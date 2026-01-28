import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleService } from '@core/services/ui/title.service';
import { NotificationContainerComponent } from '@shared/components/notification-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hando-angular';
  private titleService = inject(TitleService);

  ngOnInit(): void {
    this.titleService.init();
  }
}
