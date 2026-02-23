import { Component, inject, OnInit } from '@angular/core'
import { RouterLink, ActivatedRoute } from '@angular/router'

@Component({
    selector: 'app-confirm-mail',
    imports: [RouterLink],
    templateUrl: './confirm-mail.component.html',
    styles: ``
})
export class ConfirmMailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  isRecruiterRequest = false;

  ngOnInit(): void {
    this.isRecruiterRequest = this.route.snapshot.queryParamMap.get('type') === 'recruiter-request';
  }
}
