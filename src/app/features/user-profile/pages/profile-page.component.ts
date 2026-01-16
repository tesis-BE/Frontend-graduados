import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileContainerComponent } from '../components/profile-container/profile-container.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ProfileContainerComponent],
  template: `
    <div class="container-fluid">
      <app-profile-container />
    </div>
  `,
  styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent {}
