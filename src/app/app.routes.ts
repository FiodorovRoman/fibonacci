import { Routes } from '@angular/router';
import { GameComponent } from './game/ui/game.component';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'game', pathMatch: 'full' },
  { path: 'game', component: GameComponent },
  { path: 'about', component: AboutComponent },
  { path: 'privacy', component: PrivacyComponent }
];
