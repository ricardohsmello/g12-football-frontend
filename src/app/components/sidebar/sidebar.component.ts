import { Component, EventEmitter, OnInit, Output } from '@angular/core';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    { path: '/match', title: 'Matches',  icon:'objects_spaceship', class: '' },
    { path: '/scoreboard', title: 'Score Board',  icon:'sport_trophy', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    @Output() menuItemClicked = new EventEmitter<void>();
    menuItems: any[] = [];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      return window.innerWidth <= 991;
  };

    onItemClick() {
        if (this.isMobileMenu()) {
            this.menuItemClicked.emit();
        }
    }
}
