import { BehaviorSubject, Observable } from "rxjs";

export type DialPadValue = number | 'A';
export enum DirectionPadValue {
  Up,
  Down,
  Left,
  Right,
  Apply,
}

export type Coords = [number, number];

export interface AnimatedCoords {
  previous: Coords;
  current: Coords;
};

function newStableCoords(v: Coords): AnimatedCoords {
  return {
    previous: [...v],
    current: [...v],
  };
}

export interface Controllable {
  control(dpv: DirectionPadValue): void;
  coords$: Observable<AnimatedCoords>;
  isValidPos(cs: Coords): boolean;
}

abstract class PadModelBase implements Controllable {
  protected cs = new BehaviorSubject<AnimatedCoords>(newStableCoords([0, 0]));
  coords$ = this.cs.asObservable();

  private computeNewPos(dpv: DirectionPadValue): Coords {
    const pos: Coords = [...this.cs.value.current];
    switch (dpv) {
      case DirectionPadValue.Up: pos[0]--; break;
      case DirectionPadValue.Left: pos[1]--; break;
      case DirectionPadValue.Down: pos[0]++; break;
      case DirectionPadValue.Right: pos[1]++; break;
    }
    return pos;
  }

  control(dpv: DirectionPadValue): void {
    const pos = this.computeNewPos(dpv);
    if (!this.isValidPos(pos)) {
      return;
    }
    this.cs.next({
      previous: this.cs.value.current,
      current: pos,
    });
  }

  isApplicableMove(dpv: DirectionPadValue): boolean {
    const pos = this.computeNewPos(dpv);
    return this.isValidPos(pos);
  }

  abstract isValidPos(cs: Coords): boolean;
}

export class DialPadModel extends PadModelBase {
  readonly extents: Coords = [4, 3];

  constructor(v: DialPadValue) {
    super();
    this.set(v);
  }

  set(v: DialPadValue): void {
    switch (v) {
      case 'A':
        this.cs.next(newStableCoords([4, 3]));
        break;
      case 0:
        this.cs.next(newStableCoords([4, 2]));
        break;
      default:
        if (v < 1 || v > 9) {
          return;
        }
        this.cs.next(newStableCoords([3 - Math.trunc((v - 1) / 3), (v - 1) % 3 + 1]));
        break;
    }
  }

  valueAt(cs: Coords): DialPadValue | undefined {
    const [row, col] = cs;
    if (row === 4) {
      switch (col) {
        case 2: return 0;
        case 3: return 'A';
        default:
          return undefined;
      }
    }
    if (row > 3 || row < 1 || col < 1 || col > 3) {
      return undefined;
    }
    return 3 * (3 - row) + col;
  }

  charAt(cs: Coords): string | undefined {
    return this.valueAt(cs)?.toString();
  }

  override isValidPos(cs: Coords): boolean {
    const [row, col] = cs;
    if (col < 1 || col > 3 || row < 1 || row > 4 ||
      (col == 1 && row == 4)
    ) {
      return false;
    }
    return true;
  }
}

export class DirectionPadModel extends PadModelBase {
  readonly extents: Coords = [2, 3];

  constructor(v: DirectionPadValue) {
    super();
    this.set(v);
  }

  set(v: DirectionPadValue): void {
    switch (v) {
      case DirectionPadValue.Up: this.cs.next(newStableCoords([1, 2])); break;;
      case DirectionPadValue.Left: this.cs.next(newStableCoords([2, 1])); break;;
      case DirectionPadValue.Down: this.cs.next(newStableCoords([2, 2])); break;;
      case DirectionPadValue.Right: this.cs.next(newStableCoords([2, 3])); break;;
      case DirectionPadValue.Apply: this.cs.next(newStableCoords([1, 3])); break;;
    }
  }

  valueAt(cs: Coords): DirectionPadValue | undefined {
    const [row, col] = cs;
    if (row === 2) {
      switch (col) {
        case 1: return DirectionPadValue.Left;
        case 2: return DirectionPadValue.Down;
        case 3: return DirectionPadValue.Right;
        default:
          return undefined;
      }
    } else if (row === 1) {
      switch (col) {
        case 2: return DirectionPadValue.Up;
        case 3: return DirectionPadValue.Apply;
        default:
          return undefined;
      }
    }
    return undefined;
  }

  charAt(cs: Coords): string | undefined {
    const v = this.valueAt(cs);
    switch (v) {
      case DirectionPadValue.Up: return '↑';
      case DirectionPadValue.Left: return '←';
      case DirectionPadValue.Down: return '↓';
      case DirectionPadValue.Right: return '→';
      case DirectionPadValue.Apply: return 'A';
    }
    return undefined;
  }

  override isValidPos(cs: Coords): boolean {
    const [row, col] = cs;
    if (col < 1 || col > 3 || row < 1 || row > 2 ||
      (col == 1 && row == 1)
    ) {
      return false;
    }
    return true;
  }
}

export type PadModel = DialPadModel | DirectionPadModel;
