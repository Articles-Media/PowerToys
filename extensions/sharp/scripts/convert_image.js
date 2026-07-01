import path from 'path';
import fs from 'fs';
import process from 'process';
import readline from 'readline'; // <-- Built-in Node.js module for CLI inputs

// Ensure sharp is installed locally in this directory's node_modules
import sharp from 'sharp';

const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Error: No input file provided.');
  process.exit(1);
}

const fileDetails = path.parse(inputFile);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const allowedFormats = ['png', 'jpg', 'jpeg', 'webp', 'ico'];
const defaultFormat = 'webp';
const defaultMaxPixels = 1024;
const defaultQuality = 80;

function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function normalizeFormat(format) {
  if (!format) {
    return defaultFormat;
  }

  const normalized = format.trim().toLowerCase();
  if (normalized === 'jpeg') {
    return 'jpg';
  }
  if (allowedFormats.includes(normalized)) {
    return normalized;
  }
  return defaultFormat;
}

async function main() {
  console.log(`Input File:  ${inputFile}`);

  const formatAnswer = await askQuestion(
    'Enter output format [png/jpg/webp/ico/jpeg] [Press Enter for default webp]: '
  );
  const outputFormat = normalizeFormat(formatAnswer);

  const sizeAnswer = await askQuestion(
    `Enter max pixel size for longest edge [Press Enter for default ${defaultMaxPixels}]: `
  );
  let maxPixels = parseInt(sizeAnswer, 10);
  if (Number.isNaN(maxPixels) || maxPixels <= 0) {
    maxPixels = defaultMaxPixels;
  }

  const qualityAnswer = await askQuestion(
    `Enter quality (0-100) [Press Enter for default ${defaultQuality}]: `
  );
  let quality = parseInt(qualityAnswer, 10);
  if (Number.isNaN(quality) || quality < 0 || quality > 100) {
    quality = defaultQuality;
  }

  rl.close();

  const sharpFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
  const outputExtension = outputFormat === 'jpg' ? 'jpg' : outputFormat;

  function resolveOutputFilePath(dir, name, ext, inputPath) {
    let count = 0;
    let candidate = path.join(dir, `${name}.${ext}`);

    while (candidate === inputPath || fs.existsSync(candidate)) {
      count += 1;
      candidate = path.join(dir, `${name}_${count}.${ext}`);
    }

    return candidate;
  }

  const outputFile = resolveOutputFilePath(fileDetails.dir, fileDetails.name, outputExtension, inputFile);

  console.log(`\nOutput Format: ${outputExtension}`);
  console.log(`Max Pixel Size: ${maxPixels}`);
  console.log(`Quality: ${quality}`);
  console.log(`Output File: ${outputFile}\n`);

  const formatOptions = { quality };
  if (sharpFormat === 'png') {
    formatOptions.compressionLevel = 9;
  }

  let pipeline = sharp(inputFile).resize({
    width: maxPixels,
    height: maxPixels,
    fit: 'inside',
    withoutEnlargement: true
  });

  pipeline = pipeline.toFormat(sharpFormat, formatOptions);

  console.log('Converting image...');

  pipeline
    .toFile(outputFile)
    .then((info) => {
      console.log('\nSuccess! File converted perfectly.');
      console.log(`Format: ${info.format.toUpperCase()}`);
      console.log(`Size: ${(info.size / 1024).toFixed(2)} KB`);

      setTimeout(() => {
        process.exit(0);
      }, 3000);
    })
    .catch((err) => {
      console.error('\nConversion failed:', err.message);
      console.log('\nPress any key to exit...');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => process.exit(1));
    });
}

main();
