import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  preferredLanguage: user.preferredLanguage,
  createdAt: user.createdAt
});

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role, preferredLanguage } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role,
    preferredLanguage
  });

  const token = signToken(user._id, user.role);

  return res.status(201).json({
    message: "Registration successful",
    token,
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id, user.role);

  return res.json({
    message: "Login successful",
    token,
    user: sanitizeUser(user)
  });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});
