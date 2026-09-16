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
}
