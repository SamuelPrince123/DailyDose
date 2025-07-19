// --- DIGITAL CLOCK ---
const hEl = document.getElementById("hour");
const mEl = document.getElementById("minute");
const sEl = document.getElementById("second");
const apEl = document.getElementById("ampm");
let counter = 0;

function tick() {
  const now = new Date();
  const opts = { hour12: true, timeZone: "Asia/Thimphu" };

  const parts = now
    .toLocaleTimeString("en-US", {
      ...opts,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .split(" "); // ["HH:MM:SS", "AM"/"PM"]

  const [h, m, s] = parts[0].split(":");
  hEl.textContent = h;
  mEl.textContent = m;
  sEl.textContent = s;
  apEl.textContent = parts[1];

  counter++;
  if (counter % 5 === 0) {
    console.log(`Timer update: ${counter} seconds elapsed`);
  }
}
setInterval(tick, 1000);
tick();

// --- KEYWORD CONTENT LOADER & FILTER ---
let originalHtml = "";

async function loadPage(page) {
  console.log("Loading page:", page);
  try {
    const res = await fetch(page);
    let html = await res.text();
    originalHtml = html;
    document.getElementById("content").innerHTML = html;
    updateKeywordTheme();
    console.log("✅ Loaded keyword content successfully");
  } catch (err) {
    document.getElementById("content").innerHTML = "❌ Error loading page.";
    console.error("❌ Failed to load keyword page:", err);
  }
}

function updateKeywordTheme() {
  const bodyClass = document.body.className;
  const themes = {
    dark: { bg: "#1e1e1e", text: "#eee", h3: "#90caf9", h4: "#aad" },
    pink: { bg: "#ffe4ec", text: "#52002d", h3: "#d63384", h4: "#880044" },
    blue: { bg: "#e3f2fd", text: "#003c8f", h3: "#1565c0", h4: "#1976d2" },
    "high-contrast": { bg: "#000", text: "#fff", h3: "#ff0", h4: "#0ff" },
    "": { bg: "#fff", text: "#333", h3: "#222", h4: "#555" },
  };
  const current = themes[bodyClass] || themes[""];
  document.querySelectorAll(".keyword-block").forEach((block) => {
    block.style.background = current.bg;
    block.style.color = current.text;
  });
  document.querySelectorAll(".keyword-block h3").forEach((h) => {
    h.style.color = current.h3;
  });
  document.querySelectorAll(".api-result h4").forEach((h) => {
    h.style.color = current.h4;
  });
}

function filterContent(query) {
  if (!originalHtml) return;
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalHtml, "text/html");
  const articles = [...doc.querySelectorAll(".keyword-block")];
  const matched = articles.filter((article) =>
    article.textContent.toLowerCase().includes(query.toLowerCase())
  );
  document.getElementById("content").innerHTML = matched.length
    ? matched.map((a) => a.outerHTML).join("")
    : "<p>No related results found.</p>";
  updateKeywordTheme();
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (query === "") {
    document.getElementById("content").innerHTML = originalHtml;
    updateKeywordTheme();
  } else {
    filterContent(query);
  }
});

// ✅ Load keyword content on page load
window.addEventListener("DOMContentLoaded", () => {
  loadPage("./firebase-fetcher/keywordresult.html");
});
