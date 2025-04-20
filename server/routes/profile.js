const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  console.log('Profile test endpoint accessed');
  res.json({ message: 'Profile route is working' });
});

// Get current user profile
router.get('/current-user', async (req, res) => {
  console.log('Profile route accessed - /current-user');
  try {
    // In a real app, you would get the user ID from the auth token
    // For now, we'll return a properly structured mock response
    const profile = {
      id: 1,
      username: 'demo_user',
      email: 'user@example.com',
      name: 'Demo User',
      role: 'user',
      preferences: {
        theme: 'light',
        notifications: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Generated profile:', JSON.stringify(profile, null, 2));

    // Validate required fields
    const requiredFields = ['id', 'username', 'email', 'name', 'role'];
    const missingFields = requiredFields.filter(field => {
      const hasField = field in profile;
      console.log(`Checking field ${field}:`, hasField);
      return !hasField;
    });
    
    if (missingFields.length > 0) {
      console.error('Missing fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('Sending profile response');
    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;