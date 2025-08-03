// src/steps/NameStep.jsx
import React, { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

const NameStep = ({
  teamOptions,
  selectedName,
  setSelectedName,
  customName,
  setCustomName,
  onNext,
  onBack,
}) => {
  const [nameTaken, setNameTaken] = useState(false);
  const [checking, setChecking] = useState(false);

  const teamName = customName || selectedName;

  // Debounced check for name availability
  useEffect(() => {
    if (!teamName) return;

    const timeout = setTimeout(() => {
      const checkTeamName = async () => {
        setChecking(true);
        try {
          const res = await fetch(
            `${apiUrl}/check-team-name?name=${encodeURIComponent(teamName)}`
          );
          const data = await res.json();
          setNameTaken(data.exists);
        } catch (err) {
          console.error("Error checking team name:", err);
          setNameTaken(false);
        } finally {
          setChecking(false);
        }
      };

      checkTeamName();
    }, 400); // debounce delay

    return () => clearTimeout(timeout);
  }, [teamName]);

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-4">Choose a Team Name</h2>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {teamOptions.map((name, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-full border text-sm ${
              selectedName === name
                ? "bg-[#A461F9] text-white"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => {
              setSelectedName(name);
              setCustomName("");
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Or enter your own name..."
        value={customName}
        onChange={(e) => {
          setCustomName(e.target.value);
          setSelectedName("");
        }}
        className="w-full p-3 border border-gray-300 rounded-xl mb-2"
      />

      {checking && (
        <p className="text-sm text-gray-500 mb-2">Checking availability...</p>
      )}
      {!checking && nameTaken && (
        <p className="text-sm text-red-500 mb-2">
          That team name is already taken. Please choose another.
        </p>
      )}
      {!checking && !nameTaken && teamName && (
        <p className="text-sm text-green-600 mb-2">✓ Team name is available!</p>
      )}

      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="text-gray-600 hover:underline">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!teamName || nameTaken || checking}
          className="bg-[#A461F9] text-white py-2 px-6 rounded-xl font-semibold hover:bg-[#934ff2] transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default NameStep;
