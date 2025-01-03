import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  /**
   * Current year for dynamic display in the footer.
   */
  public currentYear: number = new Date().getFullYear();
}
