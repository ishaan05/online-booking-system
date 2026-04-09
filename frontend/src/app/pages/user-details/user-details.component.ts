import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PublicAuthSessionService, initialsFromFullName } from '../../core/public-auth-session.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('root', { read: ElementRef }) private root?: ElementRef<HTMLElement>;
  @ViewChild('videoRef') private videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasRef') private canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  fullName = '';
  mobile = '';
  email = '';
  photoUrl: string | null = null;
  initials = '';

  photoMenuOpen = false;
  cameraOpen = false;
  fileError = '';

  private stream: MediaStream | null = null;

  constructor(private auth: PublicAuthSessionService) {}

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (u) {
      this.fullName = u.fullName;
      this.mobile = u.mobileNumber;
      this.email = u.email;
      this.photoUrl = this.auth.getProfilePhotoDataUrl(u.registrationId);
      this.initials = initialsFromFullName(u.fullName);
    }
  }

  ngOnDestroy(): void {
    this.stopStream();
  }

  togglePhotoMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.photoMenuOpen = !this.photoMenuOpen;
    this.fileError = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.photoMenuOpen) {
      return;
    }
    const t = event.target as Node;
    if (this.root?.nativeElement.contains(t)) {
      return;
    }
    this.photoMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cameraOpen) {
      this.closeCamera();
    }
    this.photoMenuOpen = false;
  }

  openFilePicker(): void {
    this.photoMenuOpen = false;
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const ok = /image\/(jpeg|png)/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!ok) {
      this.fileError = 'Please choose a JPG or PNG image only.';
      return;
    }
    this.fileError = '';
    const reader = new FileReader();
    reader.onload = () => {
      const u = this.auth.currentUser();
      if (u && typeof reader.result === 'string') {
        this.auth.setProfilePhotoDataUrl(u.registrationId, reader.result);
        this.photoUrl = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  openCamera(): void {
    this.photoMenuOpen = false;
    this.cameraOpen = true;
    setTimeout(() => this.startCamera(), 0);
  }

  private startCamera(): void {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.fileError = 'Camera is not supported in this browser.';
      this.cameraOpen = false;
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => {
        this.stream = s;
        const v = this.videoRef?.nativeElement;
        if (v) {
          v.srcObject = s;
          void v.play();
        }
      })
      .catch(() => {
        this.fileError = 'Camera permission was denied or no camera is available.';
        this.cameraOpen = false;
      });
  }

  capturePhoto(): void {
    const v = this.videoRef?.nativeElement;
    const c = this.canvasRef?.nativeElement;
    if (!v || !c || !v.videoWidth) {
      return;
    }
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.88);
    const u = this.auth.currentUser();
    if (u) {
      this.auth.setProfilePhotoDataUrl(u.registrationId, dataUrl);
      this.photoUrl = dataUrl;
    }
    this.closeCamera();
  }

  closeCamera(): void {
    this.stopStream();
    this.cameraOpen = false;
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    const v = this.videoRef?.nativeElement;
    if (v) {
      v.srcObject = null;
    }
  }

  saveProfile(): void {
    this.auth.updateProfile({
      fullName: this.fullName.trim(),
      mobileNumber: this.mobile.trim(),
      email: this.email.trim(),
    });
    const u = this.auth.currentUser();
    if (u) {
      this.initials = initialsFromFullName(u.fullName);
    }
  }
}
