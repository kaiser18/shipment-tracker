import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Shipment, ShipmentEvent } from '../model/shipment';
import { ShipmentItem, ShipmentUser } from '../model/shipment';

const API_BASE_URL = 'http://localhost:3000';

interface ShipmentsResponse {
  data: {
    shipments: Shipment[];
  };
}

@Injectable({ providedIn: 'root' })
export class Shipments {
  private readonly http = inject(HttpClient);

  getShipments(): Observable<Shipment[]> {
    return this.http
      .get<ShipmentsResponse>(`${API_BASE_URL}/shipments?limit=1000`)
      .pipe(map((response) => response.data.shipments));
  }

  getUsers(): Observable<ShipmentUser[]> {
    return this.http
      .get<{ data: { users: ShipmentUser[] } }>(`${API_BASE_URL}/users`)
      .pipe(map((response) => response.data.users));
  }

  getItems(): Observable<ShipmentItem[]> {
    return this.http
      .get<{ data: { items: ShipmentItem[] } }>(`${API_BASE_URL}/shipments/items`)
      .pipe(map((response) => response.data.items));
  }

  createShipment(payload: {
    destination: string;
    promisedDate: string;
    userId: number;
    itemIds: number[];
  }): Observable<Shipment> {
    return this.http
      .post<{ data: { newShipment: Shipment } }>(`${API_BASE_URL}/shipments`, payload)
      .pipe(map((response) => response.data.newShipment));
  }

  recordShipmentEvent(
    shipmentId: number,
    payload: { status: Shipment['status']; address: string; eventDate: string },
  ): Observable<ShipmentEvent> {
    return this.http
      .post<{ data: { event: ShipmentEvent } }>(
        `${API_BASE_URL}/shipments/${shipmentId}/events`,
        payload,
      )
      .pipe(map((response) => response.data.event));
  }
}
