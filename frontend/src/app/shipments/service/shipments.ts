import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Shipment, ShipmentEvent } from '../model/shipment';
import { ShipmentItem, ShipmentUser } from '../model/shipment';

interface ShipmentsResponse {
  data: {
    shipments: Array<Shipment & { address?: string }>;
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
          destination: shipment.destination ?? shipment.address ?? '',
          status: shipment.status,
          promisedDate: shipment.promisedDate,
          userName: shipment.userName ?? '',
          userSurname: shipment.userSurname ?? '',
          items: shipment.items ?? [],
          events: shipment.events ?? [],
        })),
      ),
    );
  }

  getUsers(): Observable<ShipmentUser[]> {
    return this.http
      .get<{ data: { users: ShipmentUser[] } }>('http://localhost:3000/users')
      .pipe(map((response) => response.data.users));
  }

  getItems(): Observable<ShipmentItem[]> {
    return this.http
      .get<{ data: { items: ShipmentItem[] } }>('http://localhost:3000/shipments/items')
      .pipe(map((response) => response.data.items));
  }

  createShipment(payload: {
    address: string;
    promisedDate: string;
    userId: number;
    itemIds: number[];
  }): Observable<Shipment> {
    return this.http
      .post<{ data: { newShipment: Shipment } }>('http://localhost:3000/shipments', payload)
      .pipe(map((response) => response.data.newShipment));
  }

  recordShipmentEvent(
    shipmentId: number,
    payload: { status: Shipment['status']; address: string; eventDate: string },
  ): Observable<ShipmentEvent> {
    return this.http
      .post<{ data: { event: ShipmentEvent } }>(
        `http://localhost:3000/shipments/${shipmentId}/events`,
        payload,
      )
      .pipe(map((response) => response.data.event));
  }
}
