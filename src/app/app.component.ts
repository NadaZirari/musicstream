import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app">
      <h1>{{ title() }}</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app {
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  protected readonly title = signal('Music Stream');
}
