// pages/api/auth/me.js
import { authenticate } from '../../../lib/authMiddleware';

const handler = async (req, res) => {
  // req.user is set by authenticate
  res.status(200).json({ user: req.user });
};

export default authenticate(handler);
