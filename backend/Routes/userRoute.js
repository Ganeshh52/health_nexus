const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userRoute = express.Router();
const userModel = require('../Models/userMondel');

const userImageDir = path.join(__dirname, '..', 'public', 'image', 'users');
fs.mkdirSync(userImageDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userImageDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Register with image upload
userRoute.post('/register', upload.single('image'), async (req, res) => {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({ msg: 'Full name, email, and password are required' });
      }

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ msg: 'Email already registered' });
      }

      const userData = {
        ...req.body,
        image: req.file ? req.file.filename : null
      };
  
      const user = await userModel.create(userData);
      res.json({ 'msg': 'success', "value": user });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ msg: 'Email already registered' });
      }

      res.status(500).json({ msg: err.message || 'Registration failed' });
    }
  });

// Get all users
userRoute.get('', async (req, res) => {
  const user = await userModel.find();
  res.json({ 'msg': 'success', "value": user });
});

// Doctor page cards api 
userRoute.get('/doctors', async (req, res) => {
  try {
    const doctors = await userModel.find({ type: 'doctor' }).select('-password');
    res.json({ msg: 'success', value: doctors });
  } catch (err) {
    res.status(500).json({ msg: 'error', error: err.message });
  }
});

// Get user by ID
userRoute.get('/:id', async (req, res) => {
  const id = req.params.id;
  const user = await userModel.findById(id).select('-password');
  res.json({ 'msg': 'success', "value": user });
});



// Login
userRoute.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const type = req.body.type;
  const user = await userModel.findOne({ email: email });
  if (user && user.password === password && user.type === type) {
    const authToken = Math.random().toString(36).substring(2);  /*testing*/
    res.json({
      'msg': 'success',
      'type': user.type,
      'token': authToken,
      'userId': user._id.toString()
    });
  } else {
    res.json({ 'msg': 'failed' });
  }
});

module.exports = userRoute;
