# DevLog

This is a personal activity tracker which I built to demonstrate production-like architecture, containerization and a CI/CD pipeline. With this application you can log and track what you built, what you learned or what you configured.

The goal of this project is not only the application itself but also the infrastructure around it. DevLog is designed to demonstrate every layer of a production-like system: a reverse proxy routing traffic, containerized services communicating over an internal docker network, a relational database with persistent storage, a caching layer reducing unnecessary database reads, and a CI/CD pipeline that builds and ships Docker images automatically on every code push to main branch.

## Architecture

![Architecture](./assets/DevLogArchitecture.svg)

All services run inside the docker bridge network. Only Nginx is exposed to the host on port 80. Every other service is reachable only through Docker's internal DNS.

### Why this Architecture?
**Nginx as reverse proxy** -- Rather than exposing each service on its own port, Nginx sits infront of everything. Requests to `/api/*` are forwaded to the Node.js backend and all other requests got to the React frontend. This ensures the internal services have no public surface area and are more secure.

**Containerized services** -- Each service runs on its own container. This ensures consistent environment across machines and clean isolation between services. Docker Compose ties everything together with a shared network. These services then communicate with each other using an internal DNS created by Docker using names like `backend`, `postgres` and `redis` instead of IPs.

**Caching** -- Redis is used for caching strategy. At the current scale of this project, caching does provide a noticeable performance benefit. However, I just included it to understand how it works in real production systems. On a single request of logs for this application,the backend checks Redis. A cache hit returns data in under a millisecond. A cache miss queries Postgres and stores the result in Redis with a 60-second TTL. Write operations (`POST`, `DELETE`) invalidate the cache key immediately.

## Tech Stack

| Layer      | Technology          | Version |
|------------|---------------------|---------|
| Proxy      | Nginx               | 1.25    |
| Frontend   | React + Vite        | 18 / 5  |
| Backend    | Node.js + Express   | 20 / 4  |
| Database   | PostgreSQL          | 16      |
| Cache      | Redis               | 7       |
| Runtime    | Docker + Compose    | v2      |
| CI/CD      | GitHub Actions      | —       |
| Registry   | GitHub Container Registry (GHCR) | — |

---

## Running this Project Locally
### Prerequisites
- Docker Engine
- Docker Compose

```bash
git clone https://github.com/Diing54/devlog.git
cd devlog
```
- Create the .env file and fill in your own values;

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=postgresql://devlog:change_me_in_production@postgres:5432/devlog_db
REDIS_URL=redis://redis:6379
```
- Build images and start your services;

```bash
docker compose up --build
```
- Then open **http://localhost** in your browser.

### Stopping this Project

```bash
# Stop containers, keep database volumes
docker compose down

# Stop containers and delete all persisted data
docker compose down -v
```

