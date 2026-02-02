import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { merge, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';

type StatusFilter = 'All' | 'Open' | 'In Progress' | 'Done';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly itemService = inject(ItemService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  searchControl = new FormControl('', { nonNullable: true });
  statusControl = new FormControl<StatusFilter>('All', { nonNullable: true });

  items: Item[] = [];
  filteredItems: Item[] = [];
  notice: string | null = null;

  ngOnInit(): void {
    this.loadItems();
    const notice = this.route.snapshot.queryParamMap.get('notice');
    if (notice === 'created') {
      this.notice = 'Item created successfully.';
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
    merge(
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
      this.statusControl.valueChanges.pipe(startWith(this.statusControl.value))
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  clearNotice(): void {
    this.notice = null;
  }

  deleteItem(item: Item): void {
    const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    this.itemService.delete(item.id);
    this.loadItems();
  }

  trackById = (_: number, item: Item): string => item.id;

  private loadItems(): void {
    this.items = this.itemService.getAll();
    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchControl.value.trim().toLowerCase();
    const status = this.statusControl.value;
    this.filteredItems = this.items.filter(item => {
      const matchesTerm =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || item.status === status;
      return matchesTerm && matchesStatus;
    });
  }
}
