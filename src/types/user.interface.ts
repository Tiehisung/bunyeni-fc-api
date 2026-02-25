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
export interface IAuthUser {
  name: string;
  email: string;
  role: EUserRole;
  id: string
  image?: string
}

export enum EUserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  GUEST = 'guest',
  PLAYER = 'player',
  COACH = 'coach'
}
export enum EUserAccount {
  CREDENTIALS = 'credentials',
  GOOGLE = 'google',
}
export interface ISession {
  user: {
    id: string
    name: string;
    image: string;
    role?: EUserRole
    email: string;

  };
  expires: string
}





