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
1. Start Keycloak using Docker Compose:

```
docker-compose up -d 
```

2. Access the Keycloak admin console at http://localhost:8081/
3. Create a new realm for the application.
   - name: g12
4. Create a new client with the following settings:
   - Client ID: frontend
   - Root URL: http://localhost:4200/
   - Valid Redirect URIs: http://localhost:4200/*

5. Create user roles and assign them to users as needed.

## Running the Application
1. First, build everything:

```
npm install 
```

2. Then, run the application:

```
npm start 
```