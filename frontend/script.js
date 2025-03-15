document.addEventListener("DOMContentLoaded", async () => {
    // Handle Judge Login
    document.getElementById("loginBtn")?.addEventListener("click", async () => {
        const judgeName = document.getElementById("judgeName").value;
        if (!judgeName) return alert("Enter your name!");
        await registerJudge(judgeName);
        sessionStorage.setItem("judgeName", judgeName);
        loadTeams();
    });

    // Load Teams
    async function loadTeams() {
        const teams = await getTeams();
        const teamList = document.getElementById("teamList");
        teamList.innerHTML = "";
        teams.forEach(team => {
            const btn = document.createElement("button");
            btn.innerText = team.name;
            btn.onclick = () => {
                sessionStorage.setItem("teamId", team._id);
                sessionStorage.setItem("teamName", team.name);
                window.location.href = "score.html";
            };
            teamList.appendChild(btn);
        });
    }

    // Handle Score Submission
    document.getElementById("scoreForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const judgeName = sessionStorage.getItem("judgeName");
        const teamId = sessionStorage.getItem("teamId");

        const scores = {
            design: {
                visuallyAttractive: +document.getElementById("design1").value || 0,
                interactivity: +document.getElementById("design2").value || 0,
                intuitivity: +document.getElementById("design3").value || 0
            },
            factuality: {
                actuality: +document.getElementById("factual1").value || 0,
                credibility: +document.getElementById("factual2").value || 0,
                learningValue: +document.getElementById("factual3").value || 0
            },
            design: {
                visuallyAttractive: +document.getElementById("design1").value || 0,
                interactivity: +document.getElementById("design2").value || 0,
                intuitivity: +document.getElementById("design3").value || 0
            },
            factuality: {
                actuality: +document.getElementById("factual1").value || 0,
                credibility: +document.getElementById("factual2").value || 0,
                learningValue: +document.getElementById("factual3").value || 0
            },
        };

        await submitScores(judgeName, teamId, scores);
        window.location.href = "index.html";
    });

    // Load Results
    if (window.location.pathname.includes("results.html")) {
        const results = await getResults();
        document.getElementById("results").innerHTML = JSON.stringify(results, null, 2);
    }
});