document.addEventListener("DOMContentLoaded", function () {
    const judgeSelect = document.getElementById("judgeSelect");
    const startBtn = document.getElementById("startBtn");
  
    const API_URL = "https://scoreboard-u4yf.onrender.com"; // Replace with your actual Render URL
  
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
          let option = document.createElement("option");
          option.value = judge._id;
          option.textContent = judge.name;
          judgeSelect.appendChild(option);
        });
      })
      .catch((err) => console.error("Error fetching judges:", err));
  
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