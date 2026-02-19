export interface IUser {
  _id?: string
  image: string
  name: string;
  email: string;
  role?: EUserRole;

  about?: string;
  dateEngaged?: string;
  password?: string;
  isActive?: boolean
  createdAt?: string;
  updatedAt?: string;
}


export enum EUserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  GUEST = 'guest',
  PLAYER = 'player',
  COACH='coach'
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





