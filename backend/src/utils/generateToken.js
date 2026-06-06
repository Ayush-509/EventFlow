import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateJwtToken(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Token payload must be a valid object');
  }

  return jwt.sign(
    payload,
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}

export function verifyJwtToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    return jwt.verify(
      token,
      env.jwtSecret
    );
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export default {
  generateJwtToken,
  verifyJwtToken,
};


