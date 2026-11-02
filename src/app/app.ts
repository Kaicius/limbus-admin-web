import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IdentityForm } from './identity-form/identity-form';

@Component({
  imports: [RouterOutlet, IdentityForm],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('limbus-admin-web');
}
