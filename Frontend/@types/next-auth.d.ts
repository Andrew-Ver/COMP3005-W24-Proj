import { DefaultSession } from "next-auth";
import { DefaultUser } from "next-auth";
//
// Extend the built-in session type
// to include additional fields
// in our session callback function
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    //id: string;
    role: string;
    name: string;
    username: string;
    //email?: string;
  }
}
