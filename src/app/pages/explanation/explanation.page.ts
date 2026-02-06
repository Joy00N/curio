import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { TtsService } from '../../services/tts.service';
import { TopicEntry } from '../../models';

@Component({
  selector: 'app-explanation',
  templateUrl: './explanation.page.html',
  styleUrls: ['./explanation.page.scss'],
})
export class ExplanationPage implements OnInit, OnDestroy {
  entry: TopicEntry | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Audio state
  isTTSAvailable = false;
  isPlaying = false;
  isPaused = false;
  selectedRate = 1.0;
  availableRates: number[] = [];
  audioEnabled = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private tts: TtsService
  ) {
    this.isTTSAvailable = this.tts.isAvailable();
    this.availableRates = this.tts.getSupportedRates();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadEntry(id);
    } else {
      this.errorMessage = 'No topic ID provided';
      this.isLoading = false;
    }

    // Check if audio is enabled in preferences
    const preferences = await this.storage.getPreferences();
    this.audioEnabled = preferences.audioEnabled;
  }

  ngOnDestroy() {
    // Stop audio when leaving page
    if (this.isPlaying) {
      this.stopAudio();
    }
  }

  /**
   * Load entry by ID
   */
  private async loadEntry(id: string) {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const entry = await this.storage.getEntryById(id);
      
      if (!entry) {
        this.errorMessage = 'Topic not found';
      } else {
        this.entry = entry;
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      this.errorMessage = 'Failed to load topic. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Play or resume audio
   */
  async playAudio() {
    if (!this.entry || !this.isTTSAvailable || !this.audioEnabled) {
      return;
    }

    try {
      if (this.isPaused) {
        await this.tts.resume();
        this.isPaused = false;
      } else {
        this.isPlaying = true;
        await this.tts.speak(this.entry, this.selectedRate);
        this.isPlaying = false;
        this.isPaused = false;
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      this.isPaused = false;
    }
  }

  /**
   * Pause audio
   */
  async pauseAudio() {
    if (!this.isPlaying) {
      return;
    }

    try {
      await this.tts.pause();
      this.isPaused = true;
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  /**
   * Stop audio
   */
  async stopAudio() {
    try {
      await this.tts.stop();
      this.isPlaying = false;
      this.isPaused = false;
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  /**
   * Change playback speed
   */
  async changeSpeed(rate: number) {
    this.selectedRate = rate;
    
    // If currently playing, restart with new speed
    if (this.isPlaying && this.entry) {
      await this.stopAudio();
      await this.playAudio();
    }
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite() {
    if (!this.entry) return;

    try {
      this.entry.isFavorite = !this.entry.isFavorite;
      await this.storage.updateEntry(this.entry.id, {
        isFavorite: this.entry.isFavorite
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  /**
   * Retry loading
   */
  async retry() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadEntry(id);
    }
  }

  /**
   * Go back
   */
  goBack() {
    this.router.navigate(['/tabs/home']);
  }

  /**
   * Format date for display
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
