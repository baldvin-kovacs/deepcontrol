import { Input, ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PadModel, Coords, AnimatedCoords, DirectionPadValue, DialPadValue } from '../pad-model';
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

  constructor(private readonly dcms: DeepControlModelService) {

  }

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
      map((animatedCoords) => computeMarkerStyle(this.padIdx, animatedCoords))
    );
  }

  initiateControl(button: DirectionPadValue | DialPadValue | undefined): void {
    console.log('initiating control: ', button);
    this.dcms.control(this.padIdx, button);
  }
}

function computeMarkerStyle(padIdx: number, ac: AnimatedCoords): Map<string, string> {
  const previousPos = ac.previous;
  const pos = ac.current;

  const styleElements: [string, string][] = [
    ['grid-row-start', `${pos[0]}`],
    ['grid-row-end:', `${pos[0]}`],
    ['grid-column-start', `${pos[1]}`],
    ['grid-column-end', `${pos[1]}`],
  ];

  if ((pos[0] !== previousPos[0]) || (pos[1] !== previousPos[1])) {
    const cellSize = 84.0;
    const dx = Math.floor((pos[1] - previousPos[1]) * cellSize);
    const dy = Math.floor((pos[0] - previousPos[0]) * cellSize);
    styleElements.push(['transform', `translate(${dx}px, ${dy}px)`]);
  }

  console.log("styleElements", padIdx, styleElements);

  return new Map<string, string>(styleElements);
}