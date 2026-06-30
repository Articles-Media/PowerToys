import packageData from './package.json' with { type: 'json' };

// index.js
const filePath = process.argv[2]; 

console.log("=========================================");
console.log("Articles Media Context Menu Engine Active");
console.log("=========================================");
console.log(`Target File Received: ${filePath}`);
console.log("=========================================");
console.log(`Version: ${packageData.version}`);