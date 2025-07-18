import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

/* --- KEYWORDS VARIABLES --- */
const keywordInput = document.getElementById("keywordInput");
const keywordList = document.getElementById("keywordList");
let keyMap = new Map();
let selectedKeys = new Set();

/* --- RESULTS VARIABLES --- */
const resultInput = document.getElementById("resultInput");
const resultList = document.getElementById("resultList");
let resultMap = new Map();
let selectedResults = new Set();

/* --- KEYWORDS FUNCTIONS --- */
window.saveKeywords = () => {
  const text = keywordInput.value.trim();
  if (!text) return;

  const keywords = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  keywords.forEach((keyword) => {
    push(ref(db, "keywords"), keyword);
  });

  keywordInput.value = "";
};

function loadKeywords() {
  onValue(ref(db, "keywords"), (snapshot) => {
    keywordList.innerHTML = "";
    keyMap.clear();
    selectedKeys.clear();

    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const value = childSnapshot.val();

      const li = document.createElement("li");
      li.textContent = value;
      keyMap.set(li, key);

      li.addEventListener("click", () => {
        li.classList.toggle("selected");
        if (selectedKeys.has(key)) {
          selectedKeys.delete(key);
        } else {
          selectedKeys.add(key);
        }
      });

      keywordList.appendChild(li);
    });
  });
}

window.deleteSelectedKeywords = async () => {
  if (selectedKeys.size === 0) {
    console.log("No keywords selected for deletion.");
    return;
  }

  const keysArray = [...selectedKeys];
  console.log("Deleting keywords with keys:", keysArray);

  try {
    await Promise.all(
      keysArray.map((key) =>
        remove(ref(db, "keywords/" + key)).then(() => {
          console.log(`Deleted keyword with key: ${key}`);
        })
      )
    );

    selectedKeys.clear();
    console.log("All selected keywords deleted.");
  } catch (error) {
    console.error("Error deleting some keywords:", error);
  }
};

window.selectAllKeywords = () => {
  selectedKeys.clear();
  document.querySelectorAll("#keywordList li").forEach((li) => {
    li.classList.add("selected");
    const key = keyMap.get(li);
    if (key) selectedKeys.add(key);
  });
};

/* --- RESULTS FUNCTIONS --- */
window.saveResults = () => {
  const text = resultInput.value.trim();
  if (!text) return;

  const results = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  results.forEach((result) => {
    push(ref(db, "results"), result);
  });

  resultInput.value = "";
};

function loadResults() {
  onValue(ref(db, "results"), (snapshot) => {
    resultList.innerHTML = "";
    resultMap.clear();
    selectedResults.clear();

    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const value = childSnapshot.val();

      const li = document.createElement("li");
      li.textContent = value;
      resultMap.set(li, key);

      li.addEventListener("click", () => {
        li.classList.toggle("selected");
        if (selectedResults.has(key)) {
          selectedResults.delete(key);
        } else {
          selectedResults.add(key);
        }
      });

      resultList.appendChild(li);
    });
  });
}

window.deleteSelectedResults = async () => {
  if (selectedResults.size === 0) {
    console.log("No results selected for deletion.");
    return;
  }

  const keysArray = [...selectedResults];
  console.log("Deleting results with keys:", keysArray);

  try {
    await Promise.all(
      keysArray.map((key) =>
        remove(ref(db, "results/" + key)).then(() => {
          console.log(`Deleted result with key: ${key}`);
        })
      )
    );

    selectedResults.clear();
    console.log("All selected results deleted.");
  } catch (error) {
    console.error("Error deleting some results:", error);
  }
};

window.selectAllResults = () => {
  selectedResults.clear();
  document.querySelectorAll("#resultList li").forEach((li) => {
    li.classList.add("selected");
    const key = resultMap.get(li);
    if (key) selectedResults.add(key);
  });
};

/* --- INITIAL LOADS --- */
loadKeywords();
loadResults();
