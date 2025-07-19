// --- THEME SELECTOR & WEATHER & RIDDLE TOGGLE ---
window.addEventListener("DOMContentLoaded", () => {
  // THEME SELECTOR SETUP
  const themeSelector = document.getElementById("themeSelector");
  const savedTheme = localStorage.getItem("theme") || "blue"; // default to blue if none saved

  // Apply saved or default theme to body and selector
  document.body.className = ""; // clear existing classes
  document.body.classList.add(savedTheme);
  themeSelector.value = savedTheme;

  themeSelector.addEventListener("change", () => {
    const theme = themeSelector.value || "blue"; // fallback to blue
    document.body.className = ""; // clear all classes
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);

    // Call updateKeywordTheme if exists globally
    if (typeof updateKeywordTheme === "function") {
      updateKeywordTheme();
    }
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
