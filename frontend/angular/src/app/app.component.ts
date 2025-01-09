import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
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
   * Starts the loading animation using `rxjs` timer for the delay
   * and handles the display of the loading screen and visibility of content.
   */
  private startLoadingAnimation(): void {
    // Show loading screen for 2 seconds (optimized for fast feedback)
    timer(2000)  // Reduced loading screen duration to 2 seconds
      .pipe(take(1))
      .subscribe(() => {
        this.isLoading = false;
        this.fadeOutLoadingScreen();
      });
  }

  /**
   * Fades out the loading screen after a 600ms delay using `rxjs` timer.
   * Then it reveals the main content.
   */
  private fadeOutLoadingScreen(): void {
    // Use a quicker fade-out (400ms) for a snappier experience
    timer(400)  // Faster fade-out
      .pipe(take(1))
      .subscribe(() => {
        this.loadingOpacity = 0; // Fade out the loading screen
        this.showMainContent();
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
    event.preventDefault(); // Disable right-click context menu
  }
}