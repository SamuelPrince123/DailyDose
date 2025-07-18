// --- CACHED API CONTENT (12-HOUR TTL) & FETCH ALL ---

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours in ms
const TS_KEY = "dailyDose_lastFetch";

async function fetchAndStoreAll() {
  const now = Date.now();

  // QUOTE
  try {
    const qr = await fetch("https://api.api-ninjas.com/v1/quotes", {
      headers: { "X-Api-Key": "KtnWtR5dGlw3+74D7grQYg==mzMWCWQ2Raih3DkU" },
    });
    const qd = await qr.json();
    const qt = `"${qd[0].quote}" — ${qd[0].author}`;
    localStorage.setItem("dailyDose_quote", qt);
    document.getElementById("quoteText").textContent = qt;
  } catch {}

  // JOKE
  try {
    const jr = await fetch("https://official-joke-api.appspot.com/random_joke");
    const jd = await jr.json();
    const jt = `${jd.setup} ${jd.punchline}`;
    localStorage.setItem("dailyDose_joke", jt);
    document.getElementById("jokeText").textContent = jt;
  } catch {}

  // WORD
  try {
    const wr = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1"
    );
    const [w] = await wr.json();
    const dr = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`
    );
    const dd = await dr.json();
    const def = dd[0].meanings[0].definitions[0].definition;
    localStorage.setItem("dailyDose_word", w);
    localStorage.setItem("dailyDose_def", def);
    document.getElementById("wordText").textContent = w;
    document.getElementById("defText").textContent = def;
  } catch {}

  // REDDIT (via AllOrigins to bypass CORS)
  try {
    console.log("Fetching Reddit posts via proxy...");
    const redditUrl = "https://www.reddit.com/r/popular/hot.json?limit=10";
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(redditUrl);
    console.log("Proxy URL:", proxyUrl);
    const rr = await fetch(proxyUrl);
    console.log("Raw Reddit response received");
    const rd = await rr.json();
    console.log("Parsed Reddit JSON:", rd);
    const posts = rd.data.children;
    if (!posts || posts.length === 0) {
      console.warn("No posts found in Reddit data");
      throw new Error("No posts found");
    }
    const p = posts[Math.floor(Math.random() * posts.length)].data;
    const rt = p.title;
    const ru = "https://reddit.com" + p.permalink;
    localStorage.setItem("dailyDose_redditTitle", rt);
    localStorage.setItem("dailyDose_redditUrl", ru);
    document.getElementById("redditText").textContent = rt;
    document.getElementById("redditLink").href = ru;
    console.log("Reddit post displayed:", rt, ru);
  } catch (e) {
    console.warn("Reddit fetch failed:", e);
    document.getElementById("redditText").textContent = "Could not load post.";
  }

  // FUN FACT
  try {
    const fr = await fetch(
      "https://uselessfacts.jsph.pl/random.json?language=en"
    );
    const fd = await fr.json();
    localStorage.setItem("dailyDose_fact", fd.text);
    document.getElementById("factText").textContent = fd.text;
  } catch {}

  // RIDDLE
  try {
    const rr2 = await fetch("https://riddles-api.vercel.app/random");
    const rd2 = await rr2.json();
    localStorage.setItem("dailyDose_riddleQ", rd2.riddle);
    localStorage.setItem("dailyDose_riddleA", rd2.answer);
    document.getElementById("riddleQuestion").textContent = rd2.riddle;
    document.getElementById("riddleAnswer").textContent = rd2.answer;
  } catch {}

  localStorage.setItem(TS_KEY, now.toString());
}

function loadCache() {
  const quote = localStorage.getItem("dailyDose_quote");
  const joke = localStorage.getItem("dailyDose_joke");
  const word = localStorage.getItem("dailyDose_word");
  const def = localStorage.getItem("dailyDose_def");
  const rt = localStorage.getItem("dailyDose_redditTitle");
  const ru = localStorage.getItem("dailyDose_redditUrl");
  const fact = localStorage.getItem("dailyDose_fact");
  const rQ = localStorage.getItem("dailyDose_riddleQ");
  const rA = localStorage.getItem("dailyDose_riddleA");

  if (quote) document.getElementById("quoteText").textContent = quote;
  if (joke) document.getElementById("jokeText").textContent = joke;
  if (word) document.getElementById("wordText").textContent = word;
  if (def) document.getElementById("defText").textContent = def;
  if (rt) {
    document.getElementById("redditText").textContent = rt;
    document.getElementById("redditLink").href = ru;
  }
  if (fact) document.getElementById("factText").textContent = fact;
  if (rQ) document.getElementById("riddleQuestion").textContent = rQ;
  if (rA) document.getElementById("riddleAnswer").textContent = rA;
}

// On DOMContentLoaded, decide to fetch or load cached
window.addEventListener("DOMContentLoaded", () => {
  const last = parseInt(localStorage.getItem(TS_KEY), 10) || 0;
  if (Date.now() - last > CACHE_TTL) {
    fetchAndStoreAll();
  } else {
    loadCache();
  }
  // schedule next fetch in 12h
  setInterval(fetchAndStoreAll, CACHE_TTL);
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
