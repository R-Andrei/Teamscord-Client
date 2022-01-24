import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { LayoutService } from 'src/app/services/layout.service';
import { User } from 'src/app/types/User';


enum SettingsTab {
    Account = 0,
    Profile = 1,
    About = 2,
}


@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

    public settingsTab: SettingsTab = SettingsTab.Account;
    public editing: boolean = false;
    public user: User | null;

    constructor(
        private layoutService: LayoutService,
        private authService: AuthService
    ) {
        this.user = authService.returnUser();
    }

    ngOnInit(): void {
        this.user = this.authService.returnUser();
    }

    public toggleSettings() {
        this.layoutService.toggleSettings();
    }

    public toggleEditing() {
        this.editing = !this.editing;
    }

    public updateSettingsTab(tabIndex: number) {
        this.settingsTab = tabIndex;
        this.editing = false;
    }

    public authLoading() {
        return this.authService.isAuthenticating();
    }

    public logout() {
        this.authService.logout()
            .then(() => {
                this.layoutService.toggleSettings();
                this.layoutService.toggleLogin();
            });
    }

}
