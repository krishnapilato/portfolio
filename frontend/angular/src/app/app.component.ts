import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly title: string = 'PrismNexus';
  private loadListener!: () => void;

  protected isLoading: boolean = true;
  protected isContentVisible: boolean = false;

  ngOnInit() {
    this.loadListener = this.startLoadingAnimation.bind(this);
    window.addEventListener('load', this.loadListener);
  }

  ngOnDestroy() {
    // Clean up event listeners to prevent memory leaks
    window.removeEventListener('load', this.loadListener);
  }

  /**
   * Starts the loading animation, showing the loading screen and then hiding it.
   */
  private startLoadingAnimation(): void {
    setTimeout(() => {
      this.fadeOutLoadingScreen();
    }, 500); // Matches the desired delay
  }

  /**
   * Fades out the loading screen and reveals the main content.
   */
  private fadeOutLoadingScreen(): void {
    const step = 0.05; // Adjust step size for smoothness vs. performance
    const duration = 1000; // Total fade-out duration in ms
    const interval = duration / (1 / step); // Calculate interval between steps

    const fadeEffect = setInterval(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.isContentVisible = true;
        clearInterval(fadeEffect);
      }
    }, interval);
  }

  /**
   * Disables the context menu globally on right-click.
   * @param event - The triggered MouseEvent.
   */
  @HostListener('document:contextmenu', ['$event'])
  private onRightClick(event: MouseEvent): void {
    event?.preventDefault();
  }
}