import { Component } from '@angular/core';

@Component({
  selector: 'app-ng-counter',
  standalone: true,
  template: `
    <button (click)="count = count - 1" aria-label="moins">−</button>
    <output>{{ count }}</output>
    <button (click)="count = count + 1" aria-label="plus">+</button>
  `,
})
export class NgCounter {
  count = 0;
}
