// script.js

document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle (Light/Dark) with localStorage
  const themeToggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.body.classList.add("dark");
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });

  // Utility: Get random element from array
  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Quote of the Day
  const quotes = [
    "The best way to predict the future is to create it.",
    "Keep your face always toward the sunshine—and shadows will fall behind you.",
    "In the middle of every difficulty lies opportunity.",
  ];
  const quoteText = document.getElementById("quoteText");
  document.getElementById("newQuoteBtn").addEventListener("click", () => {
    quoteText.textContent = getRandomItem(quotes);
  });
  // Show initial random quote
  quoteText.textContent = getRandomItem(quotes);

  // Joke
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything.",
    "I told my computer I needed a break, and it said no problem - it needed one too!",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
  ];
  const jokeText = document.getElementById("jokeText");
  document.getElementById("newJokeBtn").addEventListener("click", () => {
    jokeText.textContent = getRandomItem(jokes);
  });
  jokeText.textContent = getRandomItem(jokes);

  // Fun Fact
  const facts = [
    "Honey never spoils.",
    "Bananas are berries, but strawberries aren't.",
    "A single strand of spaghetti is called a spaghetto.",
  ];
  const factText = document.getElementById("factText");
  document.getElementById("newFactBtn").addEventListener("click", () => {
    factText.textContent = getRandomItem(facts);
  });
  factText.textContent = getRandomItem(facts);

  // Riddle
  const riddles = [
    "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? - An echo",
    "I have branches, but no fruit, trunk or leaves. What am I? - A bank",
    "What can travel around the world while staying in a corner? - A stamp",
  ];
  const riddleText = document.getElementById("riddleText");
  document.getElementById("newRiddleBtn").addEventListener("click", () => {
    riddleText.textContent = getRandomItem(riddles);
  });
  riddleText.textContent = getRandomItem(riddles);

  // Word of the Day
  const words = [
    "Serendipity: finding something good without looking for it.",
    "Euphoria: a feeling of intense happiness.",
    "Ephemeral: lasting for a very short time.",
  ];
  const wordText = document.getElementById("wordText");
  document.getElementById("newWordBtn").addEventListener("click", () => {
    wordText.textContent = getRandomItem(words);
  });
  wordText.textContent = getRandomItem(words);

  // Weather (using OpenWeatherMap API)
  const apiKey = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your real API key
  const cityInput = document.getElementById("cityInput");
  const weatherResult = document.getElementById("weatherResult");
  document.getElementById("getWeatherBtn").addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
      weatherResult.textContent = "Please enter a city.";
      return;
    }
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.main) {
          weatherResult.textContent = `${data.name}: ${data.weather[0].description}, ${data.main.temp}°C`;
        } else {
          weatherResult.textContent = "City not found.";
        }
      })
      .catch((err) => {
        weatherResult.textContent = "Error fetching weather.";
      });
  });

  // Trending Reddit (fetch top post from r/popular)
  const redditResult = document.getElementById("redditResult");
  fetch("https://www.reddit.com/r/popular/top.json?limit=1")
    .then((response) => response.json())
    .then((data) => {
      if (data && data.data && data.data.children) {
        const post = data.data.children[0].data;
        redditResult.innerHTML = `<a href="https://reddit.com${post.permalink}" target="_blank">${post.title}</a>`;
      } else {
        redditResult.textContent = "Could not load post.";
      }
    })
    .catch((err) => {
      redditResult.textContent = "Error loading Reddit.";
    });

  // Checklist (with localStorage)
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskList = document.getElementById("taskList");
  const taskInput = document.getElementById("taskInput");

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.textContent = task;
      // Remove button for each task
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.addEventListener("click", () => {
        tasks.splice(index, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
      });
      li.appendChild(removeBtn);
      taskList.appendChild(li);
    });
  }

  document.getElementById("addTaskBtn").addEventListener("click", () => {
    const task = taskInput.value.trim();
    if (task) {
      tasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      taskInput.value = "";
      renderTasks();
    }
  });
  renderTasks(); // initial render

  // Notepad (auto-save to localStorage)
  const notes = document.getElementById("notes");
  notes.value = localStorage.getItem("notesContent") || "";
  notes.addEventListener("input", () => {
    localStorage.setItem("notesContent", notes.value);
  });

  // Mood Tracker (click emoji to log)
  let moodLog = JSON.parse(localStorage.getItem("moodLog")) || [];
  const moodLogList = document.getElementById("moodLog");
  function renderMoodLog() {
    moodLogList.innerHTML = "";
    moodLog.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      moodLogList.appendChild(li);
    });
  }
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mood = btn.textContent;
      const timestamp = new Date().toLocaleString();
      moodLog.push(`${timestamp}: ${mood}`);
      localStorage.setItem("moodLog", JSON.stringify(moodLog));
      renderMoodLog();
    });
  });
  renderMoodLog(); // initial render

  // Lucky Button (random number 1-100)
  const luckyResult = document.getElementById("luckyResult");
  document.getElementById("luckyBtn").addEventListener("click", () => {
    const number = Math.floor(Math.random() * 100) + 1;
    luckyResult.textContent = `You rolled a ${number}!`;
  });

  // Music Suggestion
  const songs = [
    "Lo-fi Beats to Study To",
    "Classical Piano Relaxation",
    "Upbeat Pop Mix",
    "Jazz for Focus",
    "Nature Sounds for Work",
  ];
  const musicSuggestion = document.getElementById("musicSuggestion");
  document.getElementById("newMusicBtn").addEventListener("click", () => {
    musicSuggestion.textContent = getRandomItem(songs);
  });
});
