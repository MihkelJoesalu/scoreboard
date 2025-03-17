document.addEventListener("DOMContentLoaded", async function () {
  const resultsTable = document.querySelector("#resultsTable tbody");

  const API_URL = "https://scoreboard-u4yf.onrender.com";

  try {
    const response = await fetch(`${API_URL}/api/results`);
    const results = await response.json();

    results.sort((a, b) => b.total - a.total);

    results.forEach((team) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${team.team}</td>
                <td>${team.total}</td>
                <td>${team.detailedScores.design}</td>
                <td>${team.detailedScores.factuality}</td>
                <td>${team.detailedScores.functionality}</td>
                <td>${team.detailedScores.codeQuality}</td>
            `;

      resultsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    resultsTable.innerHTML = `<tr><td colspan="6">Failed to load results.</td></tr>`;
  }
});
