document.addEventListener("DOMContentLoaded", async function () {
    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Render URL

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

        let bestOverall = { team: "", score: 0 };
        let bestDesign = { team: "", score: 0 };
        let bestFactuality = { team: "", score: 0 };
        let bestFunctionality = { team: "", score: 0 };

        results.forEach(result => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${result.team}</td>
                <td>${result.totalScore}</td>
                <td>${result.designScore}</td>
                <td>${result.factualityScore}</td>
                <td>${result.functionalityScore}</td>
            `;
            resultsTableBody.appendChild(row);

            if (result.totalScore > bestOverall.score) {
                bestOverall = { team: result.team, score: result.totalScore };
            }
            if (result.designScore > bestDesign.score) {
                bestDesign = { team: result.team, score: result.designScore };
            }
            if (result.factualityScore > bestFactuality.score) {
                bestFactuality = { team: result.team, score: result.factualityScore };
            }
            if (result.functionalityScore > bestFunctionality.score) {
                bestFunctionality = { team: result.team, score: result.functionalityScore };
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