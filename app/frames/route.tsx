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

// Mapping of team IDs to their abbreviations
// Default logo URL for all teams
const defaultLogo = "https://resources.premierleague.com/premierleague/badges/70/t11.png";

// Mapping of team IDs to their abbreviations and logos
const teamInfo: Record<number, { abbreviation: string, logo: string }> = {
  1: { abbreviation: 'ARS', logo: 'https://resources.premierleague.com/premierleague/badges/70/t3.png' },
  2: { abbreviation: 'AVL', logo: 'https://resources.premierleague.com/premierleague/badges/70/t7.png' },
  3: { abbreviation: 'BOU', logo: defaultLogo },
  4: { abbreviation: 'BRE', logo: defaultLogo },
  5: { abbreviation: 'BHA', logo: 'https://resources.premierleague.com/premierleague/badges/70/t36.png' },
  6: { abbreviation: 'CHE', logo: 'https://resources.premierleague.com/premierleague/badges/70/t8.png' },
  7: { abbreviation: 'CRY', logo: 'https://resources.premierleague.com/premierleague/badges/70/t31.png' },
  8: { abbreviation: 'EVE', logo: 'https://resources.premierleague.com/premierleague/badges/70/t11.png' },
  9: { abbreviation: 'FUL', logo: 'https://resources.premierleague.com/premierleague/badges/70/t54.png' },
  10: { abbreviation: 'IPS', logo: 'https://resources.premierleague.com/premierleague/badges/70/t40.png' },
  11: { abbreviation: 'LEI', logo: 'https://resources.premierleague.com/premierleague/badges/70/t13.png' },
  12: { abbreviation: 'LIV', logo: 'https://resources.premierleague.com/premierleague/badges/70/t14.png' },
  13: { abbreviation: 'MCI', logo: 'https://resources.premierleague.com/premierleague/badges/70/t43.png' },
  14: { abbreviation: 'MUN', logo: 'https://resources.premierleague.com/premierleague/badges/70/t1.png' },
  15: { abbreviation: 'NEW', logo: 'https://resources.premierleague.com/premierleague/badges/70/t4.png' },
  16: { abbreviation: 'NFO', logo: 'https://resources.premierleague.com/premierleague/badges/70/t17.png' },
  17: { abbreviation: 'SOU', logo: 'https://resources.premierleague.com/premierleague/badges/70/t20.png' },
  18: { abbreviation: 'TOT', logo: 'https://resources.premierleague.com/premierleague/badges/70/t6.png' },
  19: { abbreviation: 'WHU', logo: 'https://resources.premierleague.com/premierleague/badges/70/t21.png' },
  20: { abbreviation: 'WOL', logo: 'https://resources.premierleague.com/premierleague/badges/70/t39.png' },
};

const fetchFixtures = async (event: any) => {
  const response = await fetch(`https://fantasy.premierleague.com/api/fixtures/?event=${event}`);
  const fixtures = await response.json();
  return fixtures;
};

const groupFixturesByDate = (fixtures: any[]) => {
  const groupedFixtures: Record<string, any[]> = {};
  fixtures.forEach((fixture) => {
    const date = new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

    if (!groupedFixtures[date]) {
      groupedFixtures[date] = [];
    }
    groupedFixtures[date].push(fixture);
  });
  return groupedFixtures;
};


const handleRequest = frames(async (ctx) => {
  const event = ctx.url.searchParams.get('event');

  if (!event) {
    // Default page
    return {
      image: (
        <div tw="flex flex-col items-center p-8 bg-gradient-to-r from-purple-500 to-indigo-500 text-black rounded-lg shadow-lg">
          <div tw="text-4xl font-bold">Premier League Fixtures</div>
          <div tw="text-xl mt-4">Check the latest fixtures and results.</div>
        </div>
      ),
      buttons: [
        <Button 
          action="post" 
          target={{ query: { event: "1" } }}
        >
          Start with Game Week 1
        </Button>,
      ],
    };
  }

  const fixtures = await fetchFixtures(event);
  const groupedFixtures = groupFixturesByDate(fixtures);

  return {
    image: (
      <div tw="flex flex-col p-8 justify-center items-center max-w-lg rounded-lg shadow-lg">
        <div tw="flex text-xl font-bold text-gray-800 mb-1">Game Week {event} Fixtures</div>
        {Object.keys(groupedFixtures).map((date) => (
          <div key={date} tw="flex flex-col mb-1">
            <div tw="flex justify-center text-lg font-semibold bg-violet-900 text-green-300 mb-1 rounded-lg p-1">
              {date}
            </div>
            <div tw="flex flex-wrap max-w-sm bg-white rounded-lg shadow-sm p-1">
              {groupedFixtures[date].map((fixture: any) => (
                <div key={fixture.id} tw="flex flex-wrap items-center justify-center mb-1 p-2 space-x-9">
                  <div tw="flex items-center justify-center">
                 
                  <div tw="flex text-sm antialiased font-bold text-blue-700 col-span-1">
                  {teamInfo[fixture.team_h].abbreviation}
                  
                  </div>
                  <img 
                    src={teamInfo[fixture.team_h].logo} 
                    alt={`${teamInfo[fixture.team_h].abbreviation} logo`} 
                    tw="w-4 h-4 rounded-full ml-1"
                  />

                  </div>
                  
                 
                  <div tw=" ml-2 mr-2 text-lg border border-gray-300 rounded-lg  font-mono text-gray-600 col-span-2 text-center">
                    {fixture.started
                      ? `${fixture.team_h_score} - ${fixture.team_a_score}`
                      : new Date(fixture.kickoff_time).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </div>

                  <div tw="flex items-center justify-center">
                  <img 
                    src={teamInfo[fixture.team_a].logo} 
                    alt={`${teamInfo[fixture.team_a].abbreviation} logo`} 
                    tw="w-4 h-4 mr-1 rounded-full"
                  />
                  <div tw="flex text-sm antialiased font-bold text-red-700 col-span-1">

                  {teamInfo[fixture.team_a].abbreviation}
                  </div>
                  
                </div>

                  </div>
                 
                  
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    buttons: [
      <Button 
        action="post" 
        target={{ query: { event: (Number(event) + 1).toString() } }}
      >
        Next Game Week
      </Button>,
      <Button 
        action="post" 
        target={{ query: { event: (Number(event) - 1).toString() } }}
      >
        Previous Game Week
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
