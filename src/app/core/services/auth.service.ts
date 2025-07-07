import { Injectable, signal, computed, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  IdTokenResult
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private apiService = inject(ApiService);

  // Signals pour l'état d'authentification
  private _firebaseUser = signal<FirebaseUser | null>(null);
  private _user = signal<User | null>(null);
  private _idToken = signal<string | null>(null);
  private _loading = signal(true);

  // Observables pour compatibilité
  private _idTokenSubject = new BehaviorSubject<string | null>(null);
  idToken$ = this._idTokenSubject.asObservable();

  // Computed signals
  isAuthenticated = computed(() => this._firebaseUser() !== null);
  isAuthenticated$ = new Observable<boolean>(subscriber => {
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      subscriber.next(!!user);
    });
    return unsubscribe;
  });

  currentUser = computed(() => this._user());
  loading = computed(() => this._loading());

  private redirectUrl: string | null = null;

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      this._firebaseUser.set(firebaseUser);
      
      if (firebaseUser) {
        // Récupérer le token
        const idTokenResult = await firebaseUser.getIdTokenResult();
        this._idToken.set(idTokenResult.token);
        this._idTokenSubject.next(idTokenResult.token);
        
        // Récupérer les infos utilisateur depuis l'API
        try {
          const user = await this.fetchUserProfile();
          this._user.set(user);
        } catch (error) {
          console.error('Erreur récupération profil:', error);
        }
        
        // Rafraîchir le token toutes les 55 minutes
        this.setupTokenRefresh(firebaseUser);
      } else {
        this._idToken.set(null);
        this._idTokenSubject.next(null);
        this._user.set(null);
      }
      
      this._loading.set(false);
    });
  }

  private setupTokenRefresh(user: FirebaseUser): void {
    // Rafraîchir le token avant expiration
    setInterval(async () => {
      if (this._firebaseUser()) {
        const newToken = await user.getIdToken(true);
        this._idToken.set(newToken);
        this._idTokenSubject.next(newToken);
      }
    }, 55 * 60 * 1000); // 55 minutes
  }

  async login(email: string, password: string): Promise<void> {
    try {
      this._loading.set(true);
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Récupérer le profil utilisateur
      const user = await this.fetchUserProfile();
      this._user.set(user);
      
      // Rediriger
      const url = this.redirectUrl || '/dashboard';
      this.redirectUrl = null;
      await this.router.navigate([url]);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  }

  private async fetchUserProfile(): Promise<User> {
    return this.apiService.get<User>('/auth/me').toPromise();
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getIdToken(): string | null {
    return this._idToken();
  }
}
