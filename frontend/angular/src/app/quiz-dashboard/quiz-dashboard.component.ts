import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
  currentView: 'welcome' | 'quiz' | 'results' = 'welcome';
  questionIndex = 0;
  selectedOptionIndex: number | null = null;
  showCorrectAnswer = false;
  correctAnswersCount = 0;

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
    // Additional questions here...
  ];

  public get question() {
    return this.questions[this.questionIndex];
  }

  // Progress calculation
  public get progress(): number {
    return (this.questionIndex / this.questions.length) * 100;
  }

  public startQuiz(): void {
    this.currentView = 'quiz';
  }

  public checkAnswer(option: any, index: number): void {
    if (this.selectedOptionIndex === null) {
      this.selectedOptionIndex = index;
      this.showCorrectAnswer = true;

      if (option.isCorrect) {
        this.correctAnswersCount++;
      }
    }
  }

  public nextOrFinish(): void {
    if (this.questionIndex < this.questions.length - 1) {
      this.questionIndex++;
      this.selectedOptionIndex = null;
      this.showCorrectAnswer = false;
    } else {
      this.currentView = 'results';
    }
  }

  public skipQuestion(): void {
    if (this.questionIndex < this.questions.length - 1) {
      this.questionIndex++;
      this.selectedOptionIndex = null;
      this.showCorrectAnswer = false;
    } else {
      this.currentView = 'results';
    }
  }

  public getResults(): { score: number; advice: string } {
    const score = Math.round((this.correctAnswersCount / this.questions.length) * 100);
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

  public restartQuiz(): void {
    this.currentView = 'quiz';
    this.questionIndex = 0;
    this.correctAnswersCount = 0;
    this.selectedOptionIndex = null;
    this.showCorrectAnswer = false;
  }
}
