# Table2Taste

> QR-basierte digitale menukarte fur Restaurants. Gaste scannen den QR-Code an ihrem Tisch und sehen die Speisekarte in ihrer Sprache, bestellen und bezahlen direkt vom Handy.

## Architecture

```
Browser (React SPA)  →  nginx (Reverse Proxy)  →  Spring Boot API (JPA/Hibernate)  →  PostgreSQL
                          ↕ WebSocket
                     Ticket Printer
```

## Repository Structure

```
table2taste/
├── docker-compose.yml                    ← Orchestration
├── diagram.svg / architecture.html       ← Diagrams
├── table2taste-frontend/                 ← React SPA
├── table2taste-backend_springboot/       ← Spring Boot API
└── table2taste-db/                       ← PostgreSQL
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, MUI 5, react-router-dom v6, axios |
| Backend | Spring Boot 3.2.5, Java 17, JPA/Hibernate, Spring Security, JWT |
| Database | PostgreSQL 16 |
| Real-time | WebSocket (Ticket Printer) |
| Infra | Docker Compose, nginx |

## Quick Start

```bash
git clone --recurse-submodules git@github.com:cabrasky/table2taste.git
cd table2taste
# Create .env with POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
docker compose up -d
```

Frontend: http://localhost:3000  
API: http://localhost:8080  
Swagger: http://localhost:8080/swagger-ui.html

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/menu-view.png" alt="Menu View - English" width="45%" />
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/menu-view-es.png" alt="Menu View - Spanish" width="45%" />
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/menu-item-detail.png" alt="Menu Item Detail with Allergens" width="45%" />
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/cart-page.png" alt="Cart Page" width="45%" />
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/login-page.png" alt="Login Page" width="45%" />
  <img src="https://raw.githubusercontent.com/cabrasky/table2taste-frontend/master/public/screenshots/table-status.png" alt="Table Status" width="45%" />
</p>

## License

Apache 2.0
