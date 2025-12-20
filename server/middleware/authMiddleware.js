import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // Check Authorization header first
    const authHeader = req.headers.authorization || '';
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // checking header(used by mobile apps)
    } else if (req.cookies && req.cookies.token) {
      // Fall back to cookie named `token` if available (cookie used by web app)
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ msg: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(401).json({ msg: 'Not authorized', error: err.message });
  }
};

// Role-based authorization helper
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authorized' });
  if (req.user.role !== role) return res.status(403).json({ msg: 'Forbidden - insufficient role' });
  next();
};
