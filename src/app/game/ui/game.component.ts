import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState, GameAction, GameConfig, FloatingScore } from '../models/game.models';
import { createNewGame, DEFAULT_CONFIG } from '../engine/init';
import { applyAction } from '../engine/actions';
import { undo } from '../engine/undo';
import { GridComponent } from './grid.component';
import { ActionPopupComponent } from './action-popup.component';
import { FibProgressComponent } from './fib-progress.component';
import { HapticsService } from '../../services/haptics.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, GridComponent, ActionPopupComponent, FibProgressComponent],
  providers: [HapticsService],
  template: `
    <div class="game-container">
      <div class="main-card">
        <h1 class="game-title">Fibonacci Game</h1>
        
        <div class="hero-score">
          <div class="score-label">SCORE</div>
          <div class="score-value">{{ state.score }}</div>
        </div>

        <div class="progress-section">
          <div class="objective-line">
            Next bonus: <strong>{{ state.nextFib }}</strong> <span class="bonus-tag">+{{ state.nextFib }} PTS</span>
          </div>
          
          <app-fib-progress
            [achievedFibs]="state.achievedFibs"
            [nextFib]="state.nextFib">
          </app-fib-progress>

          <div class="stats-chips">
            <div class="chip">Best: {{ state.bestFib }}</div>
            <div class="chip">Target: {{ state.nextFib }}</div>
          </div>

          <div class="action-counters">
            <div class="counter-item">
              <span class="counter-label">INC:</span>
              <span class="counter-value">{{ state.counters.inc }}</span>
            </div>
            <div class="counter-item">
              <span class="counter-label">SUM:</span>
              <span class="counter-value">{{ state.counters.sum }}</span>
            </div>
            <div class="counter-item">
              <span class="counter-label">MUL:</span>
              <span class="counter-value">{{ state.counters.mul }}</span>
            </div>
          </div>
        </div>

        <div class="controls">
          <button class="btn-undo" (click)="onUndo()" [disabled]="!state.lastMove">Undo</button>
          <button class="btn-new" (click)="onNewGame()">New Game</button>
        </div>

        <div class="grid-wrapper">
          <app-grid 
            [grid]="state.grid" 
            (cellSelect)="onCellSelect($event)"
          ></app-grid>

          <!-- Floating scores -->
          <div 
            *ngFor="let fs of floatingScores; trackBy: trackByFs"
            class="floating-score"
            [class.bonus]="fs.isBonus"
            [class.penalty]="fs.isPenalty"
            [style.left.px]="getScoreX(fs.index)"
            [style.top.px]="getScoreY(fs.index)"
            (animationend)="onFsAnimationEnd(fs.id)"
          >
            {{ fs.value }}
          </div>

          <!-- Celebration particles -->
          <div *ngIf="showConfetti" class="confetti-container">
            <div *ngFor="let p of particles" class="particle" [style]="p.style"></div>
          </div>
        </div>

        <div *ngIf="state.gameOver" class="game-over-overlay">
          <div class="game-over-card">
            <h2>GAME OVER</h2>
            <p class="game-over-reason">Not enough score to perform actions</p>
            
            <div class="game-over-stats">
              <div class="stat-item">
                <span class="stat-label">Best Fibonacci</span>
                <span class="stat-value">{{ state.bestFib }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Biggest Number</span>
                <span class="stat-value">{{ getBiggestNumber() }}</span>
              </div>
            </div>

            <div class="game-over-actions">
              <button class="btn-primary" (click)="onNewGame()">Restart</button>
              <button 
                *ngIf="state.lastMove" 
                class="btn-secondary" 
                (click)="onUndo()"
              >
                Undo last move
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-action-popup 
        *ngIf="selectedCellIndex !== null"
        [isBlocked]="state.grid[selectedCellIndex].blocked"
        [config]="config"
        [grid]="state.grid"
        [cellIndex]="selectedCellIndex"
        (actionSelect)="onActionSelect($event)"
        (close)="selectedCellIndex = null"
      ></app-action-popup>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 20px;
      background-color: #f5f5f7;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333;
    }
    .main-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      padding: 30px;
      width: 100%;
      max-width: 480px;
      text-align: center;
    }
    @media (max-width: 480px) {
      .game-container {
        padding: 10px;
      }
      .main-card {
        padding: 15px;
      }
      .score-value {
        font-size: 3rem;
      }
      .game-title {
        margin-bottom: 10px;
      }
      .hero-score {
        margin-bottom: 10px;
      }
      .progress-section {
        padding: 10px;
        margin-bottom: 10px;
      }
    }
    .game-title {
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      color: #999;
    }
    .hero-score {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    @media (min-width: 481px) {
       .main-card {
         max-height: 95vh;
         overflow-y: auto;
       }
    }
    @media (max-width: 480px) {
      .game-container {
        padding: 5px;
      }
      .main-card {
        padding: 10px;
        border-radius: 0;
        box-shadow: none;
        min-height: 100vh;
      }
      .hero-score {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        background: #f0f0f0;
        padding: 5px 12px;
        border-radius: 12px;
      }
      .score-label {
        margin-right: 10px;
      }
      .score-value {
        font-size: 1.8rem;
      }
      .progress-section {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 5px;
        margin-bottom: 5px;
      }
      .objective-line {
        display: none; /* Already have Target chip and progress ladder */
      }
      .stats-chips {
        margin-top: 0;
        flex-direction: column;
        gap: 2px;
      }
      .chip {
        font-size: 0.65rem;
        padding: 1px 6px;
        white-space: nowrap;
      }
      .action-counters {
        margin-top: 5px;
        padding-top: 5px;
        gap: 10px;
      }
      .counter-value {
        font-size: 0.85rem;
      }
      .controls {
        margin-bottom: 8px;
      }
      .controls button {
        padding: 6px 12px;
        font-size: 0.8rem;
      }
      app-fib-progress {
        flex: 1;
        min-width: 0;
      }
      .game-title {
        display: none; /* Hide title on mobile to save space */
      }
    }
    .score-label {
      font-size: 0.8rem;
      font-weight: bold;
      color: #bbb;
      letter-spacing: 1px;
    }
    .score-value {
      font-size: 4.5rem;
      font-weight: 900;
      line-height: 1;
      color: #222;
      text-shadow: 2px 2px 0px rgba(0,0,0,0.05);
    }
    .progress-section {
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 16px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .objective-line {
      font-size: 0.9rem;
      margin-bottom: 10px;
      color: #555;
    }
    .bonus-tag {
      background: #4caf50;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      margin-left: 5px;
      vertical-align: middle;
    }
    .stats-chips {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 5px;
    }
    .chip {
      background: #eee;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #666;
    }
    .action-counters {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #eee;
    }
    .counter-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .counter-label {
      font-size: 0.6rem;
      font-weight: bold;
      color: #999;
      text-transform: uppercase;
    }
    .counter-value {
      font-size: 1rem;
      font-weight: 800;
      color: #555;
    }
    .controls {
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .controls button {
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 12px;
      border: 1px solid #ddd;
      background: white;
      transition: all 0.2s;
    }
    .controls button:hover:not(:disabled) {
      background: #f8f8f8;
      border-color: #bbb;
    }
    .controls button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-new {
      background: #222 !important;
      color: white !important;
      border-color: #222 !important;
    }
    .btn-new:hover {
      background: #444 !important;
    }
    .grid-wrapper {
      position: relative;
      display: inline-block;
      margin-top: 5px;
    }
    .floating-score {
      position: absolute;
      font-weight: 900;
      font-size: 1.5rem;
      color: #4caf50;
      pointer-events: none;
      z-index: 50;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      animation: floatUp 1s ease-out forwards;
      white-space: nowrap;
    }
    .floating-score.penalty {
      color: #f44336;
    }
    .floating-score.bonus {
      font-size: 1.8rem;
      color: #ff9800;
      text-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
    }
    @keyframes floatUp {
      0% { transform: translate(-50%, 0); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translate(-50%, -60px); opacity: 0; }
    }
    .confetti-container {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 60;
    }
    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      animation: explode 0.8s ease-out forwards;
    }
    @keyframes explode {
      0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) rotate(var(--tr)); opacity: 0; }
    }
    .game-over-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
      border-radius: 16px;
      animation: fadeIn 0.3s ease-out;
    }
    .game-over-card {
      background: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(245, 34, 45, 0.15);
      border: 2px solid #ffa39e;
      max-width: 90%;
      width: 320px;
      text-align: center;
      animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .game-over-card h2 {
      color: #f5222d;
      font-size: 2rem;
      margin: 0 0 10px 0;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .game-over-reason {
      color: #776e65;
      font-size: 1rem;
      margin-bottom: 25px;
      line-height: 1.4;
    }
    .game-over-stats {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 30px;
      background: #fff1f0;
      padding: 15px;
      border-radius: 12px;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .stat-label {
      color: #8c8c8c;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .stat-value {
      color: #262626;
      font-size: 1.2rem;
      font-weight: 800;
    }
    .game-over-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .game-over-actions button {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    .btn-primary {
      background: #f5222d;
      color: white;
      box-shadow: 0 4px 10px rgba(245, 34, 45, 0.3);
    }
    .btn-primary:hover {
      background: #cf1322;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(245, 34, 45, 0.4);
    }
    .btn-secondary {
      background: #fff;
      color: #595959;
      border: 1px solid #d9d9d9 !important;
    }
    .btn-secondary:hover {
      background: #f5f5f5;
      border-color: #bfbfbf !important;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class GameComponent {
  state: GameState = createNewGame();
  config: GameConfig = DEFAULT_CONFIG;
  selectedCellIndex: number | null = null;
  floatingScores: FloatingScore[] = [];
  showConfetti = false;
  particles: any[] = [];
  private fsIdCounter = 0;

  constructor(private haptics: HapticsService) {}

  onNewGame() {
    this.haptics.tap();
    this.state = createNewGame();
    this.selectedCellIndex = null;
    this.floatingScores = [];
    this.showConfetti = false;
  }

  onUndo() {
    this.haptics.tap();
    this.state = undo(this.state);
    this.selectedCellIndex = null;
  }

  getBiggestNumber(): number {
    return Math.max(...this.state.grid.map(c => c.value));
  }

  onCellSelect(index: number) {
    if (this.state.gameOver) {
      this.haptics.warning();
      return;
    }
    this.haptics.tap();
    this.selectedCellIndex = index;
  }

  onActionSelect(action: GameAction) {
    if (this.selectedCellIndex !== null) {
      const oldScore = this.state.score;
      const oldNextFib = this.state.nextFib;
      const index = this.selectedCellIndex;
      
      this.state = applyAction(this.state, index, action, this.config);
      
      if (this.state.gameOver) {
        this.haptics.warning();
      } else {
        const bonusAchieved = oldNextFib !== this.state.nextFib;
        this.addFloatingScores(oldScore, this.state.score, index, bonusAchieved, oldNextFib);
        if (bonusAchieved) {
          this.haptics.success();
          this.triggerCelebration();
        } else {
          this.haptics.tap();
        }
      }
      
      this.selectedCellIndex = null;
    }
  }

  private triggerCelebration() {
    this.showConfetti = true;
    this.particles = Array.from({ length: 30 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 50 + Math.random() * 150;
      return {
        style: {
          '--tx': `${Math.cos(angle) * dist}px`,
          '--ty': `${Math.sin(angle) * dist}px`,
          '--tr': `${Math.random() * 360}deg`,
          'background-color': ['#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'][Math.floor(Math.random() * 7)]
        }
      };
    });

    setTimeout(() => {
      this.showConfetti = false;
      this.particles = [];
    }, 1000);
  }

  private addFloatingScores(oldScore: number, newScore: number, index: number, bonusAchieved: boolean, oldNextFib: number) {
    // Determine cost and result based on score change
    // This is a bit tricky because applyAction does: score = score - cost + bonus + resultValue
    // We want to show individual floating texts for juice.
    
    // Instead of reconstructing, let's just show the net change if it's positive, 
    // and definitely show bonus if achieved.
    
    const diff = newScore - oldScore;
    
    if (bonusAchieved) {
      this.floatingScores.push({
        id: this.fsIdCounter++,
        value: `+${oldNextFib} BONUS!`,
        index,
        isBonus: true,
        isPenalty: false
      });
      
      // Also show the rest of the change
      const rest = diff - oldNextFib;
      if (rest !== 0) {
        this.floatingScores.push({
          id: this.fsIdCounter++,
          value: (rest > 0 ? '+' : '') + rest,
          index,
          isBonus: false,
          isPenalty: rest < 0
        });
      }
    } else if (diff !== 0) {
      this.floatingScores.push({
        id: this.fsIdCounter++,
        value: (diff > 0 ? '+' : '') + diff,
        index,
        isBonus: false,
        isPenalty: diff < 0
      });
    }
  }

  getScoreX(index: number): number {
    const col = index % 4;
    // 80px cell width + 10px gap. Grid starts at some padding.
    // Center of cell = col * 90 + 40 + 10 (grid padding)
    return col * 90 + 50;
  }

  getScoreY(index: number): number {
    const row = Math.floor(index / 4);
    // 80px cell height + 10px gap.
    // Top of cell = row * 90 + 10 (grid padding)
    return row * 90 + 10;
  }

  onFsAnimationEnd(id: number) {
    this.floatingScores = this.floatingScores.filter(fs => fs.id !== id);
  }

  trackByFs(index: number, fs: FloatingScore) {
    return fs.id;
  }
}
