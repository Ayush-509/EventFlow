import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bio, address },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//API for updating profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "eventify-profiles",
      }
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePhoto: result.secure_url,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};