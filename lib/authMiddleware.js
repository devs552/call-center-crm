// lib/authMiddleware.js
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import connectToDatabase from './mongodb';
import User from '../models/User';

export const authenticate = (handler) => async (req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectToDatabase();
    const user = await User.findOne({ id: decoded.id }).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token: user not found' });

    req.user = user;
    return handler(req, res);
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ message: 'Not authorized' });
  }
};
