import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// --- TABS & COLOR DEFINITIONS ---
const TABS = {
  'WK': 'Wicket-Keeper', 'BAT': 'Batsman', 'AR': 'All-Rounder', 'BOWL': 'Bowler'
};
const TAB_KEYS = Object.keys(TABS);
const ROLE_TO_KEY = {
  'Wicket-Keeper': 'WK', 'Batsman': 'BAT', 'All-Rounder': 'AR', 'Bowler': 'BOWL'
};
// Use brighter colors for dark mode
const ROLE_COLORS = {
  'WK': 'text-blue-400',
  'BAT': 'text-green-400',
  'AR': 'text-orange-400',
  'BOWL': 'text-purple-400'
};
// ---------------------------------

function PickPlayers() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  // ... All your state and logic is perfect, no changes ...
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditsLeft, setCreditsLeft] = useState(100);
  const [playerCount, setPlayerCount] = useState(0);
  const [teamNames, setTeamNames] = useState({ teamA: '', teamB: '' });
  const [teamCounts, setTeamCounts] = useState({});
  const [roleCounts, setRoleCounts] = useState({
    'Wicket-Keeper': 0, 'Batsman': 0, 'All-Rounder': 0, 'Bowler': 0,
  });
  const [groupedPlayers, setGroupedPlayers] = useState({
    'Wicket-Keeper': [], 'Batsman': [], 'All-Rounder': [], 'Bowler': [],
  });
  const [activeTab, setActiveTab] = useState(TAB_KEYS[0]);
  
  useEffect(() => {
    // ... Your useEffect logic is perfect, no changes ...
    const apiUrl = 'https.://leaguex.s3.ap-south-1.amazonaws.com/task/fantasy-sports/Get_All_Players_of_match.json';
    axios.get(apiUrl).then((response) => {
      if (Array.isArray(response.data)) {
        setAllPlayers(response.data);
        const groups = { 'Wicket-Keeper': [], 'Batsman': [], 'All-Rounder': [], 'Bowler': [] };
        let teamA = ''; let teamB = '';
        response.data.forEach(player => {
          if (groups[player.role]) { groups[player.role].push(player); }
          if (!teamA) teamA = player.team_name;
          if (!teamB && player.team_name !== teamA) teamB = player.team_name;
        });
        setGroupedPlayers(groups);
        setTeamNames({ teamA, teamB });
        setTeamCounts({ [teamA]: 0, [teamB]: 0 });
      } else { setError('Player data is not an array.'); }
      setLoading(false);
    }).catch((err) => { setError('Failed to fetch players.'); setLoading(false); });
  }, [matchId]);

  const handleAddPlayer = (player) => {
    // ... Your handleAddPlayer logic is perfect, no changes ...
    if (playerCount >= 11) { alert("Max 11 players."); return; }
    if (creditsLeft < player.event_player_credit) { alert("Not enough credits."); return; }
    const currentTeamCount = teamCounts[player.team_name] || 0;
    if (currentTeamCount >= 7) { alert(`Max 7 players from ${player.team_name}.`); return; }
    const currentRoleCount = roleCounts[player.role] || 0;
    if (player.role === 'Wicket-Keeper' && currentRoleCount >= 5) { alert("Max 5 Wicket Keepers."); return; }
    if (player.role === 'Batsman' && currentRoleCount >= 7) { alert("Max 7 Batsmen."); return; }
    if (player.role === 'All-Rounder' && currentRoleCount >= 4) { alert("Max 4 All-Rounders."); return; }
    if (player.role === 'Bowler' && currentRoleCount >= 7) { alert("Max 7 Bowlers."); return; }
    setSelectedPlayers(prevSelected => [...prevSelected, player]);
    setCreditsLeft(prevCredits => prevCredits - player.event_player_credit);
    setPlayerCount(prevCount => prevCount + 1);
    setTeamCounts(prevCounts => ({...prevCounts, [player.team_name]: (prevCounts[player.team_name] || 0) + 1}));
    setRoleCounts(prevCounts => ({...prevCounts, [player.role]: (prevCounts[player.role] || 0) + 1}));
  };

  const handleRemovePlayer = (player) => {
    // ... Your handleRemovePlayer logic is perfect, no changes ...
    setSelectedPlayers(prevSelected => prevSelected.filter(p => p.id !== player.id));
    setCreditsLeft(prevCredits => prevCredits + player.event_player_credit);
    setPlayerCount(prevCount => prevCount - 1);
    setTeamCounts(prevCounts => ({...prevCounts, [player.team_name]: prevCounts[player.team_name] - 1}));
    setRoleCounts(prevCounts => ({...prevCounts, [player.role]: prevCounts[player.role] - 1}));
  };

  const handleGoToPickCaptain = () => {
    // ... Your handleGoToPickCaptain logic is perfect, no changes ...
    if (playerCount !== 11) { alert("You must select exactly 11 players."); return; }
    if (roleCounts['Wicket-Keeper'] < 1) { alert("You must select at least 1 Wicket Keeper."); return; }
    if (roleCounts['Batsman'] < 3) { alert("You must select at least 3 Batsmen."); return; }
    if (roleCounts['Bowler'] < 3) { alert("You must select at least 3 Bowlers."); return; }
    
    navigate(`/match/${matchId}/pick-captain`, { state: { selectedPlayers: selectedPlayers } });
  };

  const isPlayerSelected = (player) => {
    return selectedPlayers.some(p => p.id === player.id);
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Loading players...</div>;
  if (error) return <div className="p-4 text-center text-red-400">{error}</div>;

  return (
    <div> 
      
      {/* --- Sticky Crimson Top Bar --- */}
      <div className="sticky top-0 z-10 bg-crimson p-3 text-white shadow-lg">
        <h1 className="text-xl font-bold text-center">Pick Players</h1>
        <div className="flex justify-between text-center mt-2">
          {/* ... Counters ... */}
          <div>
            <p className="text-xs text-red-100">Players</p>
            <p className="font-bold text-lg">{playerCount} / 11</p>
          </div>
          <div>
            <p className="text-xs text-red-100">{teamNames.teamA}</p>
            <p className="font-bold text-lg">{teamCounts[teamNames.teamA] || 0}</p>
          </div>
          <div>
            <p className="text-xs text-red-100">{teamNames.teamB}</p>
            <p className="font-bold text-lg">{teamCounts[teamNames.teamB] || 0}</p>
          </div>
          <div>
            <p className="text-xs text-red-100">Credits Left</p>
            <p className="font-bold text-lg">{creditsLeft}</p>
          </div>
        </div>
        {/* Next Button (White on Crimson) */}
        <div className="mt-3">
          <button 
            className="w-full bg-white text-crimson font-bold py-3 rounded-lg hover:bg-gray-200 transition-all disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={handleGoToPickCaptain}
            disabled={playerCount !== 11}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* --- Tab Bar with Crimson Accent --- */}
      <div className="flex justify-around bg-black border-b-2 border-dark-border">
        {TAB_KEYS.map(tabKey => (
          <button
            key={tabKey}
            className={`flex-1 py-3 px-2 text-center font-bold ${
              activeTab === tabKey 
                ? 'text-crimson border-b-4 border-crimson' // Active tab
                : 'text-gray-400' // Inactive tab
            }`}
            onClick={() => setActiveTab(tabKey)}
          >
            {tabKey} 
            <span className={`ml-1 ${ROLE_COLORS[tabKey]}`}>
              ({roleCounts[TABS[tabKey]]})
            </span>
          </button>
        ))}
      </div>

      {/* --- Player List --- */}
      <div className="p-2">
        {groupedPlayers[TABS[activeTab]].map(player => {
          const selected = isPlayerSelected(player);
          return (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-3 border-b border-dark-border ${selected ? 'bg-dark-card' : ''}`}
            >
              <div>
                <h4 className="font-semibold text-white">{player.name}</h4>
                <p className="text-sm text-gray-400">
                  {player.team_name} | 
                  <span className={`font-semibold ${ROLE_COLORS[ROLE_TO_KEY[player.role]]}`}>
                    {player.role}
                  </span>
                   | Credits: {player.event_player_credit}
                </p>
              </div>
              {selected ? (
                <button 
                  onClick={() => handleRemovePlayer(player)} 
                  className="bg-white text-black px-3 py-1 rounded text-sm font-semibold"
                >
                  Remove
                </button>
              ) : (
                <button 
                  onClick={() => handleAddPlayer(player)}
                  className="bg-crimson text-white px-3 py-1 rounded text-sm font-semibold"
                >
                  Add
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default PickPlayers;