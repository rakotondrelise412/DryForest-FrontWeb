
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent {

  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  @Input() isLoading = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  previousPage(): void {
    if (this.currentPage > 0 && !this.isLoading) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1 && !this.isLoading) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  changePageSize(size: number): void {
    if (size > 0 && !this.isLoading) {
      this.pageSizeChange.emit(size);
    }
  }
}
