import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FooterComponent {
  private readonly currentYearValue: string = new Date().getFullYear().toString();

  /**
   * Current year for dynamic display
   */
  public get currentYear(): string {
    return this.currentYearValue;
  }
}