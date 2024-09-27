import { Component } from '@angular/core';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonListComponent],
  template: '<app-pokemon-list></app-pokemon-list>',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
