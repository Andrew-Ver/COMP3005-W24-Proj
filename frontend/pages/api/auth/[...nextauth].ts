import NextAuth, { NextAuthOptions } from "next-auth"
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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any, req) {
        // if (!credentials?.username || !credentials?.password) {
        //   return null;
        // }
        const user = await login(credentials.username, credentials.password);

        return user;
        }

    })
    ],
    pages: {
      signIn: '/login',
    },
    callbacks: {
      session({ session, user }) {
        // session.user.id = user.id;
        //console.log(user);
        // session.user.role = user.role;
        // session.user.password = user.password;
        return session;
      }
    },
}

export default NextAuth(authOptions)