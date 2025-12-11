import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() isLoading = false;
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() footerAlign: 'left' | 'center' | 'right' = 'right';

  @Output() headerAction = new EventEmitter<string>();

  @ContentChild('header', { static: false }) headerTemplate: TemplateRef<any> | null = null;
  @ContentChild('body', { static: false }) bodyTemplate: TemplateRef<any> | null = null;
  @ContentChild('footer', { static: false }) footerTemplate: TemplateRef<any> | null = null;
}
