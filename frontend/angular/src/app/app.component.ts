import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../environment/environment';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title: string = 'khovakrishnapilato.com';
  private env = environment;

  ngOnInit(): void {
    this.forceHTTPS();
  }

  forceHTTPS(): void {
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      window.location.href = `https:${window.location.href.substring(
        window.location.protocol.length
      )}`;
    }
  }

  constructor(private elementRef: ElementRef) {}
  ngAfterViewInit() {
    //this.elementRef.nativeElement.ownerDocument.body.style.color = '#000';
  }
}