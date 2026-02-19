import { IUser } from "./user";

// ARCHIVE
export interface IArchive<T = unknown> {
  data: T,
  sourceCollection: EArchivesCollection,
  dateArchived: string
  reason: String,
  originalId: string
  archivedBy?: IUser

  createdAt?: string;
  updatedAt?: string;
}
export interface IPostArchive<T = unknown> {
  data: T,
  sourceCollection: EArchivesCollection,
  originalId?: string
  dateArchived?: string
  archivedBy?: string //objectId
  reason?: String,
}

export enum EArchivesCollection {
  PLAYERS = 'players',
  USERS = 'users',
  GALLERIES = 'galleries', 
  NEWS = 'news',
  SPONSORS = 'sponsors',
  TEAMS = 'teams',
  MATCHES = 'matches',
  SQUADS = "squads",
  MANAGERS = "managers",
}