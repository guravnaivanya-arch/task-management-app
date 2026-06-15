import React, { useState, useEffect } from "react";

function App() {
  // 📦 State to keep track of our tasks list
  const [tasks, setTasks] = useState([]);

  // ✍️ States to track form inputs
  const [textInput, setTextInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Dev");

  // 🔐 Authentication States (Our New Security Post-it Notes)
  const [userToken, setUserToken] = useState(
    localStorage.getItem("token") || null,
  );
  // 📊 Live Progress Calculator
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "progress",
  ).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");

  // 📊 Calculate live progress percentage dynamically
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "progress",
  ).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 📖 READ: Fetch tasks from backend
  const fetchTasks = async () => {
    if (!userToken) return; // 1. Don't do anything if we aren't logged in!
    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${userToken}` }, // 2. Flash our badge!
      });
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  // ⏰ Alarm Clock: Load tasks instantly if a user is already logged in
  useEffect(() => {
    if (userToken) {
      fetchTasks();
    }
  }, [userToken]);

  useEffect(() => {
    fetchTasks();
  }, []);

  // 📝 Function to Handle Sign Up / Registration
  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign up failed");

      alert(data.message);
      setIsSignUpMode(false);
      setPasswordInput("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // 🔑 Function to Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      setUserToken(data.token);

      setUsernameInput("");
      setPasswordInput("");

      // 🚀 MAGIC LINE: Fetch this user's private tasks right away!
      fetchTasks();
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // 🚪 Function to Log Out
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUserToken(null);
    setTasks([]); // 🧹 Wipe the screen clean!
  };

  // ➕ CREATE: Create a brand new task item
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || !userToken) return; // 1. Safety check

    const options = { day: "numeric", month: "long", year: "numeric" };
    const dateStr = new Date().toLocaleDateString("en-GB", options);

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`, // 2. Flash our badge here too!
        },
        body: JSON.stringify({
          title: textInput,
          date: dateStr,
          category: selectedCategory,
        }),
      });
      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setTextInput("");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  // 🔄 UPDATE: Toggle completion status with badge authorization
  const toggleTaskStatus = async (id) => {
    if (!userToken) return;
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`, // 🛡️ Show badge to update!
        },
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id == id ? updatedTask : task)));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // 🗑️ DELETE: Remove a task completely with badge authorization
  const deleteTask = async (id, e) => {
    e.stopPropagation(); // Stop card click from triggering a toggle
    if (!userToken) return;
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`, // 🛡️ Show badge to delete!
        },
      });
      setTasks(tasks.filter((task) => task.id != id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 font-sans">
      {/* 🔐 SCREEN A: THE SECURITY GATE (Shows if not logged in) */}
      {!userToken ? (
        <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#3B3B98] flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
            ✨
          </div>
          <h2 className="text-2xl font-bold text-[#1E1B4B]">
            {isSignUpMode ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUpMode
              ? "Sign up to track your own custom list"
              : "Please log in to manage your tasks"}
          </p>

          <form
            onSubmit={isSignUpMode ? handleSignUp : handleLogin}
            className="mt-6 space-y-4 text-left"
          >
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[#1E1B4B] font-medium transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[#1E1B4B] font-medium transition-all"
                required
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#3B3B98] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-900/20 hover:bg-[#2C2C73] transition-all transform active:scale-[0.98] mt-2"
            >
              {isSignUpMode ? "Register Account" : "Sign In"}
            </button>
          </form>

          <p className="text-xs font-medium text-slate-400 mt-6">
            {isSignUpMode ? "Already have an account?" : "New to Magic Task?"}{" "}
            <button
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setAuthError("");
              }}
              className="text-[#3B3B98] font-bold hover:underline"
            >
              {isSignUpMode ? "Log In Here" : "Create Account"}
            </button>
          </p>
        </div>
      ) : (
        /* 📱 SCREEN B: YOUR AMAZING FULL-STACK APPLICATION LAYOUT */
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl items-center justify-center">
          {/* LEFT CONTAINER: THE INTERACTIVE PHONE DEVICE */}
          <div className="w-[360px] h-[720px] bg-[#FFFDF9] rounded-[48px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] border-[10px] border-[#1E1B4B] overflow-hidden flex flex-col relative">
            {/* Top Device Header Banner with Live Stats & Logout */}
            <div className="bg-[#1E1B4B] text-white pt-8 pb-6 px-6 rounded-b-[32px] shadow-lg relative">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Workspace
                  </span>
                  <h3 className="text-lg font-bold">
                    Hello, {localStorage.getItem("username")}! 👋
                  </h3>
                </div>
                <button
                  onClick={handleLogOut}
                  className="bg-white/10 hover:bg-white/20 text-xs text-slate-200 font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  Log Out
                </button>
              </div>

              {/* Progress bar tracking layout */}
              <div className="mt-8 flex justify-between items-end">
                <span className="text-[11px] text-slate-300">Progress</span>
                <span className="text-xs font-bold font-mono">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full mt-1.5">
                <div
                  className="bg-[#10B981] h-1 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Task list tracking visual label area */}
            <div className="flex-1 px-6 pt-6 overflow-y-auto pb-6 space-y-4">
              <h4 className="text-sm font-bold text-[#1E1B4B]">
                Progress Tasks
              </h4>

              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">
                  No tasks remaining. Sweet freedom!
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/60 flex items-center justify-between group hover:shadow-md transition-shadow cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            task.status === "progress"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-[#E0E0F6] text-[#3B3B98]"
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {task.status === "progress" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                              />
                            )}
                          </svg>
                        </div>
                        <div>
                          <h5
                            className={`text-sm font-semibold text-[#1E1B4B] ${task.status === "progress" ? "line-through text-slate-400" : ""}`}
                          >
                            {task.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {task.date} •{" "}
                            <span className="text-[#3B3B98] font-medium">
                              {task.category}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => deleteTask(task.id, e)}
                        className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-14v4M1 7h22"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Phone Navigation Footer Bar */}
            <div className="h-16 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-around px-4">
              <span className="text-indigo-600 text-lg cursor-pointer">🏠</span>
              <span className="text-slate-300 text-lg cursor-pointer">📅</span>
              <span className="text-slate-300 text-lg cursor-pointer">👜</span>
              <span className="text-slate-300 text-lg cursor-pointer">👤</span>
            </div>
          </div>

          {/* RIGHT CONTAINER: MANAGEMENT FORM PANEL */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100/60 w-full max-w-sm">
            <h3 className="text-xl font-bold text-[#1E1B4B]">
              Create New Task
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add targets to your interactive device panel.
            </p>

            <form onSubmit={handleCreateTask} className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Code API endpoints"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[#1E1B4B] font-medium placeholder-slate-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Choose Category
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {["Dev", "UI Design", "Meeting", "Review"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedCategory === cat
                          ? "bg-[#3B3B98] text-white border-[#3B3B98] shadow-md shadow-indigo-900/10"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3B3B98] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-900/20 hover:bg-[#2C2C73] transition-all transform active:scale-[0.98] mt-2"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
