import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

const CompleteStep = ({ onBack, teamName, summary, logoUrl }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleFinish = async () => {
    setSaving(true);
    setError("");

    const payload = {
      team_name: teamName,
      summary,
      logo_url: logoUrl,
      username,
      email,
      password,
    };

    console.log("Sending payload:", payload); // Debug log

    try {
      const res = await fetch(`${apiUrl}/save-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status); // Debug log
      console.log("Response headers:", res.headers); // Debug log

      // Try to get response text first to see what we're actually receiving
      const responseText = await res.text();
      console.log("Raw response:", responseText); // Debug log

      if (res.ok) {
        // Try to parse as JSON if response is ok
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          setError("Server returned invalid response format");
          return;
        }

        setSuccess(true);
        setTimeout(() => navigate("/my-teams"), 1000);
      } else {
        // Handle error responses
        let errorMessage = "Could not save team. Please check your inputs.";
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (parseError) {
          // If it's not JSON, show the raw response (truncated)
          errorMessage = `Server error: ${responseText.substring(0, 100)}...`;
        }
        
        console.error("Server error:", responseText);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Network/fetch error:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Team Created!</h2>
      <p className="text-gray-700 mb-6">To save your team and manage it later, enter your details below.</p>

      {!success && (
        <>
          <div className="grid gap-4 mb-6 text-left">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:underline">
              ← Back
            </button>
            <button
              onClick={handleFinish}
              disabled={saving || !username || !email || !password}
              className="bg-[#A461F9] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#934ff2] transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Finish"}
            </button>
          </div>
        </>
      )}

      {success && (
        <p className="text-green-500 mt-6 font-semibold">
          Team saved successfully! Redirecting...
        </p>
      )}
    </div>
  );
};

export default CompleteStep;