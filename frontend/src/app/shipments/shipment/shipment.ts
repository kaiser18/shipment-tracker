import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Shipment as ShipmentModel } from '../model/shipment';
import { Shipments as ShipmentsService } from '../service/shipments';
import { toLocalDateTimeInput } from '../utils/date';

@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  selector: 'app-shipment',
  styleUrl: './shipment.css',
  templateUrl: './shipment.html',
})
export class Shipment {
  protected readonly shipment = inject<ShipmentModel>(MAT_DIALOG_DATA);
  protected readonly isRecording = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly nextStatus = computed(() => {
    const statuses: ShipmentModel['status'][] = [
      'pending',
      'in transit',
      'at hub',
      'out for delivery',
      'delivered',
    ];
    return statuses[statuses.indexOf(this.shipment.status) + 1] ?? null;
  });
  protected readonly eventForm = inject(FormBuilder).group({
    status: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    eventDate: [toLocalDateTimeInput(), Validators.required],
  });
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly dialogRef = inject(MatDialogRef<Shipment>);

  protected isDelayed(): boolean {
    if (this.shipment.status === 'delivered') {
      return false;
    }

    const promisedDate = new Date(this.shipment.promisedDate);
    const today = new Date();
    return promisedDate < today;
  }

  protected recordEvent(): void {
    this.errorMessage.set('');
    this.isRecording.set(true);
    this.eventForm.patchValue({ status: this.nextStatus() ?? '' });
  }

  protected cancelEvent(): void {
    this.isRecording.set(false);
    this.errorMessage.set('');
  }

  protected submitEvent(): void {
    if (this.eventForm.invalid || !this.nextStatus()) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const value = this.eventForm.getRawValue();
    this.isSubmitting.set(true);
    this.shipmentsService
      .recordShipmentEvent(this.shipment.id, {
        status: this.nextStatus()!,
        address: value.address ?? '',
        eventDate: new Date(value.eventDate ?? '').toISOString(),
      })
      .subscribe({
        next: (event) => {
          this.shipment.events = [...(this.shipment.events ?? []), event];
          this.shipment.status = event.status;
          this.isRecording.set(false);
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (error: { error?: { message?: string } }) => {
          this.errorMessage.set(error.error?.message ?? 'Unable to record event.');
          this.isSubmitting.set(false);
        },
      });
  }

}
