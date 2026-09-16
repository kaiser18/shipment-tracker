import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Shipment } from './shipment';

describe('Shipment', () => {
  let component: Shipment;
  let fixture: ComponentFixture<Shipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shipment],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 1,
            destination: '12 Oak Avenue, Portland',
            status: 'pending',
            promisedDate: '2026-09-18',
          },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shipment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
