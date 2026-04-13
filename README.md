# DevLog

This is a personal activity tracker which I built to demonstrate production-like architecture, containerization and a CI/CD pipeline. With this application you can log and track what you built, what you learned or what you configured.

The goal of this project is not only the application itself but also the infrastructure around it. DevLog is designed to demonstrate every layer of a production-like system: a reverse proxy routing traffic, containerized services communicating over an internal docker network, a relational database with persistent storage, a caching layer reducing unnecessary database reads, and a CI/CD pipeline that builds and ships Docker images automatically on every code push to main branch.

