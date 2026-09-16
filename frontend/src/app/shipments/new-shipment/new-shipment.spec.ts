import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewShipment } from './new-shipment';

describe('NewShipment', () => {
  let component: NewShipment;
  let fixture: ComponentFixture<NewShipment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewShipment],
    }).compileComponents();

    fixture = TestBed.createComponent(NewShipment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
