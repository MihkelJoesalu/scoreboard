document.addEventListener("DOMContentLoaded", async function () {
    const resultsTable = document.querySelector("#resultsTable tbody");

    // Define your API base URL
    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Render URL

    try {
        const response = await fetch(`${API_URL}/api/results`);
        const results = await response.json();

        // Sort results by total score in descending order
        results.sort((a, b) => b.total - a.total);

        results.forEach(team => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${team.team}</td>
                <td>${team.total}</td>
                <td>${team.detailedScores.design}</td>
                <td>${team.detailedScores.factuality}</td>
                <td>${team.detailedScores.functionality}</td>
            `;

            resultsTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching results:", error);
        resultsTable.innerHTML = `<tr><td colspan="5">Failed to load results.</td></tr>`;
    }
});