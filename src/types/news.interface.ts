import { IFileProps, IFileUpload } from "./file.interface";
import { IUser } from "./user";

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

  likes?: { email: string, name: string; date: string; device?: string }[];
  views: { email: string, name: string; date: string; device?: string }[];
  shares?: { email: string, name: string; date: string; device?: string }[];
  comments?: { email: string, image?: string; name?: string; comment: string; date: string }[];
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
    image: Partial<IFileUpload>;
    hasVideo?: boolean;
    sponsor?: Partial<IFileUpload>;
  };
  details: {
    _id?: string;
    text?: string;
    media?: IFileUpload[];
  }[];
  reporter?: {
    name: string;
    avatar: Partial<IFileProps>;
  };
}