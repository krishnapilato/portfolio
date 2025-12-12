import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular');

  protected viewLinkedInProfile(): void {
    window.open('https://www.linkedin.com/in/khovakrishnapilato', '_blank');
  }
}
