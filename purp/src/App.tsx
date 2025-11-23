import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sdk } from "@farcaster/miniapp-sdk";

interface Game {
  id: string;
  homeTeam: string;
  homeAbbr: string;
  awayTeam: string;
  awayAbbr: string;
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
  sport: string;
  league: string;
}

interface GameDataItem {
  sport: string;
  league: string;
}

// Configure your games data here
// Format: { "gameId": { sport, league } }
const gamesData: Record<string, GameDataItem> = {
  "740714": {
    sport: "soccer",
    league: "eng.1",
  },
  "736894": {
    sport: "soccer",
    league: "ita.1",
  },
  "760862": {
    sport: "soccer",
    league: "usa.1",
  },
  "760834": {
    sport: "soccer",
    league: "usa.1",
  },
  "401772780": {
    sport: "football",
    league: "nfl",
  },
  "401772781": {
    sport: "football",
    league: "nfl",
  },
  "401772782": {
    sport: "football",
    league: "nfl",
  },
  "401772888": {
    sport: "football",
    league: "nfl",
  },
  "401772887": {
    sport: "football",
    league: "nfl",
  },
  "401772886": {
    sport: "football",
    league: "nfl",
  },
  "401772779": {
    sport: "football",
    league: "nfl",
  },
  "401772784": {
    sport: "football",
    league: "nfl",
  },
  "401772783": {
    sport: "football",
    league: "nfl",
  },
  "401772890": {
    sport: "football",
    league: "nfl",
  },
  "401772889": {
    sport: "football",
    league: "nfl",
  },
  "401772929": {
    sport: "football",
    league: "nfl",
  },
  "401772820": {
    sport: "football",
    league: "nfl",
  },
};
export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const fetchedGames = await Promise.all(
          Object.entries(gamesData).map(async ([id, data]) => {
            try {
              const url = `https://site.api.espn.com/apis/site/v2/sports/${data.sport}/${data.league}/summary?event=${id}`;
              const res = await fetch(url);
              const gameData = await res.json();

              const header = gameData.header;
              if (!header) return null;

              const competition = header.competitions?.[0];
              if (!competition) return null;

              const homeTeam = competition.competitors?.find(
                (c: any) => c.homeAway === "home"
              );
              const awayTeam = competition.competitors?.find(
                (c: any) => c.homeAway === "away"
              );

              const homeAbbr =
                homeTeam?.team?.abbreviation ||
                homeTeam?.team?.shortName ||
                "HOME";
              const awayAbbr =
                awayTeam?.team?.abbreviation ||
                awayTeam?.team?.shortName ||
                "AWAY";

              if (!homeTeam || !awayTeam) return null;

              return {
                id: header.id,
                homeTeam:
                  homeTeam.team?.displayName || homeTeam.team?.name || "Home",
                awayTeam:
                  awayTeam.team?.displayName || awayTeam.team?.name || "Away",
                homeTeamLogo:
                  homeTeam.team?.logo || homeTeam.team?.logos?.[0]?.href || "",
                awayTeamLogo:
                  awayTeam.team?.logo || awayTeam.team?.logos?.[0]?.href || "",
                status: competition.status?.type?.detail || "Scheduled",
                startDate:
                  competition.date || header.date || new Date().toISOString(),
                homeScore: parseInt(homeTeam.score) || 0,
                awayScore: parseInt(awayTeam.score) || 0,
                competitionName: header.competitions?.[0]?.competitors?.[0]
                  ?.team?.displayName
                  ? `${awayAbbr} at ${homeAbbr}`
                  : header.league?.name || "Game",
                description:
                  competition.status?.type?.shortDetail ||
                  competition.status?.type?.name ||
                  "",
                awayWinner:
                  competition.status?.type?.completed && awayTeam.winner,
                homeWinner:
                  competition.status?.type?.completed && homeTeam.winner,
                sport: data.sport,
                league: data.league,
              };
            } catch (e) {
              console.error(`Failed to fetch game ${id}:`, e);
              return null;
            }
          })
        );

        const validGames = fetchedGames.filter(Boolean) as Game[];

        // Sort games: Live first, then upcoming, then completed
        const sortedGames = validGames.sort((a, b) => {
          const getStatusPriority = (game: Game) => {
            const status = game.status.toLowerCase();
            // Live games (in progress)
            if (
              status.includes("quarter") ||
              status.includes("half") ||
              status.includes("period") ||
              status.includes("inning") ||
              status.includes("live") ||
              status.includes("progress")
            ) {
              return 1;
            }
            // Completed games
            if (status.includes("final") || status.includes("completed")) {
              return 3;
            }
            // Upcoming games (scheduled)
            return 2;
          };

          const priorityA = getStatusPriority(a);
          const priorityB = getStatusPriority(b);

          // If different priorities, sort by priority
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // If same priority, sort by start date
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        });

        setGames(sortedGames);
      } catch (err: any) {
        setError(err.message || "Failed to load games");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      football: "🏈",
      basketball: "🏀",
      soccer: "⚽",
      baseball: "⚾",
      hockey: "🏒",
    };
    return icons[sport] || "🎮";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Bracky Live Games
        </h1>
        <p className="text-center text-slate-400 mb-6">
          Track picks across all sports
        </p>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-slate-400 mt-2">Loading games...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="text-center text-slate-400 bg-slate-800/50 rounded-lg p-8">
            <p className="text-lg">No games available.</p>
            <p className="text-sm mt-2">
              Add games to gamesData to see matchups here.
            </p>
          </div>
        )}

        <ScrollArea className="h-auto">
          <div className="grid gap-4">
            {games.map((game) => (
              <Card
                key={game.id}
                className="shadow-xl bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all"
              >
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                      <span>{getSportIcon(game.sport)}</span>
                      {game.competitionName}
                    </CardTitle>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {game.description}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <div className="flex w-full justify-around gap-4">
                    {/* Away Team */}
                    <div className="flex flex-col items-center justify-center w-1/2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <img
                        src={game.awayTeamLogo}
                        alt={game.awayTeam}
                        className="w-16 h-16 mb-2 object-contain"
                      />
                      <div className="font-bold text-base text-center text-white">
                        {game.awayTeam} {game.awayWinner ? "🏆" : ""}
                      </div>
                      <div className="text-3xl font-bold text-amber-400 mt-2">
                        {game.awayScore ?? "-"}
                      </div>
                    </div>

                    {/* Home Team */}
                    <div className="flex flex-col items-center justify-center w-1/2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <img
                        src={game.homeTeamLogo}
                        alt={game.homeTeam}
                        className="w-16 h-16 mb-2 object-contain"
                      />
                      <div className="font-bold text-base text-center text-white">
                        {game.homeTeam} {game.homeWinner ? "🏆" : ""}
                      </div>
                      <div className="text-3xl font-bold text-amber-400 mt-2">
                        {game.homeScore ?? "-"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// After your app is fully loaded and ready to display
await sdk.actions.ready();
