// src/steps/SummaryStep.jsx
import React, { useState, useEffect } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

const SummaryStep = ({ prompt, summary, setSummary, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [editablePitch, setEditablePitch] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Update local editable pitch when summary changes
  useEffect(() => {
    setEditablePitch(summary || "");
  }, [summary]);

  // Update parent summary as user types (real-time sync with team card)
  const handlePitchChange = (e) => {
    const newPitch = e.target.value;
    setEditablePitch(newPitch);
    setSummary(newPitch); // This updates the team card on the left in real-time
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setEditablePitch(data.summary);
      setHasGenerated(true);
    } catch (err) {
      console.error("Failed to generate sponsorship pitch:", err);
      alert("Failed to generate sponsorship pitch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePitch = () => {
    // Pitch is already saved in real-time via handlePitchChange
    // This button just provides user feedback and moves to next step
    onNext();
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setEditablePitch(data.summary);
    } catch (err) {
      console.error("Failed to regenerate sponsorship pitch:", err);
      alert("Failed to regenerate sponsorship pitch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-4">Generate Sponsorship Pitch</h2>
      
      {!hasGenerated ? (
        <>
          <p className="text-gray-600 text-center text-sm mb-4">
            We'll create a compelling sponsorship pitch based on your team description
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-[#A461F9] text-white py-3 rounded-xl font-semibold hover:bg-[#934ff2] transition mb-4 disabled:opacity-50"
          >
            {loading ? "Generating Pitch..." : "Generate Sponsorship Pitch"}
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 text-center text-sm mb-4">
            Edit your sponsorship pitch below. Changes will appear on your team card in real-time.
          </p>
          
          {/* Editable Text Area */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Sponsorship Pitch:
            </label>
            <textarea
              value={editablePitch}
              onChange={handlePitchChange}
              placeholder="Your sponsorship pitch will appear here..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#A461F9] focus:border-transparent"
              rows={6}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {editablePitch.length} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              {loading ? "Regenerating..." : "🔄 Regenerate"}
            </button>
            <button
              onClick={handleSavePitch}
              disabled={!editablePitch.trim() || loading}
              className="flex-1 bg-[#A461F9] text-white py-2 px-4 rounded-xl font-semibold hover:bg-[#934ff2] transition disabled:opacity-50"
            >
              Save Pitch & Continue
            </button>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 hover:underline transition">
          ← Back
        </button>
        {!hasGenerated && (
          <button
            onClick={onNext}
            className="text-gray-400 hover:text-gray-600 hover:underline transition"
          >
            Skip →
          </button>
        )}
      </div>
    </div>
  );
};

export default SummaryStep;