import path from 'path';
import { execSync } from 'child_process';
import process from 'process';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Error: No input path provided.');
  process.exit(1);
}

const fileDir = path.dirname(inputPath);
const fileName = path.basename(inputPath);
const ext = path.extname(inputPath).toLowerCase();

if (ext !== '.glb' && ext !== '.gltf') {
  console.error(`Error: ${fileName} is not a .glb or .gltf file.`);
  process.exit(1);
}

console.log(`--- Transforming ${fileName} ---`);

try {
  // Added the --transform flag to the gltfjsx command
  execSync(`npx gltfjsx "${fileName}" --transform`, { 
    cwd: fileDir, 
    stdio: 'inherit' 
  });
  
  console.log(`\nSuccess! ${fileName} has been transformed.`);
} catch (error) {
  console.error(`\nFailed to process ${fileName}:`, error.message);
}

// Keeps the window open for a few seconds so you can see the result
console.log('\nClosing window in 5 seconds...');
setTimeout(() => process.exit(0), 5000);