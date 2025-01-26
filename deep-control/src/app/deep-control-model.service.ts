import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
  PadModel, DialPadModel, DirectionPadModel, DirectionPadValue, DialPadValue
} from './pad-model';

@Injectable({
  providedIn: 'root'
})
export class DeepControlModelService {
  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {
    this.route.fragment.subscribe((fragment) => {
      this.applyFragment(fragment);
    })
  }

  private model = new BehaviorSubject<PadModel[]>([]);

  model$ = this.model.asObservable();

  private code = new BehaviorSubject<string>('');
  code$ = this.code.asObservable();

  private applyDialpad(v: DialPadValue | undefined): void {
    if (v === undefined || v === 'A') {
      return;
    }
    this.code.next(this.code.value + v);
    this.setFragment();
  }

  control(idx: number, button: DirectionPadValue | DialPadValue | undefined): void {
    if (button === undefined) {
      return;
    }
    if (idx === 0) {
      this.applyDialpad(button as (DialPadValue | undefined));
      return;
    }
    // We know that only the first one is a dialpad.
    let dpv: DirectionPadValue = button as DirectionPadValue;

    while (idx > 0 && dpv === DirectionPadValue.Apply) {
      idx--;
      if (idx === 0) {
        this.applyDialpad(this.model.value[0].get() as (DialPadValue | undefined));
        return;
      }
      dpv = this.model.value[idx].get() as DirectionPadValue;
      if (dpv === undefined) {
        return;
      }
    }

    this.model.value[idx-1].control(dpv);
    this.setFragment();
  }

  applyFragment(fragment: string | null): void {
    if (fragment === null) {
      this.startFromScratch();
      return;
    }
    const parts = fragment.split(';');
    if (parts.length > 0) {
      this.newModel(parts[0].toUpperCase());
    }
    if (parts.length > 1) {
      this.newCode(parts[1]);
    }
  }

  startFromScratch(): void {
    this.adjustModel([
      new DialPadModel(6),
      new DirectionPadModel(DirectionPadValue.Up),
      new DirectionPadModel(DirectionPadValue.Left),
      new DirectionPadModel(DirectionPadValue.Apply),
    ]);
  }

  newModel(s: string): void {
    if (s === this.currentModelChars()) {
      return;
    }
    if (s.length === 0) {
      this.startFromScratch();
      return;
    }

    const nm: PadModel[] = [];

    let idx = 0;
    for (const c of s.split('')) {
      idx++;
      if (idx === 1) {
        const dialPadValue = charToDialpadValue(c);
        if (dialPadValue === undefined) {
          console.error('Wrong character for the dial pad: ', c);
          return;
        }
        nm.push(new DialPadModel(dialPadValue));
        continue;
      }
      const directionPadValue = charToDirectionPadValue(c);
      if (directionPadValue === undefined) {
        console.error('Wrong character for a direction pad: ', c);
        return;
      }
      nm.push(new DirectionPadModel(directionPadValue));
    }
    nm.push(new DirectionPadModel(DirectionPadValue.Apply));
    this.adjustModel(nm);
  }

  // This is trying to reuse some from the previous, to keep Angular
  // happy. Without this, the "@for (model of model$ | async; track model) {...}"
  // complains that it needs to re-create everything.
  adjustModel(nm: PadModel[]) {
    const om = this.model.value;
    if (nm.length === om.length) {
      for (let i = 0; i < nm.length; ++i) {
        if (nm[i].get() === om[i].get()) {
          nm[i] = om[i];
        }
      }
    }
    this.model.next(nm)
  }

  newCode(s: string): void {
    this.code.next(s);
  }

  currentModelChars(): string | undefined {
    const chars: string[] = [];
    let idx = 0;
    for (const m of this.model.value) {
      idx++;
      if (idx === this.model.value.length) {
        // We want to leave out the last one.
        break;
      }
      let c;
      if (idx === 1) {
        c = dialPadValueToChar(m.get());
      } else {
        c = directionPadValueToChar(m.get() as (DirectionPadValue | undefined));
      }
      if (c === undefined) {
        return undefined;
      }
      chars.push(c);
    }
    return chars.join('');
  }

  setFragment() {
    const cc = this.currentModelChars();
    if (cc === undefined) {
      return;
    }
    const fragment = cc + ';' + this.code.value;
    this.router.navigate([], {fragment, relativeTo: this.route});
  }
}

function charToDialpadValue(s: string): DialPadValue | undefined {
  s = s.toUpperCase();
  if (s === 'A' || s === undefined) {
    return s;
  }
  const n = Math.floor(Number(s));
  if (n < 0 || n > 9) {
    return undefined;
  }
  return n;
}

function dialPadValueToChar(v: DialPadValue | undefined): string | undefined {
  if (v === undefined) {
    return undefined;
  }
  if (v === 'A') {
    return 'A';
  }
  return `${v}`;
}

function directionPadValueToChar(v: DirectionPadValue | undefined): string | undefined {
  if (v === undefined) {
    return undefined;
  }
  switch (v) {
    case DirectionPadValue.Up: return 'U';
    case DirectionPadValue.Down: return 'D';
    case DirectionPadValue.Left: return 'L';
    case DirectionPadValue.Right: return 'R';
    case DirectionPadValue.Apply: return 'A';
   }

}

function charToDirectionPadValue(s: string): DirectionPadValue | undefined {
  s = s.toUpperCase();
  switch (s) {
   case 'U': return DirectionPadValue.Up;
   case 'D': return DirectionPadValue.Down;
   case 'L': return DirectionPadValue.Left;
   case 'R': return DirectionPadValue.Right;
   case 'A': return DirectionPadValue.Apply;
  }
  return undefined;
}