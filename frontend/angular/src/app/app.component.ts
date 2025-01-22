import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private scrollContainer: HTMLElement | null = null;
  private isScrolling = false;

  private touchStartX: number = 0; // To track touch start position
  private touchEndX: number = 0; // To track touch end position

  ngOnInit(): void {
    // Reference to the scroll container
    this.scrollContainer = document.getElementById('scrollContainer');

    // Track scrolling to update progress bar
    this.scrollContainer?.addEventListener('scroll', () => {
      this.updateProgressBar();
    });
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.scrollContainer || this.isScrolling) {
      return;
    }

    this.isScrolling = true;

    // Determine scroll direction (1 for down, -1 for up)
    const direction = event.deltaY > 0 ? 1 : -1;
    const scrollAmount = direction * window.innerWidth;

    // Scroll the container horizontally
    this.scrollContainer.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });

    // Add a timeout to avoid rapid scrolling
    setTimeout(() => {
      this.isScrolling = false;
    }, 800); // Adjust this delay to match the scroll speed
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;

    if (!this.scrollContainer || this.isScrolling) {
      return;
    }

    this.isScrolling = true;

    // Determine swipe direction
    const direction = this.touchStartX > this.touchEndX ? 1 : -1;
    const scrollAmount = direction * window.innerWidth;

    // Scroll the container horizontally
    this.scrollContainer.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });

    // Add a timeout to avoid rapid scrolling
    setTimeout(() => {
      this.isScrolling = false;
    }, 800); // Adjust this delay to match the scroll speed
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateProgressBar();
  }

  updateProgressBar(): void {
    if (this.scrollContainer) {
      const totalScrollWidth = this.scrollContainer.scrollWidth - window.innerWidth;
      const currentScrollLeft = this.scrollContainer.scrollLeft;

      const progress = (currentScrollLeft / totalScrollWidth) * 100;
      const progressBar = document.getElementById('progressBar');

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }

  completeGame(): void {
    alert('🎉 Congratulations! You completed the journey!');
  }
}