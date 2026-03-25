export default function normalizeMatch({ sport, teams, dateTime }) {
  const sorted_teams = [teams.home, teams.away]
    .map((team) =>
      team
        .toLowerCase()
        .replace(/[\s\.\(\)_-]/g, "")
        .trim(),
    )
    .sort();

  const normalizeSport = sport.toLowerCase().trim();
  const normalizeDatetime = new Date(dateTime).toISOString();
  const normalizedKey = `${normalizeSport}-${sorted_teams[0]}-${sorted_teams[1]}-${normalizeDatetime}`;

  return {
    normalizeSport,
    normalizeTeamA: sorted_teams[0],
    normalizeTeamB: sorted_teams[1],
    normalizeDatetime,
    normalizedKey,
  };
}
