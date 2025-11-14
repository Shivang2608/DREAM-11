import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function MyTeams() {
  const { matchId } = useParams();
  const [myTeams, setMyTeams] = useState([]);
  const [previewTeamId, setPreviewTeamId] = useState(null);

  useEffect(() => {
    // ... Your logic is perfect, no change ...
    const teamsKey = `my_teams_${matchId}`;
    const savedTeams = localStorage.getItem(teamsKey);
    if (savedTeams) { setMyTeams(JSON.parse(savedTeams)); }
  }, [matchId]);

  const getTeamDetails = (team) => {
    // ... Your logic is perfect, no change ...
    const captain = team.players.find(p => p.id === team.captain);
    const viceCaptain = team.players.find(p => p.id === team.viceCaptain);
    const roleCounts = { 'Wicket-Keeper': 0, 'Batsman': 0, 'All-Rounder': 0, 'Bowler': 0 };
    team.players.forEach(player => { roleCounts[player.role] += 1; });
    return {
      captainName: captain ? captain.name : 'N/A',
      viceCaptainName: viceCaptain ? viceCaptain.name : 'N/A',
      roles: roleCounts,
    };
  };

  const togglePreview = (teamId) => {
    setPreviewTeamId(previewTeamId === teamId ? null : teamId);
  };

  return (
    <div>
      {/* Sticky Crimson Header */}
      <div className="bg-crimson p-4 shadow-lg sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center text-white">My Teams</h1>
        <p className="text-center text-red-100 text-sm">Match ID: {matchId}</p>

        {/* Create Team Button (changed from green to crimson) */}
        <Link to={`/match/${matchId}/create-team`} className="block w-full mt-3">
          <button className="w-full bg-white text-crimson font-bold py-3 rounded-lg hover:bg-gray-200 transition-all">
            Create New Team
          </button>
        </Link>
      </div>

      {/* Team List Area */}
      <div className="p-3">
        {myTeams.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            You haven't created any teams for this match yet.
          </p>
        )}

        {myTeams.map((team, index) => {
          const details = getTeamDetails(team);
          return (
            <div key={team.id} className="bg-dark-card rounded-lg shadow-lg border border-dark-border mb-3">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">Team {index + 1}</h3>
                <div className="text-sm text-gray-300 mt-2">
                  <p><strong>C:</strong> {details.captainName}</p>
                  <p><strong>VC:</strong> {details.viceCaptainName}</p>
                </div>
                <div className="flex justify-around text-center mt-3 border-t border-dark-border pt-3">
                  <div>
                    <p className="text-xs text-gray-400">WK</p>
                    <p className="font-bold text-lg text-blue-400">{details.roles['Wicket-Keeper']}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">BAT</p>
                    <p className="font-bold text-lg text-green-400">{details.roles['Batsman']}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">AR</p>
                    <p className="font-bold text-lg text-orange-400">{details.roles['All-Rounder']}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">BOWL</p>
                    <p className="font-bold text-lg text-purple-400">{details.roles['Bowler']}</p>
                  </div>
                </div>
              </div>

              {/* Preview Button */}
              <button 
                onClick={() => togglePreview(team.id)}
                className="w-full text-center text-crimson font-semibold py-2 border-t border-dark-border bg-black rounded-b-lg"
              >
                {previewTeamId === team.id ? 'Hide Preview' : 'Team Preview'}
              </button>

              {/* Preview List */}
              {previewTeamId === team.id && (
                <div className="border-t border-dark-border pt-3 p-4 bg-black space-y-1">
                  {team.players.map(player => (
                    <div key={player.id} className="flex justify-between text-sm text-gray-300">
                      <p>{player.name} ({player.role})</p>
                      <div>
                        {player.id === team.captain && <span className="font-bold text-crimson"> (C)</span>}
                        {player.id === team.viceCaptain && <span className="font-bold text-red-400"> (VC)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyTeams;