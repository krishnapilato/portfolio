import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class FooterComponent {
  /**
   * Current year for dynamic display in the footer.
   */
  public get currentYear(): number {
    return new Date().getFullYear();
  }
}