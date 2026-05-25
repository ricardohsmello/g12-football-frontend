import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/Observable";

@Injectable({
    providedIn: 'root'
})export class RoundService {

    private readonly roundURL: string;

    constructor(private http: HttpClient) {
        this.roundURL = `${environment.apiUrl}/round`;
    }

    public getCurrentRound(competitionId: string = 'brasileirao') : Observable<number> {
        return this.http.get<number>(`${this.roundURL}/current?competitionId=${competitionId}`);
    }

}