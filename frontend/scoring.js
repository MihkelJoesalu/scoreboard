document.addEventListener("DOMContentLoaded", async function () {
    const judgeId = localStorage.getItem("judgeId");
    const judgeName = localStorage.getItem("judgeName");
    const judgeNameEl = document.getElementById("judgeName");
    const teamList = document.getElementById("teamList");
    const scoreForm = document.getElementById("scoreForm");
    const submitScoresLink = document.getElementById("submitScores");

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Render URL

    // Fetch all judges
    const judgesRes = await fetch(`${API_URL}/api/judges`);
    const judges = await judgesRes.json();

    // Find the judge by ID or Name
    const judgeData = judges.find(judge => judge._id === judgeId || judge.name === judgeName);

    if (!judgeData) {
        console.error("Judge not found");
        return;
    }

    // Display judge's name
    judgeNameEl.textContent = `Hindaja: ${judgeData.name}`;
    
    // Fetch teams that haven't been rated by this judge
    const teamsRes = await fetch(`${API_URL}/api/unrated-teams/${judgeData.name}`);
    const teams = await teamsRes.json();

    teams.forEach(team => {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = "#";
        a.textContent = team.name;
        a.dataset.teamId = team._id;

        a.addEventListener("click", function (event) {
            event.preventDefault();
            const links = teamList.querySelectorAll("a");
            links.forEach(link => link.classList.remove("selected"));
            a.classList.add("selected");

            const sliders = scoreForm.querySelectorAll('input[type="range"]');
            sliders.forEach(slider => {
                slider.disabled = false;
            });
        });

        li.appendChild(a);
        teamList.appendChild(li);
    });

        // Fetch rated teams for this judge
        const ratedTeamsRes = await fetch(`${API_URL}/api/rated-teams/${judgeData.name}`);
        const ratedTeams = await ratedTeamsRes.json();
    
        ratedTeams.forEach(team => {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.href = "#";
            a.textContent = `${team.teamName} (Rated)`;
            a.dataset.teamId = team.teamId;
    
            // Display team score when clicked
            a.addEventListener("click", function (event) {
                event.preventDefault();
    
                // Prefill the score form with the existing scores
                const sliders = scoreForm.querySelectorAll('input[type="range"]');
                sliders.forEach(slider => {
                    slider.disabled = false;
                    const scoreType = slider.name.split('.')[0]; // design, factuality, or functionality
                    const scoreSubType = slider.name.split('.')[1]; // visuaalne, interaktiivne, etc.
    
                    slider.value = team.scores[scoreType][scoreSubType] || 0;
                    slider.previousElementSibling.textContent = slider.value;
                });
    
                const links = ratedTeamsList.querySelectorAll("a");
                links.forEach(link => link.classList.remove("selected"));
                a.classList.add("selected");
            });
    
            li.appendChild(a);
            ratedTeamsList.appendChild(li); // Append to a different list for rated teams
        });

    // Function to reset sliders
    function resetSliders() {
        const sliders = scoreForm.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.value = 0;
            slider.previousElementSibling.textContent = 0;
            slider.disabled = true;
        });
    }

    // Function to update slider value display
    function updateSliderValue(slider) {
        const valueDisplay = slider.previousElementSibling;
        valueDisplay.textContent = slider.value;
    }

    // Add event listeners to update slider value display
    const sliders = scoreForm.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener("input", function () {
            updateSliderValue(slider);
        });
    });

    // Handle form submission when the link is clicked
    submitScoresLink.addEventListener("click", async function (event) {
        event.preventDefault();

        const selectedTeam = teamList.querySelector("a.selected");
        if (!selectedTeam) {
            alert("Please select a team");
            return;
        }

        const teamId = selectedTeam.dataset.teamId;
        const formData = new FormData(scoreForm);
        let scores = {
            design: {
                visuaalne: Number(formData.get("design.visuaalne")),
                interaktiivne: Number(formData.get("design.interaktiivne")),
                illustratiivne: Number(formData.get("design.illustratiivne")),
            },
            factuality: {
                aktuaalne: Number(formData.get("factuality.aktuaalne")),
                usaldusväärne: Number(formData.get("factuality.usaldusväärne")),
                õpetlik: Number(formData.get("factuality.õpetlik")),
            },
            functionality: {
                jõudlus: Number(formData.get("functionality.jõudlus")),
                dokumentatsioon: Number(formData.get("functionality.dokumentatsioon")),
                struktuur: Number(formData.get("functionality.struktuur")),
            }
        };

        // Send scores to backend
        const response = await fetch(`${API_URL}/api/rate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ judgeId, teamId, scores })
        });

        if (response.ok) {
            alert("Hindamine õnnestus!");

            // Remove rated team from list
            selectedTeam.parentElement.remove();

            // Reset sliders
            resetSliders();

            // If all teams are rated, go to results page
            if (teamList.children.length === 0) {
                window.location.href = "results.html";
            }
        } else {
            alert("Hindamisel tekkis viga!");
        }
    });

    // See results button
    document.getElementById("seeResultsBtn").addEventListener("click", function () {
        window.location.href = "results.html";
    });
});