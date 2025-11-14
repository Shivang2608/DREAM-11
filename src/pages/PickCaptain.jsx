import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function PickCaptain() {
  const location = useLocation();
  const navigate = useNavigate();
  const { matchId } = useParams();

  // ... All your state and logic is perfect, no changes ...
  const [selectedPlayers, setSelectedPlayers] = useState(
    location.state?.selectedPlayers || []
  );
  const [captainId, setCaptainId] = useState(null);
  const [viceCaptainId, setViceCaptainId] = useState(null);

  const handleSaveTeam = () => {
    if (!captainId || !viceCaptainId) {
      alert('Please select a Captain and a Vice-Captain.');
      return;
    }
    const finalTeam = {
      id: new Date().getTime(), matchId: matchId, players: selectedPlayers,
      captain: captainId, viceCaptain: viceCaptainId,
    };
    const teamsKey = `my_teams_${matchId}`;
    const savedTeams = JSON.parse(localStorage.getItem(teamsKey)) || [];
    const newSavedTeams = [...savedTeams, finalTeam];
    localStorage.setItem(teamsKey, JSON.stringify(newSavedTeams));

    navigate(`/match/${matchId}/my-teams`);
  };

  const handleSelectCaptain = (playerId) => {
    if (playerId === viceCaptainId) setViceCaptainId(null); 
    setCaptainId(playerId);
  };

  const handleSelectViceCaptain = (playerId) => {
    if (playerId === captainId) setCaptainId(null); 
    setViceCaptainId(playerId);
  };

  return (
    <div>
      {/* --- Sticky Crimson Header --- */}
      <div className="sticky top-0 z-10 bg-crimson p-3 text-white shadow-lg">
        <h1 className="text-xl font-bold text-center">Pick Captain & Vice-Captain</h1>
        <p className="text-center text-red-100 text-sm mt-1">
          Captain (C) gets 2x points, Vice-Captain (VC) gets 1.5x points.
        </p>
        
        {/* --- Save Button (White on Crimson) --- */}
        <div className="mt-3">
          <button 
            className="w-full bg-white text-crimson font-bold py-3 rounded-lg hover:bg-gray-200 transition-all disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleSaveTeam}
            disabled={!captainId || !viceCaptainId}
          >
            Save Team
          </button>
        </div>
      </div>

      {/* --- Player List --- */}
      <div className="p-2">
        <div className="flex justify-between p-2 bg-dark-card text-xs font-bold text-gray-400">
          <p>PLAYER</p>
          <p>SELECT C & VC</p>
        </div>
        
        {selectedPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 border-b border-dark-border"
          >
            <div>
              <h4 className="font-semibold text-white">{player.name}</h4>
              <p className="text-sm text-gray-400">
                {player.team_name} - {player.role}
              </p>
            </div>
            
            {/* C/VC Buttons with Crimson accent */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleSelectCaptain(player.id)}
                className={`w-10 h-10 rounded-full font-bold
                  ${captainId === player.id 
                    ? 'bg-crimson text-white' // Active C
                    : 'bg-dark-card text-white'}
                  ${viceCaptainId === player.id ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={viceCaptainId === player.id}
              >
                C
              </button>
              <button
                onClick={() => handleSelectViceCaptain(player.id)}
                className={`w-10 h-10 rounded-full font-bold
                  ${viceCaptainId === player.id 
                    ? 'bg-gray-700 text-white' // Active VC
                    : 'bg-dark-card text-white'}
                  ${captainId === player.id ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={captainId === player.id}
              >
                VC
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PickCaptain;