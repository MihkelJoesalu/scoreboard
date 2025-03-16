document.addEventListener("DOMContentLoaded", async function () {
        const judgeId = localStorage.getItem("judgeId");
        const judgeName = localStorage.getItem("judgeName");
        const judgeNameEl = document.getElementById("judgeName");
        const teamSelect = document.getElementById("teamSelect");
        const scoreForm = document.getElementById("scoreForm");
    
        if (!judgeId) {
            window.location.href = "index.html"; // Redirect if judge not selected
            return;
        }
    
// Fetch all judges (you mentioned judges, so we'll adjust for that)
    const judgesRes = await fetch("http://localhost:3005/api/judges");
    const judges = await judgesRes.json();

    // Find the judge by ID or Name
    const judgeData = judges.find(judge => judge._id === judgeId || judge.name === judgeName);
    
    if (!judgeData) {
        console.error("Judge not found");
        return;
    }

    // Display judge's name
    judgeNameEl.textContent = `Judge: ${judgeData.name}`;
    
        // Fetch teams that haven't been rated by this judge
    console.log("Kohtuniku nimi:", judgeName);
        const teamsRes = await fetch(`http://localhost:3005/api/unrated-teams/${judgeData.name}`);
        const teams = await teamsRes.json();
        
        teams.forEach(team => {
            let option = document.createElement("option");
            option.value = team._id;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    
        // Submit score
        scoreForm.addEventListener("submit", async function (event) {
            event.preventDefault();
    
            const teamId = teamSelect.value;
            if (!teamId) {
                alert("Please select a team");
                return;
            }
    
            const formData = new FormData(scoreForm);
            let scores = {
                design: {
                    visuallyAttractive: Number(formData.get("design.visuallyAttractive")),
                    interactivity: Number(formData.get("design.interactivity")),
                    intuitivity: Number(formData.get("design.intuitivity")),
                },
                factuality: {
                    actuality: Number(formData.get("factuality.actuality")),
                    credibility: Number(formData.get("factuality.credibility")),
                    learningValue: Number(formData.get("factuality.learningValue")),
                },
                functionality: {
                    mistakes: Number(formData.get("functionality.mistakes")),
                    reactionTime: Number(formData.get("functionality.reactionTime")),
                    errorManagement: Number(formData.get("functionality.errorManagement")),
                },
                codeQuality: {
                    structure: Number(formData.get("codeQuality.structure")),
                    dryPrinciples: Number(formData.get("codeQuality.dryPrinciples")),
                    bestPractices: Number(formData.get("codeQuality.bestPractices")),
                }
            };
    
            // Send scores to backend
            const response = await fetch("http://localhost:3005/api/rate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ judgeName: judgeId, teamId, scores })
            });
    
            if (response.ok) {
                alert("Score submitted successfully!");
    
                // Remove rated team from dropdown
                teamSelect.querySelector(`option[value="${teamId}"]`).remove();
    
                // If all teams are rated, go to results page
                if (teamSelect.options.length === 1) {
                    window.location.href = "results.html";
                }
            } else {
                alert("Error submitting score!");
            }
        });
    });