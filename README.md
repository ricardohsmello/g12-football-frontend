# g12-football-br-frontend

Frontend for the **G12 Football Betting Pool** application, built with Angular. This is a companion project to the backend service (available [here](https://github.com/ricardohsmello/g12-football-backend)).

# Features

- User login via Keycloak
- Bet placement and editing
- Scoreboard and ranking visualization
- Match list with real-time score updates
- Admin tools for managing matches and user scores

# Technologies Used

- Angular
- Angular Material
- TypeScript
- Keycloak JS Adapter

# Prerequisites

- Node.js (>= 16)
- Angular CLI

# Getting Started
## Keycloak Setup
1. Start PostgreSQL using Docker Compose:

```
docker-compose up -d 
```

2. Start keycloak locally:

```
docker run --name keycloak-g12 -p 8180:8080 
 -e KC_DB=postgres 
 -e KC_DB_URL_HOST=host.docker.internal
 -e KC_DB_URL_PORT=5432 
 -e KC_DB_URL_DATABASE=g12 
 -e KC_DB_USERNAME=g12 
 -e KC_DB_PASSWORD=postgres 
 -e KC_HOSTNAME_URL=http://localhost:8180 
 -e KEYCLOAK_ADMIN=ricas 
 -e KEYCLOAK_ADMIN_PASSWORD=ricas 
 quay.io/keycloak/keycloak:24.0.3 start-dev
``` 

3. Access the Keycloak admin console at http://localhost:8081/
4. Create a new realm for the application.
   - name: g12
5. Create a new client with the following settings:
   - Client ID: frontend
   - Root URL: http://localhost:4200/
   - Valid Redirect URIs: http://localhost:4200/*

6. Create user roles and assign them to users as needed.

## Running the Application
1. First, build everything:

```
npm install 
```

2. Then, run the application:

```
npm start 
```