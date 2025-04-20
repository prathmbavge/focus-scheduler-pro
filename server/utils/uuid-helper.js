/**
 * UUID Helper - Safely provides UUID functionality
 * This is a fallback in case the uuid module fails to load
 */

let uuidv4;

try {
  // Try to load the real uuid module
  const uuid = require('uuid');
  uuidv4 = uuid.v4;
  console.log('UUID module loaded successfully');
} catch (e) {
  console.warn('UUID module failed to load:', e.message);
  console.warn('Using fallback UUID implementation');
  
  // Simple fallback implementation for UUID v4 (not cryptographically secure)
  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Try to install the uuid module on the fly
  try {
    const { execSync } = require('child_process');
    console.log('Attempting to install uuid module...');
    execSync('npm install uuid --no-save', { stdio: 'inherit' });
    console.log('UUID module installed successfully');
    
    // Try to load it again
    const uuid = require('uuid');
    uuidv4 = uuid.v4;
    console.log('UUID module loaded after installation');
  } catch (installError) {
    console.error('Failed to install uuid module:', installError.message);
    console.log('Continuing with fallback implementation');
  }
}

module.exports = {
  uuidv4
}; 