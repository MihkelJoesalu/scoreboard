document.addEventListener("DOMContentLoaded", async function () {
    const judgeSelect = document.getElementById("judgeSelect");
    const startBtn = document.getElementById("startBtn");

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-production-51f7.up.railway.app'; // Replace with your actual Render URL

    // Fetch judges from API
    try {
        const res = await fetch(`${API_URL}/api/judges`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const judges = await res.json();

        // Dynamically add buttons for each judge
        judges.forEach(judge => {
            const button = document.createElement("a");
            button.href = "#";
            button.classList.add("button");
            button.dataset.judgeId = judge._id;
            button.textContent = judge.name;

            button.addEventListener("click", function (event) {
                event.preventDefault();
                localStorage.setItem("judgeId", judge._id);
                localStorage.setItem("judgeName", judge.name);
                window.location.href = "./frontend/score.html";
            });

            judgeSelect.appendChild(button);
        });
    } catch (err) {
        console.error("Error fetching judges:", err);
    }

    // Enable button when a judge is selected
    judgeSelect.addEventListener("change", function () {
        startBtn.disabled = !judgeSelect.value;
    });

    // Save selected judge and go to scoring page
    startBtn.addEventListener("click", function () {
        localStorage.setItem("judgeId", judgeSelect.value);
        window.location.href = "./frontend/score.html";
    });
});