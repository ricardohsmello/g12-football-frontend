
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
  availableRounds = Array.from({ length: 26 }, (_, i) => i + 13);
  scoreboard: ScoreboardEntry[] = [];

  constructor(
    private fb: FormBuilder,
    private scoreboardService: ScoreBoardService
  ) {}

  ngOnInit(): void {
    this.roundFormGroup = this.fb.group({
      roundCtrl: [0]
    });

    this.loadScoreboard(this.roundFormGroup.value.roundCtrl);
  }

  onRoundChange(): void {
    this.isLoading = true;
    this.selectedRound = this.roundFormGroup.value.roundCtrl;
    const round = this.roundFormGroup.value.roundCtrl;
    this.loadScoreboard(round);
  }

  loadScoreboard(round: number): void {
    this.scoreboardService.getByRound(round).subscribe(data => {
      this.scoreboard = data;
      this.isLoading = false;
    });
  }
}
