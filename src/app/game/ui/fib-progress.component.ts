import { Component, Input, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fib-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fib-progress.component.html',
  styleUrl: './fib-progress.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FibProgressComponent implements AfterViewChecked {
  @Input() achievedFibs: number[] = [];
  @Input() nextFib: number = 2;

  readonly sequence: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];

  @ViewChild('ladder') ladderElement!: ElementRef<HTMLDivElement>;

  private lastScrolledFib: number | null = null;

  ngAfterViewChecked(): void {
    if (this.nextFib !== this.lastScrolledFib) {
      if (this.scrollToActive()) {
        this.lastScrolledFib = this.nextFib;
      }
    }
  }

  isAchieved(fib: number): boolean {
    return this.achievedFibs.includes(fib);
  }

  isCurrent(fib: number): boolean {
    return this.nextFib === fib;
  }

  isMilestone(fib: number): boolean {
    return [144, 233, 377, 610, 987, 1597].includes(fib);
  }

  private scrollToActive(): boolean {
    if (!this.ladderElement) return false;
    
    const container = this.ladderElement.nativeElement;
    const activeItem = container.querySelector('.current');
    
    if (activeItem) {
      const activeRect = (activeItem as HTMLElement).getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (containerRect.width === 0) return false;

      // Better calculation: (item center relative to container) - (container center)
      // activeRect.left is relative to viewport
      // containerRect.left is relative to viewport
      const relativeActiveLeft = activeRect.left - containerRect.left + container.scrollLeft;
      const scrollLeft = relativeActiveLeft - (containerRect.width / 2) + (activeRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      return true;
    }
    return false;
  }
}
