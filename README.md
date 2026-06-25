# Task Management System (Team Workflow App)

A full-stack task management system that allows users to create, assign, track, and manage tasks efficiently with role-based access and workflow states.

## Features

* **Task Management**: Create, view, edit, and update tasks with title, description, priority (Low/Medium/High), due date, and status (Open, In Progress, Testing, Done).
* **Kanban Board**: Drag-and-drop Kanban board for normal users to easily update task statuses.
* **Role-Based Access Control**:
  * **Admin**: Can view and manage all tasks in the system. Has access to an admin dashboard with a table view and read-only Kanban board. Can assign tasks to any user.
  * **User**: Can view and manage only their own tasks (created by them or assigned to them).
* **User Management**: Registration and login using JWT authentication.
* **UI/UX**: Responsive design with a polished, modern interface (including Dark Mode) built with Tailwind CSS. Features micro-animations and status history tracking.

## Technologies Used

* **Frontend**: React, Vite, TypeScript, Tailwind CSS, DnD Kit (for drag-and-drop).
* **Backend**: Express.js (Node.js), TypeScript.
* **Database**: MongoDB (Mongoose).
* **Authentication**: JSON Web Tokens (JWT).

## Setup Instructions

### Prerequisites
* Node.js (v16 or higher recommended)
* MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on `.env.example` (if provided) or add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server (development mode):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to the frontend URL (usually `http://localhost:5173`).
2. Register a new user account or log in.
3. If you register as an Admin, you will see the Admin Dashboard with access to all tasks.
4. If you register as a normal User, you will see the user Kanban board where you can create and manage your tasks.
