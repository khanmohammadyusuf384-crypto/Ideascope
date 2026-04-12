function buildPrompt(payload) {
  // The prompt asks for strict JSON so the backend can parse the model output reliably.
  return `
You are a product strategist reviewing a business or product idea.

Return valid JSON with these keys:
- title
- overallScore
- recommendation
- targetAudience
- oneLiner
- scores: { originality, feasibility, marketValue, complexity }
- strengths: string[]
- risks: string[]
- mvp: string[]
- stretchGoals: string[]
- positioning

Score from 1 to 10.
Be direct, constructive, and specific.
Do not assume the idea is for software developers unless the input clearly says so.
If the idea is about real estate, evaluate it in real-estate terms rather than portfolio-project terms.

Project name: ${payload.projectName}
Problem: ${payload.problem}
Audience: ${payload.audience}
Core features: ${payload.coreFeatures}
Constraints: ${payload.constraints}
`;
}

const clampScore = (value, fallback) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(1, Math.min(10, Math.round(numericValue)));
};

const normalizeText = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue || fallback;
};

const normalizeList = (value, fallback) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalizedItems = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalizedItems.length > 0 ? normalizedItems : fallback;
};

export function normalizeEvaluationResult(result, fallbackResult) {
  const safeResult = result && typeof result === "object" ? result : {};
  const safeScores = safeResult.scores && typeof safeResult.scores === "object" ? safeResult.scores : {};

  return {
    title: normalizeText(safeResult.title, fallbackResult.title),
    overallScore: clampScore(safeResult.overallScore, fallbackResult.overallScore),
    recommendation: normalizeText(safeResult.recommendation, fallbackResult.recommendation),
    targetAudience: normalizeText(safeResult.targetAudience, fallbackResult.targetAudience),
    oneLiner: normalizeText(safeResult.oneLiner, fallbackResult.oneLiner),
    scores: {
      originality: clampScore(safeScores.originality, fallbackResult.scores.originality),
      feasibility: clampScore(safeScores.feasibility, fallbackResult.scores.feasibility),
      marketValue: clampScore(safeScores.marketValue, fallbackResult.scores.marketValue),
      complexity: clampScore(safeScores.complexity, fallbackResult.scores.complexity),
    },
    strengths: normalizeList(safeResult.strengths, fallbackResult.strengths),
    risks: normalizeList(safeResult.risks, fallbackResult.risks),
    mvp: normalizeList(safeResult.mvp, fallbackResult.mvp),
    stretchGoals: normalizeList(safeResult.stretchGoals, fallbackResult.stretchGoals),
    positioning: normalizeText(safeResult.positioning, fallbackResult.positioning),
  };
}

export async function evaluateWithOllama(payload, { baseUrl, model }) {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: buildPrompt(payload),
      stream: false,
      // A single complete JSON response is easier to validate than token-by-token streaming here.
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const data = await response.json();
  // Ollama returns the JSON as text, so we parse it into a normal JavaScript object.
  return JSON.parse(data.response);
}
