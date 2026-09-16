import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Shipment } from './model/shipment';
import { Shipments as ShipmentsService } from './service/shipments';

@Component({
  imports: [DatePipe, MatTableModule],
  selector: 'app-shipments',
  styleUrl: './shipments.css',
  templateUrl: './shipments.html',
})
export class Shipments implements OnInit {
  protected readonly displayedColumns = ['id', 'destination', 'status', 'promisedDate'];
  protected readonly shipments = signal<Shipment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  private readonly shipmentsService = inject(ShipmentsService);

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
}
