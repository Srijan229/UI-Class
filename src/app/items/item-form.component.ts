import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Item, ItemStatus } from '../models/item.model';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemService = inject(ItemService);

  isEdit = false;
  notFound = false;
  item?: Item;

  statusOptions: ItemStatus[] = ['Open', 'In Progress', 'Done'];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    status: ['Open' as ItemStatus, [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.item = this.itemService.getById(id);
      if (!this.item) {
        this.notFound = true;
        return;
      }
      this.form.patchValue({
        title: this.item.title,
        description: this.item.description,
        status: this.item.status
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (this.isEdit && this.item) {
      const updated = this.itemService.update(this.item.id, value);
      this.router.navigate(['/items', updated.id], { queryParams: { notice: 'updated' } });
      return;
    }
    this.itemService.create(value);
    this.router.navigate(['/items'], { queryParams: { notice: 'created' } });
  }
}
