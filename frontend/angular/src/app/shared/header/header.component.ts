import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public headerTitle = 'khovakrishna.pilato';

  navLinks = [
    { icon: 'fa-home', label: 'Home', route: '/home' },
    { icon: 'fa-smile', label: 'About', route: '/home' },
    { icon: 'fa-envelope', label: 'Contact', route: '/contact' },
    { icon: 'fa-arrow-right-to-bracket', label: 'Login', route: '/auth/login' },
  ];

  constructor(private authService: AuthService, private renderer: Renderer2) {}

  public toggleHover(event: MouseEvent, isHovering: boolean): void {
    const color = isHovering ? '#007bff' : 'inherit';
    this.renderer.setStyle(event.target, 'color', color);
  }
}