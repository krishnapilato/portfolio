import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './error.component.html',
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
        height: 100vh;
      }
    `,
  ],
})
export class ErrorComponent {
  message: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.message =
      this.route.snapshot.data['message'] || 'An error has occurred';
  }
}
