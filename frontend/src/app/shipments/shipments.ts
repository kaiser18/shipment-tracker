import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Shipment } from './model/shipment';
import { NewShipment } from './new-shipment/new-shipment';
import { Shipment as ShipmentDialog } from './shipment/shipment';
import { Shipments as ShipmentsService } from './service/shipments';

@Component({
  imports: [DatePipe, MatButtonModule, MatFormFieldModule, MatSelectModule, MatTableModule],
  selector: 'app-shipments',
  styleUrl: './shipments.css',
  templateUrl: './shipments.html',
})
export class Shipments implements OnInit {
  protected readonly displayedColumns = ['id', 'destination', 'status', 'promisedDate', 'details'];
  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly selectedStatus = signal('all');
  protected readonly delayedOnly = signal(false);
  protected readonly filteredShipments = computed(() => {
    const status = this.selectedStatus();

    return [...this.shipments()]
      .filter(
        (shipment) =>
          (this.delayedOnly() && this.isDelayed(shipment)) ||
          (!this.delayedOnly() && (status === 'all' || shipment.status === status)),
      )
      .sort((first, second) => {
        const firstDelayed = this.isDelayed(first) ? 1 : 0;
        const secondDelayed = this.isDelayed(second) ? 1 : 0;
        return secondDelayed - firstDelayed;
      });
  });
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  private readonly shipmentsService = inject(ShipmentsService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.shipmentsService.getShipments().subscribe({
      next: (shipments) => {
        this.shipments.set(shipments);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load shipments.');
        this.isLoading.set(false);
      },
    });
  }

  protected openShipment(shipment: Shipment): void {
    this.dialog.open(ShipmentDialog, {
      data: shipment,
      width: 'min(92vw, 560px)',
      maxWidth: '100vw',
      autoFocus: 'dialog',
    });
  }

  protected openNewShipment(): void {
    const dialogRef = this.dialog.open(NewShipment, {
      width: 'min(92vw, 620px)',
      maxWidth: '100vw',
    });

    dialogRef.afterClosed().subscribe((created: boolean) => {
      if (created) {
        this.shipmentsService.getShipments().subscribe({
          next: (shipments) => this.shipments.set(shipments),
        });
      }
    });
  }

  protected setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
    this.delayedOnly.set(false);
  }

  protected toggleDelayedOnly(): void {
    this.delayedOnly.update((showDelayed) => !showDelayed);
    this.selectedStatus.set('all');
  }

  protected isDelayed(shipment: Shipment): boolean {
    if (shipment.status.toLowerCase() === 'delivered') {
      return false;
    }

    const promisedDate = new Date(`${shipment.promisedDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return promisedDate < today;
  }
}
