document.addEventListener("DOMContentLoaded", function () {
    const judgeSelect = document.getElementById("judgeSelect");
    const startBtn = document.getElementById("startBtn");

    const API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3005' // For local development
        : 'https://scoreboard-u4yf.onrender.com'; // Replace with your actual Render URL

    // Fetch judges from API
    fetch(`${API_URL}/api/judges`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((judges) => {
            judges.forEach((judge) => {
                let label = document.createElement("label");
                label.classList.add("label");

                let input = document.createElement("input");
                input.type = "radio";
                input.name = "judge";
                input.value = judge._id;

                let span = document.createElement("span");
                span.classList.add("text");
                span.textContent = judge.name;

                label.appendChild(input);
                label.appendChild(span);
                judgeSelect.appendChild(label);
            });
        })
        .catch((err) => console.error("Error fetching judges:", err));

    // Enable button when a judge is selected
    judgeSelect.addEventListener("change", function () {
        startBtn.disabled = !document.querySelector('input[name="judge"]:checked');
    });

    // Save selected judge and go to scoring page
    startBtn.addEventListener("click", function () {
        const selectedJudge = document.querySelector('input[name="judge"]:checked');
        if (selectedJudge) {
            localStorage.setItem("judgeId", selectedJudge.value);
            window.location.href = "./frontend/score.html";
        }
    });
});
