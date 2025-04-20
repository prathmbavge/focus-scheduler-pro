/**
 * Emergency dependency installer
 * This script checks for missing dependencies and installs them if needed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running emergency dependency installer...');

// List of critical dependencies to check
const criticalDeps = [
  'uuid',
  'express',
  'cors',
  'dotenv',
  'mysql2',
  'ws'
];

// Check each dependency
let missingDeps = [];
criticalDeps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`✓ ${dep} is installed`);
  } catch (e) {
    console.log(`✗ ${dep} is missing`);
    missingDeps.push(dep);
  }
});

// Install missing dependencies
if (missingDeps.length > 0) {
  console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
  try {
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('Dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    // Try with --no-save flag as a fallback
    try {
      console.log('Trying alternative installation method...');
      execSync(`npm install ${missingDeps.join(' ')} --no-save`, { stdio: 'inherit' });
      console.log('Dependencies installed successfully with fallback method');
    } catch (fallbackError) {
      console.error('All installation attempts failed:', fallbackError);
    }
  }
} else {
  console.log('All critical dependencies are installed');
}

console.log('Emergency dependency check complete'); 