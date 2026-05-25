
import { Component, OnInit } from '@angular/core';
import { ScoreboardEntry, ScoreBoardService } from '../../services/score-board-service/score-board.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Competition, COMPETITIONS, DEFAULT_COMPETITION, WORLD_CUP_ROUND_LABELS } from '../../domain/model/competition/competition';

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

  get selectedCompetition(): Competition {
    return this.roundFormGroup.get('competitionCtrl')?.value ?? DEFAULT_COMPETITION;
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
    this.scoreboardService.getByRound(round, competition.year, competition.competitionId).subscribe(data => {
      this.scoreboard = data;
      this.isLoading = false;
    });
  }
}
