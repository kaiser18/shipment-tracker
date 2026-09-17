# Shipment Tracker

A shipment tracking application with an Angular frontend, an Express/Sequelize backend, and PostgreSQL.

## Technology

- Node.js 26.8.2
- Angular 22.1.6
- PostgreSQL 18

The backend is configured to use PostgreSQL port `5433` by default. Change `DB_PORT` if your database uses the standard port `5432`.

## Setup

### 1. Install backend dependencies

From the repository root:

```cmd
cd backend
npm install
```

### 2. Configure the backend

Create a local environment file from the example:

```cmd
copy .env.example .env
```

Edit `backend/.env` and set the PostgreSQL connection values:

```env
PORT=3000
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=shipment_tracker
DB_HOST=localhost
DB_PORT=5433
```

Create the `shipment_tracker` database in PostgreSQL before starting the backend.

### 3. Install frontend dependencies

Open a second terminal at the repository root:

```cmd
cd frontend
npm install
```

## Run the application

Start the backend first:

```cmd
cd backend
npm start
```

The backend runs at `http://localhost:3000`. On startup, Sequelize synchronizes the database and the seed script creates sample users and shipments when the database contains no shipment data.

In a second terminal, start the Angular frontend:

```cmd
cd frontend
npm start
```

Open `http://localhost:4200` in a browser.

## Seed data

Seeding is automatic when the backend starts. It is skipped if the database already contains shipment records. To load the sample data again, clear the existing shipment data and restart the backend.

## Tests

Run backend tests:

```cmd
cd backend
npm test
```

Run frontend tests:

```cmd
cd frontend
npm test
```

## Project structure

- `backend/`: Express API, Sequelize models, database configuration, and seed data
- `frontend/`: Angular application and Material UI components
- `backend/.env.example`: backend environment variable template

## Decisions

### Q1

A shipment is considered late when it's not delivered and its promisedDate is earlier than the current moment. This is computed, not stored.

### Q2

Shipment's status can't move from any state to any other. For recorded shipment events, the allowed progression is:

pending → in transit → at hub → out for delivery → delivered

The rule is defined in service.js and enforced in recordShipmentEvent() by checking that the requested status equals the current status’s next value. So if the current status is 'pending', only 'in transit' would be accepted.

### Q3

A transport event is a recorded milestone in the shipment’s history. Each event contains a status, event date and an address. When the event is recorded, the next allowed status is validated, then a new event record is created, and finally the shipment's current status is updated to that next status. The shipment's status is the current value, and the events are the timeline.

### Q4

If operations records an event that contradicts the shipment’s current state, the backend rejects it. It checks the shipment's current status, computes the expected next status, and then rejects anything that doesn't match it. For example, if the shipment is 'in transit' and the user submits 'delivered', the event is rejected because the next status must be 'at hub'. If the shipment is already delivered, the expected next status is none, so any further event is rejected the same way.

### Q5

The first big problem would be client-side pagination, it will work with the smaller number of shipments, but once it gets larger, the pagination should be implemented on the backend. The same can be said for filtering. The next problem could be the database, if the dataset becomes large enough and indexes and pagination are not added.

### Q6

If I was given two more days I would move the pagination to the backend, add integration tests, maybe add some kind of notification about shipments that are supposed to be delivered soon, authentication and role based authorization, more refactoring so it's easier to implement new features and database indexing.
