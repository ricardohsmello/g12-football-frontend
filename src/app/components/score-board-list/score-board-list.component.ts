
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ScoreboardEntry, ScoreBoardService } from '../../services/score-board-service/score-board.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Competition, COMPETITIONS, DEFAULT_COMPETITION, WORLD_CUP_ROUND_LABELS } from '../../domain/model/competition/competition';
import { flagUrl } from '../../domain/model/match/flag-map';

// Rodada "Pontuação Extra" da Copa (WORLD_CUP_ROUND_LABELS[10])
const EXTRA_POINTS_ROUND = 10;
// Rodada 0 = Total Geral (soma de todas as rodadas)
const OVERALL_ROUND = 0;
// Competicoes que exibem o podium (Top 3) no Total Geral
const PODIUM_COMPETITIONS = ['world-cup-2026', 'brasileirao'];

@Component({
  selector: 'app-score-board-list',
  templateUrl: './score-board-list.component.html',
  styleUrls: ['./score-board-list.component.scss']
})
export class ScoreBoardListComponent implements OnInit {

  roundFormGroup!: FormGroup;
  isLoading = true;
  selectedRound = 0;
  competitions = COMPETITIONS;
  scoreboard: ScoreboardEntry[] = [];
  flagUrl = flagUrl;

  get selectedCompetition(): Competition {
    return this.roundFormGroup.get('competitionCtrl')?.value ?? DEFAULT_COMPETITION;
  }

  get isOverall(): boolean {
    return this.selectedRound === OVERALL_ROUND;
  }

  // Podium (Top 3) aparece no Total Geral das competicoes configuradas
  get showPodium(): boolean {
    return this.isOverall
      && PODIUM_COMPETITIONS.includes(this.selectedCompetition.competitionId)
      && this.scoreboard.length > 0;
  }

  get podium(): ScoreboardEntry[] {
    return this.scoreboard.slice(0, 3);
  }

  initials(name: string): string {
    return (name ?? '').trim().slice(0, 2).toUpperCase();
  }

  get showPredictions(): boolean {
    return this.selectedCompetition.competitionId === 'world-cup-2026'
      && (this.isOverall || this.selectedRound === EXTRA_POINTS_ROUND)
      && this.scoreboard.some(entry => (entry.prediction?.length ?? 0) > 0);
  }

  // Coluna de pontos do Top 4 aparece so no Total Geral (na Pontuacao Extra o proprio "Pontos" ja e esse valor)
  get showExtraPoints(): boolean {
    return this.showPredictions && this.isOverall;
  }

  get availableRounds(): number[] {
    return this.selectedCompetition.rounds;
  }

  constructor(
    private fb: FormBuilder,
    private scoreboardService: ScoreBoardService
  ) {}

  ngOnInit(): void {
    this.roundFormGroup = this.fb.group({
      roundCtrl: [0],
      competitionCtrl: [DEFAULT_COMPETITION]
    });

    this.loadScoreboard(0, DEFAULT_COMPETITION);
  }

  onRoundChange(): void {
    this.isLoading = true;
    this.selectedRound = this.roundFormGroup.value.roundCtrl;
    this.loadScoreboard(this.roundFormGroup.value.roundCtrl, this.selectedCompetition);
  }

  onCompetitionChange(): void {
    this.isLoading = true;
    this.selectedRound = 0;
    this.roundFormGroup.get('roundCtrl')?.setValue(0, { emitEvent: false });
    this.loadScoreboard(0, this.selectedCompetition);
  }

  compareCompetition(a: Competition, b: Competition): boolean {
    return a?.competitionId === b?.competitionId && a?.year === b?.year;
  }

  roundLabel(round: number): string {
    if (this.selectedCompetition.competitionId === 'world-cup-2026') {
      return WORLD_CUP_ROUND_LABELS[round] ?? `Rodada ${round}`;
    }
    return `${round}`;
  }

  loadScoreboard(round: number, competition: Competition): void {
    const isOverallWorldCup = round === OVERALL_ROUND && competition.competitionId === 'world-cup-2026';

    // No Total Geral da Copa, o palpite e os pontos do Top 4 vivem no doc round=10.
    // Buscamos os dois e casamos por jogador, sem depender de mudanca no backend.
    if (isOverallWorldCup) {
      forkJoin({
        totals: this.scoreboardService.getByRound(OVERALL_ROUND, competition.year, competition.competitionId),
        extra: this.scoreboardService.getByRound(EXTRA_POINTS_ROUND, competition.year, competition.competitionId)
      }).subscribe({
        next: ({ totals, extra }) => {
          const extraByUser = new Map(extra.map(e => [e.username, e]));
          this.scoreboard = totals.map(t => {
            const ex = extraByUser.get(t.username);
            return { ...t, prediction: ex?.prediction ?? t.prediction, extraPoints: ex?.points ?? 0 };
          });
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
      return;
    }

    this.scoreboardService.getByRound(round, competition.year, competition.competitionId).subscribe({
      next: (data) => {
        this.scoreboard = data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}
