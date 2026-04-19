import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashPassword(password = "") {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

function generateJWT(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function signup({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password ?? "");

  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      message: "Email and password are required",
    };
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return {
      ok: false,
      message: "User already exists",
    };
  }

  const user = await User.create({ 
    email: normalizedEmail,
    passwordHash: hashPassword(normalizedPassword),
    createdAt: new Date().toISOString(),
  });

  return {
    ok: true,
    message: "User stored successfully",
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

export async function login({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password ?? "");

  if (!normalizedEmail || !normalizedPassword) {
    return {
      ok: false,
      message: "Email and password are required",
    };
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      ok: false,
      message: "Authentication failed",
    };
  }

  const isValid = user.passwordHash === hashPassword(normalizedPassword);
  if (!isValid) {
    return {
      ok: false,
      message: "Authentication failed",
    };
  }

  return {
    ok: true,
    message: "Authentication successful",
    token: generateJWT(user),
    user: {
      id: user.id,
      email: user.email,
    },
  };
}
