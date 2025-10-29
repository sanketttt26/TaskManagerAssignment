import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { isEmail, sanitizeString } from "../utils/validate.js";

function signJwt(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  });
}

function clearAuthCookie(res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("access_token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/"
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    // Password policy: min 8, 1 upper, 1 lower, 1 number, 1 special
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordPolicy.test(password)) {
      return res.status(400).json({ message: "Password must include uppercase, lowercase, number, and special character" });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: sanitizeString(name), email, passwordHash, role: role === "admin" ? "admin" : "user" });
    const token = signJwt(user);
    setAuthCookie(res, token);
    return res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });
    if (!isEmail(email)) return res.status(400).json({ message: "Invalid email format" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signJwt(user);
    setAuthCookie(res, token);
    return res.status(200).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  return res.status(200).json({ user: req.user.toSafeJSON() });
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out" });
}

