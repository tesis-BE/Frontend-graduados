import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-offers-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Ofertas de Trabajo</h1>
      <p>Módulo en desarrollo</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }
  `]
})
export class JobOffersListComponent implements OnInit {
  ngOnInit(): void {}
}
