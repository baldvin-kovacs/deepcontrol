import { Input, ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PadModel, Coords, DirectionPadValue, DialPadValue } from '../pad-model';
import { DialButtonComponent } from '../dial-button/dial-button.component';
import { MarkerComponent } from '../marker/marker.component';
import { DeepControlModelService } from '../deep-control-model.service';

interface Dial {
  pos: [number, number];
  char: string;
  val: DirectionPadValue | DialPadValue | undefined;
}

@Component({
  selector: 'app-button-grid',
  imports: [DialButtonComponent, MarkerComponent, CommonModule],
  templateUrl: './button-grid.component.html',
  styleUrl: './button-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGridComponent {
  @Input() padModel!: PadModel;
  @Input() isLast!: boolean;
  @Input() padIdx!: number;

  constructor(private readonly dcms: DeepControlModelService) {}

  dials: Dial[] = [];
  cols!: number;
  rows!: number;
  markerStyle$!: Observable<Map<string, string>>;

  ngOnInit(): void {
    this.rows = this.padModel.extents[0];
    this.cols = this.padModel.extents[1];
    for (let row = 1; row <= this.rows; row++) {
      for (let col = 1; col <= this.cols; col++) {
        const pos: Coords = [row, col];
        const c = this.padModel.charAt(pos);
        if (c === undefined) {
          continue;
        }
        this.dials.push({
          pos,
          char: c,
          val: this.padModel.valueAt(pos),
        });
      }
    }
    this.markerStyle$ = this.padModel.coords$.pipe(
      map((pos) => computeMarkerStyle(this.padIdx, pos))
    );
  }

  initiateControl(button: DirectionPadValue | DialPadValue | undefined): void {
    console.log('initiating control: ', button);
    this.dcms.control(this.padIdx, button);
  }
}

function computeMarkerStyle(padIdx: number, pos: Coords): Map<string, string> {
  const cellSize = 84;
  const top = (pos[0] - 1) * cellSize;
  const left = (pos[1] - 1) * cellSize;

  const styleElements: [string, string][] = [
    ['top', `${top}px`],
    ['left', `${left}px`],
  ];

  console.log("styleElements", padIdx, styleElements);

  return new Map<string, string>(styleElements);
}