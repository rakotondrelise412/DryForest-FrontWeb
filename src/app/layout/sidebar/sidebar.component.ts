// src/app/layout/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }
}