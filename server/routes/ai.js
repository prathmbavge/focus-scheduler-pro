const express = require('express');
const router = express.Router();

/**
 * AI-powered task suggestion endpoint
 * This provides task suggestions based on user input
 */
router.post('/task-suggestions', async (req, res) => {
  try {
    console.log('Received task suggestion request:', req.body);
    
    // For now, just return some static suggestions
    // In the future, this could integrate with an actual AI service
    const suggestions = [
      {
        title: "Complete project documentation",
        description: "Create comprehensive documentation for your current project",
        category: "coding",
        priority: "high",
        timeEstimate: 120
      },
      {
        title: "Review code pull requests",
        description: "Go through open PRs and provide feedback to team members",
        category: "coding",
        priority: "medium",
        timeEstimate: 45
      },
      {
        title: "Learn about new React features",
        description: "Study up on the latest React features and best practices",
        category: "study",
        priority: "medium",
        timeEstimate: 60
      },
      {
        title: "Exercise session",
        description: "30 minutes of cardio or strength training",
        category: "personal",
        priority: "high",
        timeEstimate: 30
      }
    ];
    
    res.json({
      success: true,
      message: "Task suggestions generated successfully",
      suggestions: suggestions
    });
  } catch (error) {
    console.error('Error generating task suggestions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate task suggestions',
      message: error.message
    });
  }
});

module.exports = router; 