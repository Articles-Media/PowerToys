import path from 'path';
import fs from 'fs';
import process from 'process';
import readline from 'readline'; // <-- Built-in Node.js module for CLI inputs

// Ensure sharp is installed locally in this directory's node_modules
import sharp from 'sharp';

// %1 from the Windows context menu passes the absolute file path as the first argument
const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Error: No input file provided.');
  process.exit(1);
}

// Parse the file path to separate the directory, name, and extension
const fileDetails = path.parse(inputFile);

// Construct the new output path with the .webp extension in the same folder
const outputFile = path.join(fileDetails.dir, `${fileDetails.name}.webp`);

console.log(`Input File:  ${inputFile}`);
console.log(`Output File: ${outputFile}\n`);

// 1. Create the interface to read from the command prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 2. Ask the user for the quality setting
rl.question('Enter WebP quality (0-100) [Press Enter for default 80]: ', (answer) => {

  // 3. Parse the input into a number. Default to 80 if they just press Enter or type text.
  let quality = parseInt(answer, 10);

  if (isNaN(quality) || quality < 0 || quality > 100) {
    console.log('Invalid or empty input. Defaulting to quality: 80\n');
    quality = 80;
  } else {
    console.log(`Using quality: ${quality}\n`);
  }

  // Close the prompt interface so the script can finish normally later
  rl.close();

  console.log('Converting image to WebP...');

  // 4. Perform the conversion using sharp with the dynamic quality
  sharp(inputFile)
    .webp({ quality: quality }) // Adjusts based on user input
    .toFile(outputFile)
    .then((info) => {
      console.log('\nSuccess! File converted perfectly.');
      console.log(`Format: ${info.format.toUpperCase()}`);
      console.log(`Size: ${(info.size / 1024).toFixed(2)} KB`);

      // Keeps the cmd window open for 3 seconds so you can see the success message
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    })
    .catch((err) => {
      console.error('\nConversion failed:', err.message);

      // Keeps the window open on error so you can debug what went wrong
      console.log('\nPress any key to exit...');
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => process.exit(1));
    });
});