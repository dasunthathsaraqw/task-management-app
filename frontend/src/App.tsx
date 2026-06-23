import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages will be created later
const HomePage = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <h1>🚀 Task Management System</h1>
    <p>Frontend is running successfully!</p>
    <p style={{ color: "#666", fontSize: "14px" }}>
      Backend API: {import.meta.env.VITE_API_URL || "http://localhost:5000"}
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
