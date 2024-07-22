import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomModalComponent, ModalInputField } from '../../shared/custom-modal/custom-modal.component';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatTooltipModule,
    CommonModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatToolbar,
    MatToolbarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  public displayedColumns: string[] = [
    'id',
    'fullName',
    'email',
    'role',
    'options',
  ];
  public dataSource: MatTableDataSource<User> = new MatTableDataSource<User>(
    []
  );
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private dialog: MatDialog, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(
      (users) => {
        this.dataSource.data = users;
      },
      (error) => console.error('Error fetching users:', error)
    );
  }

  loadUsers() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 35);
  }

  openModal() {
    const inputFields: ModalInputField[] = [
      { type: 'text', label: 'Name', icon: 'person', required: true, },
      { type: 'email', label: 'Email', icon: 'mail', required: true },
      { type: 'email', label: 'Email', icon: 'mail', required: true },
    ];

    // Open the modal
    const dialogRef = this.dialog.open(CustomModalComponent, {
      data: {
        subtitleLabel: 'Compile form to add new user.',
        titleLabel: 'Add user',
        inputFields: inputFields
      }
    });

    dialogRef.componentInstance.submitEvent.subscribe((formData: any) => {
      // Handle the submitted form data here
      console.log(formData);
    });
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }
}
