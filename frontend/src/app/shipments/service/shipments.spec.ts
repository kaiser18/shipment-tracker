import { TestBed } from '@angular/core/testing';
import { Shipments } from './shipments';

describe('Shipments', () => {
  let service: Shipments;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Shipments);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
