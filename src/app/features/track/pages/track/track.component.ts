import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="track">
      <h2>Détails de la piste</h2>
      <p>ID de la piste : {{ trackId }}</p>
      <!-- Ajoutez plus de détails de la piste ici -->
    </div>
  `,
  styles: [`
    .track {
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
export class TrackComponent {
  private route = inject(ActivatedRoute);
  trackId = this.route.snapshot.paramMap.get('id');
}
