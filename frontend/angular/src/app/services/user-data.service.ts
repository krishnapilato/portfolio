import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  private userPreferences: any;

  constructor() {
    this.updatePreferences();
    // Optionally, listen for changes to theme or screen size
    this.setupListeners();
  }

  // Getter to retrieve user preferences
  public get getUserPreferences(): any {
    return this.userPreferences;
  }

  // Initialize or update preferences
  private updatePreferences(): void {
    this.userPreferences = {
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      browserLanguage: navigator.language || navigator.languages[0],
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }

  // Optional: Listen for dynamic changes to user preferences
  private setupListeners(): void {
    // Listen for changes in theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.updatePreferences();
    });

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.updatePreferences();
    });
  }
}