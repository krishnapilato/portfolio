import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatIconModule, MatTableModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'email', 'phone', 'created_at'];
  dataSource: MatTableDataSource<any>;
  date = new Date();

  ngOnInit(): void {
    const users: any[] = [
      { id: 1, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000', created_at: this.date },
      { id: 2, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000', created_at: this.date },
      { id: 3, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000',  created_at: this.date },
      { id: 4, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000',  created_at: this.date },
      { id: 5, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000',  created_at: this.date },
      { id: 6, fullName: 'Name Surname', email: 'name.surname@mail.com', phone: '0000000000',  created_at: this.date },
    ];

    this.dataSource = new MatTableDataSource<any>(users);
  }

  editUser(user: User) {}

  deleteUser(user: User) {}
}