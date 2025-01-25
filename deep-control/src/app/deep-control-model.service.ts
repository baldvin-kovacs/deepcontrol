import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
  PadModel, DialPadModel, DirectionPadModel, DirectionPadValue, DialPadValue
} from './pad-model';

@Injectable({
  providedIn: 'root'
})
export class DeepControlModelService {
  constructor(private route: ActivatedRoute) { }

  model = new BehaviorSubject<PadModel[]>([
    new DialPadModel(6),
    new DirectionPadModel(DirectionPadValue.Up),
    new DirectionPadModel(DirectionPadValue.Left),
    new DirectionPadModel(DirectionPadValue.Apply),
  ]);

  model$ = this.model.asObservable();

  control(idx: number, button: DirectionPadValue | DialPadValue | undefined): void {
    if (idx === 0 || button === undefined) {
      return;
    }
    // We know that only the first one is a dialpad.
    const dpv: DirectionPadValue = button as DirectionPadValue;
    if (dpv === DirectionPadValue.Apply) {
      return;
    }

    this.model.value[idx-1].control(dpv);
  }
}
