import type { FutsalSessionDetails, FutsalTeamStanding } from '@/types';

export function calculateSessionStandings(session: FutsalSessionDetails): FutsalTeamStanding[] {
  const standings = new Map<string, FutsalTeamStanding>();

  for (const team of session.teams) {
    standings.set(team.id, {
      team_id: team.id,
      team_name: team.name,
      color: team.color,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
  }

  for (const game of session.games) {
    const home = standings.get(game.home_team_id);
    const away = standings.get(game.away_team_id);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goals_for += game.home_score;
    home.goals_against += game.away_score;
    away.goals_for += game.away_score;
    away.goals_against += game.home_score;

    if (game.home_score > game.away_score) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (game.away_score > game.home_score) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(standings.values())
    .map((standing) => ({
      ...standing,
      goal_difference: standing.goals_for - standing.goals_against,
    }))
    .sort((left, right) =>
      right.points - left.points ||
      right.goal_difference - left.goal_difference ||
      right.goals_for - left.goals_for ||
      left.team_name.localeCompare(right.team_name, 'pt-BR')
    );
}
