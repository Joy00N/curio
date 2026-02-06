import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { TopicEntry } from '../../models';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  allEntries: TopicEntry[] = [];
  filteredEntries: TopicEntry[] = [];
  searchQuery = '';
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    await this.loadHistory();
  }

  async ionViewWillEnter() {
    // Refresh history when returning to page
    await this.loadHistory();
  }

  /**
   * Load all history entries
   */
  private async loadHistory() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.allEntries = await this.storage.getEntries();
      this.filteredEntries = [...this.allEntries];
    } catch (error) {
      console.error('Error loading history:', error);
      this.errorMessage = 'Failed to load history. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle search input
   */
  async onSearchChange(event: any) {
    const query = event.target.value || '';
    this.searchQuery = query.trim();

    if (!this.searchQuery) {
      // Show all entries if search is empty
      this.filteredEntries = [...this.allEntries];
    } else {
      // Search in storage service
      this.filteredEntries = await this.storage.searchEntries(this.searchQuery);
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery = '';
    this.filteredEntries = [...this.allEntries];
  }

  /**
   * Navigate to entry detail
   */
  openEntry(entry: TopicEntry) {
    this.router.navigate(['/explain', entry.id]);
  }

  /**
   * Format date for display
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Retry loading
   */
  async retry() {
    await this.loadHistory();
  }

  /**
   * Track by function for *ngFor optimization
   */
  trackByEntryId(index: number, entry: TopicEntry): string {
    return entry.id;
  }
}
