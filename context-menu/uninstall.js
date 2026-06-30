import { exec } from 'node:child_process';

// The locations where your registry keys were created
const keysToRemove = [
  `HKCU\\Software\\Classes\\*\\shell\\ArticlesMedia`,        // File entries
  `HKCU\\Software\\Classes\\Directory\\shell\\ArticlesMedia`, // Folder entries
  `HKCU\\Software\\Classes\\Folder\\shell\\ArticlesMedia`     // General Folder object entries
];

console.log('Removing "Articles Media" context menu entries from files and folders...');

let completed = 0;

keysToRemove.forEach((path) => {
  const command = `reg delete "${path}" /f`;
  
  exec(command, (error, stdout, stderr) => {
    // If error code is 1, the key likely didn't exist (which is fine)
    if (error && error.code !== 1) {
      console.error(`Error removing ${path}: ${error.message}`);
    } else {
      console.log(`Successfully processed: ${path}`);
    }

    completed++;
    if (completed === keysToRemove.length) {
      console.log('Cleanup complete.');
    }
  });
});