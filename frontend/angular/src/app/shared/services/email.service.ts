import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendEmail(emailData: {
    to: string;
    subject: string;
    body: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('to', encodeURIComponent(emailData.to))
      .set('subject', encodeURIComponent(emailData.subject))
      .set('body', encodeURIComponent(emailData.body));

    return this.http.post(
      environment.apiUrl + '/api/email/send',
      {},
      {
        headers,
        params,
      }
    );
  }
}
