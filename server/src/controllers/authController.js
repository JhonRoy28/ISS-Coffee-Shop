const argon2 = require("argon2");
const User = require("../models/User");
const { hashSetupToken, toPublicUser } = require("../utils/userSecurity");

const SESSION_COOKIE_NAME = "brewstock.sid";
const PASSWORD_HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

const isValidPassword = (password) =>
  typeof password === "string" && password.length >= 12 && password.length <= 128;

const saveSession = (session) => new Promise((resolve, reject) => {
  session.save((error) => error ? reject(error) : resolve());
});

const regenerateSession = (session) => new Promise((resolve, reject) => {
  session.regenerate((error) => error ? reject(error) : resolve());
});

const login = async (req, res, next) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!email || email.length > 254 || typeof password !== "string" || !password || password.length > 128) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email })
      .select("+passwordHash +sessionVersion");
    if (
      !user
      || !user.isActive
      || !user.passwordHash
      || !(await argon2.verify(user.passwordHash, password))
    ) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await regenerateSession(req.session);
    req.session.userId = String(user._id);
    req.session.sessionVersion = user.sessionVersion;
    await saveSession(req.session);

    return res.status(200).json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const completePasswordSetup = async (req, res, next) => {
  const { token, password } = req.body || {};
  if (typeof token !== "string" || token.length > 128 || !isValidPassword(password)) {
    return res.status(400).json({
      message: "A valid setup token and a password of 12 to 128 characters are required.",
    });
  }

  try {
    const user = await User.findOne({
      passwordSetupTokenHash: hashSetupToken(token),
      passwordSetupExpiresAt: { $gt: new Date() },
      isActive: true,
    }).select("+passwordHash +passwordSetupTokenHash +passwordSetupExpiresAt +sessionVersion");

    if (!user || user.passwordHash) {
      return res.status(400).json({ message: "This password setup link is invalid or expired." });
    }

    user.passwordHash = await argon2.hash(password, PASSWORD_HASH_OPTIONS);
    user.passwordSetAt = new Date();
    user.passwordSetupTokenHash = undefined;
    user.passwordSetupExpiresAt = undefined;
    user.sessionVersion += 1;
    await user.save();

    return res.status(200).json({ message: "Password set. You can now sign in." });
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res, next) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  if (!req.session) {
    res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
    return res.status(200).json({ message: "Signed out." });
  }

  return req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
    return res.status(200).json({ message: "Signed out." });
  });
};

const getCurrentUser = (req, res) => {
  res.status(200).json({ user: toPublicUser(req.user) });
};

module.exports = {
  completePasswordSetup,
  getCurrentUser,
  login,
  logout,
};
