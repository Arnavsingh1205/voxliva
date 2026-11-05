import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Voxliva AI Usage Limits
|--------------------------------------------------------------------------
*/

const LIMITS = {
  maxSessionsPerDay: 3,
  maxTurnsPerSession: 20,
  maxTurnsPerDay: 60,
  maxTestsPerDay: 2,
  maxSessionMinutes: 15,
};

/*
|--------------------------------------------------------------------------
| Date Key
|--------------------------------------------------------------------------
*/

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:
      process.env.USAGE_TIME_ZONE ||
      "Asia/Kolkata",
  }).format(new Date());
}

/*
|--------------------------------------------------------------------------
| Get Fresh User
|--------------------------------------------------------------------------
*/

async function getFreshUser(userId) {
  return User.findById(userId);
}

/*
|--------------------------------------------------------------------------
| Reset Daily Usage
|--------------------------------------------------------------------------
*/

async function resetDailyUsageIfNeeded(user) {
  const today = getTodayKey();

  if (user.usage?.date !== today) {
    user.usage = {
      date: today,

      aiSessions: 0,

      aiTurns: 0,

      aiTests: 0,

      practiceMinutesToday: 0,

      currentSession: {
        startedAt: null,

        turns: 0,

        active: false,
      },
    };

    await user.save();
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| Session Minutes
|--------------------------------------------------------------------------
*/

function getSessionMinutes(startedAt) {
  if (!startedAt) {
    return 0;
  }

  const elapsedMs =
    Date.now() -
    new Date(startedAt).getTime();

  return Math.max(
    0,
    Math.floor(elapsedMs / 60000)
  );
}

/*
|--------------------------------------------------------------------------
| Create Usage Error
|--------------------------------------------------------------------------
*/

function usageError(
  status,
  code,
  message,
  extra = {}
) {
  const error = new Error(message);

  error.status = status;

  error.code = code;

  Object.assign(error, extra);

  return error;
}

/*
|--------------------------------------------------------------------------
| Start AI Session
|--------------------------------------------------------------------------
*/

async function startAiSession(req, res, next) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    let user = await getFreshUser(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user =
      await resetDailyUsageIfNeeded(
        user
      );

    /*
    |--------------------------------------------------------------------------
    | Daily Session Limit
    |--------------------------------------------------------------------------
    */

    if (
      user.usage.aiSessions >=
      LIMITS.maxSessionsPerDay
    ) {
      return res.status(429).json({
        success: false,

        code:
          "DAILY_SESSION_LIMIT",

        message:
          "You have reached today's AI conversation session limit.",

        limit:
          LIMITS.maxSessionsPerDay,

        used:
          user.usage.aiSessions,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Start New Session
    |--------------------------------------------------------------------------
    */

    user.usage.aiSessions += 1;

    user.usage.currentSession = {
      startedAt: new Date(),

      turns: 0,

      active: true,
    };

    await user.save();

    req.usageUser = user;

    next();
  } catch (error) {
    console.error(
      "Start AI session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start AI conversation.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Check Active AI Session
|--------------------------------------------------------------------------
*/

async function checkAiSession(
  req,
  res,
  next
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    let user = await getFreshUser(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user =
      await resetDailyUsageIfNeeded(
        user
      );

    const session =
      user.usage.currentSession;

    /*
    |--------------------------------------------------------------------------
    | Active Session Check
    |--------------------------------------------------------------------------
    */

    if (
      !session?.active ||
      !session.startedAt
    ) {
      return res.status(403).json({
        success: false,

        code:
          "NO_ACTIVE_SESSION",

        message:
          "No active AI conversation session.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 15 Minute Limit
    |--------------------------------------------------------------------------
    */

    const sessionMinutes =
      getSessionMinutes(
        session.startedAt
      );

    if (
      sessionMinutes >=
      LIMITS.maxSessionMinutes
    ) {
      user.usage.currentSession.active =
        false;

      await user.save();

      return res.status(429).json({
        success: false,

        code:
          "SESSION_TIME_LIMIT",

        message:
          "Your 15-minute AI conversation session has ended.",

        limit:
          LIMITS.maxSessionMinutes,

        used:
          sessionMinutes,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Daily Turn Limit
    |--------------------------------------------------------------------------
    */

    if (
      user.usage.aiTurns >=
      LIMITS.maxTurnsPerDay
    ) {
      return res.status(429).json({
        success: false,

        code:
          "DAILY_TURN_LIMIT",

        message:
          "You have reached today's AI conversation limit.",

        limit:
          LIMITS.maxTurnsPerDay,

        used:
          user.usage.aiTurns,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Session Turn Limit
    |--------------------------------------------------------------------------
    */

    if (
      session.turns >=
      LIMITS.maxTurnsPerSession
    ) {
      return res.status(429).json({
        success: false,

        code:
          "SESSION_TURN_LIMIT",

        message:
          "You have reached the 20-turn limit for this session.",

        limit:
          LIMITS.maxTurnsPerSession,

        used:
          session.turns,
      });
    }

    req.usageUser = user;

    req.sessionMinutes =
      sessionMinutes;

    next();
  } catch (error) {
    console.error(
      "Check AI session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify AI session.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Record Successful AI Turn
|--------------------------------------------------------------------------
*/

async function recordAiTurn(
  userId
) {
  let user =
    await getFreshUser(userId);

  if (!user) {
    throw usageError(
      404,
      "USER_NOT_FOUND",
      "User not found."
    );
  }

  user =
    await resetDailyUsageIfNeeded(
      user
    );

  const session =
    user.usage.currentSession;

  if (
    !session?.active ||
    !session.startedAt
  ) {
    throw usageError(
      403,
      "NO_ACTIVE_SESSION",
      "No active AI conversation session."
    );
  }

  const sessionMinutes =
    getSessionMinutes(
      session.startedAt
    );

  if (
    sessionMinutes >=
    LIMITS.maxSessionMinutes
  ) {
    session.active = false;

    await user.save();

    throw usageError(
      429,
      "SESSION_TIME_LIMIT",
      "Your 15-minute AI conversation session has ended.",
      {
        limit:
          LIMITS.maxSessionMinutes,

        used:
          sessionMinutes,
      }
    );
  }

  if (
    user.usage.aiTurns >=
    LIMITS.maxTurnsPerDay
  ) {
    throw usageError(
      429,
      "DAILY_TURN_LIMIT",
      "You have reached today's AI conversation limit.",
      {
        limit:
          LIMITS.maxTurnsPerDay,

        used:
          user.usage.aiTurns,
      }
    );
  }

  if (
    session.turns >=
    LIMITS.maxTurnsPerSession
  ) {
    throw usageError(
      429,
      "SESSION_TURN_LIMIT",
      "You have reached the 20-turn limit for this session.",
      {
        limit:
          LIMITS.maxTurnsPerSession,

        used:
          session.turns,
      }
    );
  }

  user.usage.aiTurns += 1;

  user.usage.currentSession.turns += 1;

  await user.save();

  return user;
}

/*
|--------------------------------------------------------------------------
| Backward-Compatible Turn Middleware
|--------------------------------------------------------------------------
*/

async function countAiTurn(
  req,
  res,
  next
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    await recordAiTurn(
      req.user.userId
    );

    next();
  } catch (error) {
    console.error(
      "Count AI turn error:",
      error
    );

    return res.status(
      error.status || 500
    ).json({
      success: false,

      code:
        error.code ||
        "USAGE_ERROR",

      message:
        error.message ||
        "Unable to update AI usage.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| End AI Session
|--------------------------------------------------------------------------
*/

async function endAiSession(
  req,
  res,
  next
) {
  try {
    if (req.user?.userId) {
      const user =
        await getFreshUser(
          req.user.userId
        );

      if (
        user?.usage?.currentSession
      ) {
        user.usage.currentSession.active =
          false;

        await user.save();
      }
    }

    next();
  } catch (error) {
    console.error(
      "End AI session error:",
      error
    );

    next();
  }
}

/*
|--------------------------------------------------------------------------
| AI Test Limit
|--------------------------------------------------------------------------
*/

async function checkAiTestLimit(
  req,
  res,
  next
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    let user = await getFreshUser(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user =
      await resetDailyUsageIfNeeded(
        user
      );

    /*
    |--------------------------------------------------------------------------
    | AI TEST COOLDOWN DISABLED
    |--------------------------------------------------------------------------
    |
    | Development mode:
    | Users can start AI tests without
    | waiting for 1 hour.
    |
    */

    user.usage.aiTestStartedAt =
      new Date();

    await user.save();

    req.usageUser = user;

    next();
  } catch (error) {
    console.error(
      "AI test limit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify AI test limit.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Usage Controller
|--------------------------------------------------------------------------
*/

async function getUsageController(
  req,
  res
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    let user =
      await getFreshUser(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user =
      await resetDailyUsageIfNeeded(
        user
      );

    const session =
      user.usage.currentSession;

    const sessionMinutes =
      session?.startedAt
        ? getSessionMinutes(
            session.startedAt
          )
        : 0;

    /*
    |--------------------------------------------------------------------------
    | AI TEST COOLDOWN DISABLED
    |--------------------------------------------------------------------------
    */

    const aiTestRemainingSeconds = 0;

    return res.json({
      success: true,

      usage: {
        aiSessions:
          user.usage.aiSessions,

        aiTurns:
          user.usage.aiTurns,

        aiTests:
          user.usage.aiTests,

        aiTestStartedAt:
          user.usage.aiTestStartedAt ||
          null,

        aiTestRemainingSeconds,

        practiceMinutesToday:
          user.usage.practiceMinutesToday,

        currentSession: {
          active:
            session?.active ||
            false,

          turns:
            session?.turns ||
            0,

          minutes:
            sessionMinutes,
        },
      },

      limits: LIMITS,
    });
  } catch (error) {
    console.error(
      "Get usage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get usage information.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  LIMITS,
  startAiSession,
  checkAiSession,
  recordAiTurn,
  countAiTurn,
  endAiSession,
  checkAiTestLimit,
  getUsageController,
};