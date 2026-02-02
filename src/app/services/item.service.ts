import { Injectable } from '@angular/core';
import { Item, ItemStatus } from '../models/item.model';

const STORAGE_KEY = 'items';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private items: Item[] = [];
  private hasStorage = false;

  constructor() {
    this.hasStorage = this.checkStorage();
    this.items = this.loadItems();
    if (this.items.length === 0) {
      this.items = this.seedItems();
      this.persist();
    }
  }

  getAll(): Item[] {
    return [...this.items];
  }

  getById(id: string): Item | undefined {
    return this.items.find(item => item.id === id);
  }

  create(payload: Pick<Item, 'title' | 'description' | 'status'>): Item {
    const now = new Date().toISOString();
    const item: Item = {
      id: this.generateId(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: payload.status,
      createdAt: now
    };
    this.items = [item, ...this.items];
    this.persist();
    return item;
  }

  update(id: string, patch: Partial<Pick<Item, 'title' | 'description' | 'status'>>): Item {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error('Item not found');
    }
    const updated: Item = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.items = this.items.map(item => (item.id === id ? updated : item));
    this.persist();
    return updated;
  }

  delete(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
    this.persist();
  }

  private loadItems(): Item[] {
    if (!this.hasStorage) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as Item[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.hasStorage) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  private checkStorage(): boolean {
    try {
      const testKey = '__item_manager_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private seedItems(): Item[] {
    const now = new Date();
    const make = (title: string, description: string, status: ItemStatus, daysAgo: number): Item => ({
      id: this.generateId(),
      title,
      description,
      status,
      createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    });

    return [
      make('Plan onboarding flow', 'Outline the first-time user journey and checklist.', 'Open', 2),
      make('Draft weekly release notes', 'Summarize features and fixes for the weekly update.', 'In Progress', 5),
      make('Polish landing page copy', 'Tighten headline and value props for clarity.', 'Done', 10),
      make('Set up analytics events', 'Track create/edit/delete item actions and page views.', 'Open', 1)
    ];
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `item-${Math.random().toString(36).slice(2, 10)}`;
  }
}
