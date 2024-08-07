import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';
import { TYPES } from '../../../../../app-nest/src/types';

@Component({
  selector: 'app-dialogs-sign-in-as',
  standalone: true,
  imports: [
    // material module
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatRadioModule,
  ],
  templateUrl: './dialogs-sign-in-as.component.html',
  styleUrl: './dialogs-sign-in-as.component.scss'
})
export class DialogsSignInAsComponent {
  authService = inject(AuthService);
  environment = environment;
  TYPES = TYPES;
}
