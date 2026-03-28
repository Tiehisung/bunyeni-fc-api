import { IFileProps,   } from "./file.interface";
import { IUser } from "./user.interface";

export interface IInteraction {
  user?: IUser;
  date: string;
  device: string;
  _id:string
}
export interface IComment extends IInteraction {
  comment: string;
}

export interface INewsProps {
  _id: string;
  slug: string;
  stats?: {
    isTrending: boolean;
    isLatest: boolean;
  };
  headline: {
    text: string;
    image: string;
    hasVideo?: boolean;
    sponsor?: Partial<IFileProps>;
  };
  details: {
    _id?: string;
    text?: string;
    media?: Partial<IFileProps>[];
  }[];
  metaDetails?: unknown; //ISquad etc
  isPublished?: boolean;
  type?: "squad" | "signing" | "match" | "training" | "general";
  summary?: string;
  tags?: string[];

  likes?: IInteraction[];
  views: IInteraction[];
  shares?: IInteraction[];
  comments?: IComment[];
  reactions?: number//sum likes,views,shares and comments

  createdAt: string;
  updatedAt: string;

  reporter?: IUser & { about?: string }

}


export interface IPostNews {
  stats?: {
    isTrending: boolean;
    isLatest: boolean;
  };
  headline: {
    text: string;
    image: Partial<IFileProps>;
    hasVideo?: boolean;
    sponsor?: Partial<IFileProps>;
  };
  details: {
    _id?: string;
    text?: string;
    media?: IFileProps[];
  }[];
  reporter?: {
    name: string;
    avatar: Partial<IFileProps>;
  };
}