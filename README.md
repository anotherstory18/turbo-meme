# MediFlow AI – Smart Hospital Management, Live Queue & Bed Intelligence Platform

A premium full-stack hospital-tech demo built with **Node.js + Express + EJS + Socket.io + local JSON storage**.

## Features
- Landing + animated role-based login
- Admin, Receptionist, Doctor dashboards
- Patient registration + OPD slip generation
- Smart OPD queue with live updates
- Live hospital operations dashboard
- Doctor availability cards
- Bed intelligence + occupancy tracking
- Billing + receipt generation
- Reports with Chart.js visual analytics
- Settings/demo data page

## Tech Stack
- Node.js
- Express
- EJS
- Socket.io
- Chart.js
- JSON file storage (`/data`)

## Run locally
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000`

## Demo credentials
- **Admin**: `admin` / `admin123`
- **Receptionist**: `recep` / `recep123`
- **Doctor**: `doctor` / `doctor123`

## Project structure
```
mediflow-ai/
  package.json
  server.js
  README.md
  /routes
  /controllers
  /models
  /views
  /public
    /css
    /js
    /images
  /data
  /utils
```

## Notes
- No external DB, Docker, Firebase, or cloud setup required.
- Built for easy student-laptop demos with only Node.js + npm.
