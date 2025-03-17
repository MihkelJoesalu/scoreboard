document.addEventListener("DOMContentLoaded", async function () {
    const judgeId = localStorage.getItem("judgeId");
    const judgeName = localStorage.getItem("judgeName");
    const judgeNameEl = document.getElementById("judgeName");
    const teamSelect = document.getElementById("teamSelect");
    const scoreForm = document.getElementById("scoreForm");

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-u4yf.onrender.com'; // Replace with your actual Render URL

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
    judgeNameEl.textContent = `Judge: ${judgeData.name}`;

    // Fetch teams that haven't been rated by this judge
    const teamsRes = await fetch(`${API_URL}/api/unrated-teams/${judgeData.name}`);
    const teams = await teamsRes.json();

    teams.forEach(team => {
        let option = document.createElement("option");
        option.value = team._id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });

    // Function to reset sliders
    function resetSliders() {
        const sliders = scoreForm.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.value = 0;
            slider.nextElementSibling.textContent = 0;
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

            // Remove rated team from dropdown
            teamSelect.querySelector(`option[value="${teamId}"]`).remove();

            // Reset sliders
            resetSliders();

            // If all teams are rated, go to results page
            if (teamSelect.options.length === 1) {
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
