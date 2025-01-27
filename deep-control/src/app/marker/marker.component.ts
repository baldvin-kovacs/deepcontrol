import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marker',
  imports: [],
  templateUrl: './marker.component.html',
  styleUrl: './marker.component.scss'
})
export class MarkerComponent {
  @Input() color!: string;
}
