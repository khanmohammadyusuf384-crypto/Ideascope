const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function keywordHits(text, keywords) {
  const normalized = text.toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function detectDomain(text) {
  // We classify the idea first so later summary text sounds relevant to the domain.
  if (
    text.includes("real estate") ||
    text.includes("property") ||
    text.includes("broker") ||
    text.includes("listing") ||
    text.includes("home buyer") ||
    text.includes("housing")
  ) {
    return "real-estate";
  }
  if (text.includes("student") || text.includes("education") || text.includes("school")) {
    return "education";
  }
  if (text.includes("developer") || text.includes("software") || text.includes("saas")) {
    return "software";
  }
  if (text.includes("small business") || text.includes("sme") || text.includes("local business")) {
    return "small-business";
  }
  return "general";
}

function scoreOriginality(text) {
  // These scores are heuristics, not model reasoning. Keywords nudge the score up or down.
  const boosts = keywordHits(text, [
    "ai",
    "automation",
    "niche",
    "market gap",
    "underserved",
    "workflow",
    "specialized",
    "real estate",
    "fintech",
    "healthcare",
  ]);
  const penalties = keywordHits(text, [
    "clone",
    "generic",
    "me too",
    "netflix",
    "spotify",
    "todo app",
  ]);

  return clamp(5 + boosts - penalties * 2, 1, 10);
}

function scoreFeasibility(text) {
  const penalties = keywordHits(text, [
    "nationwide marketplace",
    "multi-sided marketplace",
    "real-time bidding",
    "blockchain",
    "fully automated",
    "instant scale",
    "video streaming",
  ]);
  const boosts = keywordHits(text, [
    "mvp",
    "pilot",
    "single city",
    "single market",
    "dashboard",
    "prototype",
    "manual ops",
    "service business",
  ]);

  return clamp(6 + boosts - penalties, 1, 10);
}

function scoreMarketValue(text) {
  const boosts = keywordHits(text, [
    "revenue",
    "cost saving",
    "time saving",
    "lead generation",
    "conversion",
    "operations",
    "compliance",
    "real estate",
    "b2b",
    "subscription",
  ]);

  return clamp(4 + boosts, 1, 10);
}

function scoreComplexity(text) {
  const boosts = keywordHits(text, [
    "search",
    "analytics",
    "ai",
    "recommendation",
    "dashboard",
    "history",
    "payments",
    "crm",
  ]);
  const penalties = keywordHits(text, [
    "multi-sided marketplace",
    "social network",
    "video streaming",
    "real-time bidding",
    "full automation",
  ]);

  return clamp(5 + boosts - penalties, 1, 10);
}

function inferAudience(text, audience) {
  const normalizedAudience = audience.trim();
  const domain = detectDomain(text);

  // If the user already told us the audience, we trust that over our own guess.
  if (normalizedAudience.length >= 3) {
    return normalizedAudience;
  }
  if (domain === "real-estate") {
    return "Property buyers, sellers, agents, and real-estate operators";
  }
  if (domain === "education") {
    return "Students, parents, and education-focused buyers";
  }
  if (domain === "small-business") {
    return "Small businesses that need simple operational tools";
  }
  if (domain === "software") {
    return "Teams evaluating whether a software idea is worth building";
  }
  return "A specific audience with a painful problem worth validating early";
}

function buildHighlights(text) {
  const highlights = [];

  if (text.includes("real estate") || text.includes("property")) {
    highlights.push("Targets a high-value market where even small efficiency gains can matter commercially.");
  }
  if (text.includes("ai") || text.includes("automation")) {
    highlights.push("Automation can create a clear before-and-after story if it removes repetitive work.");
  }
  if (text.includes("dashboard") || text.includes("analytics")) {
    highlights.push("Visible reporting can make the product easier to trust and easier to demo.");
  }
  if (text.includes("niche") || text.includes("local") || text.includes("single city")) {
    highlights.push("A focused niche can make early adoption and validation much more realistic.");
  }
  if (highlights.length === 0) {
    highlights.push("The idea has room for a focused MVP with real user-facing value.");
  }

  return highlights;
}

function buildRisks(text) {
  const risks = [];

  if (text.includes("marketplace")) {
    risks.push("Marketplace ideas are hard because supply, demand, and trust all need to work at the same time.");
  }
  if (text.includes("real estate") || text.includes("property")) {
    risks.push("Real-estate products often run into trust, data quality, and long sales-cycle challenges.");
  }
  if (text.includes("ai") || text.includes("automation")) {
    risks.push("If the automation makes mistakes in a high-stakes workflow, users may hesitate to rely on it.");
  }
  if (risks.length === 0) {
    risks.push("The biggest risk is shipping too many features before validating the core problem.");
  }

  return risks;
}

function buildMvp(text) {
  const items = [
    "A structured input flow that captures the user's problem, audience, and constraints.",
    "A simple evaluation or recommendation engine that produces a clear result.",
    "A results view that explains the reasoning in plain language.",
  ];

  if (text.includes("real estate") || text.includes("property")) {
    items.push("A focused workflow for one property use case, such as lead qualification, listing analysis, or buyer matching.");
  } else {
    items.push("Saved history so users can compare multiple ideas or scenarios over time.");
  }

  return items;
}

function buildStretchGoals(text) {
  const items = [
    "Comparison mode between two or more options.",
    "Export to PDF or Markdown for sharing with collaborators or investors.",
    "Recommendations for next steps based on score weak spots.",
  ];

  if (text.includes("real estate") || text.includes("property")) {
    items.push("Integrations with listing data, CRM tools, or neighborhood-level market signals.");
  }

  return items;
}

function buildOneLiner(text) {
  const domain = detectDomain(text);

  if (domain === "real-estate") {
    return "A focused real-estate product that helps buyers or agents make faster, better property decisions.";
  }
  if (domain === "education") {
    return "A focused education product that helps people make clearer learning or enrollment decisions.";
  }
  if (domain === "software") {
    return "A focused product concept that helps teams validate whether an idea is worth building.";
  }

  return "A focused concept that helps people decide whether an idea is worth testing before spending too much time or money.";
}

function buildPositioning(text) {
  const domain = detectDomain(text);

  if (domain === "real-estate") {
    return "Frame this as a real-estate decision-support product that reduces search friction, improves buyer confidence, and helps professionals qualify or guide leads more effectively.";
  }
  if (domain === "education") {
    return "Frame this as a decision-support product that helps users choose better learning paths with less confusion and wasted effort.";
  }
  if (domain === "software") {
    return "Frame this as a decision-support product that helps teams validate ideas, reduce wasted effort, and focus on the highest-value version first.";
  }

  return "Frame this as a decision-support product that helps users validate ideas, reduce wasted effort, and focus on the highest-value version first.";
}

function buildSummary(payload, ideaText, scores) {
  // The overall score is a simple average so the result stays easy to explain.
  const overall = Math.round(
    (scores.originality + scores.feasibility + scores.marketValue + scores.complexity) / 4
  );
  const recommendation =
    overall >= 8
      ? "This is a strong concept with clear differentiation and commercial promise."
      : overall >= 6
        ? "This idea is viable, but it needs tighter scope and clearer differentiation."
        : "This idea needs sharper positioning and a more focused first version.";

  return {
    title: "Idea review",
    overallScore: overall,
    recommendation,
    targetAudience: inferAudience(ideaText, payload.audience || ""),
    oneLiner: buildOneLiner(ideaText),
  };
}

export function evaluateIdeaLocally(payload) {
  const ideaText = [
    payload.projectName,
    payload.problem,
    payload.audience,
    payload.coreFeatures,
    payload.constraints,
  ]
    .filter(Boolean)
    .join(" \n")
    .toLowerCase();

  // We combine the input into one searchable text block so the fallback logic stays simple.
  const scores = {
    originality: scoreOriginality(ideaText),
    feasibility: scoreFeasibility(ideaText),
    marketValue: scoreMarketValue(ideaText),
    complexity: scoreComplexity(ideaText),
  };

  return {
    ...buildSummary(payload, ideaText, scores),
    scores,
    strengths: buildHighlights(ideaText),
    risks: buildRisks(ideaText),
    mvp: buildMvp(ideaText),
    stretchGoals: buildStretchGoals(ideaText),
    positioning: buildPositioning(ideaText),
  };
}
