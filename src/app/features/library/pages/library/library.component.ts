import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="library">
      <h2>Music Library</h2>
      <p>Welcome to your music library NADA !. Your tracks will appear here.</p>
    </div>
  `,
  styles: [`
    .library {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
    }
  `]
})
export class LibraryComponent {}
