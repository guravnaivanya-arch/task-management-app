# Task Management Application

A full-stack, secure task management application built to help users organize their daily goals with privacy and efficiency.

## 🚀 Key Features

- **Secure User Authentication:** Register and log in with password hashing (bcrypt) and JWT token-based security.
- **Private Data Storage:** Each user has their own "private drawer" of tasks—users can only view, create, and manage their own items.
- **Dynamic Task Tracking:** Real-time progress bar that updates as you toggle task status.
- **CRUD Functionality:** Full Create, Read, Update, and Delete operations for task management.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Database:** Local JSON File Storage (`tasks.json`, `users.json`)

## ⚙️ How to Run

1. **Backend:**
   - Navigate to the server folder: `cd backend`
   - Install dependencies: `npm install`
   - Run the server: `node server.js`

2. **Frontend:**
   - Navigate to the frontend folder: `cd frontend`
   - Install dependencies: `npm install`
   - Run the app: `npm run dev`

## 👤 Author

Developed by [Naivanya]
