export interface Shipment {
  id: number;
  destination: string;
  status: string;
  promisedDate: string;
  items?: ShipmentItem[];
  userName?: string;
  userSurname?: string;
}

export interface ShipmentItem {
  id: number;
  name: string;
  quantity: number;
}

export interface ShipmentUser {
  id: number;
  name: string;
  surname: string;
}
