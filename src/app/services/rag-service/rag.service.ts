import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RagAnswer } from '../../domain/model/rag/rag';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RagService {

   private readonly ragURL: string;

  constructor(private http: HttpClient) {
    this.ragURL = `${environment.apiUrl}/rag-admin`;
  }

  ask(question: string): Observable<RagAnswer> {
    const body = { question };
    return this.http.post<RagAnswer>(`${this.ragURL}/ask`, body);
  }

}
