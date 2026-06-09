import express from "express";
import { evaluateWithOllama, normalizeEvaluationResult } from "../ollama.js";
import { evaluateIdeaLocally } from "../scoring.js";
import { createIdea } from "../structures.js";
import { config } from "../config.js";
import { requireAuthToken } from "../middleware/authMiddleware.js";
import { Idea } from "../models/Idea.js";

export const ideaRouter = express.Router();

ideaRouter.use(requireAuthToken);

function buildPayload(body) {
  return {
    projectName: String(body.projectName || "").trim(),
    problem: String(body.problem || "").trim(),
    audience: String(body.audience || "").trim(),
    coreFeatures: String(body.coreFeatures || "").trim(),
    constraints: String(body.constraints || "").trim(),
  };
}

function hasEnoughInput(payload) {
  return [payload.projectName, payload.problem, payload.coreFeatures].join(" ").trim().length > 10;
}

function serializeIdea(idea) {
  return {
    id: idea.id,
    workspaceId: idea.workspaceId,
    projectName: idea.projectName,
    problem: idea.problem,
    audience: idea.audience,
    coreFeatures: idea.coreFeatures,
    constraints: idea.constraints,
    source: idea.source,
    result: idea.result,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  };
}

async function runEvaluation(payload) {
  const fallbackResult = evaluateIdeaLocally(payload);

  try {
    const rawResult = await evaluateWithOllama(payload, {
      baseUrl: config.ollamaBaseUrl,
      model: config.ollamaModel,
    });

    return {
      source: "ollama",
      result: normalizeEvaluationResult(rawResult, fallbackResult),
    };
  } catch (_error) {
    return {
      source: "local-fallback",
      result: fallbackResult,
    };
  }
}

ideaRouter.post("/evaluate", async (req, res, next) => {
  try {
    const payload = buildPayload(req.body);

    if (!hasEnoughInput(payload)) {
      return res.status(400).json({
        error: "Please provide a project name, problem statement, and core features.",
      });
    }

    const idea = createIdea({
      userId: req.auth.userId,
      workspaceId: req.body.workspaceId ?? null,
      ...payload,
    });
    const evaluation = await runEvaluation(payload);
    const savedIdea = await Idea.create({
      userId: idea.userId,
      workspaceId: idea.workspaceId,
      ...payload,
      source: evaluation.source,
      result: evaluation.result,
    });

    return res.status(201).json({
      ...evaluation,
      idea: serializeIdea(savedIdea),
    });
  } catch (error) {
    return next(error);
  }
});

ideaRouter.get("/ideas", async (req, res, next) => {
  try {
    const ideas = await Idea.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).limit(50);

    return res.json({
      ideas: ideas.map(serializeIdea),
    });
  } catch (error) {
    return next(error);
  }
});

ideaRouter.get("/ideas/:id", async (req, res, next) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    return res.json({ idea: serializeIdea(idea) });
  } catch (error) {
    return next(error);
  }
});

ideaRouter.delete("/ideas/:id", async (req, res, next) => {
  try {
    const deleted = await Idea.findOneAndDelete({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Idea not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
