import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '..');

const fileMenuPath = `HKCU\\Software\\Classes\\*\\shell\\ArticlesMedia`;
const runAboutScriptPath = `${fileMenuPath}\\shell\\RunScript`;
// const convertPath = `${fileMenuPath}\\shell\\ConvertFile`;
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

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  const prefixed = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (prefixed) {
    return prefixed.split('=').slice(1).join('=');
  }
  return undefined;
}

const enabledExtensions = JSON.parse(process.env.ENABLED_EXTENSIONS || '[]');
const extensions = JSON.parse(process.env.EXTENSIONS || '[]');

// const argEnabledExtensions = enabledExtensions

// const argPath = getArgValue('--path');
console.log({
  message: 'Args',
  enabledExtensions: enabledExtensions,
  extensions: extensions,
  // path: argPath
});

function dynamicGeneratedCommands() {
  if (!Array.isArray(enabledExtensions) || enabledExtensions.length === 0) {
    console.log('No enabled extensions provided.');
    return [];
  }

  const generatedCommands = [];

  try {
    enabledExtensions.forEach((ext) => {
      if (!ext.enabled) {
        return;
      }

      console.log('Generating commands for enabled extension:', ext.name);

      const extensionLookup = extensions.find((e) => (
        e.config?.name === ext.name.split(':')[1]
        &&
        e.config?.author === ext.name.split(':')[0]
      ));

      if (extensionLookup?.config?.commands && Array.isArray(extensionLookup.config.commands)) {
        console.log(`Found ${extensionLookup.config.commands.length} commands for extension ${extensionLookup.config.name}.`);

        extensionLookup.config.commands.forEach((cmd) => {
          console.log('Generating command for:', cmd);

          const commandPath = `${fileMenuPath}\\shell\\${cmd.title}`;
          const commandExec = `cmd /k node \\\"${basePath}\\extensions\\${ext.name}\\${ext.command}\\\" \\\"%1\\\"`;

          const convertedIconPath = path.join(extensionLookup.image ?? '');
          const fileExists = fs.existsSync(convertedIconPath);
          console.log('convertedIconPath', convertedIconPath, fileExists);

          const finalScriptPath = path.join(extensionLookup.extensionPath, "scripts", cmd.command);
          const scriptExists = fs.existsSync(finalScriptPath);

          console.log("finalScriptPath", finalScriptPath, scriptExists);
          console.log("cmdConvert", cmdConvert);

          const realFinalCommand = `cmd /k node \\\"${finalScriptPath}\\\" \\\"%1\\\"`;

          const appliesToValue = Array.isArray(cmd.file_extensions)
            ? cmd.file_extensions
                .map((ext) => `System.FileExtension:=.${ext.trim()}`)
                .join(' OR ')
            : 'System.FileExtension:=.png';

          generatedCommands.push(`reg add "${commandPath}" /ve /t REG_SZ /d "${cmd.title}" /f`);
          generatedCommands.push(`reg add "${commandPath}" /v "Icon" /t REG_SZ /d "${convertedIconPath}" /f`);

          generatedCommands.push(`reg add "${commandPath}" /v "AppliesTo" /t REG_SZ /d "${appliesToValue}" /f`);

          generatedCommands.push(`reg add "${commandPath}\\command" /ve /t REG_SZ /d "${realFinalCommand}${cmd.appendCliToCommand ? " -cli" : ""}" /f`);
        });
      }
    });
  } catch (e) {
    console.error('Error parsing enabled extensions:', e);
  }

  return generatedCommands;
}

// console.log(
//   "Dynamic commands generated for enabled extensions:",
//   dynamicGeneratedCommands()
// );

// return

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

  ...dynamicGeneratedCommands(),

  // Convert to WebP (Images)
  // `reg add "${convertPath}" /ve /t REG_SZ /d "Convert to WebP" /f`,
  // `reg add "${convertPath}" /v "Icon" /t REG_SZ /d "${iconPathSharp}" /f`,
  // `reg add "${convertPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.png OR System.FileExtension:=.jpg" /f`,
  // `reg add "${convertPath}\\command" /ve /t REG_SZ /d "${cmdConvert}" /f`,

  // GLB Thumbnail
  // `reg add "${glbThumbnailPath}" /ve /t REG_SZ /d "GLB Thumbnail" /f`,
  // `reg add "${glbThumbnailPath}" /v "Icon" /t REG_SZ /d "${iconPathBlender}" /f`,
  // `reg add "${glbThumbnailPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.glb" /f`,
  // `reg add "${glbThumbnailPath}\\command" /ve /t REG_SZ /d "${cmdGlbThumbnail}" /f`,

  // GLB Thumbnail CLI
  // `reg add "${glbThumbnailCliPath}" /ve /t REG_SZ /d "GLB Thumbnail CLI" /f`,
  // `reg add "${glbThumbnailCliPath}" /v "Icon" /t REG_SZ /d "${iconPathBlender}" /f`,
  // `reg add "${glbThumbnailCliPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.glb" /f`,
  // `reg add "${glbThumbnailCliPath}\\command" /ve /t REG_SZ /d "${cmdGlbThumbnailCli}" /f`,

  // Transform GLTFJSX (3D Models)
  // `reg add "${transformPath}" /ve /t REG_SZ /d "Transform GLTFJSX" /f`,
  // `reg add "${transformPath}" /v "Icon" /t REG_SZ /d "${iconPathGltfjsx}" /f`,
  // `reg add "${transformPath}" /v "AppliesTo" /t REG_SZ /d "System.FileExtension:=.gltf OR System.FileExtension:=.glb" /f`,
  // `reg add "${transformPath}\\command" /ve /t REG_SZ /d "${cmdTransform}" /f`
];

function runCommands(index = 0) {

  console.log("commands", commands)

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

// dynamicGeneratedCommands()