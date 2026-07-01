import path from 'path';
import { execFileSync } from 'child_process';
import process from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import readline from 'readline';
import fs from 'fs';

function findConfigPath(startDir) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const dirName = path.basename(currentDir);
    if (dirName === 'extensions') {
      const parentConfigPath = path.join(path.dirname(currentDir), 'config.js');
      if (fs.existsSync(parentConfigPath)) {
        return parentConfigPath;
      }
    }

    const candidateConfigPath = path.join(currentDir, 'config.js');
    if (fs.existsSync(candidateConfigPath)) {
      return candidateConfigPath;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error('Could not find config.js above the extensions folder.');
    }

    currentDir = parentDir;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = findConfigPath(__dirname);
const config = (await import(pathToFileURL(configPath).href)).default;

const inputFile = process.argv[2];

const cliMode = process.argv.includes('-cli') || process.argv.includes('--cli');

if (!inputFile) {
  console.error('Error: No input file provided.');
  process.exit(1);
}

const inputFileDetails = path.parse(inputFile);
const fileDetails = path.parse(inputFile);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

console.log('File path:', __filename);
console.log('Directory path:', __dirname);
console.log('inputFile', inputFile);

const blenderPath = config.blender.blenderPath;
let outputDir = inputFileDetails.dir;
let appendRotationToName = false;

function askForOutputFolderName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter output folder name [Press Enter for default same location as file]: ', (answer) => {
      rl.close();
      const trimmed = answer.trim();

      if (!trimmed || trimmed === '.') {
        resolve(inputFileDetails.dir);
        return;
      }

      if (path.isAbsolute(trimmed)) {
        resolve(trimmed);
      } else {
        resolve(path.join(inputFileDetails.dir, trimmed));
      }
    });
  });
}

function askForRotation() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter model rotation value in degrees [Press Enter for default 0]: ', (answer) => {
      const parsedValue = parseFloat(answer);
      rl.close();

      if (Number.isNaN(parsedValue)) {
        resolve(0);
      } else {
        resolve(parsedValue);
      }
    });
  });
}

function askForAppendRotationName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Append rotation value to final image name? (y/N): ', (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

async function main() {
  let rotationDegrees = 0;

  if (cliMode) {
    outputDir = await askForOutputFolderName();
    rotationDegrees = await askForRotation();
    appendRotationToName = await askForAppendRotationName();
    console.log(`Using model rotation: ${rotationDegrees} degrees`);
    console.log(`Append rotation to image name: ${appendRotationToName ? 'yes' : 'no'}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const args = [
      '--background',
      '--python', path.resolve(`${__dirname}/create_previews.py`),
      '--',
      '--input', path.resolve(inputFile),
      '--output', path.resolve(outputDir)
    ];

    if (cliMode) {
      args.push('--rotation', String(rotationDegrees));
      args.push('--append-rotation-to-name', String(appendRotationToName));
    }

    execFileSync(blenderPath, args, {
      stdio: 'inherit'
    });

    console.log(`\nSuccess! ${__filename} thumbnail created.`);
  } catch (error) {
    console.error(`\nFailed to process ${__filename}:`, error.message);
  }
}

main();