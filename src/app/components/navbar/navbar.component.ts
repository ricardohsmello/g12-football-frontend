import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() isMobile = false;
  @Output() toggleMenu = new EventEmitter<void>();
  isCollapsed = true;

  location: Location;
  public profile: KeycloakProfile | null = null;

  constructor(location: Location, private readonly keycloak: KeycloakService, private router: Router) {
    this.location = location;
  }

  navigateToProfile() {
    this.router.navigate(['/user-profile']).then(r => null);
  }

  public async logout() {
    await this.keycloak.logout();
  }

  toggleSidebar() {
    this.toggleMenu.emit();
  }
}
