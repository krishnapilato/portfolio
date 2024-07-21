import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { delay, finalize, tap } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-user-management',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatToolbar,
    MatToolbarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'fullName', 'email', 'role', 'options'];

  public dataSource: MatTableDataSource<User> = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  public isLoading: boolean = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().pipe(tap(users => this.dataSource.data = users), delay(2000), finalize(() => this.isLoading = false))
    .subscribe(() => {}, error => { console.error('Error fetching users:', error); });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  
  editUser(user: User) {
    console.log('Edit user:', user); 
  }

  deleteUser(user: User) {
    console.log('Delete user:', user); 
  }
}