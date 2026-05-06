DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS screenings;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    poster_url TEXT
);

CREATE TABLE screenings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    room TEXT NOT NULL,
    total_seats INTEGER NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(id)
);

CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    screening_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    seats TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (screening_id) REFERENCES screenings(id)
);

INSERT INTO movies (title, description, duration_minutes, poster_url) VALUES
('Csillagok között', 'Látványos sci-fi film az űrutazásról és az emberi kitartásról.', 169, 'https://picsum.photos/seed/interstellar/400/600'),
('A nagy kaland', 'Családi kalandfilm sok humorral és izgalmas jelenettel.', 112, 'https://picsum.photos/seed/adventure/400/600'),
('Rejtély a városban', 'Krimi történet egy eltűnt ékszer nyomában.', 98, 'https://picsum.photos/seed/mystery/400/600');
('Vas', 'Akció film a motorozás szerelmeseinek.', 187, 'https://i.pinimg.com/236x/41/af/7a/41af7ae0017153df3b93d9ff0bdd7c21.jpg');
('Bolondos nyár', 'vígjáték, tini nyári románc', 123, 'https://kiderul.startlap.hu/uploads/2025/05/r0_v_nyar.jpg');

INSERT INTO screenings (movie_id, start_time, room, total_seats) VALUES
(1, '2026-05-01T18:00:00', '1-es terem', 40),
(1, '2026-05-01T21:00:00', '1-es terem', 40),
(2, '2026-05-02T17:30:00', '2-es terem', 30),
(3, '2026-05-02T20:00:00', '3-as terem', 25);
(4, '2026-06-03T12:15', '5-ös terem', 25);
(5, '2026-07-25T16:45', '5-ös terem', 34);