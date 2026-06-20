import User from "../models/user.js";

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    }).select("-password");

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({
      role: "organizer",
    }).select("-password");

    res.json(organizers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};