import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CommService } from 'src/app/services/communication.service';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public formGroup: FormGroup;
    public loading: boolean = false;
    public submitted: boolean = false;

    constructor(
        private authService: AuthService,
        private layoutService: LayoutService,
        private commService: CommService
    ) {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    private initForm() {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.initForm();
    }

    public login() {
        this.submitted = true;
        if (this.formGroup.valid) {
            this.loading = true;
            const { email, password } = this.formGroup.value;
            this.authService.login({ email, password })
                .then((_: boolean) => {
                    this.loading = false;
                    this.layoutService.toggleLogin();
                    const user = this.authService.returnUser();
                    if (user)
                        this.commService.retrieveRooms(user?._id);
                })
                .catch((_: any) => {
                    this.loading = false;
                });
        }
    }

    public startRegister() {
    }

}
