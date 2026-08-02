import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
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
  const { fullName, email, password, phone, role, preferredLanguage, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Validate OTP code if provided or enforced
  if (otp) {
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired email verification code" });
    }
    // Delete verified OTP
    await OTP.deleteMany({ email: normalizedEmail });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
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

export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Generate random 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing OTPs for this email
  await OTP.deleteMany({ email: normalizedEmail });

  // Save new OTP code
  await OTP.create({
    email: normalizedEmail,
    otp: otpCode
  });

  // Send Email
  const mailResult = await sendOTPEmail(normalizedEmail, otpCode);

  return res.json({
    message: "Verification code sent successfully",
    mode: mailResult.mode,
    smtpError: mailResult.error,
    demoOtp: mailResult.mode === "console" ? otpCode : undefined
  });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, fullName, role } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const record = await OTP.findOne({ email: normalizedEmail, otp });

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP code" });
  }

  // Delete consumed OTP
  await OTP.deleteMany({ email: normalizedEmail });

  let user = await User.findOne({ email: normalizedEmail });

  // Auto-register user if logging in with email OTP for the first time
  if (!user) {
    user = await User.create({
      fullName: fullName || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: Math.random().toString(36).slice(-10) + "Aa1!",
      role: role || "customer"
    });
  }

  const token = signToken(user._id, user.role);

  return res.json({
    message: "Email verification successful",
    token,
    user: sanitizeUser(user)
  });
});
