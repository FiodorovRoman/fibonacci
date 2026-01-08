import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root'
})
export class HapticsService {
  async tap() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  async success() {
    await Haptics.notification({ type: 'SUCCESS' as any });
  }

  async warning() {
    await Haptics.notification({ type: 'WARNING' as any });
  }

  async vibrate() {
    await Haptics.vibrate();
  }
}
