import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionTextAreaComponent } from './instruction-text-area.component';

describe('InstructionTextAreaComponent', () => {
  let component: InstructionTextAreaComponent;
  let fixture: ComponentFixture<InstructionTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstructionTextAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
