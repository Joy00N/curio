import { Injectable } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';
import { GeneratedContent } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  private isNativeTTSAvailable = false;
  private webSpeechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;

  constructor() {
    this.initializeTTS();
  }

  /**
   * Initialize TTS - check for native or web support
   */
  private async initializeTTS() {
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        // Test if TTS is available
        const supported = await TextToSpeech.isLanguageSupported({ lang: 'en-US' });
        this.isNativeTTSAvailable = supported.supported;
      } catch (error) {
        console.warn('Native TTS not available:', error);
        this.isNativeTTSAvailable = false;
      }
    }

    // Fallback to Web Speech API
    if (!this.isNativeTTSAvailable && 'speechSynthesis' in window) {
      this.webSpeechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if TTS is available
   */
  isAvailable(): boolean {
    return this.isNativeTTSAvailable || this.webSpeechSynthesis !== null;
  }

  /**
   * Compose full text from content for TTS
   */
  private composeFullText(content: GeneratedContent): string {
    const sections = [
      `Understanding ${content.topic}.`,
      '',
      'Explain Like I\'m 7.',
      content.eli7,
      '',
      'One Level Deeper.',
      content.deeper,
      '',
      'Real-World Example.',
      content.example,
      '',
      'Why This Matters.',
      content.whyItMatters,
      '',
      'Reflection Question.',
      content.reflectionQuestion
    ];

    return sections.join(' ');
  }

  /**
   * Speak the content
   */
  async speak(content: GeneratedContent, rate: number = 1.0): Promise<void> {
    if (this.isSpeaking) {
      await this.stop();
    }

    const text = this.composeFullText(content);

    this.isSpeaking = true;
    this.isPaused = false;

    if (this.isNativeTTSAvailable) {
      await this.speakNative(text, rate);
    } else if (this.webSpeechSynthesis) {
      await this.speakWeb(text, rate);
    } else {
      this.isSpeaking = false;
      throw new Error('Text-to-speech is not available on this device');
    }
  }

  /**
   * Speak using native TTS
   */
  private async speakNative(text: string, rate: number): Promise<void> {
    try {
      await TextToSpeech.speak({
        text,
        lang: 'en-US',
        rate,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });
    } catch (error) {
      console.error('Native TTS error:', error);
      throw new Error('Failed to speak using native TTS');
    }
  }

  /**
   * Speak using Web Speech API
   */
  private async speakWeb(text: string, rate: number): Promise<void> {
    if (!this.webSpeechSynthesis) {
      throw new Error('Web Speech API not available');
    }

    return new Promise((resolve, reject) => {
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.lang = 'en-US';
      this.currentUtterance.rate = rate;
      this.currentUtterance.pitch = 1.0;
      this.currentUtterance.volume = 1.0;

      this.currentUtterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        console.error('Web TTS error:', event);
        reject(new Error('Failed to speak using Web Speech API'));
      };

      this.webSpeechSynthesis!.speak(this.currentUtterance);
    });
  }

  /**
   * Pause speaking
   */
  async pause(): Promise<void> {
    if (!this.isSpeaking || this.isPaused) {
      return;
    }

    if (this.isNativeTTSAvailable) {
      // Native TTS doesn't support pause/resume, so we stop instead
      await this.stop();
    } else if (this.webSpeechSynthesis) {
      this.webSpeechSynthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume speaking
   */
  async resume(): Promise<void> {
    if (!this.isSpeaking || !this.isPaused) {
      return;
    }

    if (this.webSpeechSynthesis) {
      this.webSpeechSynthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop speaking
   */
  async stop(): Promise<void> {
    if (!this.isSpeaking) {
      return;
    }

    if (this.isNativeTTSAvailable) {
      try {
        await TextToSpeech.stop();
      } catch (error) {
        console.error('Error stopping native TTS:', error);
      }
    } else if (this.webSpeechSynthesis) {
      this.webSpeechSynthesis.cancel();
      this.currentUtterance = null;
    }

    this.isSpeaking = false;
    this.isPaused = false;
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if paused
   */
  getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get supported speech rates
   */
  getSupportedRates(): number[] {
    return [0.8, 1.0, 1.2];
  }
}
