import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: true,
  imports: [CommonModule],
})
export class FooterComponent {
  /**
   * Current year for dynamic display in the footer.
   */
  currentYear: number = new Date().getFullYear();
}
