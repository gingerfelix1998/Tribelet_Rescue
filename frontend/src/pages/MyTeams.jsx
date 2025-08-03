// src/pages/MyTeams.jsx
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

const MyTeams = () => {
  const { username } = useContext(UserContext);
  const email = localStorage.getItem("userEmail");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const res = await fetch(`${apiUrl}/teams/by-user?email=${email}`);
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [email]);

  // 🔒 If user is not logged in
  if (!email) {
    return (
      <div className="text-white text-center mt-16">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your teams.</h2>
        <button
          onClick={() => navigate("/account")}
          className="mt-4 bg-[#A461F9] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#934ff2] transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="text-white max-w-4xl mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {username ? `${username}'s Teams` : "Your Teams"}
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading teams...</p>
      ) : teams.length === 0 ? (
        <p className="text-center text-gray-500">No teams created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-2">{team.team_name}</h3>
              <p className="text-gray-300 text-sm mb-2">{team.summary}</p>
              {team.logo_url && (
                <img src={team.logo_url} alt="Logo" className="h-24 w-24 object-contain mt-2" />
              )}
              <p className="text-xs text-gray-500 mt-2">Team ID: {team.team_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeams;