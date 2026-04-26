const movieList = document.getElementById("movieList");
const screeningSelect = document.getElementById("screeningId");
const form = document.getElementById("bookingForm");
const message = document.getElementById("message");

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
      screeningSelect.appendChild(option);
    });
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const seats = document.getElementById("seats").value
    .split(",")
    .map(seat => seat.trim().toUpperCase())
    .filter(Boolean);

  const body = {
    screeningId: Number(screeningSelect.value),
    customerName: document.getElementById("customerName").value,
    customerEmail: document.getElementById("customerEmail").value,
    seats
  };

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok) {
    message.textContent = `Sikeres foglalás! Foglalási azonosító: ${result.id}`;
    message.style.color = "green";
    form.reset();
  } else {
    message.textContent = result.message || "Hiba történt.";
    message.style.color = "crimson";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}

loadMovies();
