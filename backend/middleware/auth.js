import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    return;
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
