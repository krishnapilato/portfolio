import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  loading = false;
  selectedOptionIndex: number | null = null;
  showCorrectAnswer = false; // Re-added this variable
  correctAnswersCount = 0;
  questions: any[] = [];
  generatedResponse: any = {};

  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly apiKey = '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'; // Replace with your Groq API key

  constructor(private http: HttpClient) {}

  // Moved API call from ngOnInit to startQuiz
  startQuiz(): void {
    this.fetchGroqModelResponse();
    setTimeout(() => {
      this.currentView = 'quiz';
    }, 2000);
  }

  // Fetch questions from the Groq API using the Llama model
  private fetchGroqModelResponse(): void {
    const requestPayload = {
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: this.generateQuizRequest() }],
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    });

    this.http.post<any>(this.apiUrl, requestPayload, { headers }).subscribe({
      next: (response) => {
        const rawText = response.choices[0].message.content.trim();
        this.questions = this.parseResponse(rawText);
      },
      error: (error) => console.error('Failed to fetch response from Groq:', error),
    });
  }

  // Request template to generate quiz questions
  private generateQuizRequest(): string {
    return 'Generate 5 multiple-choice quiz questions about aviation. Each question should include:\n1. The question text.\n2. 4 answer options, one of which is correct.\n3. An explanation for the correct answer.';
  }

  // Function to parse the Groq response into the required format
  private parseResponse(response: string): any[] {
    const questionRegex = /Question (\d+):/g;
    const optionRegex = /([A-Z])\)\s([^\n]+)/g;
    const explanationRegex = /Explanation:\s([\s\S]*)/g;

    let questions: any[] = [];
    let questionMatches: RegExpExecArray | null;

    while ((questionMatches = questionRegex.exec(response)) !== null) {
      const questionText = this.extractText(response, questionMatches.index, 'A)');
      const cleanedQuestionText = this.getCleanedQuestionText(questionText); // Clean the question text
      const optionsMatches = this.extractOptions(response, optionRegex);
      const explanation = (explanationRegex.exec(response)?.[1] || '').trim();

      questions.push({
        text: cleanedQuestionText, // Use the cleaned question text
        options: optionsMatches.map((match, index) => ({
          text: match[2].trim(),
          isCorrect: index === 0, // Assuming correct answer is always the first option
        })),
        explanation,
      });
    }
    console.log("Questions: ", questions);
    return questions;
  }

  getCleanedQuestionText(rawText: string): string {
    return rawText.replace(/stion \d+:|\*+/g, '').trim();
  }

  // Helper function to extract question text
  private extractText(response: string, startIndex: number, endMarker: string): string {
    return response.substring(startIndex + 3, response.indexOf(endMarker, startIndex)).trim();
  }

  // Helper function to extract options
  private extractOptions(response: string, optionRegex: RegExp): RegExpExecArray[] {
    const optionsMatches: RegExpExecArray[] = [];
    let optionMatch: RegExpExecArray | null;
    while ((optionMatch = optionRegex.exec(response)) !== null && optionsMatches.length < 4) {
      optionsMatches.push(optionMatch);
    }
    return optionsMatches;
  }

  get question() {
    return this.questions[this.questionIndex];
  }

  get progress(): number {
    return (this.questionIndex / this.questions.length) * 100;
  }

  checkAnswer(option: any, index: number): void {
    if (this.selectedOptionIndex === null) {
      this.selectedOptionIndex = index;
      this.showCorrectAnswer = true;

      if (option.isCorrect) this.correctAnswersCount++;
    }
  }

  nextOrFinish(): void {
    if (this.questionIndex < this.questions.length - 1) {
      this.questionIndex++;
      this.resetAnswerState();
    } else {
      this.currentView = 'results';
    }
  }

  skipQuestion(): void {
    if (this.questionIndex < this.questions.length - 1) {
      this.questionIndex++;
      this.resetAnswerState();
    } else {
      this.currentView = 'results';
    }
  }

  private resetAnswerState(): void {
    this.selectedOptionIndex = null;
    this.showCorrectAnswer = false; // Reset showCorrectAnswer when moving to the next question
  }

  getResults(): { score: number; advice: string } {
    const score = Math.round((this.correctAnswersCount / this.questions.length) * 100);
    const advice = this.getAdvice(score);
    return { score, advice };
  }

  private getAdvice(score: number): string {
    if (score === 100) return 'Excellent! You have a perfect understanding of the material.';
    if (score >= 75) return 'Great job! Review a few areas to perfect your knowledge.';
    if (score >= 50) return 'Good effort! Focus on reviewing the topics you missed.';
    return 'Needs improvement. Consider studying the material thoroughly.';
  }

  restartQuiz(): void {
    this.fetchGroqModelResponse();
    setTimeout(() => {
      this.currentView = 'quiz';
    }, 2000);
    this.questionIndex = 0;
    this.correctAnswersCount = 0;
    this.resetAnswerState();
  }
}
