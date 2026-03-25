export interface IUser {
  _id?: string
  image: string
  name: string;
  email: string;
  password?: string;
  role?: EUserRole;

  isActive?: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt?: string;
  updatedAt?: string;
}

export enum EUserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  FAN = 'fan',
  PLAYER = 'player',
  COACH = 'coach'
}
export enum EUserAccount {
  CREDENTIALS = 'credentials',
  GOOGLE = 'google',
}


export interface IFan extends IUser {
  fanPoints: number;
  fanBadges: string[];
  fanRank?: number;
  engagementScore: number;
  contributions: {
    comments: number;
    shares: number;
    reactions: number;
    matchAttendance: number;
    galleries: number;
    newsViews: number;
  };
  fanSince: Date;
  lastActive: Date;
  isFan: boolean;
}


