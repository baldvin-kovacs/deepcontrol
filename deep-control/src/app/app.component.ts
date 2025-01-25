import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterOutlet } from '@angular/router';
import { DeepControlModelService } from './deep-control-model.service';
import { Observable } from 'rxjs';

import {ButtonGridComponent} from './button-grid/button-grid.component';
import { PadModel } from './pad-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [CommonModule, ButtonGridComponent],
})
export class AppComponent {
  title = 'deep-control';

  model$: Observable<PadModel[]>;

  constructor(private readonly dcms: DeepControlModelService) {
    this.model$ = dcms.model$;
  }
}
