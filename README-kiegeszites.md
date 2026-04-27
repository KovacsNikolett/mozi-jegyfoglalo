## Felhasználói regisztráció és foglalások nyomon követése

A weboldalon külön felület készült:

- regisztrációhoz,
- bejelentkezéshez,
- kijelentkezéshez,
- saját foglalások megtekintéséhez.

Bejelentkezett felhasználó esetén a foglalás a felhasználó azonosítójához kapcsolódik, ezért később a **Saját foglalásaim megtekintése** gombbal visszanézhető.

A funkcióhoz használt fő API végpontok:

```http
POST /api/auth/register
POST /api/auth/login
GET /api/bookings/my
```
