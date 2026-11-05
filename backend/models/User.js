import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profile: {
      conversations: {
        type: Number,
        default: 0,
      },

      practiceMinutes: {
        type: Number,
        default: 0,
      },

      streak: {
        type: Number,
        default: 0,
      },
    },

    usage: {
      date: {
        type: String,
        default: "",
      },

      aiSessions: {
        type: Number,
        default: 0,
      },

      aiTurns: {
        type: Number,
        default: 0,
      },

      aiTests: {
        type: Number,
        default: 0,
      },

      aiTestStartedAt: {
        type: Date,
        default: null,
      },

      practiceMinutesToday: {
        type: Number,
        default: 0,
      },

      currentSession: {
        startedAt: {
          type: Date,
          default: null,
        },

        turns: {
          type: Number,
          default: 0,
        },

        active: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;