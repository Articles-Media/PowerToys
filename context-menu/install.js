import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '..');

const fileMenuPath = `HKCU\\Software\\Classes\\*\\shell\\ArticlesMedia`;
const runAboutScriptPath = `${fileMenuPath}\\shell\\RunScript`;
const convertPath = `${fileMenuPath}\\shell\\ConvertFile`;
const transformPath = `${fileMenuPath}\\shell\\TransformGLTFJSX`;
const glbThumbnailPath = `${fileMenuPath}\\shell\\GlbThumbnail`;
const glbThumbnailCliPath = `${fileMenuPath}\\shell\\GlbThumbnailCLI`;

const iconPath = path.join(basePath, 'images', 'icons', 'articles_icon.ico');
const iconPathGltfjsx = path.join(basePath, 'images', 'icons', 'gltfjsx_icon.ico');
const iconPathBlender = path.join(basePath, 'images', 'icons', 'blender_icon.ico');
const iconPathSharp = path.join(basePath, 'images', 'icons', 'sharp_icon.ico');

const cmdRunScript = `cmd /k node \\\"${basePath}\\index.js\\\" \\\"%1\\\"`;
const cmdConvert = `cmd /k node \\\"${basePath}\\convert_image.js\\\" \\\"%1\\\"`;
const cmdTransform = `cmd /k node \\\"${basePath}\\transform_gltfjsx.js\\\" \\\"%1\\\"`;
const cmdGlbThumbnail = `cmd /k node \\\"${basePath}\\glb_thumbnail.js\\\" \\\"%1\\\"`;
const cmdGlbThumbnailCli = `cmd /k node \\\"${basePath}\\glb_thumbnail.js\\\" \\\"%1\\\" -cli`;

const commands = [
  // Base Menu
  `reg add "${fileMenuPath}" /v "MUIVerb" /t REG_SZ /d "Articles Media" /f`,
  `reg add "${fileMenuPath}" /v "Icon" /t REG_SZ /d "${iconPath}" /f`,
  `reg add "${fileMenuPath}" /v "Extended" /t REG_SZ /d "" /f`, // Requires Shift-Click
  `reg add "${fileMenuPath}" /v "subcommands" /t REG_SZ /d "" /f`,

  // Run Script
  `reg add "${runAboutScriptPath}" /ve /t REG_SZ /d "Run About Script" /f`,
  `reg add "${runAboutScriptPath}" /v "Icon" /t REG_SZ /d "${iconPath}" /f`,
  `reg add "${runAboutScriptPath}\\command" /ve /t REG_SZ /d "${cmdRunScript}" /f`,
  `reg add "${runAboutScriptPath}" /v "CommandFlags" /t REG_DWORD /d 32 /f`, // Separator

  // Convert to WebP (Images)
  `reg add "${convertPath}" /ve /t REG_SZ /d "Convert to WebP" /f`,
  `reg add "${convertPath}" /v "Icon" /t REG_SZ /d "${iconPathSharp}" /f`,
  `reg add "${convertPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.png OR System.FileExtension:=.jpg" /f`,
  `reg add "${convertPath}\\command" /ve /t REG_SZ /d "${cmdConvert}" /f`,

  // GLB Thumbnail
  `reg add "${glbThumbnailPath}" /ve /t REG_SZ /d "GLB Thumbnail" /f`,
  `reg add "${glbThumbnailPath}" /v "Icon" /t REG_SZ /d "${iconPathBlender}" /f`,
  `reg add "${glbThumbnailPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.glb" /f`,
  `reg add "${glbThumbnailPath}\\command" /ve /t REG_SZ /d "${cmdGlbThumbnail}" /f`,

  // GLB Thumbnail CLI
  `reg add "${glbThumbnailCliPath}" /ve /t REG_SZ /d "GLB Thumbnail CLI" /f`,
  `reg add "${glbThumbnailCliPath}" /v "Icon" /t REG_SZ /d "${iconPathBlender}" /f`,
  `reg add "${glbThumbnailCliPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.glb" /f`,
  `reg add "${glbThumbnailCliPath}\\command" /ve /t REG_SZ /d "${cmdGlbThumbnailCli}" /f`,

  // Transform GLTFJSX (3D Models)
  `reg add "${transformPath}" /ve /t REG_SZ /d "Transform GLTFJSX" /f`,
  `reg add "${transformPath}" /v "Icon" /t REG_SZ /d "${iconPathGltfjsx}" /f`,
  `reg add "${transformPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.gltf OR System.FileExtension:=.glb" /f`,
  `reg add "${transformPath}\\command" /ve /t REG_SZ /d "${cmdTransform}" /f`
];

function runCommands(index = 0) {
  if (index >= commands.length) {
    console.log('Context menu updated! Folder code removed.');
    return;
  }
  exec(commands[index], (error) => {
    if (error) console.error(`Error: ${error.message}`);
    else runCommands(index + 1);
  });
}

runCommands();