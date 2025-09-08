// routes/impactData.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get impact data
router.get('/impact-data', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM impact_data WHERE id = 1');
    if (results.length > 0) {
      res.json({
        beneficiaries: results[0].beneficiaries,
        states: results[0].states,
        projects: results[0].projects
      });
    } else {
      // Default values if no data exists
      res.json({
        beneficiaries: 15,
        states: 20,
        projects: 200
      });
    }
  } catch (error) {
    console.error('Error fetching impact data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update impact data (for admin dashboard)
router.put('/impact-data', async (req, res) => {
  try {
    const { beneficiaries, states, projects } = req.body;
    
    // Check if record exists
    const [existing] = await db.execute('SELECT * FROM impact_data WHERE id = 1');
    
    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        'UPDATE impact_data SET beneficiaries = ?, states = ?, projects = ? WHERE id = 1',
        [beneficiaries, states, projects]
      );
    } else {
      // Insert new record
      await db.execute(
        'INSERT INTO impact_data (id, beneficiaries, states, projects) VALUES (1, ?, ?, ?)',
        [beneficiaries, states, projects]
      );
    }
    
    res.json({ message: 'Impact data updated successfully' });
  } catch (error) {
    console.error('Error updating impact data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;