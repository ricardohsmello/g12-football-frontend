import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Bet } from '../../domain/model/bet/bet' 
import { environment } from '../../../environments/environment';
import {Observable} from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})export class BetService {

  private betURL: string;

  constructor(private http: HttpClient) {
    this.betURL = `${environment.apiUrl}/bet`;
  }

  public save(bet: Bet) {
    console.log(this.betURL);
    return this.http.post<Bet>(this.betURL, bet);
  }

  public countBettorsByRound(round: number): Observable<number> {
    return this.http.get<number>(`${this.betURL}/round/${round}/bettors-count`);
  }
}



