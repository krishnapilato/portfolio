import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private scrollContainer: HTMLElement | null = null;
  private isScrolling = false;

  ngOnInit(): void {
    // Reference to the scroll container
    this.scrollContainer = document.getElementById('scrollContainer');
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
}