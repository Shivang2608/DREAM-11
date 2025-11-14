import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/**
 * PickPlayers.jsx
 * - Route: /match/:id/pick-players
 *
 * Keeps original UI/layout but:
 * - fixes role normalization
 * - guards against undefined ROLE_LIMITS lookups
 * - handles various API shapes robustly
 * - avoids NaN credits
 */

const API_PLAYERS_URL =
  "https://leaguex.s3.ap-south-1.amazonaws.com/task/fantasy-sports/Get_All_Players_of_match.json";

const MAX_CREDITS = 100;
const REQUIRED_PLAYERS = 11;
const ROLE_LIMITS = {
  BAT: { min: 3, max: 7 },
  WK: { min: 1, max: 5 },
  AR: { min: 0, max: 4 },
  BOWL: { min: 3, max: 7 },
};

const roleKeys = Object.keys(ROLE_LIMITS);

// Map various possible API role strings to our canonical roles
const ROLE_MAP = {
  BATSMAN: "BAT",
  BAT: "BAT",
  BATT: "BAT",
  "WICKET KEEPER": "WK",
  "WICKET-KEEPER": "WK",
  "WICKETKEEPER": "WK",
  WK: "WK",
  "ALL ROUNDER": "AR",
  "ALL-ROUNDER": "AR",
  "ALLROUNDER": "AR",
  "ALLROUND": "AR",
  AR: "AR",
  BOWLER: "BOWL",
  BOWL: "BOWL",
  BOL: "BOWL",
};

const normalizeRole = (raw) => {
  if (!raw) return "BAT";
  const key = String(raw).trim().toUpperCase();
  // Try direct map first, else try partial matches
  if (ROLE_MAP[key]) return ROLE_MAP[key];
  if (key.includes("WICKET") || key.includes("KEEPER")) return "WK";
  if (key.includes("ALL") || key.includes("ROUND")) return "AR";
  if (key.includes("BOWL") || key.includes("BOL")) return "BOWL";
  if (key.includes("BAT")) return "BAT";
  // fallback
  return "BAT";
};

const safeNumber = (v, fallback = 8) => {
  const n = Number(v);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : fallback;
};

const PickPlayers = () => {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const editTeamIndex = state?.editTeamIndex ?? null;
  const prefilledTeam = state?.teamData ?? null;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI filters
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("ALL");
  const [maxCreditFilter, setMaxCreditFilter] = useState(MAX_CREDITS);

  // Selected players state
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(API_PLAYERS_URL);
        const payload = res.data;
        let allPlayers = [];

        if (Array.isArray(payload)) {
          allPlayers = payload;
        } else if (payload && Array.isArray(payload.player)) {
          allPlayers = payload.player;
        } else if (payload && Array.isArray(payload.players)) {
          allPlayers = payload.players;
        } else if (payload && Array.isArray(payload.AllPlayers)) {
          allPlayers = payload.AllPlayers;
        } else if (payload && payload.data && Array.isArray(payload.data.players)) {
          allPlayers = payload.data.players;
        } else {
          const arrVal = Object.values(payload).find((v) => Array.isArray(v));
          allPlayers = arrVal || [];
        }

        // Filter for match (robust)
        const filteredForMatch = allPlayers.filter((p) => {
          if (!p) return false;
          if (p.match_id && String(p.match_id) === String(matchId)) return true;
          if (p.matchId && String(p.matchId) === String(matchId)) return true;
          if (p.match && String(p.match) === String(matchId)) return true;
          // If dataset is already scoped to match, include it
          return !("match_id" in p || "matchId" in p || "match" in p);
        });

        const normalized = filteredForMatch.map((p, idx) => {
          const rawRole = p.role ?? p.player_role ?? p.type ?? p.type_of_player ?? "BAT";
          const role = normalizeRole(rawRole);

          const credits = safeNumber(p.credit ?? p.value ?? p.credit_value ?? p.points ?? p.credits ?? 8, 8);

          return {
            id: p.id ?? p.player_id ?? p.pid ?? `${idx}`,
            name: p.name ?? p.player_name ?? p.player ?? `Player ${idx + 1}`,
            role,
            team: p.team ?? p.team_name ?? p.teamShort ?? p.teamA ?? p.team_B ?? "TEAM",
            credits,
            raw: p,
          };
        });

        if (!mounted) return;
        setPlayers(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch players:", err);
        if (!mounted) return;
        setError("Failed to load players. Try again.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchPlayers();

    return () => {
      mounted = false;
    };
  }, [matchId]);

  // Prefill selected players if editing
  useEffect(() => {
    if (!prefilledTeam || !Array.isArray(prefilledTeam.players)) return;

    // Wait until players are loaded to map ids to actual player objects
    if (players.length === 0) return;

    const preselected = prefilledTeam.players
      .map((p) => {
        if (typeof p === "string" || typeof p === "number") {
          const found = players.find((pl) => String(pl.id) === String(p));
          return found || { id: p, name: String(p), role: "BAT", team: "TEAM", credits: 8 };
        }
        // if p is object
        const found = players.find((pl) => String(pl.id) === String(p.id));
        return found || { id: p.id ?? p, name: p.name ?? "Player", role: normalizeRole(p.role ?? p.type), team: p.team ?? "TEAM", credits: safeNumber(p.credits ?? p.credit, 8) };
      })
      .filter(Boolean)
      .slice(0, REQUIRED_PLAYERS);

    if (preselected.length > 0) {
      setSelectedPlayers(preselected);
    } else if (prefilledTeam.players.length > 0) {
      // fallback minimal objects
      const fallback = prefilledTeam.players.map((p, i) => ({
        id: p.id ?? p,
        name: p.name ?? `Player ${i + 1}`,
        role: normalizeRole(p.role ?? p.type),
        team: p.team ?? "TEAM",
        credits: safeNumber(p.credits ?? p.credit, 8),
      })).slice(0, REQUIRED_PLAYERS);
      setSelectedPlayers(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledTeam, players]);

  // Derived info: teams list for filters
  const teamsList = useMemo(() => {
    const t = new Set();
    players.forEach((p) => t.add(p.team));
    return Array.from(t);
  }, [players]);

  // Derived summary counts
  const summary = useMemo(() => {
    const counts = {
      totalSelected: selectedPlayers.length,
      creditsUsed: selectedPlayers.reduce((s, p) => s + safeNumber(p.credits, 0), 0),
      roleCounts: roleKeys.reduce((acc, r) => ({ ...acc, [r]: 0 }), {}),
      teamCounts: {},
    };

    selectedPlayers.forEach((p) => {
      const role = (p.role || "BAT").toUpperCase();
      // ignore roles that somehow are not in ROLE_LIMITS by using fallback assignment
      const normalizedRoleKey = ROLE_MAP[role] ? ROLE_MAP[role] : roleKeys.includes(role) ? role : "BAT";
      counts.roleCounts[normalizedRoleKey] = (counts.roleCounts[normalizedRoleKey] || 0) + 1;
      counts.teamCounts[p.team] = (counts.teamCounts[p.team] || 0) + 1;
    });

    counts.creditsLeft = MAX_CREDITS - counts.creditsUsed;
    return counts;
  }, [selectedPlayers]);

  // Validation helpers
  const roleViolations = useMemo(() => {
    const violations = [];
    roleKeys.forEach((r) => {
      const cnt = summary.roleCounts[r] || 0;
      const { min, max } = ROLE_LIMITS[r];
      if (cnt < min) violations.push(`${r}: min ${min}`);
      if (cnt > max) violations.push(`${r}: max ${max}`);
    });
    return violations;
  }, [summary.roleCounts]);

  const exceedsTeamLimit = useMemo(() => {
    return Object.values(summary.teamCounts).some((c) => c > 7);
  }, [summary.teamCounts]);

  const selectionIsValid = useMemo(() => {
    if (summary.totalSelected !== REQUIRED_PLAYERS) return false;
    if (summary.creditsUsed > MAX_CREDITS) return false;
    if (exceedsTeamLimit) return false;
    for (let r of roleKeys) {
      const cnt = summary.roleCounts[r] || 0;
      const { min, max } = ROLE_LIMITS[r];
      if (cnt < min || cnt > max) return false;
    }
    return true;
  }, [summary, exceedsTeamLimit]);

  // Player selection toggler (defensive & role-safe)
  const toggleSelectPlayer = (player) => {
    if (!player) return;

    const already = selectedPlayers.find((p) => String(p.id) === String(player.id));
    if (already) {
      setSelectedPlayers((prev) => prev.filter((p) => String(p.id) !== String(player.id)));
      return;
    }

    // Prevent adding beyond required players
    if (selectedPlayers.length >= REQUIRED_PLAYERS) {
      alert(`You can select only ${REQUIRED_PLAYERS} players.`);
      return;
    }

    // Credits check (use latest summary)
    const newCredits = summary.creditsUsed + safeNumber(player.credits, 0);
    if (newCredits > MAX_CREDITS) {
      alert(`Not enough credits. Max ${MAX_CREDITS} credits allowed.`);
      return;
    }

    // Team limit check
    const teamCount = summary.teamCounts[player.team] || 0;
    if (teamCount + 1 > 7) {
      alert("Cannot select more than 7 players from the same team.");
      return;
    }

    // Role max check with guard
    const role = (player.role || "BAT").toUpperCase();
    // ensure role key exists in ROLE_LIMITS, else fallback to BAT limits
    const limits = ROLE_LIMITS[role] || ROLE_LIMITS["BAT"];
    const roleCount = summary.roleCounts[role] || 0;
    if (roleCount + 1 > limits.max) {
      alert(`${role} exceeds maximum allowed (${limits.max}).`);
      return;
    }

    setSelectedPlayers((prev) => [...prev, player]);
  };

  // Remove by id
  const removeSelected = (playerId) => {
    setSelectedPlayers((prev) => prev.filter((p) => String(p.id) !== String(playerId)));
  };

  // Proceed to pick captain page
  const handleProceedToCaptain = () => {
    if (!selectionIsValid) {
      alert("Team is not valid yet. Check role distribution, credits and total players.");
      return;
    }

    navigate(`/match/${matchId}/pick-captain`, {
      state: {
        matchId,
        selectedPlayers,
        editTeamIndex,
      },
    });
  };

  // Filtered view
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (selectedRoleFilter !== "ALL" && p.role.toUpperCase() !== selectedRoleFilter) return false;
      if (selectedTeamFilter !== "ALL" && p.team !== selectedTeamFilter) return false;
      if (p.credits > maxCreditFilter) return false;
      return true;
    });
  }, [players, selectedRoleFilter, selectedTeamFilter, maxCreditFilter]);

  if (loading) {
    return <div className="p-4 text-center text-gray-300">Loading players...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="bg-crimson min-h-screen p-5">
      <h1 className="text-2xl text-white font-bold text-center mb-4">Pick Players</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Filters + Summary */}
        <aside className="lg:col-span-1 bg-dark-card border border-dark-border rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Filters</h3>

          <div className="mb-3">
            <label className="text-sm text-gray-300">Role</label>
            <select
              className="w-full mt-2 p-2 rounded bg-gray-800 text-white"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              {roleKeys.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-300">Team</label>
            <select
              className="w-full mt-2 p-2 rounded bg-gray-800 text-white"
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              {teamsList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-300">Max credits (≤ {MAX_CREDITS})</label>
            <input
              type="range"
              min="1"
              max={MAX_CREDITS}
              value={maxCreditFilter}
              onChange={(e) => setMaxCreditFilter(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="text-sm text-gray-400 mt-1">{maxCreditFilter} credits</div>
          </div>

          <hr className="border-gray-700 my-3" />

          <h3 className="text-white font-semibold mb-2">Selection Summary</h3>
          <div className="text-sm text-gray-300">
            <p>
              Selected players: <span className="font-semibold">{summary.totalSelected}/{REQUIRED_PLAYERS}</span>
            </p>
            <p>
              Credits used: <span className="font-semibold">{summary.creditsUsed}</span> / {MAX_CREDITS}
            </p>
            <p>
              Credits left: <span className="font-semibold">{summary.creditsLeft}</span>
            </p>
            <div className="mt-2">
              {roleKeys.map((r) => (
                <div key={r} className="flex justify-between text-xs text-gray-300">
                  <span>{r}</span>
                  <span>{summary.roleCounts[r] || 0}</span>
                </div>
              ))}
            </div>
            {exceedsTeamLimit && <p className="text-xs text-yellow-300 mt-2">More than 7 players from a single team</p>}
            {summary.creditsUsed > MAX_CREDITS && <p className="text-xs text-red-400 mt-2">Exceeded credits</p>}
            {summary.totalSelected !== REQUIRED_PLAYERS && <p className="text-xs text-gray-400 mt-2">Select exactly {REQUIRED_PLAYERS} players</p>}
            {roleViolations.length > 0 && (
              <div className="mt-2 text-xs text-yellow-200">
                <strong>Role constraints:</strong>
                <ul className="list-disc ml-5">
                  {roleViolations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleProceedToCaptain}
            disabled={!selectionIsValid}
            className={`mt-4 w-full py-2 rounded font-semibold ${selectionIsValid ? "bg-white text-black hover:bg-gray-200" : "bg-gray-600 text-gray-300 cursor-not-allowed"}`}
          >
            Proceed to Captain & Vice
          </button>
        </aside>

        {/* Right: Players Grid */}
        <main className="lg:col-span-3">
          {/* Selected players strip */}
          <div className="mb-4 bg-dark-card border border-dark-border rounded p-3">
            <h4 className="text-white font-semibold mb-2">Selected Players</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.length === 0 && <div className="text-sm text-gray-400">No players selected yet</div>}
              {selectedPlayers.map((p) => (
                <div key={p.id} className="bg-gray-800 text-white px-3 py-1 rounded flex items-center gap-2">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-gray-300">({p.role})</span>
                  <button onClick={() => removeSelected(p.id)} className="text-xs ml-2 text-red-400">remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* Players grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlayers.map((p) => {
              const isSelected = !!selectedPlayers.find((s) => String(s.id) === String(p.id));
              return (
                <div key={p.id} className={`p-3 rounded-lg border ${isSelected ? "border-white bg-gray-700" : "border-dark-border bg-dark-card"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-300">{p.role} • {p.team}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white font-bold">{p.credits} cr</div>
                      <div className="text-xs text-gray-400">ID: {p.id}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => toggleSelectPlayer(p)}
                      className={`flex-1 py-2 rounded text-sm font-semibold ${isSelected ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-gray-200"}`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>

                    {isSelected && (
                      <button onClick={() => removeSelected(p.id)} className="py-2 px-3 rounded text-sm bg-red-600 text-white">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* If no players after filters */}
          {filteredPlayers.length === 0 && (
            <div className="mt-6 text-center text-gray-300">
              No players match the current filters.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PickPlayers;
