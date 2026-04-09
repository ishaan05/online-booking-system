import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminDataService } from '../../core/admin-data.service';
import { AuthService } from '../../core/auth.service';
import { AdminToast, ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-office-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  toast: AdminToast | null = null;
  private toastSub?: Subscription;
  private toastClear?: ReturnType<typeof setTimeout>;

  constructor(
    private toastSvc: ToastService,
    private auth: AuthService,
    private data: AdminDataService,
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.data.loadAll();
    }
    this.toastSub = this.toastSvc.watch().subscribe((t) => {
      if (this.toastClear) {
        clearTimeout(this.toastClear);
      }
      this.toast = t;
      this.toastClear = setTimeout(() => {
        this.toast = null;
      }, 5200);
    });
  }

  ngOnDestroy(): void {
    this.toastSub?.unsubscribe();
    if (this.toastClear) {
      clearTimeout(this.toastClear);
    }
  }

  dismissToast(): void {
    this.toast = null;
    if (this.toastClear) {
      clearTimeout(this.toastClear);
    }
  }
}
