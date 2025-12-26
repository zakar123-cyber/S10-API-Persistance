import React, { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import TasksScreen from "./screens/TasksScreen";

export default function App() {
  const [screen, setScreen] = useState("login"); // "login" | "register" | "tasks"

  // Rendu conditionnel des écrans
  if (screen === "login") {
    return <LoginScreen setScreen={setScreen} />;
  }

  if (screen === "register") {
    return <RegisterScreen setScreen={setScreen} />;
  }

  if (screen === "tasks") {
    return <TasksScreen setScreen={setScreen} />;
  }

  return null;
}
