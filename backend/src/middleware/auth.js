import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export async function authenticate(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization || '';

    const token = authHeader.startsWith(
      'Bearer '
    )
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token required',
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwtSecret
    );

    if (!decoded?.id) {
      return res.status(401).json({
        message: 'Invalid token payload',
      });
    }

    const user = await User.findById(
      decoded.id
    ).select(
      '_id name email role isBlocked points'
    );

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: 'User account is blocked',
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
    };

    next();
  } catch (err) {
    console.error(
      'Authentication Error:',
      err.message
    );

    if (
      err.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: 'Token expired',
      });
    }

    if (
      err.name === 'JsonWebTokenError'
    ) {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}


