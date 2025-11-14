import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function UpcomingMatches() {
  const [matches, setMatches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = 'https://leaguex.s3.ap-south-1.amazonaws.com/task/fantasy-sports/Get_All_upcoming_Matches.json';
    
    axios.get(apiUrl).then((response) => {
      if (response.data && response.data.matches && Array.isArray(response.data.matches.cricket)) {
        setMatches(response.data.matches.cricket);
      } else {
        console.error("API data is not in the expected format:", response.data);
        setError('Received invalid data from server.');
      }
      setLoading(false);
    }).catch((err) => {
      console.error("API call failed:", err);
      setError('Failed to fetch matches. Please try again later.');
      setLoading(false);
    });
  }, []); 

  if (loading) {
    return <div className="p-4 text-center text-white-400">Loading matches...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-400">{error}</div>;
  }

  return (
    // --- THIS IS THE CHANGE ---
    // The main container now has a crimson background
    <div className="bg-crimson p-4 min-h-screen">
      
      {/* --- THIS IS THE CHANGE --- */}
      {/* The border is now white to be visible on the crimson background */}
      <h1 className="text-2xl font-bold text-center text-white mb-4 pb-2 border-b-4 border-white">
        Upcoming Matches
      </h1>
      
      {/* Match List */}
      <div className="space-y-3">
        {Array.isArray(matches) && matches.map((match) => (
          <Link 
            key={match.id} 
            to={`/match/${match.id}/my-teams`} 
            // The dark cards will contrast well with the crimson
            className="block p-4 bg-dark-card rounded-lg shadow-lg hover:bg-gray-800 transition-colors border border-dark-border"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-white">{match.match_name}</span>
              <span className="text-xs bg-white text-black-400 px-2 py-1 rounded-full">
                ID: {match.id}
              </span>
            </div>
            <button className="text-sm text-gray-400 mt-1">Click to create your team</button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default UpcomingMatches;