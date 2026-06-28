export interface LiveBet {
  username: string;
  prediction: { homeTeam: number; awayTeam: number };
  projectedPoints: number;
}

export interface LiveMatch {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  liveScore: { homeTeam: number; awayTeam: number };
  updatedAt: string;
  bets: LiveBet[];
}
