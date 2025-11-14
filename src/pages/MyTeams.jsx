import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MyTeams = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);

  // Load teams from localStorage
  useEffect(() => {
    const savedTeams = JSON.parse(localStorage.getItem(`teams_${matchId}`)) || [];
    setTeams(savedTeams);
  }, [matchId]);

  // Create new team
  const handleCreateTeam = () => {
    navigate(`/match/${matchId}/create-team`);
  };

  // Edit existing team
  const handleEditTeam = (teamIndex) => {
    navigate(`/match/${matchId}/create-team`, {
      state: {
        editTeamIndex: teamIndex,
        teamData: teams[teamIndex],
      },
    });
  };

  return (
    <div className="bg-crimson min-h-screen p-5">
      <h1 className="text-3xl font-bold text-white text-center mb-5 pb-2 border-b-4 border-white">
        My Teams
      </h1>

      {teams.length === 0 && (
        <div className="text-center text-white mt-10">
          <p className="text-lg mb-4">No teams created for this match yet.</p>
          <button
            onClick={handleCreateTeam}
            className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Create Team
          </button>
        </div>
      )}

      <div className="space-y-4 max-w-2xl mx-auto">
        {teams.map((team, index) => (
          <div
            key={index}
            className="bg-dark-card border border-dark-border p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">
                Team {index + 1}
              </h2>

              <button
                onClick={() => handleEditTeam(index)}
                className="bg-white text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-200"
              >
                Edit
              </button>
            </div>

            <p className="text-gray-400 mt-1">
              Players: {team.players?.length || 0}
            </p>

            <p className="text-gray-300 text-sm mt-1">
              Captain: <span className="font-semibold">{team.captain}</span>
            </p>
            <p className="text-gray-300 text-sm">
              Vice Captain: <span className="font-semibold">{team.viceCaptain}</span>
            </p>
          </div>
        ))}

        {teams.length > 0 && (
          <button
            onClick={handleCreateTeam}
            className="w-full bg-white text-black py-2 rounded-lg mt-4 font-semibold hover:bg-gray-200"
          >
            Create Another Team
          </button>
        )}
      </div>
    </div>
  );
};

export default MyTeams;
