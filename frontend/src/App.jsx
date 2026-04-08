import React, { useState } from "react";

const initialForm = {
  projectName: "",
  problem: "",
  audience: "",
  coreFeatures: "",
  constraints: "",
};

function ScoreCard({ label, value }) {
  return (
    <div className="score-card">
      <span>{label}</span>
      <strong>{value}/10</strong>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <section className="result-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The frontend only collects input; the actual evaluation happens on the backend.
      const response = await fetch("http://localhost:4000/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate the project idea.");
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="hero">
        <p className="eyebrow">Idea Validation Tool</p>
        <h1>IdeaScope</h1>
        <p className="hero-copy">
          Turn a rough idea into a sharper MVP, a clearer target market, and a
          more realistic plan.
        </p>
      </div>

      <main className="layout">
        <form className="idea-form" onSubmit={handleSubmit}>
          <label>
            Project name
            <input
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              placeholder="Neighborhood Match"
            />
          </label>

          <label>
            Problem to solve
            <textarea
              name="problem"
              value={form.problem}
              onChange={handleChange}
              placeholder="Home buyers struggle to compare properties and neighborhood fit before talking to an agent."
              rows="4"
            />
          </label>

          <label>
            Target audience
            <input
              name="audience"
              value={form.audience}
              onChange={handleChange}
              placeholder="First-time home buyers in growing city markets"
            />
          </label>

          <label>
            Core features
            <textarea
              name="coreFeatures"
              value={form.coreFeatures}
              onChange={handleChange}
              placeholder="Property comparison, affordability filters, neighborhood scoring, buyer-fit recommendations"
              rows="4"
            />
          </label>

          <label>
            Constraints
            <textarea
              name="constraints"
              value={form.constraints}
              onChange={handleChange}
              placeholder="Must launch in one city first, work with limited listing data, and be testable with a small pilot."
              rows="3"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Evaluating..." : "Evaluate idea"}
          </button>

          {error ? <p className="error-message">{error}</p> : null}
        </form>

        <section className="results-panel">
          {!result ? (
            <div className="placeholder-card">
              <h2>What you'll get</h2>
              <p>
                A structured review with scores, MVP scope, risks, stretch
                goals, and clear positioning for the idea.
              </p>
            </div>
          ) : (
            // We only show the result card after the backend returns a completed evaluation.
            <div className="result-card">
              <div className="result-header">
                <div>
                  <p className="source-chip">
                    Source: {result.source === "ollama" ? "Ollama" : "Local fallback"}
                  </p>
                  <h2>{result.result.title}</h2>
                  <p>{result.result.recommendation}</p>
                </div>
                <div className="overall-score">
                  <span>Overall</span>
                  <strong>{result.result.overallScore}/10</strong>
                </div>
              </div>

              <div className="score-grid">
                <ScoreCard label="Originality" value={result.result.scores.originality} />
                <ScoreCard label="Feasibility" value={result.result.scores.feasibility} />
                <ScoreCard label="Market value" value={result.result.scores.marketValue} />
                <ScoreCard label="Complexity" value={result.result.scores.complexity} />
              </div>

              <div className="summary-block">
                <h3>Target audience</h3>
                <p>{result.result.targetAudience}</p>
                <h3>One-line product angle</h3>
                <p>{result.result.oneLiner}</p>
                <h3>Positioning</h3>
                <p>{result.result.positioning}</p>
              </div>

              <Section title="Strengths" items={result.result.strengths} />
              <Section title="Risks" items={result.result.risks} />
              <Section title="MVP" items={result.result.mvp} />
              <Section title="Stretch goals" items={result.result.stretchGoals} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
