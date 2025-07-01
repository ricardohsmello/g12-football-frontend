import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {KeycloakService} from "keycloak-angular";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private keycloak: KeycloakService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const authenticated = await this.keycloak.isLoggedIn();
    if (!authenticated) {
      this.keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
      return false;
    }
    return true;
  }
}