import { IUser } from "./user.interface";

// ARCHIVE
export interface IArchive<T = unknown> {
  doc: T,
  sourceCollection: EArchivesCollection,
  reason: String,
  user?: IUser

  createdAt?: string;
  updatedAt?: string;
}
export interface IPostArchive<T = unknown> {
  doc: T,
  sourceCollection: EArchivesCollection,
  originalId?: string
  reason?: String,
  user:IUser
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
  STAFF = "staff",
}