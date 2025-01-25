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

  private model = new BehaviorSubject<PadModel[]>([
    new DialPadModel(6),
    new DirectionPadModel(DirectionPadValue.Up),
    new DirectionPadModel(DirectionPadValue.Left),
    new DirectionPadModel(DirectionPadValue.Apply),
  ]);

  model$ = this.model.asObservable();

  private code = new BehaviorSubject<string>('');
  code$ = this.code.asObservable();

  private applyDialpad(): void {
    const c = this.model.value[0].get() as DialPadValue;
    if (c === undefined || c === 'A') {
      return;
    }
    this.code.next(this.code.value + c);
  }

  control(idx: number, button: DirectionPadValue | DialPadValue | undefined): void {
    if (button === undefined) {
      return;
    }
    if (idx === 0) {
      this.applyDialpad();
      return;
    }
    // We know that only the first one is a dialpad.
    let dpv: DirectionPadValue = button as DirectionPadValue;

    while (idx > 0 && dpv === DirectionPadValue.Apply) {
      idx--;
      if (idx === 0) {
        this.applyDialpad();
        return;
      }
      dpv = this.model.value[idx].get() as DirectionPadValue;
      if (dpv === undefined) {
        return;
      }
    }

    this.model.value[idx-1].control(dpv);
  }
}
