import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { CommService } from 'src/app/services/communication.service';
import { LayoutService } from 'src/app/services/layout.service';
import { RawObjectId } from 'src/app/types/Misc';
import { ProfileUpdateProps, User } from 'src/app/types/User';
// @ts-ignore
import * as language from '../../../environments/internationalization.json';
import { LanguageProperties } from 'src/app/types/Misc';

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

    public readonly languageProperties: LanguageProperties = language;

    public settingsTab: SettingsTab = SettingsTab.Account;
    public editing: boolean = false;
    public user: User | null;

    public avatarFormGroup: FormGroup;
    public languageFormGroup: FormGroup;

    constructor(
        private layoutService: LayoutService,
        private authService: AuthService,
        private commService: CommService
    ) {
        this.user = authService.returnUser();

        this.avatarFormGroup = new FormGroup({
            avatar: new FormControl(this.user?.avatar, [Validators.required]),
        });
        this.languageFormGroup = new FormGroup({
            language: new FormControl(this.user?.language, [Validators.required]),
        });
    }

    private initForm() {
        this.avatarFormGroup = new FormGroup({
            avatar: new FormControl(this.user?.avatar, [Validators.required]),
        });
        this.languageFormGroup = new FormGroup({
            language: new FormControl(this.user?.language, [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.user = this.authService.returnUser();
        this.initForm();
    }

    public getCurrentLanguage(): string {
        const user = this.authService.returnUser();
        if (user)
            return user.language;
        return 'en';
    }

    public getCurrentAvatarValue(): string {
        return this.avatarFormGroup.value.avatar;
    }

    public toggleSettings() {
        this.layoutService.toggleSettings();
    }

    public toggleEditing() {
        this.editing = !this.editing;
    }

    public getCurrentUser(): User {
        const user = this.authService.returnUser();
        if (user)
            return user;
        return {} as User;
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

    public saveProfile(): void {
        // get the form values
        const { avatar } = this.avatarFormGroup.value;
        const { language } = this.languageFormGroup.value;

        // update the user
        this.authService.updateProfile({ avatar, language })
            .then((_: ProfileUpdateProps) => {
                const userId: RawObjectId | undefined = this.authService.returnUser()?._id;
                if (userId)
                    this.commService.updateRoomParticipantProfile(userId, { avatar, language });
                else {
                    console.error('could not update room participant profile');
                }
            });
    }

}
