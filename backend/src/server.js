import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { login, signup } from "./auth.js";
import { evaluateWithOllama, normalizeEvaluationResult } from "./ollama.js";
import { evaluateIdeaLocally } from "./scoring.js";
import { createIdea, STRUCTURE_NAMES } from "./structures.js";
import { requireAuthToken } from "./middleware/authMiddleware.js";
import { connectDB } from "./db.js";
dotenv.config();


console.log("FULL ENV", process.env);

const app = express();
const port = Number(process.env.PORT || 4000);
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";

app.use(cors());
app.use(express.json());
// Planned auth integration: add token-validation middleware here before protected routes.
// Example future usage:
//   app.use("/api", requireAuthToken);
// The middleware will parse "Authorization: Bearer <token>", validate it,
// and attach authenticated identity (for example: req.auth.userId).

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ideascope-backend",
    ollamaBaseUrl,
    ollamaModel,
    availableStructures: STRUCTURE_NAMES,
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const result = await signup({
    email: req.body.email,
    password: req.body.password,
  });

  if (!result.ok) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
});

app.post("/api/auth/login", async (req, res) => {
  const result = await login({
    email: req.body.email,
    password: req.body.password,
  });

  if (!result.ok) {
    return res.status(401).json(result);
  }

  return res.json(result);
});

app.post("/api/evaluate", requireAuthToken, async (req, res) => {
  const idea = createIdea({
    userId: req.auth.userId,
    workspaceId: req.body.workspaceId ?? null,
    projectName: req.body.projectName || "",
    problem: req.body.problem || "",
    audience: req.body.audience || "",
    coreFeatures: req.body.coreFeatures || "",
    constraints: req.body.constraints || "",
  });

  // Keep the current evaluation pipeline unchanged by passing the same content fields.
  const payload = {
    projectName: idea.projectName,
    problem: idea.problem,
    audience: idea.audience,
    coreFeatures: idea.coreFeatures,
    constraints: idea.constraints,
  };

  const hasEnoughInput = [payload.projectName, payload.problem, payload.coreFeatures]
    .join(" ")
    .trim().length > 10;

  // We block extremely short submissions so the app does not return meaningless scores.
  if (!hasEnoughInput) {
    return res.status(400).json({
      error: "Please provide a project name, problem statement, and core features.",
    });
  }

  try {
    const fallbackResult = evaluateIdeaLocally(payload);

    // Ollama is the richer path when a local model is available.
    const rawResult = await evaluateWithOllama(payload, {
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
    });

    return res.json({
      source: "ollama",
      result: normalizeEvaluationResult(rawResult, fallbackResult),
    });
  } catch (_error) {
    // If the model is missing or down, we still return a usable result instead of failing the app.
    return res.json({
      source: "local-fallback",
      result: evaluateIdeaLocally(payload),
    });
  }
});

await connectDB();

app.listen(port, () => {
  console.log(`IdeaScope backend running on http://localhost:${port}`);
});
