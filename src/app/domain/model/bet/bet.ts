import { Score } from "../score/score";

export class Bet {
    competitionId: string;
    matchId: string;
    username: string;
    prediction: Score;
    round: number;
}
