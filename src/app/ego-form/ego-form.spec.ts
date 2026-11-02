import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EgoForm } from './ego-form';

describe('EgoForm', () => {
  let component: EgoForm;
  let fixture: ComponentFixture<EgoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EgoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(EgoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
