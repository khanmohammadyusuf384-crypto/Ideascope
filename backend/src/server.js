import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { evaluateWithOllama } from "./ollama.js";
import { evaluateIdeaLocally } from "./scoring.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ideascope-backend",
    ollamaBaseUrl,
    ollamaModel,
  });
});

app.post("/api/evaluate", async (req, res) => {
  const payload = {
    projectName: req.body.projectName || "",
    problem: req.body.problem || "",
    audience: req.body.audience || "",
    coreFeatures: req.body.coreFeatures || "",
    constraints: req.body.constraints || "",
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
    // Ollama is the richer path when a local model is available.
    const result = await evaluateWithOllama(payload, {
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
    });

    return res.json({
      source: "ollama",
      result,
    });
  } catch (_error) {
    // If the model is missing or down, we still return a usable result instead of failing the app.
    return res.json({
      source: "local-fallback",
      result: evaluateIdeaLocally(payload),
    });
  }
});

app.listen(port, () => {
  console.log(`IdeaScope backend running on http://localhost:${port}`);
});
