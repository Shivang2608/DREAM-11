import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpcomingMatches() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(
        "https://leaguex.s3.ap-south-1.amazonaws.com/task/fantasy-sports/Get_All_upcoming_Matches.json"
      )
      .then((res) => setMatches(res.data.matches.cricket || []));
  }, []);

  return (
    <div>
      {/* Banner */}
      <div className="bg-white rounded-xl overflow-hidden shadow mb-6 h-40">
        <img
          src="https://via.placeholder.com/1200x200?text=Promotional+Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((m) => (
          <div
            key={m.id}
            className="bg-white shadow rounded-xl border p-4 relative hover:shadow-lg transition"
          >
            {/* Tournament */}
            <p className="text-gray-500 text-sm mb-3 font-medium">
              {m.event_name} - {m.match_type} Match
            </p>

            <div className="flex items-center justify-between">
              {/* Teams */}
              <div className="flex flex-col gap-3">
                {/* Team 1 */}
                <div className="flex items-center gap-3">
                  <img
                    src={m.t1_image}
                    className="w-10 h-10 rounded-full object-contain border"
                  />
                  <span className="font-semibold text-black text-lg">
                    {m.t1_name}
                  </span>
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-3">
                  <img
                    src={m.t2_image}
                    className="w-10 h-10 rounded-full object-contain border"
                  />
                  <span className="font-semibold text-black text-lg">
                    {m.t2_name}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="text-gray-700 font-bold">
                  {new Date(m.match_date).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
                <p className="text-gray-500 text-sm">Tomorrow</p>
              </div>
            </div>

            {/* Prize pool */}
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-lg text-sm font-semibold">
                ₹58 crores
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                MEGA
              </span>
            </div>

            {/* Plus Button */}
            <button
              onClick={() => navigate(`/match/${m.id}/my-teams`)}
              className="absolute bottom-3 right-3 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}