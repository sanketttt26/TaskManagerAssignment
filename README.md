## Task Manager - Backend + Client

A simple full-stack Task Manager with authentication, RBAC, and CRUD for tasks. Includes Swagger API docs and a small vanilla JS client.

### Tech Stack
- Server: Node.js, Express, Mongoose, JWT, Helmet, CORS, Cookie Parser, Swagger
- Client: Vanilla HTML/CSS/JS (fetch API)

### Features
- User registration and login with JWT
- HttpOnly cookie support for tokens, also supports Authorization: Bearer
- Role-based access control (user, admin)
- Tasks CRUD (per-user), admin can view all tasks
- Swagger API docs at `/api-docs`
- Strong password policy and client-side validations

### Project Structure
```
assignment/
  client/
    index.html
    app.js
    styles.css
  server/
    src/
      app.js
      server.js
      models/
      controllers/
      routes/
      middleware/
      config/
      docs/
    package.json
```

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB connection string

### Environment Variables (Server)
Create `server/.env` using the template below:

```bash
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/assignment
JWT_SECRET=change_me
JWT_EXPIRES_IN=1d
```

Tip: You can also commit `server/.env.example` with the same keys and placeholder values.

### Install & Run (Local)
```bash
cd server
npm install

# create .env (see variables above)
# Windows PowerShell
Copy-Item .env.example .env  # if you create the example file

npm run dev
```

Server will start on `http://localhost:4000`. Swagger UI: `http://localhost:4000/api-docs`.

Open the client by just opening `client/index.html` in your browser (or serve it with any static server).

### API Overview
- Auth
  - POST `/api/v1/auth/register` { name, email, password, confirmPassword, role? }
  - POST `/api/v1/auth/login` { email, password }
  - GET  `/api/v1/auth/me`
  - POST `/api/v1/auth/logout`

- Tasks (requires authentication)
  - GET    `/api/v1/tasks` – list tasks for current user
  - POST   `/api/v1/tasks` – create task
  - GET    `/api/v1/tasks/:id` – get task by id (owner only)
  - PATCH  `/api/v1/tasks/:id` – update task (owner only)
  - DELETE `/api/v1/tasks/:id` – delete task (owner only)
  - GET    `/api/v1/tasks/admin/all` – list all tasks (admin only)

Full schema and examples are available in Swagger at `/api-docs`.

### Authentication
- On successful login/register, the server sets an `access_token` HttpOnly cookie.
- Clients may also send `Authorization: Bearer <token>` if they store the token.

### Password Policy
- Minimum 8 characters
- Must include: at least one uppercase, one lowercase, one number, and one special character
- Client enforces real-time validation and confirm password match before enabling register

### Client Notes
- The client uses localStorage to keep the token when logging in/registration via JSON response.
- DELETE endpoints return `204 No Content`. The client safely handles empty responses.

### CORS and Cookies
- If you serve the client from a different origin and rely on cookies, ensure CORS is configured with credentials and proper `origin`. Adjust `server/src/app.js` CORS settings if needed.

### Common Issues
- 401 Unauthorized: Ensure token is present (cookie or Bearer header) and not expired.
- 204 No Content parsing: Already handled by the client’s `apiCall` helper.
- MongoDB connection issues: Verify `MONGODB_URI` and that MongoDB is running.

### Deploy to GitHub (Quick Steps)
```bash
git init
git add .
git commit -m "Initial commit: backend+client with auth, tasks, validations"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Add a `.gitignore` at the repo root to avoid committing environment files:
```gitignore
node_modules/
.env
server/.env
client/.env
.DS_Store
Thumbs.db
.vscode/
```

### Scripts (Server)
```bash
npm run dev   # run with env file and auto-restart if using nodemon later
npm start     # production start
```

### License
MIT (or your preferred license)


