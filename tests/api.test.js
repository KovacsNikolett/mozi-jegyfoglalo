const request = require("supertest");
const { app, initDatabase } = require("../src/app");
const { sequelize, Movie, Screening } = require("../src/db");

beforeAll(async () => {
  process.env.DB_STORAGE = ":memory:";
  await sequelize.sync({ force: true });

  const movie = await Movie.create({
    title: "Teszt film",
    description: "Teszt leírás",
    durationMinutes: 100,
    posterUrl: ""
  });

  await Screening.create({
    movie_id: movie.id,
    startTime: "2026-05-01T18:00:00",
    room: "Teszt terem",
    totalSeats: 20
  });
});

afterAll(async () => {
  await sequelize.close();
});

test("GET /api/movies visszaadja a filmeket", async () => {
  const res = await request(app).get("/api/movies");
  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
  expect(res.body[0]).toHaveProperty("title");
});

test("POST /api/bookings létrehoz egy foglalást", async () => {
  const res = await request(app)
    .post("/api/bookings")
    .send({
      screeningId: 1,
      customerName: "Teszt Elek",
      customerEmail: "teszt@example.com",
      seats: ["A1", "A2"]
    });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("id");
  expect(res.body.seats).toEqual(["A1", "A2"]);
});
