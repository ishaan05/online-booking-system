import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { CardsComponent } from './cards.component';

describe('CardsComponent', () => {
  let component: CardsComponent;
  let fixture: ComponentFixture<CardsComponent>;

  beforeEach(() => {
    const sanitizerStub = {
      bypassSecurityTrustResourceUrl: (u: string) => u as unknown as ReturnType<
        DomSanitizer['bypassSecurityTrustResourceUrl']
      >,
    };
    TestBed.configureTestingModule({
      declarations: [CardsComponent],
      providers: [{ provide: DomSanitizer, useValue: sanitizerStub }],
    });
    fixture = TestBed.createComponent(CardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
