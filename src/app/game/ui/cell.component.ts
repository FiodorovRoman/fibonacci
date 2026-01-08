import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cell } from '../models/game.models';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="cell" 
      [class.blocked]="cell.blocked"
      [class.pop]="isPop"
      [class.ripple]="isRipple"
      (click)="onClick()"
      (animationend)="onAnimationEnd()"
    >
      <span *ngIf="!cell.blocked" class="value">{{ cell.value }}</span>
      <span *ngIf="cell.blocked" class="lock">🔒</span>
    </div>
  `,
  styles: [`
    .cell {
      width: 80px;
      height: 80px;
      border: 2px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      background-color: #f9f9f9;
      transition: background-color 0.2s, transform 0.1s;
      position: relative;
    }
    .cell:hover {
      background-color: #e0e0e0;
    }
    .blocked {
      background-color: #666;
      color: white;
    }
    .value {
      color: #333;
    }
    .pop {
      animation: pop 0.3s ease-out;
    }
    .ripple {
      animation: ripple 0.4s ease-out;
    }
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    @keyframes ripple {
      0% { background-color: #f9f9f9; }
      50% { background-color: #fff59d; }
      100% { background-color: #f9f9f9; }
    }
  `]
})
export class CellComponent {
  @Input() cell!: Cell;
  @Output() cellClick = new EventEmitter<void>();

  isPop = false;
  isRipple = false;

  triggerPop() {
    this.isPop = true;
  }

  triggerRipple() {
    this.isRipple = true;
  }

  onAnimationEnd() {
    this.isPop = false;
    this.isRipple = false;
  }

  onClick() {
    this.cellClick.emit();
  }
}
