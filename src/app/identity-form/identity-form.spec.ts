import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdentityForm } from './identity-form';

describe('IdentityForm', () => {
  let component: IdentityForm;
  let fixture: ComponentFixture<IdentityForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityForm],
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
