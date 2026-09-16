import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Shipment } from './model/shipment';
import { NewShipment } from './new-shipment/new-shipment';
import { Shipment as ShipmentDialog } from './shipment/shipment';
import { Shipments as ShipmentsService } from './service/shipments';

@Component({
  imports: [DatePipe, MatButtonModule, MatTableModule],
  selector: 'app-shipments',
  styleUrl: './shipments.css',
  templateUrl: './shipments.html',
})
export class Shipments implements OnInit {
  protected readonly displayedColumns = ['id', 'destination', 'status', 'promisedDate', 'details'];
  protected readonly shipments = signal<Shipment[]>([]);
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
}
