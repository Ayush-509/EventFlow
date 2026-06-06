import User from '../models/User.js';
import { generateJwtToken } from '../utils/generateToken.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: 'Email already in use',
      });
    }

    // Only allow customer or organizer signup
    const allowedRoles = ['customer', 'organizer'];

    const userRole = allowedRoles.includes(role)
      ? role
      : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    });

    const token = generateJwtToken({
      id: user._id,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    });
  } catch (err) {
    console.error('Signup Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: 'User account has been blocked',
      });
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const token = generateJwtToken({
      id: user._id,
      role: user.role,
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        isBlocked: user.isBlocked,
        interests: user.interests,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Me Endpoint Error:', err);

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};


