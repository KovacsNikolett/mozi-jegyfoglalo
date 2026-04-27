const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const adminContent = document.getElementById("adminContent");
const movieForm = document.getElementById("movieForm");
const movieMessage = document.getElementById("movieMessage");
const screeningForm = document.getElementById("screeningForm");
const screeningMessage = document.getElementById("screeningMessage");
const screeningMovieId = document.getElementById("screeningMovieId");
const adminMovieList = document.getElementById("adminMovieList");
const refreshButton = document.getElementById("refreshButton");

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

function setMessage(element, text, color = "green") {
  element.textContent = text;
  element.style.color = color;
}

function showAdminContent() {
  adminContent.classList.remove("hidden");
  loadMoviesForAdmin();
}

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    email: document.getElementById("adminEmail").value,
    password: document.getElementById("adminPassword").value
  };

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (!response.ok) {
    setMessage(adminLoginMessage, result.message || "Sikertelen bejelentkezés.", "crimson");
    return;
  }

  if (result.user.role !== "admin") {
    setMessage(adminLoginMessage, "Ez a felhasználó nem admin.", "crimson");
    return;
  }

  localStorage.setItem("adminToken", result.token);
  setMessage(adminLoginMessage, "Sikeres admin bejelentkezés.");
  showAdminContent();
});

async function loadMoviesForAdmin() {
  const response = await fetch("/api/movies");
  const movies = await response.json();

  screeningMovieId.innerHTML = "";
  adminMovieList.innerHTML = "";

  movies.forEach(movie => {
    const option = document.createElement("option");
    option.value = movie.id;
    option.textContent = movie.title;
    screeningMovieId.appendChild(option);

    const screenings = movie.Screenings.map(screening => {
      return `<li>${new Date(screening.startTime).toLocaleString("hu-HU")} – ${screening.room} – ${screening.totalSeats} férőhely</li>`;
    }).join("");

    const item = document.createElement("div");
    item.className = "booking-item";
    item.innerHTML = `
      <strong>${movie.title}</strong><br>
      ${movie.description}<br>
      Hossz: ${movie.durationMinutes} perc
      <ul>${screenings || "<li>Nincs vetítés</li>"}</ul>
    `;
    adminMovieList.appendChild(item);
  });
}

movieForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    title: document.getElementById("movieTitle").value,
    description: document.getElementById("movieDescription").value,
    durationMinutes: Number(document.getElementById("movieDuration").value),
    posterUrl: document.getElementById("moviePosterUrl").value || "https://picsum.photos/seed/newmovie/400/600"
  };

  const response = await fetch("/api/admin/movies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    setMessage(movieMessage, "Film sikeresen hozzáadva.");
    movieForm.reset();
    loadMoviesForAdmin();
  } else {
    setMessage(movieMessage, result.message || "Nem sikerült hozzáadni a filmet.", "crimson");
  }
});

screeningForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    movieId: Number(document.getElementById("screeningMovieId").value),
    startTime: document.getElementById("screeningStartTime").value,
    room: document.getElementById("screeningRoom").value,
    totalSeats: Number(document.getElementById("screeningTotalSeats").value)
  };

  const response = await fetch("/api/admin/screenings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    setMessage(screeningMessage, "Vetítés sikeresen hozzáadva.");
    screeningForm.reset();
    loadMoviesForAdmin();
  } else {
    setMessage(screeningMessage, result.message || "Nem sikerült hozzáadni a vetítést.", "crimson");
  }
});

refreshButton.addEventListener("click", loadMoviesForAdmin);

if (getAdminToken()) {
  showAdminContent();
}
