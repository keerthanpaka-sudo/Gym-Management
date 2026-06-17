const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gym-management',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'avi', 'mov'],
  },
});

const upload = multer({ storage });

// Upload single file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload multiple files
router.post('/upload-multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:public_id', auth, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.public_id);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;