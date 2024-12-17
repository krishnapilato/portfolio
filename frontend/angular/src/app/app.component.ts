import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Scripted Horizons';

  readonly currentYear = new Date().getFullYear();
  public isDarkTheme = false;

  // Method to update theme based on the emitted event
  onThemeToggle(isDark: boolean): void {
    this.isDarkTheme = isDark;
    if (this.isDarkTheme) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnInit() {
    // Check localStorage for the saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      this.isDarkTheme = false;
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) { event.preventDefault(); }
}
