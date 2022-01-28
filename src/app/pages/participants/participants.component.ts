import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { Location } from '@angular/common';
import { getTextWidth } from 'src/app/utils';
import { CommService } from 'src/app/services/communication.service';
import { Room } from 'src/app/types/Room';
import { SocketRoomUser, User } from 'src/app/types/User';
import { AuthService } from 'src/app/services/auth.service';
// @ts-ignore
import * as language from '../../../environments/internationalization.json';
import { LanguageProperties } from 'src/app/types/Misc';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketService } from 'src/app/services/sockets.service';


@Component({
    selector: 'participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

    public readonly languageProperties: LanguageProperties = language;

    public formGroup: FormGroup;
    public addingBuddy: boolean = false;
    public addingBuddyLoading: boolean = false;

    constructor(
        private layoutService: LayoutService,
        private commService: CommService,
        private location: Location,
        private authService: AuthService,
        private socketService: SocketService
    ) {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required])
        });
    }

    private initForm() {
        this.formGroup = new FormGroup({
            email: new FormControl('', [Validators.required]),
        });
    }

    ngOnInit(): void {
        this.initForm();
    }

    toggleSettings() {
        this.layoutService.toggleSettings();
    }

    public getCurrentUser(): User {
        const user = this.authService.returnUser();
        if (user)
            return user;
        return {} as User;
    }

    public getCurrentLanguage(): string {
        const user = this.authService.returnUser();
        if (user)
            return user.language;
        return 'en';
    }

    public getParticipantsText(text: string): string {
        const width: number = getTextWidth(text);
        if (width > 230) {
            const difference = 245 / width;
            const newText = text.substring(0, Math.floor(difference * text.length) - 3) + '...';

            return newText;
        }
        return text;
    }

    public participantsAlignedLeft(): boolean {
        const text = this.getParticipantsText(this.getRoomName());
        const width: number = getTextWidth(text);
        if (width > 230) {
            return true;
        }
        return false;
    }

    private getRoom(): Room | null {
        const currentLocation: string = this.location.path();
        const currentId = currentLocation.substring(currentLocation.lastIndexOf('/') + 1);
        const room: Room | null = this.commService.returnRoom(currentId);
        return room;
    }

    public getRoomName(): string {
        const room: Room | null = this.getRoom();
        if (room)
            return (room.name) ? room.name : room.participants.map((participant) => participant.username).join(', ');
        return '';
    }

    public getParticipants(): User[] {
        const room: Room | null = this.getRoom();
        if (room) {
            return room.participants;
        }
        return [];
    }

    public addBuddyToRoom() {
        this.addingBuddyLoading = true;
        const room: Room | null = this.getRoom();
        const email = this.formGroup.value.email;
        if (room) {
            this.commService.addBuddyToRoom(room._id, email)
                .then((res: User) => {
                    this.addingBuddy = false;
                    this.addingBuddyLoading = false;
                    // add user to socket room

                    const buddy: SocketRoomUser = {
                        _id: res._id,
                        username: res.username,
                        email: res.email,
                        avatar: res.avatar,
                        tag: res.tag,
                        createdAt: res.createdAt,
                        updatedAt: res.updatedAt,
                    }
                    this.socketService.addToRoom(room._id, buddy);

                }).catch((err) => {
                    console.error(err);
                    this.addingBuddyLoading = false;
                    this.addingBuddy = false;
                });
        } else {
            console.error('No room found to add buddy to.');
        }
    }

    public startAddBuddy() {
        this.addingBuddy = true;

    }

    public cancelAddBuddy() {
        this.addingBuddy = false;
    }
}
