document.addEventListener("DOMContentLoaded", function () {
        const judgeSelect = document.getElementById("judgeSelect");
        const startBtn = document.getElementById("startBtn");

// Define your CORS configuration
const API_URL = process.env.NODE_ENV === 'production'
? 'https://scoreboard-henna.vercel.app' // Replace with your actual Vercel URL
: 'http://localhost:3005'; // For local development 

        // Fetch judges from API
        fetch(API_URL + "/api/judges")
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
            window.location.href = "./frontend/score.html";
        });
    });