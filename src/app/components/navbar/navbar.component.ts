import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() isMobile = false;
  @Output() toggleMenu = new EventEmitter<void>();

  location: Location;
  public profile: KeycloakProfile | null = null;

  constructor(location: Location, private readonly keycloak: KeycloakService) {
    this.location = location;
  }

  public async logout() {
    this.keycloak.logout();
  }

  toggleSidebar() {
    this.toggleMenu.emit();
  }
}
