import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profile: {
      conversations: user.profile?.conversations || 0,
      practiceMinutes:
        user.profile?.practiceMinutes || 0,
      streak: user.profile?.streak || 0,
    },
  };
}

async function signupController(req, res) {
  try {
    const {
      name = "",
      email = "",
      password = "",
    } = req.body || {};

    const safeName = String(name).trim();
    const safeEmail = String(email)
      .trim()
      .toLowerCase();
    const safePassword = String(password);

    if (!safeName || !safeEmail || !safePassword) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    if (safePassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: safeEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      safePassword,
      12
    );

    const user = await User.create({
      name: safeName,
      email: safeEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error(
      "Signup controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to create account.",
    });
  }
}

async function loginController(req, res) {
  try {
    const {
      email = "",
      password = "",
    } = req.body || {};

    const safeEmail = String(email)
      .trim()
      .toLowerCase();

    const safePassword = String(password);

    if (!safeEmail || !safePassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: safeEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        safePassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id.toString());

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error(
      "Login controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to login.",
    });
  }
}

async function getCurrentUserController(
  req,
  res
) {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: userResponse(user),
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get current user.",
    });
  }
}

export {
  signupController,
  loginController,
  getCurrentUserController,
};

export default {
  signupController,
  loginController,
  getCurrentUserController,
};