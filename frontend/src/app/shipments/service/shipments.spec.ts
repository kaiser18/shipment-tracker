import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Shipments } from './shipments';

describe('Shipments', () => {
  let service: Shipments;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Shipments);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads users from the users endpoint', () => {
    const http = TestBed.inject(HttpTestingController);
    const users = [{ id: 1, name: 'Maya', surname: 'Patel' }];

    service.getUsers().subscribe((result) => expect(result).toEqual(users));

    const request = http.expectOne('http://localhost:3000/users');
    expect(request.request.method).toBe('GET');
    request.flush({ data: { users } });
  });

  it('loads items from the shipments items endpoint', () => {
    const http = TestBed.inject(HttpTestingController);
    const items = [{ id: 1, name: 'Laptop stand', quantity: 1 }];

    service.getItems().subscribe((result) => expect(result).toEqual(items));

    const request = http.expectOne('http://localhost:3000/shipments/items');
    expect(request.request.method).toBe('GET');
    request.flush({ data: { items } });
  });

  it('records a shipment event', () => {
    const http = TestBed.inject(HttpTestingController);
    const payload = {
      status: 'in transit' as const,
      address: 'Regional hub',
      eventDate: '2026-09-16T10:00:00.000Z',
    };
    const event = { id: 2, ...payload };

    service.recordShipmentEvent(4, payload).subscribe((result) => expect(result).toEqual(event));

    const request = http.expectOne('http://localhost:3000/shipments/4/events');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { event } });
  });
});
