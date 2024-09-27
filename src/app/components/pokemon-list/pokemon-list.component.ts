import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService, PokemonDetail, PokemonListResponse } from '../../services/pokemons.service';
import { BehaviorSubject, delay, finalize} from 'rxjs';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./pokemon-list.component.html"
})
export class PokemonListComponent {
  private pokemonDataSubject = new BehaviorSubject<PokemonListResponse | null>(null);

  pokemonData$ = this.pokemonDataSubject.asObservable();
  currentOffset = signal(0);
  limit = signal(20);
  loading = signal(false);
  selectedPokemon = signal<PokemonDetail | null>(null);

  constructor(private pokemonService: PokemonService) {
    this.loadPokemon();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.loadMore();
    }
  }

  loadPokemon() {
    if (this.loading()) return;
    
    this.loading.set(true);
    this.pokemonService.getPokemons(this.limit(), this.currentOffset())
    .pipe(
      delay(500),
      finalize(() => {
        this.loading.set(false);
      })
    )
    .subscribe(newData => {
      const currentData = this.pokemonDataSubject.value;
      if (currentData) {
        this.pokemonDataSubject.next({
          count: newData.count,
          results: [...currentData.results, ...newData.results],
          details: [...currentData.details, ...newData.details]
        });
      } else {
        this.pokemonDataSubject.next(newData);
      }
    });
  }

  loadMore() {
    this.currentOffset.update(val => val + this.limit());
    this.loading.set(false);
    this.loadPokemon();
  }

  getPokemonBackgroundColor = computed(() => (pokemon: PokemonDetail): string => {
    if (pokemon.types && pokemon.types.length > 0) {
      const primaryType = pokemon.types[0].type.name;
      return this.pokemonService.colorsMap()[primaryType] || '#FFFFFF';
    }
    return '#FFFFFF';
  });

  getTypeColor = computed(() => (type: any): any => {
    if(type.slot === 2){
      return this.pokemonService.colorsMap()[type.type.name] || '#A8A77A';  // Couleur par défaut
    }else{
      return
    }
  });

  showPokemonDetails(pokemon: PokemonDetail) {
    this.selectedPokemon.set(pokemon);
    this.playPokemonCry(pokemon.cries.latest);
  }

  playPokemonCry(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.volume = 0.05; // Set volume to 20%
    audio.onended = () => URL.revokeObjectURL(audioUrl);
    audio.play().catch(error => console.error('Error playing audio:', error));
  }

  closeDetails() {
    this.selectedPokemon.set(null);
  }
}