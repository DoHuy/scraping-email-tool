# Scraping Email Tool

A full-stack application for scraping emails from web resources.

## Project Structure

```
scraping-email-tool/
├── scrape-email-be/   # Backend (Node.js/Express/TypeScript)
├── scrape-email-fe/   # Frontend (e.g., React/Vue)
├── docker-compose.yml
└── README.md
```

## Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/your-username/scraping-email-tool.git
cd scraping-email-tool
```

### 2. Build and run with Docker Compose

```sh
docker-compose up --build
```

- Backend will be available at [http://localhost:3000](http://localhost:3000)
- Frontend will be available at [http://localhost:8080](http://localhost:8080)

### 3. Stopping the services

```sh
docker-compose down
```

## Project Details

### Backend (`scrape-email-be`)

- Node.js, Express, TypeScript
- Exposes API endpoints for scraping and email extraction

### Frontend (`scrape-email-fe`)

- Modern JavaScript framework (e.g., React or Vue)
- User interface for interacting with the backend

## Development

You can run each service locally for development. Refer to each subfolder's README or package.json for scripts.
