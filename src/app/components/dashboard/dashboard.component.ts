import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { RoundService } from '../../services/round-service/round.service';
import { BetService } from '../../services/bet-service/bet.service';
import { RagService } from '../../services/rag-service/rag.service';
import { FormControl, Validators } from '@angular/forms';
import { RagAnswer } from '../../domain/model/rag/rag';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentRound: number;
  totalPlayers = 21;
  nextMatch: Date = new Date('2025-08-09T18:30:00');
  totalBettors = 0;
  missing: number;
  isLoading = true;
  isAsking = false;

  public isLogged = false;
  public profile: KeycloakProfile | null = null;

  questionCtrl = new FormControl('', [Validators.required, Validators.minLength(2)]);
  lastAnswer: RagAnswer | null = null;
  history: RagAnswer[] = [];

  constructor(
      private readonly keycloak: KeycloakService,
      private roundService: RoundService,
      private betService: BetService,
      private ragService: RagService
  ) {}

  async ngOnInit() {
    this.isLogged = await this.keycloak.isLoggedIn();
    if (this.isLogged) {
      this.profile = await this.keycloak.loadUserProfile();
    }

    this.roundService.getCurrentRound().subscribe((round: number) => {
      this.currentRound = round;

      this.betService.countBettorsByRound(round).subscribe(count => {
        this.totalBettors = count;
        this.isLoading = false;
        this.missing = this.totalPlayers - count;
      });
    });
  }

  ask() {
    if (this.questionCtrl.invalid || this.isAsking) return;

    const question = this.questionCtrl.value!.trim();
    if (!question) return;

    this.isAsking = true;


    this.ragService.ask(question).subscribe({
      next: (res) => {
        this.lastAnswer = res;
        this.history.unshift(res);
        this.questionCtrl.reset('');
        this.isAsking = false;
      },
      error: () => {
        this.lastAnswer = { question, answer: 'Erro ao buscar resposta. Tente novamente.' };
        this.isAsking = false;
      }
    });
  }

  onKeydownEnter(ev: KeyboardEvent) {
    if (!ev.shiftKey) {
      ev.preventDefault();
      this.ask();
    }
  }
}
