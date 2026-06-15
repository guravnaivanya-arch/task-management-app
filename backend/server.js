const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "tasks.json");
const USERS_FILE = path.join(__dirname, "users.json");

// 🔑 THE SECRET KEY WORD (This fixes the 500 crash!)
const JWT_SECRET = "MY_SUPER_SECRET_KEY";

app.use(cors());
app.use(express.json());

// ==========================================
// 🧠 HELPER FUNCTIONS (File Readers & Writers)
// ==========================================
//demo
const readTasksFromFile = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Could not read tasks file:", error);
    return [];
  }
};

const writeTasksToFile = (tasks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error writing to file database:", error);
  }
};

const readUsersFromFile = () => {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Could not read users file:", error);
    return [];
  }
};

const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing to users database:", error);
  }
};

// ==========================================
// 🛡️ SECURITY GUARD MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied! No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token!" });
  }
};

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ==========================================

app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  let users = readUsersFromFile();

  const userExists = users.find((u) => u.username === username);
  if (userExists) {
    return res.status(400).json({ error: "That username is already taken!" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: hashedPassword,
    };

    users.push(newUser);
    writeUsersToFile(users);

    res
      .status(201)
      .json({ message: "User registered successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  let users = readUsersFromFile();

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ error: "User not found!" });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Oops! Wrong password." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Welcome back!",
      token: token,
      username: user.username,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// ==========================================
// 📋 TASK MANAGEMENT ENDPOINTS
// ==========================================

app.get("/api/tasks", authenticateToken, (req, res) => {
  const allTasks = readTasksFromFile();
  const userTasks = allTasks.filter((task) => task.userId === req.user.userId);
  res.json(userTasks);
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  const tasks = readTasksFromFile();

  const newTask = {
    id: Date.now().toString(),
    userId: req.user.userId,
    title: req.body.title,
    date: req.body.date,
    category: req.body.category,
    status: "todo",
  };

  tasks.unshift(newTask);
  writeTasksToFile(tasks);
  res.json(newTask);
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  const taskId = req.params.id;
  let tasks = readTasksFromFile();
  tasks = tasks.filter((task) => task.id != taskId);

  writeTasksToFile(tasks);
  res.json({ message: "Task deleted successfully" });
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  const taskId = req.params.id;
  let tasks = readTasksFromFile();

  const taskIndex = tasks.findIndex((task) => task.id == taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex].status =
      tasks[taskIndex].status === "todo" ? "progress" : "todo";
    writeTasksToFile(tasks);
    res.json(tasks[taskIndex]);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🎉 Permanent Brain is live at http://localhost:${PORT}`);
});
