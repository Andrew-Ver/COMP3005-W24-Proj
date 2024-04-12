import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "./auth";

export const authOptions: NextAuthOptions = {
  //secret: process.env.NEXTAUTH_SECRET,
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req) {
        // if (!credentials?.username || !credentials?.password) {
        //   return null;
        // }
        const user = await login(credentials.username, credentials.password);

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /*
        jwt() is called when the JSON Web Token has been created.

        Use the JWT token to fields like user.id or user.role to the token.
      */
    session({ session, user, token }: { session: any; user: any; token: any }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    },
    jwt({ token, user, account, profile }) {
      /*
          jwt() is called whenever a JSON Web Token is created (i.e. at sign in)
          This function is called whenever a JSON Web Token is created.
          It is the responsibility of this function to add the user's ID (or another unique identifier) to the JWT payload.
          The JWT is often used to identify the user in the client side of the application.
          This is the function that should be used to add the user's ID to the JWT payload.
        */
      // console.log(token, user, account, profile, isNewUser)
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
