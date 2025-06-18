import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  location: Location;
  public isLogged = false;
  public profile: KeycloakProfile | null = null;

  constructor(location: Location, private readonly keycloak: KeycloakService) {
    this.location = location;
  }
 
  public async logout() {
    this.keycloak.logout();
  }


}
