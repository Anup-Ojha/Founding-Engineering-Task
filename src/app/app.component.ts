// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// Define an interface for better type safety, matching the backend output
interface ProductResult {
  productName: string;
  price: number;
  currency: string;
  link: string;
  website_name: string;
  parameter1: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  country = 'US';
  query = '';
  results: ProductResult[] = [];
  loading = false;
  error: string | null = null;

  countdown: number = 40; // Initial countdown value
  private timerSubscription: Subscription | undefined;
  private readonly MAX_WAIT_TIME = 40; // Max seconds to display for the timer

  constructor(private http: HttpClient) {}

  async search() {
    this.loading = true;
    this.results = [];
    this.error = null;
    this.countdown = this.MAX_WAIT_TIME; // Reset countdown

    // Start the countdown timer
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.loading && this.countdown > 0))
      .subscribe(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          // Optional: Display a message if timer runs out but loading is still true
          // this.error = "Search is taking longer than expected. Please wait or try again.";
        }
      });

    const payload = {
      country: this.country,
      query: this.query
    };

    try {
      const response = await firstValueFrom(
        //https://backendtaskfethosted.onrender.com/api/search
        this.http.post<ProductResult[]>('http://localhost:3000', payload)
      );
      this.results = response;
    } catch (err: any) {
      console.error('Search failed:', err);
      this.error = err.error?.error || 'Could not fetch results. Please check if the backend server is running and try again.';
    } finally {
      this.loading = false;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe(); // Stop the timer
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from the timer to prevent memory leaks when component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
