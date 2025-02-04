import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import clientPromise from "./db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const client = await clientPromise;
        const users = client.db("chat-app").collection("users");
        const user = await users.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.authToken = user.authToken; // 여기서 authToken을 추가로 저장
      }
      return token;
    },
    async session({ session, token }) {
      session.token = token.authToken; // 세션에 토큰 추가
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
};