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
    
       // Fetch unrated and rated teams
       const [unratedRes, ratedRes] = await Promise.all([
        fetch(`${API_URL}/api/unrated-teams/${judgeData.name}`),
        fetch(`${API_URL}/api/rated-teams/${judgeData.name}`)
    ]);

    const unratedTeams = await unratedRes.json();
    const ratedTeams = await ratedRes.json();

    function createTeamListItem(team, isRated = false) {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.href = "#";
        a.textContent = team.teamName || team.name; // Handle different response formats
        a.dataset.teamId = team.teamId || team._id;
        a.dataset.rated = isRated; // Mark rated teams

        a.addEventListener("click", function (event) {
            event.preventDefault();

            // Unselect teams from the other list
            if (isRated) {
                teamList.querySelectorAll("a").forEach(link => link.classList.remove("selected"));
            } else {
                ratedTeamList.querySelectorAll("a").forEach(link => link.classList.remove("selected"));
            }

            // Highlight selected team
            document.querySelectorAll("#teamList a, #ratedTeamList a").forEach(link => link.classList.remove("selected"));
            a.classList.add("selected");

            selectedTeam = team;
            isRatedTeam = isRated;

            if (isRated) {
                updateSliders(team.scores);
            } else {
                resetSliders();
            }
        });

        li.appendChild(a);
        return li;
    }

    // Populate Unrated Teams List
    unratedTeams.forEach(team => teamList.appendChild(createTeamListItem(team, false)));

    // Populate Rated Teams List
    ratedTeams.forEach(team => ratedTeamList.appendChild(createTeamListItem(team, true)));

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