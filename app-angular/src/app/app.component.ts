import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HistoryService } from './_core/history.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  historyService = inject(HistoryService);

  constructor() {
    this.historyService.init();
  }
}
