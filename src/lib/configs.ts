

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://konjiehifc.vercel.app";


export const apiConfig = {
  base: `${baseUrl}/api`,
  features: `${baseUrl}/api/features`,
  users: `${baseUrl}/api/users`,
  auth: `${baseUrl}/api/auth`,
  signin: `${baseUrl}/api/auth/signin`,
  credentialSignin: `${baseUrl}/api/auth/credentials`,
  signout: `${baseUrl}/api/auth/signout`,
  logout: `${baseUrl}/api/auth/users/logout`,
  sponsors: `${baseUrl}/api/sponsors`,
  docs: `${baseUrl}/api/documents`,
  moveCopyDoc: `${baseUrl}/api/documents/move-copy`,

  teams: `${baseUrl}/api/teams`,

  matches: `${baseUrl}/api/matches`,
  goals: `${baseUrl}/api/goals`,
  cards: `${baseUrl}/api/cards`,
  mvps: `${baseUrl}/api/mvps`,
  injuries: `${baseUrl}/api/injuries`,

  players: `${baseUrl}/api/players`,
  trainingSession: `${baseUrl}/api/training`,

  managers: `${baseUrl}/api/managers`,

  captains: `${baseUrl}/api/captains`,
  currentCaptains: `${baseUrl}/api/captains/current`,

  galleries: `${baseUrl}/api/galleries`,

  messages: `${baseUrl}/api/messages`,
  transactions: `${baseUrl}/api/finance/transactions`,
  news: `${baseUrl}/api/news`,
  squad: `${baseUrl}/api/squad`,

  fileUpload: `${baseUrl}/api/file/cloudinary`,
  file: `${baseUrl}/api/file`,
  highlights: `${baseUrl}/api/highlights`,
};
