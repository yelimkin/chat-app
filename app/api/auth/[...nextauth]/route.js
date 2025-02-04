import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // lib/auth.js에서 authOptions를 가져옴

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };