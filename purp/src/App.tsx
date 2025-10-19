import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { sdk } from "@farcaster/miniapp-sdk";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  status: string;
  startDate: string;
  homeScore?: number;
  awayScore?: number;
  competitionName: string;
  description: string;
  awayWinner?: boolean;
  homeWinner?: boolean;
}

// Store picks/notes data (you can replace this with an API call or database)
const picksData: Record<string, Array<{ picker: string; pick: string }>> = {
  "401772757": [
    { picker: "Gilb", pick: "Cam Skattebo +54.5 Rushing Yards" },
    { picker: "Gilb", pick: "Giants ML" },
    { picker: "Tay", pick: "Giants -7.5" },
  ],
  "401772864": [
    { picker: "Gilb", pick: "Luke McCaffrey +37.5 Rushing And Receiving" },
    { picker: "Phil", pick: "Commanders ML" },
    { picker: "Tay", pick: "Chris Moore +0.5 Touchdowns" },
    { picker: "Tay", pick: "Dak Prescott +1.5 Passing TDs" },
  ],
  "401772861": [
    { picker: "Gilb", pick: "Saints ML" },
    { picker: "Phil", pick: "Bears ML" },
  ],
  "401772754": [
    { picker: "Gilb", pick: "Dolphins ML" },
    { picker: "Phil", pick: "Browns ML" },
    { picker: "Tay", pick: "De'Von Achane +0.5 Touchdowns" },
    { picker: "Tay", pick: "Tua Tagovailoa +30.5 Passing Attempts" },
  ],
  "401772756": [
    { picker: "Gilb", pick: "Colts ML" },
    { picker: "Phil", pick: "Colts ML" },
    { picker: "Tay", pick: "Alec Pierce +0.5 Touchdowns" },
    { picker: "Tay", pick: "Justin Herbert +1.5 Passing TDs" },
  ],
  "401772753": [{ picker: "Phil", pick: "Chiefs ML" }],
  "401772860": [
    { picker: "Phil", pick: "Panthers ML" },
    { picker: "Tay", pick: "Mason Taylor +0.5 Touchdowns" },
  ],
  "401772863": [
    { picker: "Phil", pick: "Packers ML" },
    { picker: "Tay", pick: "Romeo Doubs +0.5 Touchdowns" },
  ],
  "401772924": [
    { picker: "Phil", pick: "49ers ML" },
    { picker: "Tay", pick: "Falcons -2.5" },
    { picker: "Tay", pick: "George Kittle +0.5 Touchdowns" },
    { picker: "Tay", pick: "Zonovan Knight +0.5 Touchdowns" },
  ],
  "401772755": [{ picker: "Phil", pick: "Patriots ML" }],
  "401772826": [{ picker: "Tay", pick: "Jaxon Smith-Njigba +0.5 Touchdowns" }],
  "401772816": [{ picker: "Tay", pick: "Jared Goff +1.5 Passing TDs" }],
  "401772635": [{ picker: "Tay", pick: "Total over 45.5" }],
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(
          "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
        );
        const data = await res.json();
        const formattedGames: Game[] = (data.events || [])
          .map((event: any) => {
            try {
              const competition = event.competitions?.[0];
              if (!competition) return null;
              const homeTeam = competition.competitors?.[0];
              const awayTeam = competition.competitors?.[1];
              console.log("Home Team:", homeTeam);
              if (!homeTeam || !awayTeam) return null;
              return {
                id: event.id,
                homeTeam: homeTeam.team?.name || "Home",
                awayTeam: awayTeam.team?.name || "Away",
                homeTeamLogo: homeTeam.team?.logo || "",
                awayTeamLogo: awayTeam.team?.logo || "",
                status: competition.status?.type?.detail || "Scheduled",
                startDate: event.date || new Date().toISOString(),
                homeScore: homeTeam.score,
                awayScore: awayTeam.score,
                competitionName: event.name || "NFL Game",
                description: competition.status?.type?.shortDetail || "",
                awayWinner:
                  competition.status?.type?.detail === "Final" &&
                  awayTeam.winner,
                homeWinner:
                  competition.status?.type?.detail === "Final" &&
                  homeTeam.winner,
              };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean) as Game[];

        const allowedIds = [
          "401772635",
          "401772861",
          "401772757",
          "401772864", // Commanders Game
          "401772754",
          "401772756", // Colts Game
          "401772753", // Chiefs Game
          "401772860", // Panthers Game
          "401772863", // Packers Game
          "401772924", // 49ers Game
          "401772755", // Patriots Game
          "401772826", // Texans Game
          "401772816", // Bucs Game
        ];

        let gamesToDisplay: Game[] = [];

        if (allowedIds && allowedIds.length > 0) {
          // Filter games by allowed IDs
          const filteredGames = formattedGames.filter((game) =>
            allowedIds.includes(game.id)
          );

          // For allowed IDs not in the scoreboard, fetch individual game data
          const missingIds = allowedIds.filter(
            (id) => !filteredGames.some((game) => game.id === id)
          );

          if (missingIds.length > 0) {
            const fetchedGames = await Promise.all(
              missingIds.map(async (id) => {
                try {
                  const summaryRes = await fetch(
                    `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${id}`
                  );
                  const summaryData = await summaryRes.json();
                  const header = summaryData.header;

                  if (!header) return null;

                  const competition = header.competitions?.[0];
                  if (!competition) return null;
                  const homeTeam = competition.competitors?.[0];
                  const awayTeam = competition.competitors?.[1];

                  if (!homeTeam || !awayTeam) return null;

                  return {
                    id: header.id,
                    homeTeam: homeTeam.team?.name || "Home",
                    awayTeam: awayTeam.team?.name || "Away",
                    homeTeamLogo: homeTeam.team?.logos?.[0]?.href || "",
                    awayTeamLogo: awayTeam.team?.logos?.[0]?.href || "",
                    status: competition.status?.type?.detail || "Scheduled",
                    startDate: competition.date || new Date().toISOString(),
                    homeScore: homeTeam.score,
                    awayScore: awayTeam.score,
                    competitionName: `${homeTeam.team?.name} vs ${awayTeam.team?.name}`,
                    description: competition.status?.type?.shortDetail || "",
                    awayWinner:
                      competition.status?.type?.detail === "Final" &&
                      awayTeam.winner,
                    homeWinner:
                      competition.status?.type?.detail === "Final" &&
                      homeTeam.winner,
                  };
                } catch (e) {
                  console.error(`Failed to fetch game ${id}:`, e);
                  return null;
                }
              })
            );

            gamesToDisplay = [
              ...filteredGames,
              ...fetchedGames.filter(Boolean),
            ] as Game[];
          } else {
            gamesToDisplay = filteredGames;
          }
        } else {
          // No allowed IDs, display all games
          gamesToDisplay = formattedGames;
        }

        setGames(gamesToDisplay);
      } catch (err: any) {
        setError(err.message || "Failed to load games");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);
  return (
    <div className="min-h-screen dark:bg-background text-foreground p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-amber-900 dark:text-amber-100">
        🏈 Gilbs Picks 💸
      </h1>

      {loading && (
        <p className="text-center text-muted-foreground">Loading games...</p>
      )}
      {error && <p className="text-center text-destructive">Error: {error}</p>}
      {!loading && !error && games.length === 0 && (
        <p className="text-center text-muted-foreground">No games available.</p>
      )}

      <ScrollArea className="h-auto">
        <div className="grid gap-4 sm:max-w-3xl mx-auto">
          {games.map((game) => (
            <Card
              key={game.id}
              className="shadow-md hover:shadow-lg transition-shadow bg-foreground/10 border-amber-600"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    {game.competitionName}
                  </CardTitle>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-background text-amber-900 dark:text-amber-100">
                    {game.description}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <div className="flex w-full justify-around gap-4">
                  {/* Away Team */}
                  <div className="flex flex-col items-center justify-center w-1/2 p-4 bg-amber-50 dark:bg-background rounded-lg">
                    <img
                      src={game.awayTeamLogo}
                      alt={game.awayTeam}
                      className="w-12 h-12 mb-2 object-contain"
                    />
                    <div className="font-bold text-lg text-center">
                      {game.awayTeam} {game.awayWinner ? "🏆" : ""}
                    </div>
                    <div className="text-2xl font-bold text-white dark:text-white mt-1">
                      {game.awayScore ?? "-"}
                    </div>
                  </div>

                  {/* Home Team */}
                  <div className="flex flex-col items-center justify-center w-1/2 p-4 bg-amber-50 dark:bg-background rounded-lg">
                    <img
                      src={game.homeTeamLogo}
                      alt={game.homeTeam}
                      className="w-12 h-12 mb-2 object-contain"
                    />
                    <div className="font-bold text-lg text-center">
                      {game.homeTeam} {game.homeWinner ? "🏆" : ""}
                    </div>
                    <div className="text-2xl font-bold text-white dark:text-white mt-1">
                      {game.homeScore ?? ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-600">
                  <p className="text-xl font-semibold text-muted-foreground mb-2">
                    PICKS
                  </p>
                  {(() => {
                    const grouped = (picksData[game.id] || []).reduce(
                      (acc: Record<string, string[]>, pick) => {
                        if (!acc[pick.pick]) acc[pick.pick] = [];
                        acc[pick.pick].push(pick.picker);
                        return acc;
                      },
                      {}
                    );

                    return Object.entries(grouped).map(
                      ([pickName, pickers]) => (
                        <div key={pickName} className="text-md text-white mb-1">
                          <span className="font-semibold">{pickName}</span> pick
                          by{" "}
                          <span className="font-semibold">
                            {pickers.join(", ")}
                          </span>{" "}
                        </div>
                      )
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// After your app is fully loaded and ready to display
// await sdk.actions.ready();
