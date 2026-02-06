import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { RecommendationService } from '../../services/recommendation.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage {
  availableInterests: string[] = [];
  selectedInterests: Set<string> = new Set();
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private storage: StorageService,
    private recommendation: RecommendationService
  ) {
    this.availableInterests = this.recommendation.getCategories();
  }

  /**
   * Toggle interest selection
   */
  toggleInterest(interest: string) {
    if (this.selectedInterests.has(interest)) {
      this.selectedInterests.delete(interest);
    } else {
      this.selectedInterests.add(interest);
    }
  }

  /**
   * Check if interest is selected
   */
  isSelected(interest: string): boolean {
    return this.selectedInterests.has(interest);
  }

  /**
   * Check if user can continue (at least 3 selected)
   */
  canContinue(): boolean {
    return this.selectedInterests.size >= 3;
  }

  /**
   * Continue to home
   */
  async continue() {
    if (!this.canContinue()) {
      this.errorMessage = 'Please select at least 3 interests';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const preferences = await this.storage.getPreferences();
      preferences.selectedInterests = Array.from(this.selectedInterests);
      preferences.hasCompletedOnboarding = true;
      
      await this.storage.setPreferences(preferences);
      
      // Navigate to home
      await this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (error) {
      console.error('Error saving preferences:', error);
      this.errorMessage = 'Failed to save your interests. Please try again.';
      this.isLoading = false;
    }
  }
}
