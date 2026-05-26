
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { MatDialog } from '@angular/material/dialog';
import { MatchService } from '../../../../services/match-service/match.service';
import { MatchAddComponent } from '../../add/match-add.component';
import { MatchResponse } from '../../../../domain/model/match/match-response';
import { FormBuilder, Validators } from '@angular/forms';
import { MatchScoreEditComponent } from '../../score-edit/match-score-edit/match-score-edit.component';
import { MatchBetEditComponent } from '../../bet-edit/match-bet-edit/match-bet-edit.component';
import { BetService } from '../../../../services/bet-service/bet.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../dialog/confirm-dialog.component';
import { RoundService } from "../../../../services/round-service/round.service";
import { Competition, COMPETITIONS, DEFAULT_COMPETITION, WORLD_CUP_ROUND_LABELS } from '../../../../domain/model/competition/competition';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {

  roundFormGroup = this._formBuilder.group({
    roundCtrl: this._formBuilder.control(1, Validators.required),
    competitionCtrl: this._formBuilder.control(DEFAULT_COMPETITION, Validators.required),
  });

  userFormGroup = this._formBuilder.group({
    userCtrl: this._formBuilder.control('Selecione o jogador', Validators.required),
  });

  loggedUser: string;
  username: string;
  matchResponse: MatchResponse[];
  currentRound: number = 1;
  public hasAdminRole: boolean = false;
  name?: string;
  sortOrder: 'asc' | 'desc' = 'desc';
  dateSortOrder: 'asc' | 'desc' = 'asc';
  roundSortOrder: 'asc' | 'desc' = 'asc';
  groupSortOrder: 'asc' | 'desc' = 'asc';
  activeSortField: 'date' | 'points' | 'round' | 'group' | null = null;
  isLoading = true;
  competitions = COMPETITIONS;

  users = [
    "antonio", "braulio", "bruno", "cleber", "daniel", "edmilson", "fabio",
    "gabriel", "giovanni", "guilherme", "heraldo", "joaozorzella", "lucas", "luciano", "matheus",
    "murilo", "rafaelcarvalho", "ricardocoutinho", "ricardomello", "weslley", "zitras"
  ];

  get selectedCompetition(): Competition {
    return this.roundFormGroup.get('competitionCtrl')?.value ?? DEFAULT_COMPETITION;
  }

  get rounds(): number[] {
    return this.selectedCompetition.rounds;
  }

  constructor(
    private matchService: MatchService,
    private readonly keycloak: KeycloakService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private betService: BetService,
    private snackBar: MatSnackBar,
    private roundService: RoundService
  ) {
  }

  toggleRoundSortOrder(): void {
    this.activeSortField = 'round';
    this.roundSortOrder = this.roundSortOrder === 'asc' ? 'desc' : 'asc';
    this.matchResponse = [...this.matchResponse].sort((a, b) =>
      this.roundSortOrder === 'asc' ? a.round - b.round : b.round - a.round
    );
  }

  toggleGroupSortOrder(): void {
    this.activeSortField = 'group';
    this.groupSortOrder = this.groupSortOrder === 'asc' ? 'desc' : 'asc';
    this.matchResponse = [...this.matchResponse].sort((a, b) => {
      const ga = a.group ?? '';
      const gb = b.group ?? '';
      return this.groupSortOrder === 'asc' ? ga.localeCompare(gb) : gb.localeCompare(ga);
    });
  }

  toggleDateSortOrder(): void {
    this.activeSortField = 'date';
    this.dateSortOrder = this.dateSortOrder === 'asc' ? 'desc' : 'asc';
    this.matchResponse = [...this.matchResponse].sort((a, b) => {
      const dateA = new Date(a.matchDate).getTime();
      const dateB = new Date(b.matchDate).getTime();
      return this.dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  sortMatchesByDate(): void {
    this.matchResponse = [...this.matchResponse].sort((a, b) => {
      const dateA = new Date(a.matchDate).getTime();
      const dateB = new Date(b.matchDate).getTime();
      return this.dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  toggleSortOrder(): void {
    this.activeSortField = 'points';
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.matchResponse = [...this.matchResponse].sort((a, b) => {
      const aPoints = a.pointsEarned ?? 0;
      const bPoints = b.pointsEarned ?? 0;
      return this.sortOrder === 'asc' ? aPoints - bPoints : bPoints - aPoints;
    });
  }

  sortMatches(): void {
    this.matchResponse = [...this.matchResponse].sort((a, b) => {
      const aPoints = a.pointsEarned ?? 0;
      const bPoints = b.pointsEarned ?? 0;
      return this.sortOrder === 'asc' ? aPoints - bPoints : bPoints - aPoints;
    });
  }

  openEditBetDialog(match: MatchResponse): void {
    const dialogRef = this.dialog.open(MatchBetEditComponent, {
      width: '300px',
      data: { match },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.keycloak.loadUserProfile().then(profile => {
          const payload = {
            competitionId: this.selectedCompetition.competitionId,
            matchId: match.id,
            username: profile.username ?? profile.email ?? 'unknown',
            prediction: {
              homeTeam: result.homeTeam,
              awayTeam: result.awayTeam
            },
            round: match.round
          };

          this.betService.save(payload).subscribe({
            next: () => {
              this.snackBar.open('Palpite informado com sucesso!', '', { duration: 3000 });
              dialogRef.close(true);
              this.findByUsernameRound(this.username, this.currentRound);
            },
            error: (error) => {
              if (error.error && error.error.message) {
                this.snackBar.open(error.error.message, '', { duration: 4000 });
              } else {
                this.snackBar.open('Unexpected error occurred.', '', { duration: 4000 });
              }
            }
          });
        });
      }
    });
  }

  openEditScoreDialog(match: MatchResponse): void {
    const dialogRef = this.dialog.open(MatchScoreEditComponent, {
      width: '300px',
      data: { match },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.matchService.updateScore(match.id, result).subscribe({
          next: () => {
            this.snackBar.open('Match score added successfully!', '', { duration: 3000 });
            dialogRef.close(true);
            this.findByUsernameRound(this.username, this.currentRound);
          },
          error: (error) => {
            if (error.error && error.error.message) {
              this.snackBar.open(error.error.message, '', { duration: 4000 });
            } else {
              this.snackBar.open('Unexpected error occurred.', '', { duration: 4000 });
            }
          }
        });
      }
    });
  }

  async ngOnInit() {
    this.keycloak.loadUserProfile().then(profile => {
      this.loggedUser = profile.username ?? profile.email ?? 'unknown';
      this.username = profile.username ?? profile.email ?? 'unknown';
      this.hasAdminRole = this.keycloak.getUserRoles().includes('admin');

      // @ts-ignore
      this.userFormGroup.get('userCtrl')?.setValue(this.username, { emitEvent: false });

      this.loadCurrentRound(this.selectedCompetition);

      this.roundFormGroup.get('competitionCtrl')?.valueChanges.subscribe((competition: Competition) => {
        this.isLoading = true;
        this.loadCurrentRound(competition);
      });

      this.roundFormGroup.get('roundCtrl')?.valueChanges.subscribe((roundValue) => {
        this.isLoading = true;
        const roundNumber = Number(roundValue);
        this.currentRound = roundNumber;
        if (!isNaN(roundNumber)) {
          this.findByUsernameRound(this.username, roundNumber);
        }
      });

      this.userFormGroup.get('userCtrl')?.valueChanges.subscribe((user) => {
        this.isLoading = true;
        this.findByUsernameRound(user, this.currentRound);
      });
    });
  }

  private loadCurrentRound(competition: Competition): void {
    this.roundService.getCurrentRound(competition.competitionId).subscribe({
      next: (round: number) => {
        this.currentRound = round;
        this.roundFormGroup.get('roundCtrl')?.setValue(round, { emitEvent: false });
        this.findByUsernameRound(this.username, round);
      },
      error: (err) => {
        this.matchResponse = [];
        this.isLoading = false;
        const msg = err?.error?.message ?? 'Erro ao carregar a rodada atual.';
        this.snackBar.open(msg, '', { duration: 4000 });
      }
    });
  }

  compareCompetition(a: Competition, b: Competition): boolean {
    return a?.competitionId === b?.competitionId && a?.year === b?.year;
  }

  get showGroupColumn(): boolean {
    if (this.selectedCompetition.competitionId !== 'world-cup-2026') return false;
    const round = Number(this.roundFormGroup.get('roundCtrl')?.value);
    return round >= 1 && round <= 3;
  }

  roundLabel(round: number): string {
    if (this.selectedCompetition.competitionId === 'world-cup-2026') {
      return WORLD_CUP_ROUND_LABELS[round] ?? `Rodada ${round}`;
    }
    return `${round}`;
  }

  get isCurrentUserSelected(): boolean {
    return this.userFormGroup.get('userCtrl')?.value === this.loggedUser;
  }

  get isWorldCup(): boolean {
    return this.selectedCompetition.competitionId === 'world-cup-2026';
  }

  get isWcGroupRound(): boolean {
    const round = Number(this.roundFormGroup.get('roundCtrl')?.value);
    return this.isWorldCup && round >= 1 && round <= 3;
  }

  get isGroupStage(): boolean {
    if (this.activeSortField !== null) return false;
    return this.isWcGroupRound;
  }

  get groupedMatches(): { group: string; matches: MatchResponse[] }[] {
    if (!this.isGroupStage) return [];
    const map = new Map<string, MatchResponse[]>();
    for (const m of this.matchResponse) {
      const g = m.group ?? '—';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(m);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, matches]) => ({ group, matches }));
  }

  statusLabel(status: string): string {
    return status === 'OPEN' ? 'Aberto' : status === 'CLOSED' ? 'Encerrado' : status;
  }

  settleRound(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        message: `Are you sure you want to settle round ${this.currentRound}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;

        this.matchService.scoreRound(this.currentRound, this.selectedCompetition.competitionId, this.selectedCompetition.year).subscribe({
          next: () => {
            this.snackBar.open('Round processing routine triggered successfully', '', { duration: 3000 });
            this.findByUsernameRound(this.username, this.currentRound);
          },
          error: (error) => {
            this.isLoading = false;
            if (error.error && error.error.message) {
              this.snackBar.open(error.error.message, '', { duration: 4000 });
            } else {
              this.snackBar.open('Unexpected error occurred.', '', { duration: 4000 });
            }
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  public add() {
    const dialogRef = this.dialog.open(MatchAddComponent, {
      data: { competition: this.selectedCompetition },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        this.findByUsernameRound(this.username, this.currentRound);
      }
    });
  }

  private findByUsernameRound(username: string, round: number) {
    const { competitionId, year } = this.selectedCompetition;
    this.matchService.findByUsernameRound(username, round, year, this.loggedUser, competitionId).subscribe({
      next: (data) => {
        this.matchResponse = data;
        this.activeSortField = null;
        this.sortMatches();
        this.isLoading = false;
      },
      error: (err) => {
        this.matchResponse = [];
        this.isLoading = false;
        const msg = err?.error?.message ?? 'Erro ao carregar partidas.';
        this.snackBar.open(msg, '', { duration: 4000 });
      }
    });
  }
}
