const API_BASE = "https://localhost:3005/api";

// Register judge
async function registerJudge(name) {
  const res = await fetch(`${API_BASE}/judges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

// Get teams
async function getTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  return res.json();
}

// Submit scores
async function submitScores(judgeName, teamId, scores) {
  const res = await fetch(`${API_BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ judgeName, teamId, scores }),
  });
  return res.json();
}

// Get final results
async function getResults() {
  const res = await fetch(`${API_BASE}/results`);
  return res.json();
}
