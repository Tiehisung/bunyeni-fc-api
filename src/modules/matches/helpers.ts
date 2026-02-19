import MatchModel from "./match.model";

export interface IMatchEvent {
    title: string,
    description?: string;
    minute: string | number,
    type: 'goal' | 'card' | 'injury' | 'general'
    timestamp:Date
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
