import { IMatch } from "./match.interface";
import { EPlayerPosition,   IPlayerMini } from "./player.interface";

export interface IMvp {
    _id: string;
    player: IPlayerMini,
    match: IMatch,
    description?: string,
    date?: string
    positionPlayed?: EPlayerPosition

    createdAt?: string;
    updatedAt?: string;
}