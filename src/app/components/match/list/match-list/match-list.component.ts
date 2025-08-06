
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
import {RoundService} from "../../../../services/round-service/round.service";

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']

})
export class MatchListComponent implements OnInit {

  roundFormGroup = this._formBuilder.group({
    roundCtrl: this._formBuilder.control(13, Validators.required),
  });

  userFormGroup = this._formBuilder.group({
    userCtrl: this._formBuilder.control('Selecione o jogador', Validators.required),
  });


  loggedUser: string;
  username: string;
  matchResponse: MatchResponse[];
  rounds: number[];
  currentRound: number = 13;
  public hasAdminRole: boolean = false;
  name?: string;
  sortOrder: 'asc' | 'desc' = 'desc';
  dateSortOrder: 'asc' | 'desc' = 'asc';
  isLoading = true;

  users = [
    "antonio", "braulio", "bruno", "cleber", "daniel", "edmilson", "fabio",
    "gabriel", "giovanni", "guilherme", "heraldo", "joaozorzella", "lucas", "luciano", "matheus",
    "murilo", "rafaelcarvalho", "ricardomello", "weslley", "zitras"
  ];

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

  toggleDateSortOrder() {
    this.dateSortOrder = this.dateSortOrder === 'asc' ? 'desc' : 'asc';
    this.sortMatchesByDate();
  }

  sortMatchesByDate() {
    this.matchResponse.sort((a, b) => {
      const dateA = new Date(a.matchDate).getTime();
      const dateB = new Date(b.matchDate).getTime();
      return this.dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortMatches();
  }

  sortMatches(): void {
    this.matchResponse.sort((a, b) => {
      const aPoints = a.pointsEarned ?? 0;
      const bPoints = b.pointsEarned ?? 0;

      return this.sortOrder === 'asc'
        ? aPoints - bPoints
        : bPoints - aPoints;
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
        })
      }
    });
  }

  async ngOnInit() {


    this.keycloak.loadUserProfile().then(profile => {
      this.loggedUser = profile.username ?? profile.email ?? 'unknown'
      this.username = profile.username ?? profile.email ?? 'unknown'

      this.rounds = Array.from({ length: 26 }, (_, i) => i + 13);

      this.hasAdminRole = this.keycloak.getUserRoles().includes('admin');

      this.roundService.getCurrentRound().subscribe((round: number) => {
        this.currentRound = round;

        // @ts-ignore
        this.userFormGroup.get('userCtrl')?.setValue(this.username, { emitEvent: false });

        this.roundFormGroup.get('roundCtrl')?.setValue(round, { emitEvent: false });
        this.findByUsernameRound(this.username, round);

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

    });
  }

  get isCurrentUserSelected(): boolean {
    return this.userFormGroup.get('userCtrl')?.value === this.loggedUser;
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
        this.isLoading = true

        this.matchService.scoreRound(this.currentRound).subscribe({
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
      data: { name: this.name },
    })

    dialogRef.afterClosed().subscribe(async result => {
      (this.matchService.save(result)).subscribe();
    }
    );

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        this.findByUsernameRound(this.username, this.currentRound);
      }
    });
  }

  private findByUsernameRound(username: string, round: number) {
    this.matchService.findByUsernameRound(username, round).subscribe(data => {
      this.matchResponse = data;
      this.sortMatches();
      this.isLoading = false;
    });
  }
}


