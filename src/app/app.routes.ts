import { Routes } from '@angular/router';
import { GameComponent } from './game/ui/game.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: 'game', pathMatch: 'full' },
  { path: 'game', component: GameComponent },
  { path: 'about', component: AboutComponent }
];
