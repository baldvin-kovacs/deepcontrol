import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'
import { Observable } from 'rxjs';

import { ButtonGridComponent } from './button-grid/button-grid.component';
import { PadModel } from './pad-model';
import { DeepControlModelService } from './deep-control-model.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CommonModule, ButtonGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly model$: Observable<PadModel[]>;
  readonly code$!: Observable<string>;
  readonly colors = [
    '50, 54%',
    '225, 74%',
    '30, 74%',
    '100, 54%',
  ];

  constructor(private readonly dcms: DeepControlModelService) {
    this.model$ = dcms.model$;
    this.code$ = dcms.code$;
  }
}
