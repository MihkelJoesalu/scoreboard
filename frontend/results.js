document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Railway URL

    const resultsTableBody = document.querySelector("#resultsTable tbody");
    const bestOverallEl = document.querySelector("#bestOverall span");
    const bestDesignEl = document.querySelector("#bestDesign span");
    const bestFactualityEl = document.querySelector("#bestFactuality span");
    const bestFunctionalityEl = document.querySelector("#bestFunctionality span");

    // Fetch results from API
    try {
        const res = await fetch(`${API_URL}/api/results`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const results = await res.json();

        // Log the API response to the console for debugging
        console.log("API response:", results);

        let bestOverall = { team: "", score: 0 };
        let bestDesign = { team: "", score: 0 };
        let bestFactuality = { team: "", score: 0 };
        let bestFunctionality = { team: "", score: 0 };

        results.forEach(result => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${result.team}</td>
                <td>${result.total}</td>
                <td>${result.detailedScores.design}</td>
                <td>${result.detailedScores.factuality}</td>
                <td>${result.detailedScores.functionality}</td>
            `;
            resultsTableBody.appendChild(row);

            if (result.total > bestOverall.score) {
                bestOverall = { team: result.team, score: result.total };
            }
            if (result.detailedScores.design > bestDesign.score) {
                bestDesign = { team: result.team, score: result.detailedScores.design };
            }
            if (result.detailedScores.factuality > bestFactuality.score) {
                bestFactuality = { team: result.team, score: result.detailedScores.factuality };
            }
            if (result.detailedScores.functionality > bestFunctionality.score) {
                bestFunctionality = { team: result.team, score: result.detailedScores.functionality };
            }
        });

        bestOverallEl.textContent = bestOverall.team;
        bestDesignEl.textContent = bestDesign.team;
        bestFactualityEl.textContent = bestFactuality.team;
        bestFunctionalityEl.textContent = bestFunctionality.team;
    } catch (err) {
        console.error("Error fetching results:", err);
    }
});