import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, take } from 'rxjs';

@Component({
  selector: 'app-error',
  template: `
    <div
      class="relative w-full min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center overflow-hidden"
    >
      <!-- Decorative Shapes -->
      <div
        class="absolute top-10 left-[-100px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 w-48 h-48 rounded-full animate-bounce opacity-30 shadow-xl sm:w-40 sm:h-40 lg:w-48 lg:h-48"
        aria-hidden="true"
      ></div>
      <div
        class="absolute bottom-[-120px] right-[-80px] bg-gradient-to-tr from-blue-400 to-indigo-600 w-72 h-48 rounded-[50%] animate-spin-slow opacity-25 shadow-lg transform rotate-[15deg] sm:w-56 sm:h-36 lg:w-72 lg:h-48"
        aria-hidden="true"
      ></div>
      <div
        class="absolute top-[15%] right-[15%] bg-gradient-to-t from-yellow-300 via-orange-400 to-red-500 w-64 h-64 rounded-full animate-pulse opacity-40 shadow-md sm:w-48 sm:h-48 lg:w-64 lg:h-64"
        aria-hidden="true"
      ></div>
      <div
        class="absolute bottom-[5%] left-[20%] bg-gradient-to-bl from-green-400 to-blue-500 w-80 h-40 rounded-[30%] animate-ping opacity-30 shadow-lg sm:w-64 sm:h-32 lg:w-80 lg:h-40"
        aria-hidden="true"
      ></div>
      <div
        class="absolute top-[10%] left-[55%] bg-gradient-to-b from-teal-500 to-cyan-600 w-56 h-56 rounded-full animate-ping opacity-40 shadow-2xl sm:w-48 sm:h-48 lg:w-56 lg:h-56"
        aria-hidden="true"
      ></div>

      <!-- Content -->
      <div
        class="relative text-center text-gray-100 px-6 py-12 space-y-6 sm:px-8 lg:px-12 max-w-xl"
      >
        <h1
          class="text-8xl font-extrabold text-white mb-4 leading-tight tracking-wide drop-shadow-lg sm:text-6xl lg:text-8xl"
        >
          404
        </h1>
        <h2 class="text-2xl font-semibold text-gray-200 sm:text-xl lg:text-2xl">
          Whoops! This Page is Missing
        </h2>
        <p
          class="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed sm:text-sm lg:text-base"
        >
          The page you’re looking for might have been removed, renamed, or is temporarily unavailable. But don’t worry, we’ve got you covered.
        </p>
        <p class="text-lg font-medium text-gray-200 sm:text-base lg:text-lg">
          Redirecting in <span class="font-bold text-white">{{ countdown }}</span> seconds...
        </p>

        <!-- Home Button -->
        <button
          routerLink="/"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-full font-medium text-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 sm:px-5 sm:py-2 lg:px-6 lg:py-3"
        >
          Take Me Home
        </button>
      </div>
    </div>
  `,
  imports: [RouterModule],
})
export class ErrorComponent implements OnInit {
  protected countdown: number = 10;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    interval(1000).pipe(take(this.countdown)).subscribe(() => this.countdown--, null, () => this.router.navigate(['/']));
  }
}