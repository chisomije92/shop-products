import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    isLoggedIn: boolean;
    user: Record<string, any> | null;
  }
}
