import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  username = 'Ricardo';
  currentRound = 12;
  totalPlayers = 24;
  prizePool = 1850;
  nextMatch: Date = new Date('2025-06-17T16:00:00');

  constructor() {}

  ngOnInit() {}
}
