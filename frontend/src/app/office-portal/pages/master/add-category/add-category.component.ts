import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService, CategoryRecord } from '../../../core/admin-data.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css', '../../../shared/admin-forms.css'],
})
export class AddCategoryComponent implements OnInit, OnDestroy {
  listMode = false;
  rows: CategoryRecord[] = [];
  editingId: string | null = null;
  categoryType = '';

  private sub?: Subscription;
  private qpSub?: Subscription;

  constructor(
    private data: AdminDataService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.data.categories.subscribe((r) => (this.rows = r));
    this.qpSub = this.route.queryParamMap.subscribe((q) => {
      const edit = q.get('edit');
      if (edit) {
        this.listMode = false;
        const row = this.data.getCategories().find((x) => x.id === edit);
        if (row) {
          this.editingId = row.id;
          this.categoryType = row.categoryType;
        }
      } else {
        this.editingId = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.qpSub?.unsubscribe();
  }

  showView(): void {
    this.listMode = true;
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  backToForm(): void {
    this.listMode = false;
    this.resetForm();
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  resetForm(): void {
    this.editingId = null;
    this.categoryType = '';
  }

  submit(): void {
    if (!this.categoryType.trim()) {
      return;
    }
    this.data.upsertCategory({
      id: this.editingId || undefined,
      categoryType: this.categoryType.trim(),
    });
    this.resetForm();
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  editRow(row: CategoryRecord): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { edit: row.id } });
  }

  deleteRow(row: CategoryRecord): void {
    this.data.deleteCategory(row.id);
  }
}
