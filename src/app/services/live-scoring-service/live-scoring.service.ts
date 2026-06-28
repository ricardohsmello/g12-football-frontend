import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { LiveMatch } from '../../domain/model/live-scoring/live-scoring.model';

@Injectable({ providedIn: 'root' })
export class LiveScoringService {
  private readonly url = `${environment.apiUrl}/live-scoring`;

  constructor(private http: HttpClient) {}

  getLiveScoring(round: number, competitionId: string): Observable<LiveMatch[]> {
    return this.http.get<LiveMatch[]>(`${this.url}?round=${round}&competitionId=${competitionId}`);
  }

  updateScore(matchId: string, homeTeam: number, awayTeam: number): Observable<void> {
    return this.http.put<void>(`${this.url}/matches/${matchId}/score`, { homeTeam, awayTeam });
  }
}
