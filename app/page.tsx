import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Premier League Fixtures",
    other: {
      ...(await fetchMetadata(
        new URL("/frames", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
      )),
    },
  };
}

export default async function Home() {
  return <span>Premier League Fixtures</span>;
}
