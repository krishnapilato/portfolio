import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { timer } from 'rxjs';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly title: string = 'PrismNexus';

  isLoading = true;
  isContentVisible = false;
  loadingOpacity = 1;  // Start with full opacity

  ngOnInit() {
    this.startLoadingAnimation();
  }

  /**
   * Starts the loading animation, showing the loading screen and then hiding it.
   */
  private startLoadingAnimation(): void {
    timer(3000).subscribe({
      complete: () => {
        this.isLoading = false; // Hide the loading screen
        this.fadeOutLoadingScreen(); // Trigger the fade-out animation
      },
    });
  }

  /**
   * Fades out the loading screen and reveals the main content.
   */
  private fadeOutLoadingScreen(): void {
    timer(400).subscribe({
      next: () => (this.loadingOpacity = 0), // Fade out the loading screen
      complete: () => this.showMainContent(), // Reveal the main content
    });
  }

  /**
   * Reveals the main content.
   */
  private showMainContent(): void {
    this.isContentVisible = true;
  }

  /**
   * Prevents the default context menu from appearing on right-click.
   * @param event - The MouseEvent triggered by the right-click.
   */
  @HostListener('document:contextmenu', ['$event'])
  private onRightClick(event: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
  }
}