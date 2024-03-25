import { DefaultSession } from "next-auth";
//
// Extend the built-in session type
// to include additional fields
// in our session callback function
declare module "next-auth" {
    interface Session {
      user: {
        // id: number;
        password: string;
        role: string;
      } & DefaultSession["user"];
    }
  };
