import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-shared-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  @Input()
  open = false;

  @Input()
  title = '';

  @Input()
  size: ModalSize = 'md';

  @Input()
  closeOnBackdrop = false;

  @Input()
  showHeader = true;

  @Input()
  showCloseButton = true;

  @Input()
  showFooter = false;

  @Output()
  readonly closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  protected onDialogClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected dialogClasses(): string[] {
    const sizeClassMap: Record<ModalSize, string> = {
      sm: 'modal-sm',
      md: 'modal-md',
      lg: 'modal-lg',
      xl: 'modal-xl',
    };

    return ['modal-dialog', sizeClassMap[this.size]];
  }
}
