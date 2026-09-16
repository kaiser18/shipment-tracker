import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ShipmentItem, ShipmentUser } from '../model/shipment';
import { Shipments } from '../service/shipments';

@Component({
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  selector: 'app-new-shipment',
  styleUrl: './new-shipment.css',
  templateUrl: './new-shipment.html',
})
export class NewShipment implements OnInit {
  protected readonly users = signal<ShipmentUser[]>([]);
  protected readonly items = signal<ShipmentItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = inject(FormBuilder).group({
    address: ['', [Validators.required, Validators.maxLength(255)]],
    userId: [null as number | null, Validators.required],
    itemIds: [[] as number[]],
  });
  private readonly shipmentsService = inject(Shipments);
  private readonly dialogRef = inject(MatDialogRef<NewShipment>);

  ngOnInit(): void {
    forkJoin({
      users: this.shipmentsService.getUsers(),
      items: this.shipmentsService.getItems(),
    }).subscribe({
      next: ({ users, items }) => {
        this.users.set(users);
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load users and items.');
        this.isLoading.set(false);
      },
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.shipmentsService
      .createShipment({
        address: value.address ?? '',
        promisedDate: this.getPromisedDate(),
        userId: value.userId as number,
        itemIds: value.itemIds ?? [],
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => {
          this.errorMessage.set('Unable to create shipment.');
          this.isSubmitting.set(false);
        },
      });
  }

  private getPromisedDate(): string {
    const date = new Date();
    let workingDays = 0;

    while (workingDays < 3) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        workingDays += 1;
      }
    }

    date.setHours(17, 0, 0, 0);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
}
