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
