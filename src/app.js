require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize, User, Movie, Screening, Booking } = require("./db");
const { optionalAuth, requireAuth, requireAdmin } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const path = require("path");

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Mozi jegyfoglaló" });
});

app.get("/api/movies", async (req, res) => {
  const movies = await Movie.findAll({
    include: [{ model: Screening }],
    order: [["id", "ASC"]]
  });
  res.json(movies);
});

app.get("/api/screenings", async (req, res) => {
  const screenings = await Screening.findAll({
    include: [Movie],
    order: [["startTime", "ASC"]]
  });

  res.json(screenings);
});

app.get("/api/screenings/:id/seats", async (req, res) => {
  const screening = await Screening.findByPk(req.params.id);

  if (!screening) {
    return res.status(404).json({ message: "A vetítés nem található." });
  }

  const bookings = await Booking.findAll({
    where: { screening_id: req.params.id }
  });

  const bookedSeats = bookings.flatMap(booking => JSON.parse(booking.seats));

  res.json({
    screeningId: Number(req.params.id),
    totalSeats: screening.totalSeats,
    bookedSeats
  });
});

app.post("/api/bookings", optionalAuth, async (req, res) => {
  const { screeningId, customerName, customerEmail, seats } = req.body;

  if (!screeningId || !customerName || !customerEmail || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Hiányzó vagy hibás foglalási adatok." });
  }

  const screening = await Screening.findByPk(screeningId);
  if (!screening) {
    return res.status(404).json({ message: "A vetítés nem található." });
  }

  const existingBookings = await Booking.findAll({ where: { screening_id: screeningId } });
  const alreadyBooked = existingBookings.flatMap(b => JSON.parse(b.seats));

  const conflict = seats.some(seat => alreadyBooked.includes(seat));
  if (conflict) {
    return res.status(409).json({ message: "A kiválasztott székek között már van foglalt hely." });
  }

  const booking = await Booking.create({
    screening_id: screeningId,
    user_id: req.user ? req.user.id : null,
    customerName,
    customerEmail,
    seats: JSON.stringify(seats)
  });

  res.status(201).json({
    id: booking.id,
    screeningId,
    customerName,
    customerEmail,
    seats
  });
});

app.get("/api/bookings/my", requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    where: { user_id: req.user.id },
    include: [{ model: Screening, include: [Movie] }],
    order: [["createdAt", "DESC"]]
  });
  res.json(bookings);
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Név, email és legalább 6 karakteres jelszó szükséges." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, passwordHash, role: "user" });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch {
    res.status(409).json({ message: "Ez az email cím már regisztrálva van." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Hibás email vagy jelszó." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "2h" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/api/admin/movies", requireAuth, requireAdmin, async (req, res) => {
  const { title, description, durationMinutes, posterUrl } = req.body;
  if (!title || !description || !durationMinutes) {
    return res.status(400).json({ message: "Cím, leírás és hossz megadása kötelező." });
  }

  const movie = await Movie.create({ title, description, durationMinutes, posterUrl });
  res.status(201).json(movie);
});

app.post("/api/admin/screenings", requireAuth, requireAdmin, async (req, res) => {
  const { movieId, startTime, room, totalSeats } = req.body;

  if (!movieId || !startTime || !room || !totalSeats) {
    return res.status(400).json({ message: "Film, időpont, terem és férőhely megadása kötelező." });
  }

  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    return res.status(404).json({ message: "A film nem található." });
  }

  const screening = await Screening.create({
    movie_id: movieId,
    startTime,
    room,
    totalSeats
  });

  res.status(201).json(screening);
});

async function initDatabase() {
  await sequelize.sync();

  const movieCount = await Movie.count();
  if (movieCount === 0) {
    await Movie.bulkCreate([
      {
        title: "Csillagok között",
        description: "Látványos sci-fi film az űrutazásról és az emberi kitartásról.",
        durationMinutes: 169,
        posterUrl: "https://picsum.photos/seed/interstellar/400/600"
      },
      {
        title: "A nagy kaland",
        description: "Családi kalandfilm sok humorral és izgalmas jelenettel.",
        durationMinutes: 112,
        posterUrl: "https://picsum.photos/seed/adventure/400/600"
      },
      {
        title: "Rejtély a városban",
        description: "Krimi történet egy eltűnt ékszer nyomában.",
        durationMinutes: 98,
        posterUrl: "https://picsum.photos/seed/mystery/400/600"
      }
    ]);

    await Screening.bulkCreate([
      { movie_id: 1, startTime: "2026-05-01T18:00:00", room: "1-es terem", totalSeats: 40 },
      { movie_id: 1, startTime: "2026-05-01T21:00:00", room: "1-es terem", totalSeats: 40 },
      { movie_id: 2, startTime: "2026-05-02T17:30:00", room: "2-es terem", totalSeats: 30 },
      { movie_id: 3, startTime: "2026-05-02T20:00:00", room: "3-as terem", totalSeats: 25 }
    ]);

    const adminHash = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@mozi.hu",
      passwordHash: adminHash,
      role: "admin"
    });
  }
}

module.exports = { app, initDatabase };
