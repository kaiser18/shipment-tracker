export interface Shipment {
  id: number;
  destination: string;
  status: string;
  promisedDate: string;
  items?: ShipmentItem[];
  customerId?: number;
}

export interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
}
