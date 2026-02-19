import { teamKFC } from "../../data/teams";
import { IMatch, IMatchMetrics } from "../../types/match.interface";



export const checkTeams = (match?: IMatch) => {

    if (match?.isHome) {
        return { home: teamKFC, away: match?.opponent }
    }
    return {
        home: match?.opponent,
        away: teamKFC,
    }
};

export const checkMatchMetrics = (match?: IMatch): IMatchMetrics => {
    const kfc = match?.goals?.filter(g => g.forKFC) ?? []
    const opponent = match?.goals?.filter(g => !g.forKFC) ?? []

    const status = kfc?.length < opponent?.length ? 'loss' : kfc?.length > opponent.length ? 'win' : 'draw'
    const { home, away } = checkTeams(match)

    const goals = match?.isHome
        ? { home: kfc.length, away: opponent.length }
        : { home: opponent.length, away: kfc.length }

    return {
        goals: { kfc, opponent, ...goals },
        winStatus: status,
        teams: { home, away }
    }
};