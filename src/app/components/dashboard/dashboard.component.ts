import { Component, OnInit, OnDestroy } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Router } from '@angular/router';
import { RoundService } from '../../services/round-service/round.service';
import { BetService } from '../../services/bet-service/bet.service';
import { RagService } from '../../services/rag-service/rag.service';
import { FormControl, Validators } from '@angular/forms';
import { RagAnswer } from '../../domain/model/rag/rag';
import {
  BRASILEIRAO_2026,
  COMPETITIONS,
  DEFAULT_COMPETITION,
  WORLD_CUP_ROUND_LABELS
} from '../../domain/model/competition/competition';
import { LiveScoringService } from '../../services/live-scoring-service/live-scoring.service';
import { LiveMatch } from '../../domain/model/live-scoring/live-scoring.model';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { flagUrl } from '../../domain/model/match/flag-map';

const WC = COMPETITIONS.find(c => c.competitionId === 'world-cup-2026')!;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalPlayers = 18;

  // Brasileirao
  brRound: number = 0;
  brBettors = 0;
  brMissing = 0;
  brLoading = true;
  brError: string | null = null;

  // Copa do Mundo
  wcRound: number = 0;
  wcBettors = 0;
  wcMissing = 0;
  wcLoading = true;
  wcError: string | null = null;

  public profile: KeycloakProfile | null = null;

  questionCtrl = new FormControl('', [Validators.required, Validators.minLength(2)]);
  lastAnswer: RagAnswer | null = null;

  // Live scoring
  liveMatches: LiveMatch[] = [];
  liveLoading = true;
  liveLastUpdated: Date | null = null;
  editingMatchId: string | null = null;
  editScore = { homeTeam: 0, awayTeam: 0 };
  saving = false;
  private livePollSub?: Subscription;

  constructor(
    private readonly keycloak: KeycloakService,
    private roundService: RoundService,
    private betService: BetService,
    private ragService: RagService,
    private liveScoringService: LiveScoringService,
    private router: Router
  ) {}

  goToMatches(competitionId: string): void {
    this.router.navigate(['/match'], { queryParams: { competition: competitionId } });
  }

  async ngOnInit() {
    const isLogged = await this.keycloak.isLoggedIn();
    if (isLogged) {
      this.profile = await this.keycloak.loadUserProfile();
    }

    this.loadBrasileiraoData();
    this.loadWorldCupData();
    this.startLivePolling();
  }

  ngOnDestroy(): void {
    this.livePollSub?.unsubscribe();
  }

  private loadBrasileiraoData(): void {
    const { competitionId } = BRASILEIRAO_2026;
    this.roundService.getCurrentRound(competitionId).subscribe({
      next: (round) => {
        this.brRound = round;
        this.betService.countBettorsByRound(round, competitionId).subscribe({
          next: (count) => {
            this.brBettors = count;
            this.brMissing = this.totalPlayers - count;
            this.brLoading = false;
          },
          error: () => { this.brLoading = false; }
        });
      },
      error: (err) => {
        this.brError = err?.error?.message ?? 'Erro ao carregar Brasileirao.';
        this.brLoading = false;
      }
    });
  }

  private loadWorldCupData(): void {
    this.roundService.getCurrentRound(WC.competitionId).subscribe({
      next: (round) => {
        this.wcRound = round;
        this.betService.countBettorsByRound(round, WC.competitionId).subscribe({
          next: (count) => {
            this.wcBettors = count;
            this.wcMissing = this.totalPlayers - count;
            this.wcLoading = false;
          },
          error: () => { this.wcLoading = false; }
        });
      },
      error: (err) => {
        this.wcError = err?.error?.message ?? 'Erro ao carregar Copa do Mundo.';
        this.wcLoading = false;
      }
    });
  }

  get wcStageLabel(): string {
    return WORLD_CUP_ROUND_LABELS[this.wcRound] ?? `Rodada ${this.wcRound}`;
  }

  flagUrl = flagUrl;

  goToLive(): void {
    this.router.navigate(['/live-scoring']);
  }

  topBet(match: LiveMatch) {
    return [...match.bets].sort((a, b) => b.projectedPoints - a.projectedPoints)[0] ?? null;
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
        this.restartLivePolling(); // rebusca imediatamente do backend
      },
      error: () => { this.saving = false; }
    });
  }

  private restartLivePolling(): void {
    this.livePollSub?.unsubscribe();
    this.startLivePolling();
  }

  private startLivePolling(): void {
    const wc = COMPETITIONS.find(c => c.competitionId === 'world-cup-2026')!;
    this.livePollSub = interval(1_000).pipe(
      startWith(0),
      switchMap(() => this.liveScoringService.getLiveScoring(this.wcRound || 1, wc.competitionId))
    ).subscribe({
      next: (data) => {
        this.liveMatches = data;
        this.liveLoading = false;
        this.liveLastUpdated = new Date();
      },
      error: () => { this.liveLoading = false; }
    });
  }
}
