import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const apiUrl = process.env.REACT_APP_API_URL;

const Account = () => {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // signup only
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { setUsername: setGlobalUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    const payload = {
      email,
      password,
      ...(mode === "signup" && { username }),
    };

    const endpoint = mode === "signup" ? "/create-account" : "/login";

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");

      // Derive username (fallback if logging in)
      const userNameToUse = data.username || username;

      // Store session info
      localStorage.setItem("username", userNameToUse);
      localStorage.setItem("userEmail", email);
      setGlobalUsername(userNameToUse);

      setMessage(mode === "signup" ? "Account created!" : "Signed in!");

      // Optional redirect
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === "signup" ? "Create Account" : "Sign In"}
      </h2>

      {mode === "signup" && (
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-[#A461F9] text-white py-3 rounded-xl font-semibold hover:bg-[#934ff2] transition mb-4"
      >
        {mode === "signup" ? "Create Account" : "Sign In"}
      </button>

      <div className="text-center text-sm text-gray-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-[#A461F9] hover:underline"
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-[#A461F9] hover:underline"
            >
              Create Account
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Account;
