import { ComponentFixture, TestBed } from '@angular/core/testing';
import { matchesShipmentFilter, Shipments } from './shipments';

describe('Shipments', () => {
  let component: Shipments;
  let fixture: ComponentFixture<Shipments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shipments],
    }).compileComponents();

    fixture = TestBed.createComponent(Shipments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('matches a shipment against the current status and delayed filter', () => {
    const shipment = {
      id: 3,
      destination: 'Paris',
      status: 'in transit',
      promisedDate: '2020-01-01T00:00:00.000Z',
    } as const;

    expect(matchesShipmentFilter(shipment, 'all', false)).toBeTrue();
    expect(matchesShipmentFilter(shipment, 'delivered', false)).toBeFalse();
    expect(matchesShipmentFilter(shipment, 'all', true)).toBeTrue();
    expect(matchesShipmentFilter(shipment, 'in transit', false)).toBeTrue();
  });
});
