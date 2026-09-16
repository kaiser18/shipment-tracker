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
  id: string;
  name: string;
  quantity: number;
}
