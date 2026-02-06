import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { RecommendationService } from '../../services/recommendation.service';
import { UserPreferences } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  preferences: UserPreferences | null = null;
  isLoading = true;
  isSaving = false;
  appVersion = environment.appVersion;

  // Available options
  availableInterests: string[] = [];

  constructor(
    private storage: StorageService,
    private recommendation: RecommendationService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.availableInterests = this.recommendation.getCategories();
  }

  async ngOnInit() {
    await this.loadPreferences();
  }

  async ionViewWillEnter() {
    await this.loadPreferences();
  }

  /**
   * Load user preferences
   */
  private async loadPreferences() {
    this.isLoading = true;

    try {
      this.preferences = await this.storage.getPreferences();
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Update depth preference
   */
  async onDepthChange(event: any) {
    if (!this.preferences) return;

    this.preferences.depth = event.detail.value;
    await this.savePreferences();
  }

  /**
   * Toggle audio enabled
   */
  async onAudioToggle(event: any) {
    if (!this.preferences) return;

    this.preferences.audioEnabled = event.detail.checked;
    await this.savePreferences();
  }

  /**
   * Save preferences
   */
  private async savePreferences() {
    if (!this.preferences) return;

    this.isSaving = true;

    try {
      await this.storage.setPreferences(this.preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Edit interests
   */
  async editInterests() {
    if (!this.preferences) return;

    const alert = await this.alertController.create({
      header: 'Edit Interests',
      message: 'Select at least 3 topics you\'d like to learn about',
      inputs: this.availableInterests.map(interest => ({
        name: interest,
        type: 'checkbox',
        label: interest,
        value: interest,
        checked: this.preferences?.selectedInterests.includes(interest)
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (selected: string[]) => {
            if (selected.length < 3) {
              const errorAlert = await this.alertController.create({
                header: 'Minimum Required',
                message: 'Please select at least 3 interests',
                buttons: ['OK']
              });
              await errorAlert.present();
              return false;
            }

            if (this.preferences) {
              this.preferences.selectedInterests = selected;
              await this.savePreferences();
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Clear all data
   */
  async clearData() {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: 'This will delete all your learning history and preferences. This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: async () => {
            try {
              await this.storage.clearAll();
              
              // Navigate to onboarding
              await this.router.navigate(['/onboarding'], { replaceUrl: true });
              
              const successAlert = await this.alertController.create({
                header: 'Data Cleared',
                message: 'All your data has been deleted',
                buttons: ['OK']
              });
              await successAlert.present();
            } catch (error) {
              console.error('Error clearing data:', error);
              
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Failed to clear data. Please try again.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show about info
   */
  async showAbout() {
    const alert = await this.alertController.create({
      header: 'About Curio',
      message: `
        <p><strong>Version:</strong> ${this.appVersion}</p>
        <br>
        <p>Curio is a commute-first mobile app designed to help curious learners understand one concept per day.</p>
        <br>
        <p>Learn calmly, intentionally, and deeply—without the distraction of infinite feeds.</p>
      `,
      buttons: ['Close']
    });

    await alert.present();
  }
}
