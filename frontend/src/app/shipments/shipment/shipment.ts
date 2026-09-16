import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Shipment as ShipmentModel } from '../model/shipment';

@Component({
  imports: [DatePipe, MatButtonModule, MatDialogModule],
  selector: 'app-shipment',
  styleUrl: './shipment.css',
  templateUrl: './shipment.html',
})
export class Shipment {
  protected readonly shipment = inject<ShipmentModel>(MAT_DIALOG_DATA);

  protected isDelayed(): boolean {
    if (this.shipment.status === 'delivered') {
      return false;
    }

    const promisedDate = new Date(`${this.shipment.promisedDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return promisedDate < today;
  }
}
