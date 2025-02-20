const User = require("../models/User");

const preventCreatorReReg = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "creator") {
      return res
        .status(400)
        .json({ message: "You are already registered as a creator." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = preventCreatorReReg;
