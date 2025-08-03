// src/steps/PromptStep.jsx
import React, { useState } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

const PromptStep = ({ prompt, setPrompt, setTeamOptions, onNext }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/generate-names`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setTeamOptions(data.team_names || []);
      onNext();
    } catch (err) {
      console.error("Failed to generate team names:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-4">Tell us about your team...</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="We are 5 friends from Shoreditch who like F1..."
          className="w-full p-4 border border-gray-300 rounded-xl mb-4"
        />
        <button
          type="submit"
          disabled={!prompt || loading}
          className="w-full bg-[#A461F9] text-white py-3 rounded-xl font-semibold hover:bg-[#934ff2] transition"
        >
          {loading ? "Generating..." : "Generate Team Names"}
        </button>
      </form>
    </div>
  );
};

export default PromptStep;
