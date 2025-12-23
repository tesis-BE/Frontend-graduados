import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosTableComponent } from '../components/tables/usuarios-table/usuarios-table.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, UsuariosTableComponent],
  template: `
    <div class="container-fluid">
      <app-usuarios-table />
    </div>
  `,
  styles: [
    `
      .container-fluid {
        padding: 1.5rem;
      }

      @media (max-width: 767.98px) {
        .container-fluid {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class UsuariosPageComponent {}
