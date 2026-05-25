import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Match } from '../../../domain/model/match/match';
import { MatchService } from '../../../services/match-service/match.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Competition,
  COMPETITIONS,
  DEFAULT_COMPETITION,
  BRASILEIRAO_TEAMS,
  WORLD_CUP_2026_TEAMS,
  WORLD_CUP_2026_GROUPS
} from '../../../domain/model/competition/competition';

function differentTeamsValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const home = group.get('homeTeamCtrl')?.value;
    const away = group.get('awayTeamCtrl')?.value;
    return home && away && home === away ? { sameTeam: true } : null;
  };
}

@Component({
  selector: 'app-match-add',
  templateUrl: './match-add.component.html',
  styleUrls: ['./match-add.component.scss']
})
export class MatchAddComponent implements OnInit {

  competitions = COMPETITIONS.filter(c => !(c.competitionId === 'brasileirao' && c.year === 2025))
    .map(c => ({ ...c, label: c.competitionId === 'brasileirao' ? 'Brasileirão' : c.label }));
  teams: string[] = [];
  stages: string[] = [];
  groups: string[] = [];
  rounds: number[] = [];
  roundLocked = false;

  private readonly STAGE_ROUND: Record<string, number> = {
    SECOND_ROUND:  4,
    ROUND_OF_16:   5,
    QUARTER_FINAL: 6,
    SEMI_FINAL:    7,
    THIRD_PLACE:   8,
    FINAL:         9,
  };

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<MatchAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { competition?: Competition }
  ) {}

  ngOnInit(): void {
    const initial = this.data?.competition ?? DEFAULT_COMPETITION;

    this.form = this.fb.group({
      competitionCtrl: [initial, Validators.required],
      stageCtrl:       [initial.stages[0], Validators.required],
      groupCtrl:       [null],
      roundCtrl:       [null, [Validators.required, Validators.min(1)]],
      homeTeamCtrl:    [null, Validators.required],
      awayTeamCtrl:    [null, Validators.required],
      dateCtrl:        [null, Validators.required],
      timeCtrl:        [null, [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    }, { validators: differentTeamsValidator() });

    this.applyCompetition(initial);

    this.form.get('competitionCtrl')?.valueChanges.subscribe((c: Competition) => {
      this.applyCompetition(c);
      this.form.patchValue({
        stageCtrl:    c.stages[0],
        groupCtrl:    null,
        roundCtrl:    null,
        homeTeamCtrl: null,
        awayTeamCtrl: null,
      }, { emitEvent: false });
      this.updateGroupRequired(c.stages[0]);
    });

    this.form.get('stageCtrl')?.valueChanges.subscribe((stage: string) => {
      this.updateGroupRequired(stage);
      this.updateRoundForStage(stage, this.selectedCompetition);

      if (stage !== 'GROUP') {
        this.form.get('groupCtrl')?.setValue(null, { emitEvent: false });
        this.updateTeams(this.selectedCompetition, null);
      }
    });

    this.form.get('groupCtrl')?.valueChanges.subscribe((group: string | null) => {
      this.updateTeams(this.selectedCompetition, group);
      this.form.patchValue({ homeTeamCtrl: null, awayTeamCtrl: null }, { emitEvent: false });
    });
  }

  private applyCompetition(c: Competition): void {
    this.stages = c.stages;
    this.groups = c.groups;
    this.updateTeams(c, null);
    this.updateRoundForStage(c.stages[0], c);
  }

  private updateRoundForStage(stage: string, c: Competition): void {
    const fixedRound = this.STAGE_ROUND[stage];
    if (c.competitionId === 'world-cup-2026' && fixedRound != null) {
      this.rounds = [fixedRound];
      this.roundLocked = true;
      this.form.get('roundCtrl')?.setValue(fixedRound, { emitEvent: false });
    } else if (stage === 'GROUP') {
      this.rounds = [1, 2, 3];
      this.roundLocked = false;
      this.form.get('roundCtrl')?.setValue(null, { emitEvent: false });
    } else {
      this.rounds = c.rounds;
      this.roundLocked = false;
      this.form.get('roundCtrl')?.setValue(null, { emitEvent: false });
    }
  }

  private updateTeams(c: Competition, group: string | null): void {
    if (c.competitionId === 'world-cup-2026') {
      this.teams = group && WORLD_CUP_2026_GROUPS[group]
        ? WORLD_CUP_2026_GROUPS[group]
        : WORLD_CUP_2026_TEAMS;
    } else {
      this.teams = BRASILEIRAO_TEAMS;
    }
  }

  private updateGroupRequired(stage: string): void {
    const groupCtrl = this.form.get('groupCtrl');
    if (stage === 'GROUP') {
      groupCtrl?.setValidators(Validators.required);
    } else {
      groupCtrl?.clearValidators();
    }
    groupCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  get selectedStage(): string {
    return this.form.get('stageCtrl')?.value;
  }

  get selectedCompetition(): Competition {
    return this.form.get('competitionCtrl')?.value ?? DEFAULT_COMPETITION;
  }

  compareCompetition(a: Competition, b: Competition): boolean {
    return a?.competitionId === b?.competitionId && a?.year === b?.year;
  }

  stageLabel(stage: string): string {
    const labels: Record<string, string> = {
      LEAGUE:        'Liga',
      GROUP:         'Fase de Grupos',
      SECOND_ROUND:  'Segunda Fase',
      ROUND_OF_16:   'Oitavas de Final',
      QUARTER_FINAL: 'Quartas de Final',
      SEMI_FINAL:    'Semifinal',
      THIRD_PLACE:   'Terceiro Lugar',
      FINAL:         'Final',
    };
    return labels[stage] ?? stage;
  }

  public save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const rawDate: Date = v.dateCtrl instanceof Date ? v.dateCtrl : new Date(v.dateCtrl);
    const [hours, minutes] = (v.timeCtrl as string).split(':').map(Number);
    const date = new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate(), hours, minutes, 0, 0);

    const match = new Match();
    match.competitionId = (v.competitionCtrl as Competition).competitionId;
    match.stage         = v.stageCtrl;
    match.group         = v.stageCtrl === 'GROUP' ? v.groupCtrl : null;
    match.round         = Number(v.roundCtrl);
    match.homeTeam      = v.homeTeamCtrl;
    match.awayTeam      = v.awayTeamCtrl;
    match.matchDate     = date;
    match.status        = 'OPEN';

    this.matchService.save(match).subscribe({
      next: () => {
        this.snackBar.open('Jogo cadastrado com sucesso!', '', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        const msg = error?.error?.message ?? 'Erro inesperado ao salvar o jogo.';
        this.snackBar.open(msg, '', { duration: 4000 });
      }
    });
  }
}
