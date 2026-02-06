import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const preferences = await this.storage.getPreferences();
    
    if (!preferences.hasCompletedOnboarding) {
      // Redirect to onboarding if not completed
      await this.router.navigate(['/onboarding'], { replaceUrl: true });
      return false;
    }
    
    return true;
  }
}
