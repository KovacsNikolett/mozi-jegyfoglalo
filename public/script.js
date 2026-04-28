const movieList = document.getElementById("movieList");
const screeningSelect = document.getElementById("screeningId");
const form = document.getElementById("bookingForm");
const message = document.getElementById("message");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const loggedOutBox = document.getElementById("loggedOutBox");
const loggedInBox = document.getElementById("loggedInBox");
const loggedInUser = document.getElementById("loggedInUser");
const logoutButton = document.getElementById("logoutButton");
const loadMyBookingsButton = document.getElementById("loadMyBookingsButton");
const myBookings = document.getElementById("myBookings");
let selectedSeats = [];

function getToken() {
  return localStorage.getItem("token");
}

function setAuthMessage(text, color = "green") {
  authMessage.textContent = text;
  authMessage.style.color = color;
}

function updateAuthView() {
  const token = getToken();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    loggedOutBox.classList.add("hidden");
    loggedInBox.classList.remove("hidden");
    loggedInUser.textContent = `${user.name} (${user.email})`;

    document.getElementById("customerName").value = user.name;
    document.getElementById("customerEmail").value = user.email;
  } else {
    loggedOutBox.classList.remove("hidden");
    loggedInBox.classList.add("hidden");
    loggedInUser.textContent = "";
    myBookings.innerHTML = "";
  }
}

async function loadMovies() {
  const response = await fetch("/api/movies");
  const movies = await response.json();

  movieList.innerHTML = "";
  screeningSelect.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("article");
    card.className = "movie-card";

    const screeningsHtml = movie.Screenings.map(s => {
      const date = new Date(s.startTime).toLocaleString("hu-HU");
      return `<li>${date} – ${s.room}</li>`;
    }).join("");

    card.innerHTML = `
      <img src="${movie.posterUrl}" alt="${movie.title} plakát">
      <div>
        <h3>${movie.title}</h3>
        <p>${movie.description}</p>
        <p><strong>Hossz:</strong> ${movie.durationMinutes} perc</p>
        <h4>Vetítések:</h4>
        <ul>${screeningsHtml}</ul>
      </div>
    `;
    movieList.appendChild(card);

    movie.Screenings.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id;
  option.textContent = `${movie.title} – ${new Date(s.startTime).toLocaleString("hu-HU")} – ${s.room}`;
  option.dataset.totalSeats = s.totalSeats;
  screeningSelect.appendChild(option);
    });
  });
  renderSeats();
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    name: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value
  };

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    setAuthMessage("Sikeres regisztráció! Most már be tudsz jelentkezni.");
    registerForm.reset();
  } else {
    setAuthMessage(result.message || "Sikertelen regisztráció.", "crimson");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  };

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setAuthMessage("Sikeres bejelentkezés!");
    loginForm.reset();
    updateAuthView();
  } else {
    setAuthMessage(result.message || "Sikertelen bejelentkezés.", "crimson");
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthMessage("Sikeres kijelentkezés.");
  updateAuthView();
});

loadMyBookingsButton.addEventListener("click", async () => {
  const response = await fetch("/api/bookings/my", {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    setAuthMessage(result.message || "Nem sikerült lekérni a foglalásokat.", "crimson");
    return;
  }

  if (result.length === 0) {
    myBookings.innerHTML = "<p>Még nincs saját foglalásod.</p>";
    return;
  }

  myBookings.innerHTML = result.map(booking => {
    const seats = JSON.parse(booking.seats).join(", ");
    const screening = booking.Screening;
    const movie = screening.Movie;
    return `
      <div class="booking-item">
        <strong>${movie.title}</strong><br>
        Időpont: ${new Date(screening.startTime).toLocaleString("hu-HU")}<br>
        Terem: ${screening.room}<br>
        Székek: ${seats}
      </div>
    `;
  }).join("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const seats = selectedSeats;
  

  const body = {
    screeningId: Number(screeningSelect.value),
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value,
    seats
  };

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    message.textContent = `Sikeres foglalás! Foglalási azonosító: ${result.id}`;
    message.style.color = "green";
    form.reset();
    updateAuthView();
  } else {
    message.textContent = result.message || "Hiba történt.";
    message.style.color = "crimson";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}

loadMovies();
updateAuthView();

async function getBookedSeats(screeningId) {
  const response = await fetch(`/api/screenings/${screeningId}/seats`);
  const result = await response.json();
  return result.bookedSeats || [];
}

function seatNameByNumber(number) {
  const rowLetter = String.fromCharCode(65 + Math.floor((number - 1) / 10));
  const seatNumber = ((number - 1) % 10) + 1;
  return `${rowLetter}${seatNumber}`;
}

async function renderSeats() {
  const seatMap = document.getElementById("seatMap");
  const selectedSeatsInput = document.getElementById("seats");
  const selectedOption = screeningSelect.options[screeningSelect.selectedIndex];

  if (!seatMap || !selectedOption) return;

  selectedSeats = [];
  selectedSeatsInput.value = "";

  const screeningId = screeningSelect.value;
  const totalSeats = Number(selectedOption.dataset.totalSeats || 40);
  const bookedSeats = await getBookedSeats(screeningId);

  seatMap.innerHTML = "";

  for (let i = 1; i <= totalSeats; i++) {
    const seatName = seatNameByNumber(i);
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = seatName;
    button.className = "seat-button";

    if (bookedSeats.includes(seatName)) {
      button.classList.add("booked-seat");
      button.disabled = true;
    }

    button.addEventListener("click", () => {
      if (button.classList.contains("selected-seat")) {
        button.classList.remove("selected-seat");
        selectedSeats = selectedSeats.filter(seat => seat !== seatName);
      } else {
        button.classList.add("selected-seat");
        selectedSeats.push(seatName);
      }

      selectedSeatsInput.value = selectedSeats.join(",");
    });

    seatMap.appendChild(button);
  }
}

screeningSelect.addEventListener("change", renderSeats);