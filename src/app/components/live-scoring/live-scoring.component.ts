import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { LiveScoringService } from '../../services/live-scoring-service/live-scoring.service';
import { RoundService } from '../../services/round-service/round.service';
import { LiveMatch } from '../../domain/model/live-scoring/live-scoring.model';
import { flagUrl } from '../../domain/model/match/flag-map';

const COMPETITION_ID = 'world-cup-2026';
const POLL_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-live-scoring',
  templateUrl: './live-scoring.component.html',
  styleUrls: ['./live-scoring.component.scss']
})
export class LiveScoringComponent implements OnInit, OnDestroy {
  matches: LiveMatch[] = [];
  isLoading = true;
  lastUpdated: Date | null = null;
  editingMatchId: string | null = null;
  editScore = { homeTeam: 0, awayTeam: 0 };
  saving = false;
  flagUrl = flagUrl;

  private pollSub?: Subscription;

  constructor(
    private liveScoringService: LiveScoringService,
    private roundService: RoundService
  ) {}

  ngOnInit(): void {
    this.roundService.getCurrentRound(COMPETITION_ID).subscribe({
      next: (round) => this.startPolling(round),
      error: () => this.startPolling(1)
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  sortedBets(match: LiveMatch) {
    return [...match.bets].sort((a, b) => b.projectedPoints - a.projectedPoints);
  }

  openEdit(match: LiveMatch): void {
    this.editingMatchId = match.matchId;
    this.editScore = { homeTeam: match.liveScore.homeTeam, awayTeam: match.liveScore.awayTeam };
  }

  cancelEdit(): void {
    this.editingMatchId = null;
  }

  saveScore(matchId: string): void {
    this.saving = true;
    this.liveScoringService.updateScore(matchId, this.editScore.homeTeam, this.editScore.awayTeam).subscribe({
      next: () => {
        this.saving = false;
        this.editingMatchId = null;
        this.restartPolling();
      },
      error: () => { this.saving = false; }
    });
  }

  private startPolling(round: number): void {
    this.pollSub = interval(POLL_INTERVAL_MS).pipe(
      startWith(0),
      switchMap(() => this.liveScoringService.getLiveScoring(round, COMPETITION_ID))
    ).subscribe({
      next: (data) => {
        this.matches = data;
        this.isLoading = false;
        this.lastUpdated = new Date();
      },
      error: () => { this.isLoading = false; }
    });
  }

  private restartPolling(): void {
    const round = this.matches[0] ? undefined : null;
    this.pollSub?.unsubscribe();
    this.roundService.getCurrentRound(COMPETITION_ID).subscribe({
      next: (r) => this.startPolling(r),
      error: () => this.startPolling(1)
    });
  }
}
