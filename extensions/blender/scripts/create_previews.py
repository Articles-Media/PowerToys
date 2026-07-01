import bpy
import math
import os
import sys
import traceback
from mathutils import Vector

def fit_camera_to_bounds(camera_obj, obj, margin=2.5):  # Increased margin for further back camera
    # Ensure the object is selected
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)

    # Calculate bounding box dimensions
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    bbox = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    bbox_center = sum((Vector(corner) for corner in bbox), Vector()) / 8
    bbox_size = max((bbox_corner - bbox_center).length for bbox_corner in bbox)

    # Position camera based on bounding box size and margin
    direction = (camera_obj.location - bbox_center).normalized()
    distance = bbox_size * margin
    camera_obj.location = bbox_center + direction * distance

    # Set the camera to look at the center of the object
    direction_to_object = bbox_center - camera_obj.location
    rot_quat = direction_to_object.to_track_quat('-Z', 'Y')
    camera_obj.rotation_euler = rot_quat.to_euler()

    # Adjust camera focal length if necessary
    bpy.context.scene.camera.data.lens = 50  # You can adjust this as necessary

def parse_args(argv):
    if '--' in argv:
        argv = argv[argv.index('--') + 1:]

    input_path = None
    output_folder = None
    rotation_degrees = 0.0
    append_rotation_to_name = False
    index = 0

    while index < len(argv):
        arg = argv[index]

        if arg in ('--input', '-i') and index + 1 < len(argv):
            input_path = argv[index + 1]
            index += 2
        elif arg in ('--output', '-o') and index + 1 < len(argv):
            output_folder = argv[index + 1]
            index += 2
        elif arg in ('--rotation', '-r') and index + 1 < len(argv):
            rotation_degrees = float(argv[index + 1])
            index += 2
        elif arg == '--append-rotation-to-name' and index + 1 < len(argv):
            append_rotation_to_name = argv[index + 1].lower() in ('1', 'true', 'yes', 'y')
            index += 2
        elif input_path is None:
            input_path = arg
            index += 1
        elif output_folder is None:
            output_folder = arg
            index += 1
        else:
            index += 1

    return input_path, output_folder, rotation_degrees, append_rotation_to_name


def main():
    try:
        # Log all command-line arguments for debugging
        print(f"Command-line arguments: {sys.argv}")

        input_path, output_folder, rotation_degrees, append_rotation_to_name = parse_args(sys.argv[1:])

        if not input_path or not output_folder:
            print("Usage: blender --background --python <script> -- <input_path> <output_folder> [--rotation <degrees>] [--append-rotation-to-name <true|false>]")
            return

        # Accept either a single file or a folder of files
        if os.path.isfile(input_path):
            input_files = [input_path]
        elif os.path.isdir(input_path):
            input_files = [os.path.join(input_path, filename) for filename in sorted(os.listdir(input_path))]
        else:
            print(f"Input path not found or unsupported: {input_path}")
            return

        # Ensure the output folder exists
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        for input_file_path in input_files:
            filename = os.path.basename(input_file_path)
            output_file_path = os.path.join(output_folder, filename.replace(".blend", ".glb").replace(".glb", "_processed.glb"))
            preview_filename = filename.replace(".blend", ".png").replace(".glb", ".png")

            if append_rotation_to_name and rotation_degrees:
                rotation_suffix = f"-{int(rotation_degrees)}"
                preview_filename = os.path.splitext(preview_filename)[0] + rotation_suffix + os.path.splitext(preview_filename)[1]

            preview_image_path = os.path.join(output_folder, preview_filename)

            print(f"Processing file: {filename}")

            try:
                if filename.endswith(".blend"):
                    bpy.ops.wm.open_mainfile(filepath=input_file_path)
                elif filename.endswith(".glb"):
                    bpy.ops.wm.read_factory_settings(use_empty=True)
                    bpy.ops.import_scene.gltf(filepath=input_file_path)
                else:
                    print(f"Skipping file: {filename} (unsupported format)")
                    continue

                if bpy.ops.object.mode_set.poll():
                    bpy.ops.object.mode_set(mode='OBJECT')

                # Add camera if it doesn't exist
                if not any(obj.type == 'CAMERA' for obj in bpy.data.objects):
                    bpy.ops.object.camera_add(location=(0, -20, 10))  # Camera placed further back
                    camera = bpy.context.object
                    camera.name = "Camera"
                    bpy.context.scene.camera = camera
                else:
                    camera = next(obj for obj in bpy.data.objects if obj.type == 'CAMERA')

                # Add light if it doesn't exist
                if not any(obj.type == 'LIGHT' for obj in bpy.data.objects):
                    bpy.ops.object.light_add(type='SUN', location=(10, -10, 10))
                    light = bpy.context.object
                    light.name = "GlobalLight"
                    light.data.energy = 5  # Increase light intensity for better global lighting
                    light.data.angle = 3.14  # Wide angle for more uniform light

                # Get the object to fit in the frame (assuming one main object in the scene)
                mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
                if mesh_objects:
                    if rotation_degrees:
                        print(f"Applying rotation: {rotation_degrees} degrees")
                        angle = math.radians(rotation_degrees)

                        roots = [o for o in bpy.context.scene.objects if o.parent is None]

                        for obj in roots:
                            obj.rotation_mode = 'XYZ'
                            obj.rotation_euler.z += angle

                    obj = mesh_objects[0]
                    fit_camera_to_bounds(camera, obj)

                # Render settings for transparent background
                bpy.context.scene.render.engine = 'CYCLES'
                bpy.context.scene.render.film_transparent = True

                # Set render settings for PNG preview
                bpy.context.scene.render.image_settings.file_format = 'PNG'
                bpy.context.scene.render.image_settings.color_mode = 'RGBA'
                bpy.context.scene.render.filepath = preview_image_path
                bpy.context.scene.render.resolution_x = 1024
                bpy.context.scene.render.resolution_y = 1024

                print(f"Rendering preview image: {preview_image_path}")
                bpy.ops.render.render(write_still=True)

                if filename.endswith(".blend"):
                    print(f"Exporting to .glb: {output_file_path}")
                    bpy.ops.export_scene.gltf(filepath=output_file_path, export_format='GLB')

            except Exception as e:
                print(f"Error processing {filename}: {e}")
                print(traceback.format_exc())
                continue

    except Exception as main_exception:
        print(f"Fatal error: {main_exception}")
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
