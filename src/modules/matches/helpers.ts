import { IGoal, IMatch } from "../../types/match.interface";
import MatchModel from "./match.model";

export interface IMatchEvent {
  title: string,
  description?: string;
  minute: string | number,
  type: 'goal' | 'card' | 'injury' | 'general'
  timestamp: Date
}

export async function updateMatchEvent(
  matchId: string, event: IMatchEvent) {
  try {

    const updated = await MatchModel.findByIdAndUpdate(matchId, {
      $push: { events: event },
    });

    if (updated) return { success: true, data: updated }
    return { success: false, }

  } catch { return { success: false, } }
}


export const computeMatchResult = (match: IMatch,) => {
  const goals = match.goals || []
  const opponentId = match.opponent._id.toString();

  const opponentGoals = goals.filter(
    (g) => g.teamId && String(g.teamId) === opponentId
  );

  const teamGoals = goals.filter(
    (g) => !g.teamId || String(g.teamId) !== opponentId
  );

  const teamScore = teamGoals.length;
  const opponentScore = opponentGoals.length;

  return {
    teamGoals,
    opponentGoals,
    teamScore,
    opponentScore,
    scoreline: `${teamScore} - ${opponentScore}`,
    result:
      teamScore > opponentScore
        ? "win"
        : teamScore < opponentScore
          ? "loss"
          : "draw",
  };
};