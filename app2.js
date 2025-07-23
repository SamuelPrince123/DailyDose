// Firebase SDK v9+ (modular)
// Add your own Firebase config here:
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXdhk_j0E4TbWg07ZMMtwoNSptSJtfzN4",
  authDomain: "language-fire.firebaseapp.com",
  databaseURL: "https://language-fire-default-rtdb.firebaseio.com",
  projectId: "language-fire",
  storageBucket: "language-fire.appspot.com",
  messagingSenderId: "157676968990",
  appId: "1:157676968990:web:93699e570e3e842fd0620f",
  measurementId: "G-0035FLFKPM",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

window.addEventListener("DOMContentLoaded", () => {
  loadDailyData();
});

async function loadDailyData() {
  const dbRef = ref(db, "jokeData");

  try {
    const snapshot = await get(dbRef);
    const data = snapshot.val();
    const now = Date.now();

    if (data && data.lastFetch && now - data.lastFetch < CACHE_TTL) {
      console.log("✅ Loaded from Firebase cache");
      displayData(data);
    } else {
      console.log("🔄 Fetching fresh data from APIs...");
      const freshData = await fetchDailyDataFromApis();
      freshData.lastFetch = now;
      await set(dbRef, freshData);
      console.log("✅ Saved new data to Firebase");
      displayData(freshData);
    }
  } catch (err) {
    console.error("❌ Firebase error:", err);
  }
}

async function fetchWithRetry(fetchFn, description) {
  try {
    return await fetchFn();
  } catch (err) {
    console.warn(`⚠️ Error fetching ${description}, retrying…`, err);
    // retry once
    try {
      return await fetchFn();
    } catch (err2) {
      console.error(`❌ Retry failed for ${description}`, err2);
      throw err2;
    }
  }
}

async function fetchDailyDataFromApis() {
  const freshData = {};

  // Quote
  try {
    const qd = await fetchWithRetry(
      () =>
        fetch("https://api.api-ninjas.com/v1/quotes", {
          headers: { "X-Api-Key": "KtnWtR5dGlw3+74D7grQYg==mzMWCWQ2Raih3DkU" },
        }).then((r) => r.json()),
      "quote of the day"
    );
    freshData.quote = `"${qd[0].quote}" — ${qd[0].author}`;
  } catch {
    freshData.quote = "Couldn't load quote.";
  }

  // Joke
  try {
    const jd = await fetchWithRetry(
      () =>
        fetch("https://official-joke-api.appspot.com/random_joke").then((r) =>
          r.json()
        ),
      "joke"
    );
    freshData.joke = `${jd.setup} ${jd.punchline}`;
  } catch {
    freshData.joke = "Couldn't load joke.";
  }

  // Word + Definition
  try {
    const [w] = await fetchWithRetry(
      () =>
        fetch("https://random-word-api.herokuapp.com/word?number=1").then((r) =>
          r.json()
        ),
      "word of the day"
    );
    const dd = await fetchWithRetry(
      () =>
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${w}`).then(
          (r) => r.json()
        ),
      `definition for ${w}`
    );
    freshData.word = w;
    freshData.definition = dd[0].meanings[0].definitions[0].definition;
  } catch {
    freshData.word = "error";
    freshData.definition = "Definition not found.";
  }

  // Reddit post
  try {
    const rd = await fetchWithRetry(() => {
      const redditUrl = "https://www.reddit.com/r/popular/hot.json?limit=10";
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(redditUrl);
      return fetch(proxyUrl).then((r) => r.json());
    }, "Reddit post");
    const post =
      rd.data.children[Math.floor(Math.random() * rd.data.children.length)]
        .data;
    freshData.redditTitle = post.title;
    freshData.redditUrl = "https://reddit.com" + post.permalink;
  } catch {
    freshData.redditTitle = "No Reddit post available.";
    freshData.redditUrl = "#";
  }

  // Fun Fact
  try {
    const fd = await fetchWithRetry(
      () =>
        fetch("https://uselessfacts.jsph.pl/random.json?language=en").then(
          (r) => r.json()
        ),
      "fun fact"
    );
    freshData.funFact = fd.text;
  } catch {
    freshData.funFact = "Couldn't load fun fact.";
  }

  // Riddle
  try {
    const rd2 = await fetchWithRetry(
      () =>
        fetch("https://riddles-api.vercel.app/random").then((r) => r.json()),
      "riddle"
    );
    freshData.riddleQuestion = rd2.riddle;
    freshData.riddleAnswer = rd2.answer;
  } catch {
    freshData.riddleQuestion = "No riddle today.";
    freshData.riddleAnswer = "Try again later.";
  }

  return freshData;
}

function displayData(data) {
  if (!data) return;

  document.getElementById("quoteText").textContent = data.quote || "—";
  document.getElementById("jokeText").textContent = data.joke || "—";
  document.getElementById("wordText").textContent = data.word || "—";
  document.getElementById("defText").textContent = data.definition || "—";
  document.getElementById("redditText").textContent = data.redditTitle || "—";
  document.getElementById("redditLink").href = data.redditUrl || "#";
  document.getElementById("factText").textContent = data.funFact || "—";
  document.getElementById("riddleQuestion").textContent =
    data.riddleQuestion || "—";
  document.getElementById("riddleAnswer").textContent =
    data.riddleAnswer || "—";
}
