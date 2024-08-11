import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

const frames = createFrames({
  basePath: '/frames',
  imagesRoute: null,
  middleware: [
    farcasterHubContext({
      ...(process.env.NODE_ENV === "production"
        ? {}
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
  ],
});

const teamLogos: any = {
  1: '/path/to/arsenal/logo.png',
  2: '/path/to/aston-villa/logo.png',
  // ... add all other teams
};

const fetchFixtures = async (event: any) => {
  const response = await fetch(`https://fantasy.premierleague.com/api/fixtures/?event=${event}`);
  const fixtures = await response.json();
  return fixtures;
};

const handleRequest = frames(async (ctx) => {
  const event = ctx.url.searchParams.get('event');

  if (!event) {
    // Default page
    return {
      image: (
        <div tw="flex flex-col items-center p-5">
          <div tw="text-3xl">Welcome to Premier League Fixtures</div>
          <div tw="text-lg mt-2">Check Premier League fixtures and results.</div>
        </div>
      ),
      buttons: [
        <Button action="post" target={{ query: { event: "1" } }}>
          Start with Game Week 1
        </Button>,
      ],
    };
  }

  const fixtures = await fetchFixtures(event);

  return {
    image: (
      <div tw="flex flex-col p-5">
        <div tw="flex text-3xl mb-4">Premier League Fixtures - Game Week {event}</div>
        <div tw="flex flex-col gap-4">
          {fixtures.map((fixture: any) => (
            <div key={fixture.id} tw="flex justify-between items-center">
              <div tw="flex items-center gap-2">
                <div tw="flex font-semibold">{fixture.team_h}</div>
              </div>
              <div>{new Date(fixture.kickoff_time).toLocaleTimeString()}</div>
              <div tw="flex items-center gap-2">
                <div tw="flex font-semibold">{fixture.team_a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" target={{ query: { event: (Number(event) + 1).toString() } }}>
        Next Game Week
      </Button>,
      <Button action="post" target={{ query: { event: (Number(event) - 1).toString() } }} >
        Previous Game Week
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
