"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMatchMetrics = exports.checkTeams = void 0;
const teams_1 = require("../../data/teams");
const checkTeams = (match) => {
    if (match?.isHome) {
        return { home: teams_1.teamKFC, away: match?.opponent };
    }
    return {
        home: match?.opponent,
        away: teams_1.teamKFC,
    };
};
exports.checkTeams = checkTeams;
const checkMatchMetrics = (match) => {
    const kfc = match?.goals?.filter(g => g.forKFC) ?? [];
    const opponent = match?.goals?.filter(g => !g.forKFC) ?? [];
    const status = kfc?.length < opponent?.length ? 'loss' : kfc?.length > opponent.length ? 'win' : 'draw';
    const { home, away } = (0, exports.checkTeams)(match);
    const goals = match?.isHome
        ? { home: kfc.length, away: opponent.length }
        : { home: opponent.length, away: kfc.length };
    return {
        goals: { kfc, opponent, ...goals },
        winStatus: status,
        teams: { home, away }
    };
};
exports.checkMatchMetrics = checkMatchMetrics;
