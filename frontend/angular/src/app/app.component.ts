import {
  Component,
  HostListener,
  ViewEncapsulation
} from '@angular/core';
import { StartScreenComponent } from './start-screen/start-screen.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [StartScreenComponent],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  // Disable right-click context menu globally
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu
    console.log('Context menu disabled'); // Optional: log for debugging
  }
}