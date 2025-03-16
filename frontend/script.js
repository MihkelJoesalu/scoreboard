document.addEventListener("DOMContentLoaded", function () {
        const judgeSelect = document.getElementById("judgeSelect");
        const startBtn = document.getElementById("startBtn");
    
        // Fetch judges from API
        fetch("http://localhost:3005/api/judges")
            .then(res => res.json())
            .then(judges => {
                judges.forEach(judge => {
                    let option = document.createElement("option");
                    option.value = judge._id;
                    option.textContent = judge.name;
                    judgeSelect.appendChild(option);
                });
            })
            .catch(err => console.error("Error fetching judges:", err));
    
        // Enable button when a judge is selected
        judgeSelect.addEventListener("change", function () {
            startBtn.disabled = !judgeSelect.value;
        });
    
        // Save selected judge and go to scoring page
        startBtn.addEventListener("click", function () {
            localStorage.setItem("judgeId", judgeSelect.value);
            window.location.href = "scoring.html";
        });
    });