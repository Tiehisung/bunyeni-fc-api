"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePlayerStandings = void 0;
const computePlayerStandings = (players) => {
    const formatPlayer = (p) => ({
        _id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        avatar: p.avatar || "",
        position: p.position,
        goals: p.goals?.length || 0,
        assists: p.assists?.length || 0,
        appearances: p.matches?.length || 0,
        number: p.number,
    });
    const mappedPlayers = players.map(formatPlayer);
    const topScorers = [...mappedPlayers].sort((a, b) => b.goals - a.goals);
    const topAssists = [...mappedPlayers].sort((a, b) => b.assists - a.assists);
    const topAppearances = [...mappedPlayers].sort((a, b) => b.appearances - a.appearances);
    return {
        topScorers,
        topAssists,
        topAppearances,
    };
};
exports.computePlayerStandings = computePlayerStandings;
