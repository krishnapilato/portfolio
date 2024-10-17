import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  public env = environment;
}