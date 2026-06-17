const express = require('express');
const Program = require('../models/Program');
const { auth, roleAuth } = require('../middleware/auth');

const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().populate('createdBy', 'name');
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single program
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id).populate('createdBy', 'name');
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create program (Admin/Trainer)
router.post('/', auth, roleAuth(['admin', 'trainer']), async (req, res) => {
  const { title, description, duration, difficulty, exercises } = req.body;

  try {
    const program = new Program({
      title,
      description,
      duration,
      difficulty,
      exercises,
      createdBy: req.user.id,
    });

    await program.save();
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update program
router.put('/:id', auth, roleAuth(['admin', 'trainer']), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    if (program.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedProgram);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete program
router.delete('/:id', auth, roleAuth(['admin', 'trainer']), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    if (program.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Program.findByIdAndDelete(req.params.id);
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;