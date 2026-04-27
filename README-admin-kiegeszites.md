## Admin felület

A projekt tartalmaz egy egyszerű admin felületet is:

```text
http://localhost:3000/admin.html
```

Alap admin belépési adatok:

```text
Email: admin@mozi.hu
Jelszó: admin123
```

Az admin felületen lehetőség van:

- új film hozzáadására,
- új vetítési időpont hozzáadására,
- a jelenlegi filmek és vetítések megtekintésére.

Az új film hozzáadása a következő API végpontot használja:

```http
POST /api/admin/movies
```

Az új vetítés hozzáadása a következő API végpontot használja:

```http
POST /api/admin/screenings
```
