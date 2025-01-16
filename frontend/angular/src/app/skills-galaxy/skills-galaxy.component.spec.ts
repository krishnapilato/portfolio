import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsGalaxyComponent } from './skills-galaxy.component';

describe('SkillsGalaxyComponent', () => {
  let component: SkillsGalaxyComponent;
  let fixture: ComponentFixture<SkillsGalaxyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsGalaxyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsGalaxyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
