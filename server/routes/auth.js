const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Offline mode mock auth
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB offline, allowing mock registration');
      return res.status(201).json({
        _id: 'mock_id_12345',
        name: name || 'Mock User',
        email: email,
        token: generateToken('mock_id_12345'),
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error', detail: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Offline mode mock auth
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB offline, allowing mock login');
      return res.json({
        _id: 'mock_id_12345',
        name: 'Mock User',
        email: email,
        token: generateToken('mock_id_12345'),
      });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server Error', detail: error.message });
  }
});

// Auth middleware function to be used broadly
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      if (mongoose.connection.readyState !== 1) {
         req.user = { _id: decoded.id, name: 'Mock User' };
         return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error('Token validation error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { router, protect };
