document.addEventListener("DOMContentLoaded", async function () {
    const judgeId = localStorage.getItem("judgeId");
    const judgeName = localStorage.getItem("judgeName");
    const judgeNameEl = document.getElementById("judgeName");
    const teamList = document.getElementById("teamList");
    const scoreForm = document.getElementById("scoreForm");
    const submitScoresButton = document.getElementById("submitScores");

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Render URL

    // Fetch all judges
    const judgesRes = await fetch(`${API_URL}/api/judges`);
    const judges = await judgesRes.json();

    // Find the judge by ID or Name
    const judgeData = judges.find(judge => judge._id === judgeId || judge.name === judgeName);

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
        
            // Highlight selected team
            document.querySelectorAll("#teamList a, #ratedTeamList a").forEach(link => link.classList.remove("selected"));
            a.classList.add("selected");
        
            selectedTeam = team;
            isRatedTeam = isRated;
            
            // Enable sliders
            enableSliders();
        
            // If it's a rated team, load existing scores
            if (isRated) {
                updateSliders(team.scores);
                submitScoresButton.textContent = "Muuda hindeid";  // Change button text
            } else {
                resetSliders();
                submitScoresButton.textContent = "Kinnita hinded";  // Default button text
            }
            console.log(selectedTeam)
        });
        

        li.appendChild(a);
        return li;
    }

    // Populate Unrated Teams List
    unratedTeams.forEach(team => teamList.appendChild(createTeamListItem(team, false)));

    // Populate Rated Teams List
    ratedTeams.forEach(team => ratedTeamList.appendChild(createTeamListItem(team, true)));
   
    // Function to enable sliders
    function enableSliders() {
        const sliders = scoreForm.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.disabled = false; // Enable the slider
        });
    }

    // Function to reset sliders
    function resetSliders() {
        const sliders = scoreForm.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.value = 0;
            slider.previousElementSibling.textContent = 0;
            slider.disabled = true;
        });
    }

    // Function to update sliders with existing scores
    function updateSliders(scores) {
        const sliders = scoreForm.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            const [category, type] = slider.name.split('.');
            if (scores[category] && scores[category][type] !== undefined) {
                slider.value = scores[category][type];
                slider.previousElementSibling.textContent = scores[category][type];
        }
        });
    }

    // Add event listeners to update slider value display
    const sliders = scoreForm.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        slider.addEventListener("input", function () {
            slider.previousElementSibling.textContent = slider.value;
        });
    });

    submitScoresButton.addEventListener("click", async function (event) {
        event.preventDefault();
        console.log(team.teamName || team.name)
    
        if (!selectedTeam) {
            alert("Palun vali tiim!");
            return;
        }
    
        const teamId = selectedTeam.teamId || selectedTeam._id;
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
    
        try {
            // First, check if the team is already rated
            const checkRes = await fetch(`${API_URL}/api/rated-teams/${judgeData.name}`);
            const ratedTeams = await checkRes.json();
            const isAlreadyRated = ratedTeams.some(team => team.teamId === teamId || team._id === teamId);
    
            // Determine correct method & endpoint
            const method = isAlreadyRated ? "PUT" : "POST";
            const endpoint = `${API_URL}/api/rate`;
    
            const response = await fetch(endpoint, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ judgeId, teamId, scores })
            });
    
            if (response.ok) {
                alert(isAlreadyRated ? "Hinded uuendatud!" : "Hindamine õnnestus!");
    
                if (!isAlreadyRated) {
                    // Move the team from unrated to rated list
                    selectedTeam.parentElement.remove();
                    ratedTeamList.appendChild(createTeamListItem(selectedTeam, true));
                }
                resetSliders();

                submitScoresButton.textContent = "Kinnita hinded";
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Hindamisel tekkis viga!");
            }
        } catch (error) {
            console.error("Serveri viga:", error);
            alert("Võrgu viga, proovi uuesti!");
        }
    });
    

    // See results button
    document.getElementById("seeResultsBtn").addEventListener("click", function () {
        window.location.href = "results.html";
    });
});