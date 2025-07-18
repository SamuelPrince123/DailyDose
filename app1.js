// --- THEME SELECTOR & WEATHER & RIDDLE TOGGLE ---
window.addEventListener("DOMContentLoaded", () => {
  // THEME SELECTOR SETUP
  const themeSelector = document.getElementById("themeSelector");
  const savedTheme = localStorage.getItem("theme") || "";
  document.body.className = savedTheme;
  themeSelector.value = savedTheme;

  themeSelector.addEventListener("change", () => {
    const theme = themeSelector.value;
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    // We call updateKeywordTheme from app.js but since scripts run sequentially,
    // we need to ensure updateKeywordTheme is available globally
    if (typeof updateKeywordTheme === "function") {
      updateKeywordTheme();
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const themeSelector = document.getElementById("themeSelector");

    // Apply default theme class from selected option
    document.body.className = ""; // remove existing
    const selectedTheme = themeSelector.value;
    if (selectedTheme) {
      document.body.classList.add(selectedTheme);
    }

    // Handle user changes to theme
    themeSelector.addEventListener("change", () => {
      document.body.className = ""; // clear all
      const theme = themeSelector.value;
      if (theme) {
        document.body.classList.add(theme);
      }
    });
  });

  // WEATHER FEATURE
  document.getElementById("getWeather").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim() || "Thimphu";
    const out = document.getElementById("weatherResult");
    out.textContent = "Loading...";
    fetch(`https://wttr.in/${city}?format=j1`)
      .then((r) => r.json())
      .then((data) => {
        const tempC = data.current_condition[0].temp_C;
        const desc = data.current_condition[0].weatherDesc[0].value;
        const location = data.nearest_area[0].areaName[0].value;
        out.textContent = `${location}: ${tempC}°C, ${desc}`;
      })
      .catch(() => {
        out.textContent = "Error fetching weather.";
      });
  });

  // RIDDLE ANSWER TOGGLE
  document.getElementById("riddleBtn").addEventListener("click", () => {
    const ans = document.getElementById("riddleAnswer");
    ans.style.display = ans.style.display === "none" ? "block" : "none";
  });
});
