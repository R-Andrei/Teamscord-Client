import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { Location } from '@angular/common';
import { getTextWidth } from 'src/app/utils';
import { CommService } from 'src/app/services/communication.service';
import { Room } from 'src/app/types/Room';
import { User } from 'src/app/types/User';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'participants',
    templateUrl: './participants.component.html',
    styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

    constructor(
        private layoutService: LayoutService,
        private commService: CommService,
        private location: Location,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
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
}
