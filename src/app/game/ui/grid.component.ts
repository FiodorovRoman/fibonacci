import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grid } from '../models/game.models';
import { CellComponent } from './cell.component';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, CellComponent],
  template: `
    <div class="grid-container">
      @for (cell of grid; track $index) {
        <app-cell [cell]="cell" (cellClick)="onCellClick($index)"></app-cell>
      }
    </div>
  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 10px;
      padding: 10px;
      background-color: #bbada0;
      border-radius: 6px;
      width: fit-content;
      margin: 0 auto;
      position: relative;
    }
  `]
})
export class GridComponent implements OnChanges {
  @Input() grid: Grid = [];
  @Output() cellSelect = new EventEmitter<number>();

  @ViewChildren(CellComponent) cellComponents!: QueryList<CellComponent>;

  private prevGrid: Grid | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['grid'] && this.prevGrid) {
      const currentGrid = changes['grid'].currentValue as Grid;
      this.detectAndTriggerAnimations(this.prevGrid, currentGrid);
    }
    if (changes['grid']) {
      // Clone to avoid reference issues if engine mutates (though it shouldn't as it's pure)
      this.prevGrid = (changes['grid'].currentValue as Grid).map(c => ({ ...c }));
    }
  }

  private detectAndTriggerAnimations(oldGrid: Grid, newGrid: Grid) {
    // Wait for QueryList to be updated if needed, but OnChanges happens after input update
    // We might need a small timeout or wait for afterViewChecked if components aren't ready
    setTimeout(() => {
      const cells = this.cellComponents.toArray();
      newGrid.forEach((newCell, i) => {
        const oldCell = oldGrid[i];
        if (!oldCell) return;

        // If value changed
        if (newCell.value !== oldCell.value) {
          // If value became 1 AND it was previously something else, it's likely a reset
          if (newCell.value === 1 && oldCell.value > 1 && !newCell.blocked) {
            cells[i]?.triggerRipple();
          } else {
            // Otherwise it's a result pop
            cells[i]?.triggerPop();
          }
        }
        
        // If unblocked
        if (oldCell.blocked && !newCell.blocked) {
          cells[i]?.triggerPop();
        }
      });
    }, 0);
  }

  onCellClick(index: number) {
    this.cellSelect.emit(index);
  }
}
