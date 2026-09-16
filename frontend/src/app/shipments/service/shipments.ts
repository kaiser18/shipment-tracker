import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Shipment } from '../model/shipment';

interface ShipmentsResponse {
  data: {
    shipments: Array<{
      id: number;
      address: string;
      promisedDate: string;
      status: string;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class Shipments {
  private readonly http = inject(HttpClient);

  getShipments(): Observable<Shipment[]> {
    return this.http.get<ShipmentsResponse>('http://localhost:3000/shipments').pipe(
      map((response) =>
        response.data.shipments.map((shipment) => ({
          id: shipment.id,
          destination: shipment.address,
          status: shipment.status,
          promisedDate: shipment.promisedDate,
        })),
      ),
    );
  }
}
