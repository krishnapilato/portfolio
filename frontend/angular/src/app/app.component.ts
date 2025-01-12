import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  private readonly title: string = 'PrismNexus';

  protected isLoading: boolean = true;
  protected isContentVisible: boolean = false;
  protected loadingOpacity: number = 1;

  ngOnInit() {
    window.addEventListener('load', () => {
      this.startLoadingAnimation();
    });
  }

  /**
   * Starts the loading animation, showing the loading screen and then hiding it.
   */
  private startLoadingAnimation(): void {
    setTimeout(() => {
      this.fadeOutLoadingScreen();
    }, 500); // Ensure the delay matches your loading needs
  }

  /**
   * Fades out the loading screen and reveals the main content.
   */
  private fadeOutLoadingScreen(): void {
    const fadeOutEffect = () => {
      if (this.loadingOpacity > 0) {
        this.loadingOpacity -= 0.05;
    
        requestAnimationFrame(fadeOutEffect);
      } else {
        this.isLoading = false;
        this.showMainContent();
      }
    };
    
    // Start the fade-out effect
    fadeOutEffect();
  }

  /**
   * Marks the main content as visible.
   */
  private showMainContent(): void {
    this.isContentVisible = true;
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