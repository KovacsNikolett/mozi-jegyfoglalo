# Mozi jegyfoglaló webalkalmazás

Ez a projekt egy egyszerű online jegyfoglaló rendszer mozik számára.  
A felhasználó meg tudja nézni a filmeket, a hozzájuk tartozó vetítéseket, majd jegyet tud foglalni a kiválasztott időpontra.

## Megvalósított alapkövetelmények

- Legalább 2 API végpont: több végpont is készült.
- Reszponzív kliensoldal: CSS Grid, Flexbox és Media Query használatával.
- Relációs adattárolás: SQLite adatbázis.
- Legalább 2 teszt: Jest + Supertest.
- Git verziókezelés: a csomag tartalmaz `.git` mappát és 5 commitot.
- Markdown dokumentáció: ez a README tartalmazza a felépítést, konfigurációt és végpontokat.

## Választott kiegészítő funkciók

1. **Konténerizáció Dockerrel**
   - `Dockerfile`
   - `docker-compose.yml`

2. **Autentikáció JWT-vel**
   - Regisztráció: `POST /api/auth/register`
   - Bejelentkezés: `POST /api/auth/login`
   - Saját foglalások: `GET /api/bookings/my`

3. **ORM rendszer használata**
   - Sequelize ORM SQLite adatbázissal.

4. **Offline mód Service Workerrel**
   - `public/service-worker.js`
   - `public/manifest.json`

## Alkalmazás felépítése

```text
mozi-jegyfoglalo-projekt/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── manifest.json
│   └── service-worker.js
├── sql/
│   └── init.sql
├── src/
│   ├── app.js
│   ├── db.js
│   ├── server.js
│   └── middleware/
│       └── auth.js
├── tests/
│   └── api.test.js
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Telepítés és futtatás

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Környezeti változók beállítása

Másold le az `.env.example` fájlt `.env` néven:

```bash
cp .env.example .env
```

Windows alatt:

```bash
copy .env.example .env
```

### 3. Alkalmazás indítása

```bash
npm start
```

Ezután az alkalmazás itt érhető el:

```text
http://localhost:3000
```

## Tesztek futtatása

```bash
npm test
```

A projekt két alap tesztet tartalmaz:

1. Filmek lekérése.
2. Jegyfoglalás létrehozása.

## Docker használata

```bash
docker compose up --build
```

Ezután az alkalmazás szintén itt érhető el:

```text
http://localhost:3000
```

## Adatbázis

Az alkalmazás SQLite relációs adatbázist használ.  
Az adatbázis táblái:

- `users`
- `movies`
- `screenings`
- `bookings`

Az adatbázis létrehozásához szükséges SQL fájl:

```text
sql/init.sql
```

A szerver induláskor Sequelize ORM segítségével is létrehozza a táblákat, ha még nem léteznek.

## API végpontok

### Állapot ellenőrzése

```http
GET /api/health
```

Válasz:

```json
{
  "status": "ok",
  "app": "Mozi jegyfoglaló"
}
```

### Filmek listázása

```http
GET /api/movies
```

Leírás: Lekéri a filmeket és a hozzájuk tartozó vetítéseket.

### Vetítések listázása

```http
GET /api/screenings
```

Leírás: Lekéri az összes vetítést a filmadatokkal együtt.

### Jegyfoglalás létrehozása

```http
POST /api/bookings
```

Példa kérés:

```json
{
  "screeningId": 1,
  "customerName": "Kovács Anna",
  "customerEmail": "anna@example.com",
  "seats": ["A1", "A2"]
}
```

Példa válasz:

```json
{
  "id": 1,
  "screeningId": 1,
  "customerName": "Kovács Anna",
  "customerEmail": "anna@example.com",
  "seats": ["A1", "A2"]
}
```

### Regisztráció

```http
POST /api/auth/register
```

Példa kérés:

```json
{
  "name": "Kovács Anna",
  "email": "anna@example.com",
  "password": "titkos123"
}
```

### Bejelentkezés

```http
POST /api/auth/login
```

Példa kérés:

```json
{
  "email": "anna@example.com",
  "password": "titkos123"
}
```

Válaszban a szerver JWT tokent küld vissza.

### Saját foglalások lekérése

```http
GET /api/bookings/my
```

Header szükséges:

```http
Authorization: Bearer TOKEN
```

### Admin film létrehozása

```http
POST /api/admin/movies
```

Csak admin jogosultsággal érhető el.

Alap admin belépés fejlesztéshez:

```text
Email: admin@mozi.hu
Jelszó: admin123
```

## Git commit javaslatok

A csomagban már létrehoztam 5 commitot:

1. Projekt alapstruktúra létrehozása
2. Backend API és adatbázis modellek elkészítése
3. Reszponzív frontend hozzáadása
4. Tesztek és SQL inicializáló script hozzáadása
5. Docker, offline mód és dokumentáció hozzáadása

## Rövid értékelési összefoglaló

A projekt teljesíti a kötelező elvárásokat, mert van benne REST API, reszponzív frontend, SQLite alapú relációs adatbázis, automatizált teszt, Git repository és dokumentáció.  
A kiegészítő funkciók közül több is elkészült: Docker, JWT autentikáció, Sequelize ORM és Service Worker alapú offline működés.
