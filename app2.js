// app2.js
// Firebase SDK v9+ (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
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

window.addEventListener("DOMContentLoaded", loadDailyData);

async function loadDailyData() {
  const dbRef = ref(db, "jokeData");
  try {
    const snapshot = await get(dbRef);
    const data = snapshot.val() || {};
    const now = Date.now();
    let freshData = { ...data };

    if (data.lastFetch && now - data.lastFetch < CACHE_TTL) {
      console.log("✅ Loaded from Firebase cache");

      const updateSections = [];
      if (
        data.word === "error" ||
        data.definition === "Definition not found."
      ) {
        console.log("🔄 Retrying Word of the Day...");
        updateSections.push(fetchWordSection());
      }
      if (!data.creativity) {
        console.log("🔄 Retrying Story Starter...");
        updateSections.push(fetchStoryStarterSection());
      }
      if (!data.photoUrl) {
        console.log("🔄 Retrying Photo of the Day...");
        updateSections.push(fetchPhotoOfTheDay());
      }

      if (updateSections.length) {
        const updates = await Promise.all(updateSections);
        updates.forEach((partial) => Object.assign(freshData, partial));
        freshData.lastFetch = now;
        await set(dbRef, freshData);
        console.log("✅ Updated failed sections only");
      }

      displayData(freshData);
    } else {
      console.log("🔄 Fetching fresh data from all APIs...");
      // Fetch everything except photo
      freshData = await fetchDailyDataFromApis();
      freshData.lastFetch = now;

      // **Only** generate photo if none exists already:
      if (data.photoUrl) {
        console.log(
          "📸 Preserving existing photoUrl from cache:",
          data.photoUrl
        );
        freshData.photoUrl = data.photoUrl;
      } else {
        console.log("📸 No photoUrl in cache, generating new one");
        const photoSection = await fetchPhotoOfTheDay();
        Object.assign(freshData, photoSection);
      }

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
    console.log("⏳ Fetching Quote of the Day...");
    const qd = await fetchWithRetry(
      () =>
        fetch("https://api.api-ninjas.com/v1/quotes", {
          headers: { "X-Api-Key": "KtnWtR5dGlw3+74D7grQYg==mzMWCWQ2Raih3DkU" },
        }).then((r) => r.json()),
      "quote of the day"
    );
    freshData.quote = `"${qd[0].quote}" — ${qd[0].author}`;
    console.log("✅ Quote:", freshData.quote);
  } catch (e) {
    freshData.quote = "Couldn't load quote.";
    console.error("❌ Quote Error:", e);
  }

  // Joke
  try {
    console.log("⏳ Fetching Joke of the Day...");
    const jd = await fetchWithRetry(
      () =>
        fetch("https://official-joke-api.appspot.com/random_joke").then((r) =>
          r.json()
        ),
      "joke"
    );
    freshData.joke = `${jd.setup} ${jd.punchline}`;
    console.log("✅ Joke:", freshData.joke);
  } catch (e) {
    freshData.joke = "Couldn't load joke.";
    console.error("❌ Joke Error:", e);
  }

  // Word + Definition
  Object.assign(freshData, await fetchWordSection());

  // Reddit
  try {
    console.log("⏳ Fetching Reddit post...");
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
    console.log("✅ Reddit:", freshData.redditTitle);
  } catch (e) {
    freshData.redditTitle = "No Reddit post available.";
    freshData.redditUrl = "#";
    console.error("❌ Reddit Error:", e);
  }

  // Fun Fact
  try {
    console.log("⏳ Fetching Fun Fact...");
    const fd = await fetchWithRetry(
      () =>
        fetch("https://uselessfacts.jsph.pl/random.json?language=en").then(
          (r) => r.json()
        ),
      "fun fact"
    );
    freshData.funFact = fd.text;
    console.log("✅ Fun Fact:", freshData.funFact);
  } catch (e) {
    freshData.funFact = "Couldn't load fun fact.";
    console.error("❌ Fun Fact Error:", e);
  }

  // Story Starter
  Object.assign(freshData, await fetchStoryStarterSection());

  // Riddle
  try {
    console.log("⏳ Fetching Riddle of the Day...");
    const rd2 = await fetchWithRetry(
      () =>
        fetch("https://riddles-api.vercel.app/random").then((r) => r.json()),
      "riddle"
    );
    freshData.riddleQuestion = rd2.riddle;
    freshData.riddleAnswer = rd2.answer;
    console.log("✅ Riddle:", freshData.riddleQuestion);
  } catch (e) {
    freshData.riddleQuestion = "No riddle today.";
    freshData.riddleAnswer = "Try again later.";
    console.error("❌ Riddle Error:", e);
  }

  return freshData;
}

async function fetchWordSection() {
  const wd = {};
  try {
    console.log("⏳ fetchWordSection()…");
    const [w] = await fetchWithRetry(
      () =>
        fetch("https://random-word-api.herokuapp.com/word?number=1").then((r) =>
          r.json()
        ),
      "word of the day"
    );
    console.log("🔗 Fetched Word:", w);

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`
    )}`;
    const dd = await fetchWithRetry(
      () =>
        fetch(proxyUrl)
          .then((r) => r.json())
          .then((d) => JSON.parse(d.contents)),
      `definition for ${w}`
    );

    wd.word = w;
    wd.definition =
      dd[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
      "Definition not found.";
    console.log("✅ Word Section:", wd);
  } catch (e) {
    wd.word = "error";
    wd.definition = "Definition not found.";
    console.error("❌ Word Section Error:", e);
  }
  return wd;
}

async function fetchStoryStarterSection() {
  const section = {};
  const fallbackPrompt = `
Start from here:
A mysterious stranger arrives at the village.

Your task: Continue this story. Imagine what happens next!

2 Don’ts:
- Don’t make it a dream.
- Don’t end the story with "It was all a mistake."
  `.trim();

  try {
    const proxyUrl = "https://corsproxy.io/?";
    const targetUrl = "https://shortstories-api.onrender.com/";
    const resp = await fetch(proxyUrl + encodeURIComponent(targetUrl));
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();

    if (!data.story) throw new Error("No story field in response");

    const firstSentence = data.story.split(". ")[0] + ".";

    section.creativity = `
Start from here:
${firstSentence}

Your task: Continue this story. Imagine what happens next!

2 Don’ts:
- Don’t make it a dream.
- Don’t end the story with "It was all a mistake."
    `.trim();
  } catch (e) {
    console.error("Story fetch error:", e);
    section.creativity = fallbackPrompt;
  }
  return section;
}

async function fetchPhotoOfTheDay() {
  try {
    console.log("⏳ Generating static Photo of the Day URL…");
    const randomId = Math.floor(Math.random() * 1000);
    const photoUrl = `https://picsum.photos/id/${randomId}/800/600`;
    console.log("✅ Static Photo URL generated:", photoUrl);
    return { photoUrl };
  } catch (err) {
    console.error("❌ Error generating photo URL:", err);
    return { photoUrl: "" };
  }
}

function displayData(data) {
  console.log("🔍 displayData called with:", data);

  // Photo
  if (data.photoUrl) {
    const img = document.getElementById("photoImage");
    if (img) img.src = data.photoUrl;
    const credit = document.getElementById("photoCredit");
    if (credit) credit.textContent = "Photo via Picsum";
  } else {
    console.warn("⚠️ No photoUrl found in data:", data);
  }

  // Other sections...
  document.getElementById("quoteText").textContent = data.quote || "—";
  document.getElementById("jokeText").textContent = data.joke || "—";
  document.getElementById("wordText").textContent = data.word || "—";
  document.getElementById("defText").textContent = data.definition || "—";
  document.getElementById("redditText").textContent = data.redditTitle || "—";
  document.getElementById("redditLink").href = data.redditUrl || "#";
  document.getElementById("factText").textContent = data.funFact || "—";
  document.getElementById("creativityText").textContent =
    data.creativity || "—";
  document.getElementById("riddleQuestion").textContent =
    data.riddleQuestion || "—";
  document.getElementById("riddleAnswer").textContent =
    data.riddleAnswer || "—";
}
