import path from 'path';
import { execFileSync } from 'child_process';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';
import fs from 'fs';
import config from './config.js';

const inputFile = process.argv[2];
const cliMode = process.argv.includes('-cli') || process.argv.includes('--cli');

if (!inputFile) {
  console.error('Error: No input file provided.');
  process.exit(1);
}

const inputFileDetails = path.parse(inputFile);
const fileDetails = path.parse(inputFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('File path:', __filename);
console.log('Directory path:', __dirname);
console.log('inputFile', inputFile);

const blenderPath = config.blender.blenderPath;
const outputDir = path.join(inputFileDetails.dir, '_glb_thumbnails');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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

async function main() {
  let rotationDegrees = 0;

  if (cliMode) {
    rotationDegrees = await askForRotation();
    console.log(`Using model rotation: ${rotationDegrees} degrees`);
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