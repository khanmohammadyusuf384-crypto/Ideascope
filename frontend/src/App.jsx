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
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const token = localStorage.getItem("token"); // Example of retrieving a token from localStorage

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // The frontend only collects input; the actual evaluation happens on the backend.
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage
      const response = await fetch("http://localhost:4000/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}), // Replace with your actual token if needed
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate the project idea.");
      }

      setResult(data);
    } catch (submitError) {
      setResult(null);
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("token", data.token); // Store the token in localStorage
      alert("Login successful!");
    } catch (err) {
      alert(err.message);
    }
  };

  const evaluation = result?.result;
  const scoreValues = evaluation?.scores;

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
        <div style={{ marginBottom: "20px" }}>
          <h3>Login</h3>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleLogin}>
            Login
          </button>
        </div>

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
          {!evaluation ? (
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
                  <h2>{evaluation.title}</h2>
                  <p>{evaluation.recommendation}</p>
                </div>
                <div className="overall-score">
                  <span>Overall</span>
                  <strong>{evaluation.overallScore}/10</strong>
                </div>
              </div>

              <div className="score-grid">
                <ScoreCard label="Originality" value={scoreValues?.originality ?? "-"} />
                <ScoreCard label="Feasibility" value={scoreValues?.feasibility ?? "-"} />
                <ScoreCard label="Market value" value={scoreValues?.marketValue ?? "-"} />
                <ScoreCard label="Complexity" value={scoreValues?.complexity ?? "-"} />
              </div>

              <div className="summary-block">
                <h3>Target audience</h3>
                <p>{evaluation.targetAudience}</p>
                <h3>One-line product angle</h3>
                <p>{evaluation.oneLiner}</p>
                <h3>Positioning</h3>
                <p>{evaluation.positioning}</p>
              </div>

              <Section title="Strengths" items={evaluation.strengths} />
              <Section title="Risks" items={evaluation.risks} />
              <Section title="MVP" items={evaluation.mvp} />
              <Section title="Stretch goals" items={evaluation.stretchGoals} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
