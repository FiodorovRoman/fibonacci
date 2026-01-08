import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionPopupComponent } from './action-popup.component';
import { DEFAULT_CONFIG } from '../engine/init';
import { By } from '@angular/platform-browser';

describe('ActionPopupComponent', () => {
  let component: ActionPopupComponent;
  let fixture: ComponentFixture<ActionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionPopupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionPopupComponent);
    component = fixture.componentInstance;
    
    // Setup initial state for an unblocked cell
    component.isBlocked = false;
    component.config = DEFAULT_CONFIG;
    component.grid = [
      { blocked: false, value: 2 }, { blocked: false, value: 3 }, { blocked: true, value: 0 }, { blocked: true, value: 0 },
      { blocked: false, value: 4 }, { blocked: true, value: 0 }, { blocked: true, value: 0 }, { blocked: true, value: 0 },
      { blocked: true, value: 0 }, { blocked: true, value: 0 }, { blocked: true, value: 0 }, { blocked: true, value: 0 },
      { blocked: true, value: 0 }, { blocked: true, value: 0 }, { blocked: true, value: 0 }, { blocked: true, value: 0 }
    ];
    component.cellIndex = 0;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show INC preview by default', () => {
    const previewValue = fixture.debugElement.query(By.css('.preview-value')).nativeElement;
    expect(previewValue.textContent).toBe('3'); // 2 + 1
  });

  it('should update preview on hover of SUM', () => {
    const sumBtn = fixture.debugElement.query(By.css('.action-btn.sum'));
    sumBtn.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();
    
    // Neighbors of index 0 in 4x4 are 0, 1, 4, 5 (5 is blocked)
    // Values: grid[0]=2, grid[1]=3, grid[4]=4. Sum = 9.
    const previewValues = fixture.debugElement.queryAll(By.css('.preview-value'));
    expect(previewValues[0].nativeElement.textContent).toBe('9');
    expect(previewValues[1].nativeElement.textContent).toBe('2 cells'); // grid[1] and grid[4]
  });

  it('should update preview on hover of MUL', () => {
    const mulBtn = fixture.debugElement.query(By.css('.action-btn.mul'));
    mulBtn.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();
    
    // Neighbors: 2, 3, 4. Product = 24.
    const previewValues = fixture.debugElement.queryAll(By.css('.preview-value'));
    expect(previewValues[0].nativeElement.textContent).toBe('24');
    expect(previewValues[1].nativeElement.textContent).toBe('2 cells');
  });

  it('should emit actionSelect when button is clicked', () => {
    const actionSpy = vi.spyOn(component.actionSelect, 'emit');
    const incBtn = fixture.debugElement.query(By.css('.action-btn.inc'));
    incBtn.nativeElement.click();
    expect(actionSpy).toHaveBeenCalledWith('INC');
  });

  it('should show UNBLOCK when isBlocked is true', () => {
    fixture.componentRef.setInput('isBlocked', true);
    fixture.detectChanges();
    
    const unblockBtn = fixture.debugElement.query(By.css('.action-btn.unblock'));
    expect(unblockBtn).toBeTruthy();
    expect(unblockBtn.nativeElement.textContent).toContain('UNBLOCK');
    expect(unblockBtn.nativeElement.textContent).toContain(DEFAULT_CONFIG.costs.unblock.toString());
  });

  it('should emit close when cancel button is clicked', () => {
    const closeSpy = vi.spyOn(component.close, 'emit');
    const cancelBtn = fixture.debugElement.query(By.css('.cancel-btn'));
    cancelBtn.nativeElement.click();
    expect(closeSpy).toHaveBeenCalled();
  });
});
