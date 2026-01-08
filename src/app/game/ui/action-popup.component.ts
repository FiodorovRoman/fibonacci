import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameAction, GameConfig, Grid } from '../models/game.models';
import { DEFAULT_CONFIG } from '../engine/init';
import { getNeighborIndexes } from '../engine/grid';

@Component({
  selector: 'app-action-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-overlay" (click)="onClose()">
      <div class="popup-content" (click)="$event.stopPropagation()">
        <div class="preview-panel" *ngIf="!isBlocked">
          <div class="preview-item">
            <span class="preview-label">Predict:</span>
            <span class="preview-value">{{ preview.result }}</span>
          </div>
          <div class="preview-item" *ngIf="preview.resets > 0">
            <span class="preview-label">Resets:</span>
            <span class="preview-value">{{ preview.resets }} cells</span>
          </div>
        </div>

        <div class="actions-grid">
          <ng-container *ngIf="!isBlocked">
            <button class="action-btn inc" (click)="onAction('INC')" (mouseenter)="updatePreview('INC')">
              <span class="icon">+1</span>
              <span class="cost-pill">{{ config.costs.inc }}</span>
            </button>
            <button class="action-btn sum" (click)="onAction('SUM')" (mouseenter)="updatePreview('SUM')">
              <span class="icon">Σ</span>
              <span class="cost-pill">{{ config.costs.sum }}</span>
            </button>
            <button class="action-btn mul" (click)="onAction('MUL')" (mouseenter)="updatePreview('MUL')">
              <span class="icon">×</span>
              <span class="cost-pill">{{ config.costs.mul }}</span>
            </button>
          </ng-container>

          <button *ngIf="isBlocked" class="action-btn unblock" (click)="onAction('UNBLOCK')">
            <span class="icon">🔓</span>
            <span class="label">UNBLOCK</span>
            <span class="cost-pill">{{ config.costs.unblock }}</span>
          </button>
        </div>

        <button class="cancel-btn" (click)="onClose()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(2px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .popup-content {
      background: #fff;
      padding: 24px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      position: relative;
      min-width: 220px;
      transform: scale(1);
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .preview-panel {
      background: #f0f4f8;
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 50px;
      justify-content: center;
    }
    .preview-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }
    .preview-label {
      color: #666;
    }
    .preview-value {
      font-weight: bold;
      color: #1976d2;
    }
    .actions-grid {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    .action-btn {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      border: none;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      padding-top: 5px;
    }
    .action-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }
    .action-btn .icon {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .action-btn.inc { color: #4caf50; }
    .action-btn.sum { color: #2196f3; }
    .action-btn.mul { color: #ff9800; }
    
    .action-btn.unblock {
      width: auto;
      padding: 0 20px;
      flex-direction: row;
      gap: 10px;
      color: #9c27b0;
    }

    .cost-pill {
      background: #eee;
      color: #666;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: bold;
    }
    
    .action-btn:hover .cost-pill {
      background: #333;
      color: #fff;
    }

    .cancel-btn {
      position: absolute;
      top: -12px;
      right: -12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f44336;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    @media (max-width: 480px) {
      .popup-content {
        padding: 16px;
        min-width: 180px;
      }
      .actions-grid {
        gap: 10px;
      }
      .action-btn {
        width: 56px;
        height: 56px;
      }
      .action-btn.unblock {
        padding: 0 12px;
      }
    }
  `]
})
export class ActionPopupComponent implements OnInit {
  @Input() isBlocked: boolean = false;
  @Input() config: GameConfig = DEFAULT_CONFIG;
  @Input() grid: Grid = [];
  @Input() cellIndex: number | null = null;
  
  @Output() actionSelect = new EventEmitter<GameAction>();
  @Output() close = new EventEmitter<void>();

  preview = { result: 0, resets: 0 };

  ngOnInit() {
    if (!this.isBlocked) {
      this.updatePreview('INC');
    }
  }

  onAction(action: GameAction) {
    this.actionSelect.emit(action);
  }

  onClose() {
    this.close.emit();
  }

  updatePreview(action: GameAction) {
    if (this.cellIndex === null || this.grid.length === 0) return;

    if (action === 'INC') {
      this.preview = {
        result: this.grid[this.cellIndex].value + 1,
        resets: 0
      };
    } else if (action === 'SUM' || action === 'MUL') {
      const neighbors = getNeighborIndexes(this.cellIndex, this.grid, this.config.size);
      let result = 0;
      if (action === 'SUM') {
        result = neighbors.reduce((acc, idx) => acc + this.grid[idx].value, 0);
      } else {
        result = neighbors.reduce((acc, idx) => acc * this.grid[idx].value, 1);
      }
      this.preview = {
        result,
        resets: neighbors.length - 1 // All except the clicked one
      };
    }
  }
}
