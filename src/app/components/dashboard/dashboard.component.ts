import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Router } from '@angular/router';
import { RoundService } from '../../services/round-service/round.service';
import { BetService } from '../../services/bet-service/bet.service';
import { RagService } from '../../services/rag-service/rag.service';
import { FormControl, Validators } from '@angular/forms';
import { RagAnswer } from '../../domain/model/rag/rag';
import { COMPETITIONS, DEFAULT_COMPETITION, WORLD_CUP_ROUND_LABELS } from '../../domain/model/competition/competition';

const WC = COMPETITIONS.find(c => c.competitionId === 'world-cup-2026')!;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

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

  constructor(
    private readonly keycloak: KeycloakService,
    private roundService: RoundService,
    private betService: BetService,
    private ragService: RagService,
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
  }

  private loadBrasileiraoData(): void {
    const { competitionId } = DEFAULT_COMPETITION;
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
}
