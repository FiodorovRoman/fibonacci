import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FibProgressComponent } from './fib-progress.component';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('FibProgressComponent', () => {
  let component: FibProgressComponent;
  let fixture: ComponentFixture<FibProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FibProgressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FibProgressComponent);
    component = fixture.componentInstance;
    
    // Mock scrollTo on native element since jsdom doesn't implement it
    const ladder = fixture.nativeElement.querySelector('.ladder-container');
    if (ladder) {
      ladder.scrollTo = vi.fn();
    }
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the full Fibonacci sequence', () => {
    const items = fixture.debugElement.queryAll(By.css('.fib-item'));
    expect(items.length).toBe(component.sequence.length);
    expect(items[0].nativeElement.textContent).toContain('1');
    expect(items[items.length - 1].nativeElement.textContent).toContain('610');
  });

  it('should highlight the current target (nextFib)', () => {
    fixture.componentRef.setInput('nextFib', 5);
    fixture.detectChanges();
    
    const currentItem = fixture.debugElement.query(By.css('.fib-item.current'));
    expect(currentItem).toBeTruthy();
    expect(currentItem.nativeElement.textContent).toContain('5');
  });

  it('should mark achieved Fibonacci numbers', () => {
    fixture.componentRef.setInput('achievedFibs', [1, 2, 3]);
    fixture.componentRef.setInput('nextFib', 5);
    fixture.detectChanges();

    const achievedItems = fixture.debugElement.queryAll(By.css('.fib-item.achieved'));
    // 1, 2, 3 are in sequence and in achievedFibs
    expect(achievedItems.length).toBe(3);
    expect(achievedItems[0].nativeElement.textContent).toContain('1');
    expect(achievedItems[0].query(By.css('.fib-status'))).toBeTruthy();
    expect(achievedItems[1].nativeElement.textContent).toContain('2');
    expect(achievedItems[2].nativeElement.textContent).toContain('3');
  });

  it('should mark future Fibonacci numbers', () => {
    fixture.componentRef.setInput('achievedFibs', [2]);
    fixture.componentRef.setInput('nextFib', 3);
    fixture.detectChanges();

    const futureItems = fixture.debugElement.queryAll(By.css('.fib-item.future'));
    // sequence: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]
    // achieved: 2, current: 3, future: 1, 5, 8... (12 items)
    expect(futureItems.length).toBe(component.sequence.length - 2);
    expect(futureItems[0].nativeElement.textContent).toContain('1');
    expect(futureItems[1].nativeElement.textContent).toContain('5');
  });

  it('should call scrollTo when view is checked', () => {
    const ladder = fixture.componentInstance.ladderElement.nativeElement;
    const scrollToSpy = vi.spyOn(ladder, 'scrollTo');
    
    // Ensure width > 0 so it doesn't return early
    vi.spyOn(ladder, 'getBoundingClientRect').mockReturnValue({ width: 400, left: 0 } as DOMRect);
    
    fixture.componentRef.setInput('nextFib', 13);
    fixture.detectChanges();
    
    // ngAfterViewChecked will be called after detectChanges
    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('should center the current item when scrolling', () => {
    const ladder = fixture.componentInstance.ladderElement.nativeElement;
    const scrollToSpy = vi.spyOn(ladder, 'scrollTo');
    
    // Mock getBoundingClientRect for ladder and item
    vi.spyOn(ladder, 'getBoundingClientRect').mockReturnValue({ width: 400, left: 0 } as DOMRect);
    
    // We need to mock a current item
    fixture.componentRef.setInput('nextFib', 8);
    fixture.detectChanges();
    
    const currentItem = fixture.debugElement.query(By.css('.fib-item.current')).nativeElement;
    vi.spyOn(currentItem, 'getBoundingClientRect').mockReturnValue({ width: 50, left: 200 } as DOMRect);
    
    // Manually trigger the private method if possible or just trigger another detectChanges
    (component as any).scrollToActive();

    // relativeActiveLeft = item.left - container.left + container.scrollLeft = 200 - 0 + 0 = 200
    // scrollLeft = relativeActiveLeft - (containerWidth / 2) + (itemWidth / 2)
    // scrollLeft = 200 - (400 / 2) + (50 / 2) = 200 - 200 + 25 = 25
    expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({
      left: 25,
      behavior: 'smooth'
    }));
  });
});
