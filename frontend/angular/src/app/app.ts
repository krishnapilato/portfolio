import { CommonModule } from '@angular/common';
import {
  Component
} from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'Krishna Pilato - Portfolio';
}