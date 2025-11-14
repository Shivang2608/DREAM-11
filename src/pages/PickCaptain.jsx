import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const PickCaptain = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const selectedPlayers = state?.selectedPlayers || [];
  const editTeamIndex = state?.editTeamIndex ?? null;

  const [captain, setCaptain] = useState(null);
  const [viceCaptain, setViceCaptain] = useState(null);

  useEffect(() => {
    if (!selectedPlayers || selectedPlayers.length !== 11) {
      // If user directly comes to this page without selection
      alert("Please select 11 players first.");
      navigate(`/match/${matchId}/pick-players`);
    }
  }, [selectedPlayers, matchId, navigate]);

  const handleSaveTeam = () => {
    if (!captain || !viceCaptain) {
      alert("Please choose both Captain and Vice Captain.");
      return;
    }
    if (captain === viceCaptain) {
      alert("Captain and Vice-Captain cannot be the same player.");
      return;
    }

    const newTeam = {
      players: selectedPlayers,
      captain,
      viceCaptain,
      createdAt: new Date().toISOString(),
    };

    const storageKey = `teams_${matchId}`;
    const existingTeams = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (editTeamIndex !== null && existingTeams[editTeamIndex]) {
      // update existing team
      existingTeams[editTeamIndex] = newTeam;
    } else {
      // add new team
      existingTeams.push(newTeam);
    }

    localStorage.setItem(storageKey, JSON.stringify(existingTeams));

    alert("Team saved successfully!");

    navigate(`/match/${matchId}/my-teams`);
  };

  return (
    <div className="bg-crimson min-h-screen p-5">
      <h1 className="text-3xl font-bold text-white text-center mb-6 pb-2 border-b-4 border-white">
        Select Captain & Vice Captain
      </h1>

      <div className="max-w-3xl mx-auto bg-dark-card border border-dark-border rounded-lg p-5">
        <h2 className="text-xl text-white font-semibold text-center mb-4">
          Choose wisely! Captain = 2x points, Vice Captain = 1.5x points
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedPlayers.map((player) => (
            <div
              key={player.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <h3 className="text-white font-bold">{player.name}</h3>
              <p className="text-sm text-gray-300">{player.role} • {player.team}</p>
              <p className="text-sm text-gray-400">{player.credits} credits</p>

              <div className="mt-3 flex items-center justify-between">
                {/* Captain Selection */}
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    name="captain"
                    checked={captain === player.id}
                    onChange={() => setCaptain(player.id)}
                  />
                  Captain
                </label>

                {/* Vice Captain Selection */}
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="radio"
                    name="viceCaptain"
                    checked={viceCaptain === player.id}
                    onChange={() => setViceCaptain(player.id)}
                  />
                  Vice-Captain
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveTeam}
          className="mt-6 w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200"
        >
          Confirm & Save Team
        </button>
      </div>
    </div>
  );
};

export default PickCaptain;
