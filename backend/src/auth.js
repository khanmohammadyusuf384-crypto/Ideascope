import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { User } from "./models/User.js";

const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SEPARATOR = ":";

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashPassword(password = "") {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LENGTH).toString("hex");

  return [salt, hash].join(PASSWORD_SEPARATOR);
}

function verifyPassword(password = "", storedHash = "") {
  const [salt, hash] = String(storedHash).split(PASSWORD_SEPARATOR);

  if (!salt || !hash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(String(password), salt, PASSWORD_KEY_LENGTH);
  const storedBuffer = Buffer.from(hash, "hex");

  return storedBuffer.length === candidateHash.length && crypto.timingSafeEqual(storedBuffer, candidateHash);
}

function generateJWT(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
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

  if (normalizedPassword.length < 8) {
    return {
      ok: false,
      message: "Password must be at least 8 characters",
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
    token: generateJWT(user),
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

  const isValid = verifyPassword(normalizedPassword, user.passwordHash);
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
