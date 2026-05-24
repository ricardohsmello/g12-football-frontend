
import { Component, OnInit } from '@angular/core';
import { ScoreboardEntry, ScoreBoardService } from '../../services/score-board-service/score-board.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-score-board-list',
  templateUrl: './score-board-list.component.html',
  styleUrls: ['./score-board-list.component.scss']
})
export class ScoreBoardListComponent implements OnInit {

roundFormGroup!: FormGroup;
  isLoading = true;
  selectedRound = 0;
  selectedYear = 2026;
  availableRounds = Array.from({ length: 26 }, (_, i) => i + 13);
  availableYears = [2025, 2026];
  scoreboard: ScoreboardEntry[] = [];

  constructor(
    private fb: FormBuilder,
    private scoreboardService: ScoreBoardService
  ) {}

  ngOnInit(): void {
    this.roundFormGroup = this.fb.group({
      roundCtrl: [0],
      yearCtrl: [2026]
    });

    this.loadScoreboard(this.roundFormGroup.value.roundCtrl, this.roundFormGroup.value.yearCtrl);
  }

  onRoundChange(): void {
    this.isLoading = true;
    this.selectedRound = this.roundFormGroup.value.roundCtrl;
    this.loadScoreboard(this.roundFormGroup.value.roundCtrl, this.roundFormGroup.value.yearCtrl);
  }

  onYearChange(): void {
    this.isLoading = true;
    this.selectedYear = this.roundFormGroup.value.yearCtrl;
    this.loadScoreboard(this.roundFormGroup.value.roundCtrl, this.roundFormGroup.value.yearCtrl);
  }

  loadScoreboard(round: number, year: number): void {
    this.scoreboardService.getByRound(round, year).subscribe(data => {
      this.scoreboard = data;
      this.isLoading = false;
    });
  }
}
