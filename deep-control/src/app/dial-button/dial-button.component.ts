import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dial-button',
  imports: [],
  templateUrl: './dial-button.component.html',
  styleUrl: './dial-button.component.scss'
})
export class DialButtonComponent {
  @Input() val!: string;
}
