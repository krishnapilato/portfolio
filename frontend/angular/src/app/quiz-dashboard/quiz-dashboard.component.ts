import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import {
  ReactiveFormsModule
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-quiz-dashboard',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quiz-dashboard.component.html',
  styleUrls: ['./quiz-dashboard.component.css'],
})
export class QuizDashboardComponent {
  questionIndex = 0;
  selectedOptionIndex: number | null = null;
  showCorrectAnswer = false;
  correctAnswersCount = 0;
  quizFinished = false;

  // Mock questions array
  questions = [
    {
      text: 'What is the purpose of a preflight checklist?',
      options: [
        { text: 'To ensure the plane is in safe operating condition.', isCorrect: true },
        { text: 'To review recent weather conditions.', isCorrect: false },
        { text: 'To calculate fuel requirements.', isCorrect: false },
        { text: 'To verify the flight path.', isCorrect: false },
      ],
      explanation:
        'A preflight checklist ensures that the aircraft is in a safe condition for flight by verifying all critical systems and components are functioning correctly.',
    },
    {
      text: 'What is VFR?',
      options: [
        { text: 'Visual Flight Rules.', isCorrect: true },
        { text: 'Variable Flight Range.', isCorrect: false },
        { text: 'Verified Flight Route.', isCorrect: false },
        { text: 'Virtual Flying Regulations.', isCorrect: false },
      ],
      explanation:
        'VFR stands for Visual Flight Rules, which are a set of regulations under which a pilot operates an aircraft in weather conditions clear enough to see where the aircraft is going.',
    },
    {
      text: 'What is the primary responsibility of a pilot?',
      options: [
        { text: 'Ensure passenger comfort.', isCorrect: false },
        { text: 'Operate the aircraft safely.', isCorrect: true },
        { text: 'Follow air traffic control instructions blindly.', isCorrect: false },
        { text: 'Log flight hours.', isCorrect: false },
      ],
      explanation:
        'The primary responsibility of a pilot is to ensure the safe operation of the aircraft during all phases of flight.',
    },
    {
      text: 'What is the purpose of an altimeter?',
      options: [
        { text: 'To measure airspeed.', isCorrect: false },
        { text: 'To indicate altitude.', isCorrect: true },
        { text: 'To display engine RPM.', isCorrect: false },
        { text: 'To calculate wind speed.', isCorrect: false },
      ],
      explanation:
        'An altimeter indicates the altitude of an aircraft above sea level, which is crucial for navigation and maintaining safe separation from terrain and other aircraft.',
    },
  ];

  // Current question
  get question() {
    return this.questions[this.questionIndex];
  }

  checkAnswer(option: any, index: number): void {
    this.selectedOptionIndex = index;
    this.showCorrectAnswer = true;

    if (option.isCorrect) {
      this.correctAnswersCount++;
    }
  }

  nextOrFinish(): void {
    if (this.questionIndex < this.questions.length - 1) {
      this.questionIndex++;
      this.selectedOptionIndex = null;
      this.showCorrectAnswer = false;
    } else {
      this.quizFinished = true;
    }
  }

  getResults(): { score: number; advice: string } {
    const score = (this.correctAnswersCount / this.questions.length) * 100;
    let advice = '';

    if (score === 100) {
      advice = 'Excellent! You have a perfect understanding of the material.';
    } else if (score >= 75) {
      advice = 'Great job! Review a few areas to perfect your knowledge.';
    } else if (score >= 50) {
      advice = 'Good effort! Focus on reviewing the topics you missed.';
    } else {
      advice = 'Needs improvement. Consider studying the material thoroughly.';
    }

    return { score, advice };
  }

  restartQuiz(): void {
    this.questionIndex = 0;
    this.correctAnswersCount = 0;
    this.quizFinished = false;
    this.selectedOptionIndex = null;
    this.showCorrectAnswer = false;
  }
}