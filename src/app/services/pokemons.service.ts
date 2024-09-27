import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';

interface Results {
  name: string,
  url: string
}

export interface PokemonListResponse {
  details: any;
  count: number;
  results: Results[];
}

export interface PokemonDetail {
  id: number;
  cries: {
    latest: string;
  };
  moves: Array<{
    move: {
      name: string
    }
  }>;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      },
      showdown:{
        front_default: string;
      }
    }
  };
  stats: Array<{
    base_stat: number
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    }
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    },
    is_hidden: boolean;
    slot: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  colorsMap = signal<{ [key: string]: string }>({
    fire: '#daa8a8',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FF',
    ground: '#F4E7DA',
    rock: '#B5B5B5',
    fairy: '#FCEAFF',
    poison: '#F2C4FF',
    bug: '#F8D5A3',
    dragon: '#97B3E6',
    psychic: '#EAEDA1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#E3E3E3',
    ice: '#FFF'
  });

  private apiUrl = 'https://pokeapi.co/api/v2';
  private pokemonSubject = new BehaviorSubject<Results[]>([]);
  pokemon$ = this.pokemonSubject.asObservable();
  private pokemonDetailsSubject = new BehaviorSubject<PokemonDetail[]>([]);
  pokemonDetails$ = this.pokemonDetailsSubject.asObservable();

  constructor(private http: HttpClient) { }

  getPokemons(limit: number = 20, offset: number = 0): Observable<PokemonListResponse> {
    return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`)
      .pipe(
        tap(response => this.pokemonSubject.next(response.results)),
        switchMap(response => {
          return this.getPokemonDetails(response.results).pipe(
            map(details => ({
              count: response.count,
              results: response.results,
              details: details
            }))
          );
        })
      );
  }

  private getPokemonDetails(pokemonList: Results[]): Observable<PokemonDetail[]> {
    const detailRequests = pokemonList.map(pokemon => 
      this.http.get<PokemonDetail>(`${this.apiUrl}/pokemon/${pokemon.name}`)
    );
    
    return forkJoin(detailRequests).pipe(
      map(detailedPokemons => detailedPokemons.map(pokemon => ({
        ...pokemon,
        cries: {
          latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`
        }
      }))),
      tap(detailedPokemons => this.pokemonDetailsSubject.next(detailedPokemons))
    );
  }

  getTypeColor(type: string): string {
    return this.colorsMap()[type] || '#FFFFFF';
  }

}