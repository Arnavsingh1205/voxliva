import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Create JWT Token
|--------------------------------------------------------------------------
*/

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

/*
|--------------------------------------------------------------------------
| User Response
|--------------------------------------------------------------------------
*/

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,

    profile: {
      conversations:
        user.profile?.conversations || 0,

      practiceMinutes:
        user.profile?.practiceMinutes || 0,

      streak:
        user.profile?.streak || 0,
    },

    usage: {
      date:
        user.usage?.date || "",

      aiSessions:
        user.usage?.aiSessions || 0,

      aiTurns:
        user.usage?.aiTurns || 0,

      aiTests:
        user.usage?.aiTests || 0,

      practiceMinutesToday:
        user.usage?.practiceMinutesToday || 0,

      currentSession: {
        startedAt:
          user.usage?.currentSession?.startedAt ||
          null,

        turns:
          user.usage?.currentSession?.turns ||
          0,

        active:
          user.usage?.currentSession?.active ||
          false,
      },
    },
  };
}

/*
|--------------------------------------------------------------------------
| Signup
|--------------------------------------------------------------------------
*/

async function signup(req, res) {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check Existing User
    |--------------------------------------------------------------------------
    */

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Hash Password
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(password, 12);

    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    /*
    |--------------------------------------------------------------------------
    | Create Token
    |--------------------------------------------------------------------------
    */

    const token = createToken(user._id.toString());

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create account.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

async function login(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findOne({
        email: cleanEmail,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Compare Password
    |--------------------------------------------------------------------------
    */

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Token
    |--------------------------------------------------------------------------
    */

    const token = createToken(user._id.toString());

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      message:
        "Login successful.",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

async function getCurrentUser(req, res) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const user =
      await User.findById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
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
        "Unable to get current user.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  signup,
  login,
  getCurrentUser,
};

export default {
  signup,
  login,
  getCurrentUser,
};