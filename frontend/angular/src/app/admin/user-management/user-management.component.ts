import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CustomModalComponent,
  ModalInputField,
} from '../../shared/custom-modal/custom-modal.component';
import { Role, User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';

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
    MatSnackBarModule,
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

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

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

  public createNewUser(): void {
    const inputFields: ModalInputField[] = [
      { type: 'text', label: 'Full Name', icon: 'person', required: true },
      { type: 'email', label: 'Email', icon: 'mail', required: true },
      { type: 'password', label: 'Password', icon: '', required: true },
    ];

    const dialogRef = this.dialog.open(CustomModalComponent, {
      data: {
        subtitleLabel: 'Complete the form to create a new user.',
        titleLabel: 'Create a new user',
        cancelButtonLabel: 'Cancel',
        submitButtonLabel: 'Create user',
        submitButtonIcon: 'add',
        submitButtonTooltip: 'Add new user.',
        inputFields: inputFields,
      },
    });

    dialogRef.componentInstance.submitEvent.subscribe((formData: any) => {
      let user: User = {
        fullName: formData['Full Name'],
        email: formData['Email'],
        password: formData['Password'],
        createdAt: new Date(),
        updatedAt: new Date(),
        role: Role.USER,
        locked: false,
      };
      this.userService.createNewUser(user).subscribe(
        (response: any) => {
          console.log(response);
          this.ngOnInit();
          this.dialog.closeAll();
          this._snackbar.open('User created successfully!', 'Close', {
            duration: 3000,
          });
        },
        (error: any) => console.error(error)
      );
    });
  }

  editUser(user: User, state: string) {
    const inputFields: ModalInputField[] = [
      {
        type: 'text',
        label: 'Full Name',
        icon: 'person',
        value: user.fullName,
        required: true,
        disabled: state === 'edit' ? false : true,
      },
      {
        type: 'email',
        label: 'Email',
        value: user.email,
        icon: 'mail',
        required: true,
        disabled: state === 'edit' ? false : true,
      },
      {
        type: 'password',
        label: 'Password',
        icon: 'lock',
        required: false,
        disabled: state === 'edit' ? false : true,
      },
    ];

    const userCreatedAt = new Date(user.updatedAt);
    const formattedDate = userCreatedAt.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/Rome',
    });

    const dialogRef = this.dialog.open(CustomModalComponent, {
      data: {
        subtitleLabel: `User was updated on ${formattedDate} last time.`,
        titleLabel:
          state == 'edit' ? `Edit User #${user.id}` : `Information #${user.id}`,
        cancelButtonLabel: 'Cancel',
        submitButtonLabel: 'Update',
        submitButtonIcon: 'edit',
        submitButtonTooltip: 'Update user',
        inputFields: inputFields,
      },
    });

    dialogRef.componentInstance.submitEvent.subscribe((formData: any) => {
      let userObject: User = {
        fullName: formData['Full Name'],
        email: formData['Email'],
        password: formData['Password'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userService.updateUser(user.id || 0, userObject).subscribe(
        (response: any) => {
          this.ngOnInit();
          this.dialog.closeAll();
          this._snackbar.open('User updated successfully!', 'Close', {
            duration: 3000,
          });
        },
        (error: any) => console.error(error)
      );
    });
  }

  toggleLockUser(user: User) {
    this.userService.toggleLockUser(user.id || 0).subscribe(
      (updatedUser: User) => {
        this.dataSource.data = this.dataSource.data.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );
        this.ngOnInit();
        this._snackbar.open(
          `User ${updatedUser.locked ? 'locked' : 'unlocked'} successfully!`,
          'Close',
          { duration: 3000 }
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(CustomModalComponent, {
      data: {
        titleLabel: 'Confirm Delete',
        subtitleLabel: `Are you sure you want to delete ${user.fullName}?`,
        cancelButtonLabel: 'Cancel',
        submitButtonLabel: 'Delete',
        submitButtonIcon: 'delete_forever',
        submitButtonColor: 'warn',
        inputFields: [],
      },
    });

    dialogRef.componentInstance.submitEvent.subscribe(() => {
      this.userService.deleteUserById(user.id || 0).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.ngOnInit();
          this.dialog.closeAll();
          this._snackbar.open('User deleted successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting user:', error);
        },
      });
    });
  }
}
