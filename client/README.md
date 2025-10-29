# Task Manager Frontend

A simple, modern frontend built with vanilla HTML, CSS, and JavaScript to showcase the Task Manager backend API.

## Features

- **User Authentication**
  - Login with email and password
  - Register new accounts (with User/Admin roles)
  - Persistent session with JWT tokens

- **Task Management**
  - Create tasks with title and description
  - View all your tasks
  - Mark tasks as complete/incomplete
  - Edit task details
  - Delete tasks
  - Real-time statistics (Total, Completed, Pending)

- **Admin Features**
  - View all tasks from all users (Admin only)

- **Modern UI**
  - Clean, responsive design
  - Beautiful gradient background
  - Smooth animations and transitions
  - Real-time notifications
  - Mobile-friendly layout

## Getting Started

1. **Make sure the backend server is running**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The server should be running on `http://localhost:4000`

2. **Open the frontend**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Access the application**
   - Open `http://localhost:8080` (or the port you're using) in your browser

## Usage

1. **Register/Login**
   - Click on the "Register" tab to create a new account
   - Choose between User or Admin role
   - Or login with existing credentials

2. **Create Tasks**
   - Fill in the title (required) and description (optional)
   - Click "Add Task"

3. **Manage Tasks**
   - Mark tasks as complete or incomplete
   - Edit task details by clicking "Edit"
   - Delete tasks by clicking "Delete"

4. **View Statistics**
   - Check the stat cards at the top for a quick overview

5. **Admin Features**
   - If you're an admin, click "View All Users' Tasks" to see tasks from all users

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user info
- `GET /api/v1/tasks` - List user's tasks
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/:id` - Get task by ID
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/admin/all` - List all tasks (Admin)

## Configuration

If your backend is running on a different port, update the `API_BASE_URL` in `app.js`:

```javascript
const API_BASE_URL = 'http://localhost:4000/api/v1';
```

