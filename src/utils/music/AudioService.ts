import { AudioPreferences } from '@/types';

/**
 * Audio Service utility for managing audio preferences and persistence
 */
export class AudioService {
  private static readonly STORAGE_KEY = 'wedding-music-preferences';

  /**
   * Save audio preferences to localStorage
   */
  static savePreferences(preferences: AudioPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  }

  /**
   * Load audio preferences from localStorage
   */
  static loadPreferences(): AudioPreferences | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
      return null;
    }
  }

  /**
   * Clear stored preferences
   */
  static clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear audio preferences:', error);
    }
  }

  /**
   * Check if audio autoplay is likely to be blocked
   */
  static async canAutoplay(): Promise<boolean> {
    try {
      const audio = new Audio();
      audio.muted = true;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        audio.pause();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Handle visibility change for tab switching
   */
  static handleVisibilityChange(
    audio: HTMLAudioElement,
    originalVolume: number,
    reducedVolume: number = 0.3
  ): void {
    if (document.hidden) {
      audio.volume = reducedVolume;
    } else {
      audio.volume = originalVolume;
    }
  }

  /**
   * Format time in MM:SS format
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Validate audio file URL
   */
  static isValidAudioUrl(url: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const lowercaseUrl = url.toLowerCase();
    return audioExtensions.some((ext) => lowercaseUrl.includes(ext));
  }
}
