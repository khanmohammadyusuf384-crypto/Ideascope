import express from "express";
import { login, signup } from "../auth.js";
import { requireAuthToken } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    const result = await signup({
      email: req.body.email,
      password: req.body.password,
    });

    if (!result.ok) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const result = await login({
      email: req.body.email,
      password: req.body.password,
    });

    if (!result.ok) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuthToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId).select("email createdAt");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});
