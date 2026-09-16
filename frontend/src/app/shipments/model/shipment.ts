export interface Shipment {
  id: number;
  destination: string;
  status: ShipmentStatus;
  promisedDate: string;
  items?: ShipmentItem[];
  events?: ShipmentEvent[];
  userName?: string;
  userSurname?: string;
}

export type ShipmentStatus = 'pending' | 'in transit' | 'at hub' | 'out for delivery' | 'delivered';

export interface ShipmentItem {
  id: number;
  name: string;
  quantity: number;
}

export interface ShipmentEvent {
  id: number;
  status: ShipmentStatus;
  eventDate: string;
  address: string;
}

export interface ShipmentUser {
  id: number;
  name: string;
  surname: string;
}
