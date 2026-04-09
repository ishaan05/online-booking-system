import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService, HallDescriptionRecord } from '../../../core/admin-data.service';

@Component({
  selector: 'app-add-hall-description',
  templateUrl: './add-hall-description.component.html',
  styleUrls: ['./add-hall-description.component.css', '../../../shared/admin-forms.css'],
})
export class AddHallDescriptionComponent implements OnInit, OnDestroy {
  listMode = false;
  rows: HallDescriptionRecord[] = [];
  editingId: string | null = null;

  shortCode = '';
  name = '';
  gpsLocation = '';
  capacity = '';
  address = '';
  areaSqmt = '';
  rooms = '';
  kitchen = '';
  toilet = '';
  bathroom = '';
  facilities = '';
  photoDataUrl = '';
  status = 'Active';
  /** Last chosen file name for UI; cleared on reset */
  pickedPhotoName = '';

  private sub?: Subscription;
  private qpSub?: Subscription;

  constructor(
    private data: AdminDataService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.data.halls.subscribe((r) => (this.rows = r));
    this.qpSub = this.route.queryParamMap.subscribe((q) => {
      const edit = q.get('edit');
      if (edit) {
        this.listMode = false;
        const row = this.data.getHalls().find((x) => x.id === edit);
        if (row) {
          this.editingId = row.id;
          this.shortCode = row.shortCode;
          this.name = row.name;
          this.gpsLocation = row.gpsLocation;
          this.capacity = row.capacity;
          this.address = row.address;
          this.areaSqmt = row.areaSqmt;
          this.rooms = row.rooms;
          this.kitchen = row.kitchen;
          this.toilet = row.toilet;
          this.bathroom = row.bathroom;
          this.facilities = row.facilities;
          this.photoDataUrl = row.photoDataUrl;
          this.status = row.status;
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

  get photoPickLabel(): string {
    if (this.pickedPhotoName) {
      return this.pickedPhotoName;
    }
    if (this.photoDataUrl) {
      return 'Current photo attached';
    }
    return '';
  }

  onPhotoChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.pickedPhotoName = '';
      return;
    }
    this.loadPhotoFile(file);
  }

  onPhotoDragOver(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer) {
      ev.dataTransfer.dropEffect = 'copy';
    }
  }

  onPhotoDrop(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    const file = ev.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    this.loadPhotoFile(file);
    const input = document.getElementById('h-photo') as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  private loadPhotoFile(file: File): void {
    this.pickedPhotoName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoDataUrl = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
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
    this.shortCode = '';
    this.name = '';
    this.gpsLocation = '';
    this.capacity = '';
    this.address = '';
    this.areaSqmt = '';
    this.rooms = '';
    this.kitchen = '';
    this.toilet = '';
    this.bathroom = '';
    this.facilities = '';
    this.photoDataUrl = '';
    this.pickedPhotoName = '';
    this.status = 'Active';
  }

  submit(): void {
    if (!this.shortCode.trim() || !this.name.trim()) {
      return;
    }
    this.data.upsertHall({
      id: this.editingId || undefined,
      shortCode: this.shortCode.trim(),
      name: this.name.trim(),
      gpsLocation: this.gpsLocation.trim(),
      capacity: this.capacity.trim(),
      address: this.address.trim(),
      areaSqmt: this.areaSqmt.trim(),
      rooms: this.rooms.trim(),
      kitchen: this.kitchen.trim(),
      toilet: this.toilet.trim(),
      bathroom: this.bathroom.trim(),
      facilities: this.facilities.trim(),
      photoDataUrl: this.photoDataUrl,
      status: this.status,
    });
    this.resetForm();
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  editRow(row: HallDescriptionRecord): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { edit: row.id } });
  }

  deleteRow(row: HallDescriptionRecord): void {
    this.data.deleteHall(row.id);
  }
}
