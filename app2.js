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

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours  12 * 60 * 60 * 1000

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

async function fetchDailyDataFromApis() {
  const freshData = {};

  try {
    const qr = await fetch("https://api.api-ninjas.com/v1/quotes", {
      headers: { "X-Api-Key": "KtnWtR5dGlw3+74D7grQYg==mzMWCWQ2Raih3DkU" },
    });
    const qd = await qr.json();
    freshData.quote = `"${qd[0].quote}" — ${qd[0].author}`;
  } catch (e) {
    freshData.quote = "Couldn't load quote.";
  }

  try {
    const jr = await fetch("https://official-joke-api.appspot.com/random_joke");
    const jd = await jr.json();
    freshData.joke = `${jd.setup} ${jd.punchline}`;
  } catch {
    freshData.joke = "Couldn't load joke.";
  }

  try {
    const wr = await fetch(
      "https://random-word-api.herokuapp.com/word?number=1"
    );
    const [w] = await wr.json();
    const dr = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`
    );
    const dd = await dr.json();
    freshData.word = w;
    freshData.definition = dd[0].meanings[0].definitions[0].definition;
  } catch {
    freshData.word = "error";
    freshData.definition = "Definition not found.";
  }

  try {
    const redditUrl = "https://www.reddit.com/r/popular/hot.json?limit=10";
    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(redditUrl);
    const rr = await fetch(proxyUrl);
    const rd = await rr.json();
    const post = rd.data.children[Math.floor(Math.random() * 10)].data;
    freshData.redditTitle = post.title;
    freshData.redditUrl = "https://reddit.com" + post.permalink;
  } catch {
    freshData.redditTitle = "No Reddit post available.";
    freshData.redditUrl = "#";
  }

  try {
    const fr = await fetch(
      "https://uselessfacts.jsph.pl/random.json?language=en"
    );
    const fd = await fr.json();
    freshData.funFact = fd.text;
  } catch {
    freshData.funFact = "Couldn't load fun fact.";
  }

  try {
    const rr2 = await fetch("https://riddles-api.vercel.app/random");
    const rd2 = await rr2.json();
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
