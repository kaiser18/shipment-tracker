import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Shipment } from './model/shipment';
import { NewShipment } from './new-shipment/new-shipment';
import { Shipment as ShipmentDialog } from './shipment/shipment';
import { Shipments as ShipmentsService } from './service/shipments';

@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
  ],
  selector: 'app-shipments',
  styleUrl: './shipments.css',
  templateUrl: './shipments.html',
})
export class Shipments implements OnInit {
  protected readonly displayedColumns = ['id', 'destination', 'status', 'promisedDate', 'details'];
  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly totalShipments = computed(() => this.shipments().length);
  protected readonly delayedShipments = computed(
    () => this.shipments().filter((shipment) => this.isDelayed(shipment)).length,
  );
  protected readonly deliveredShipments = computed(
    () => this.shipments().filter((shipment) => shipment.status === 'delivered').length,
  );
  protected readonly selectedStatus = signal('all');
  protected readonly delayedOnly = signal(false);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly pageSizeOptions = [5, 10, 25];
  protected readonly filteredShipments = computed(() => {
    const status = this.selectedStatus();

    return [...this.shipments()]
      .filter(
        (shipment) =>
          (this.delayedOnly() && this.isDelayed(shipment)) ||
          (!this.delayedOnly() && (status === 'all' || shipment.status === status)),
      )
      .sort((first, second) => {
        const getPriority = (shipment: Shipment): number => {
          if (this.isDelayed(shipment)) return 2;
          if (shipment.status === 'delivered') return 0;
          return 1;
        };

        return getPriority(second) - getPriority(first);
      });
  });
  protected readonly paginatedShipments = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredShipments().slice(start, start + this.pageSize());
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
    const dialogRef = this.dialog.open(ShipmentDialog, {
      data: shipment,
      width: 'min(92vw, 560px)',
      maxWidth: '100vw',
      autoFocus: 'dialog',
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.shipmentsService.getShipments().subscribe({
          next: (shipments) => this.shipments.set(shipments),
        });
      }
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
    this.pageIndex.set(0);
  }

  protected toggleDelayedOnly(): void {
    this.delayedOnly.update((showDelayed) => !showDelayed);
    this.selectedStatus.set('all');
    this.pageIndex.set(0);
  }

  protected setPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected isDelayed(shipment: Shipment): boolean {
    if (shipment.status.toLowerCase() === 'delivered') {
      return false;
    }

    const promisedDate = new Date(shipment.promisedDate);
    const today = new Date();
    return promisedDate < today;
  }
}
