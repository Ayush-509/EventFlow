import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// SIGNUP

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

// LOGIN

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
};

// GET PROFILE

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Profile fetch failed" });
  }
};

// FORGOT PASSWORD

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `Reset your password using this link:\n\n${resetUrl}`,
    });

    res.json({
      message: "Reset password link sent to email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Forgot password failed" });
  }
};

// RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token is invalid or expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Reset password failed" });
  }
};

// CHANGE PASSWORD (LOGGED IN USER)

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Change password failed" });
  }
};

//API for Google Login
export const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    const ticket =
      await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
    } = payload;

    const user = await User.findOne({
  email,
});

if (!user) {
  return res.status(404).json({
    success: false,
    message:
      "Account not found. Please sign up first.",
  });
}

    const token = generateToken(
      user._id,
      user.role
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Google login failed",
    });
  }
};

export const googleSignup = async (req, res) => {
  try {
    const { credential, role } = req.body;

    const ticket =
      await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Account already exists. Please login.",
      });
    }

    const user = await User.create({
      name,
      email,
      password:
        Math.random().toString(36).slice(-8),
      role: role || "customer",
    });

    const token = generateToken(
      user._id,
      user.role
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Google signup failed",
    });
  }
};
