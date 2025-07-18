import { Component, OnInit } from '@angular/core';
import {KeycloakService} from "keycloak-angular";
import {KeycloakProfile} from "keycloak-js";
import {RoundService} from "../../services/round-service/round.service";
import {Round} from "../../domain/model/round/round";
import {Observable} from "rxjs/Observable";
import {BetService} from "../../services/bet-service/bet.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentRound: number;
  totalPlayers = 20;
  nextMatch: Date = new Date('2025-07-19T16:00:00');
  totalBettors: number = 0;
  missing: number;
  isLoading = true;
  public isLogged = false;
  public profile: KeycloakProfile | null = null;

  constructor(private readonly keycloak: KeycloakService, private roundService: RoundService, private betService: BetService) {}

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



  }}
