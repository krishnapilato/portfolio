import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public header = environment.header;

  headerTitle = 'khovakrishna.pilato';

  // Array of objects for each nav link
  navLinks = [
    { icon: 'fa-home', label: 'Home', route: '#' },
    { icon: 'fa-smile', label: 'About', route: '#' },
    { icon: 'fa-envelope', label: 'Contact', route: '#' },
    { icon: 'fa-arrow-right-to-bracket', label: 'Login', route: '/auth/login' },
  ];
  constructor(public authService: AuthService) {}

  hoverEffect(event: any) {
    event.target.style.color = '#007bff';
  }

  normalEffect(event: any) {
    event.target.style.color = 'inherit';
  }
}