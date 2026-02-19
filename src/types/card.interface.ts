import { IMatch, } from "./match.interface";
import { IPlayerMini } from "./player.interface";

export enum ECardType {
    YELLOW = 'yellow',
    RED = 'red'
}

export interface ICard {
    _id: string;
    type: ECardType;
    match?: IMatch;
    player?: IPlayerMini
    minute?: string
    description?: string
    createdAt?: string
    updatedAt?: string
} 