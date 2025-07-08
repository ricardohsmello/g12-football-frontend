import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isMobile = false;
  sidebarOpened = true;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992;
    this.sidebarOpened = !this.isMobile;
  }

  toggleSidebar() {
    this.sidebarOpened = !this.sidebarOpened;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpened = false;
    }
  }
}
