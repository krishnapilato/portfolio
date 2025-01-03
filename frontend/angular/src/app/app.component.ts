import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "./shared/footer/footer.component";
import { HeaderComponent } from './shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private readonly title: string = 'PrismNexus';

  /**
   * Prevents the default context menu from appearing on right-click.
   * @param event - The MouseEvent triggered by the right-click.
   */
  @HostListener('document:contextmenu', ['$event'])
  private onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Disable right-click context menu
  }
}
