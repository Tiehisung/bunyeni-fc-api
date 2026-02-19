 
import { IPlayerMini } from "./player.interface";
 
import { ICard } from "./card.interface";
import { IFileProps } from "./file.interface";
import { ISquad } from "./squad.interface";

export enum EMatchStatus {
  FT = 'FT',
  LIVE = 'LIVE',
  UPCOMING = 'UPCOMING'
}

export type TMatchType = "home" | "away";

export interface IMatch {
  _id: string;
  slug?: string;
  comment?: string;
  title: string;
  date: string;
  time: string;
  opponent: ITeam;
  broadcaster?: IFileProps;
  status: EMatchStatus;
  results: 'win' | 'draw' | 'loss'
  isHome: boolean;
  venue?: { name: string; files: IFileProps[] };
  goals: Array<IGoal>
  events: Array<IMatchEvent>;
  cards: Array<ICard>;
  squad?: ISquad
}
export interface IMatchMetrics {
  goals: {
    home: number;
    away: number;
    kfc: IGoal[];
    opponent: IGoal[];
  };
  winStatus: string;
  teams: {
    home: ITeam | undefined;
    away: ITeam;
  }
}
 
export interface IMatchEvent {
  title: string,
  description?: string;
  minute: string | number,
  type: 'goal' | 'card' | 'injury' | 'general'
}


export interface ITeam {
  _id: string;
  name: string;
  community: string;
  alias: string;
  contact: string;
  contactName: string;
  logo: string;
  currentPlayers: IPlayerMini[];
  createdAt: string;
  updatedAt: string;
}

export interface IGoal {
  _id?: string;
  opponent: string; //ObjectId of team
  minute: string | number;
  scorer?: IPlayerMini;
  assist?: IPlayerMini;
  modeOfScore?: EGoalType
  description?: string
  match: string
  forKFC: boolean
  videoUrl?: string;
}


export interface IMatchHighlight extends IFileProps {
  title: string
  match: IMatch
}

export enum EGoalType {
  OPEN_PLAY = "Open Play Goal",
  SET_PIECE = "Set Piece Goal",
  PENALTY = "Penalty Goal",
  OWN_GOAL = "Own Goal",
  COUNTER_ATTACK = "Counter-Attack Goal",
  HEADER = "Header Goal",
  VOLLEY = "Volley Goal",
  TAP_IN = "Tap-In Goal",
  LONG_RANGE = "Long-Range Goal",
  UNKNOWN = 'Unknown'
}