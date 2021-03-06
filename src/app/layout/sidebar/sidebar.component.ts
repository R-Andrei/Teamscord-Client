import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { format } from 'date-fns';

import { CommService } from 'src/app/services/communication.service';
import { DisplayRoom, Room, Rooms, SocketRoom } from 'src/app/types/Room';
import { getTextWidth } from 'src/app/utils';
import { AuthService } from 'src/app/services/auth.service';
import { RawObjectId } from 'src/app/types/Misc';
// @ts-ignore
import * as language from '../../../environments/internationalization.json';
import { LanguageProperties } from 'src/app/types/Misc';
import { SocketService } from 'src/app/services/sockets.service';
import { SocketRoomUser, User } from 'src/app/types/User';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    public readonly languageProperties: LanguageProperties = language;
    public addLoading: boolean = false;

    constructor(
        private commService: CommService,
        private location: Location,
        private authService: AuthService,
        private socketService: SocketService
    ) {

    }

    ngOnInit(): void {
    }

    public getCurrentLanguage(): string {
        const user = this.authService.returnUser();
        if (user)
            return user.language;
        return 'en';
    }

    public getParticipantsText(text: string): string {
        const width: number = getTextWidth(text);
        if (width > 140) {
            const difference = 155 / width;
            const newText = text.substring(0, Math.floor(difference * text.length) - 3) + '...';

            return newText;
        }
        return text;
    }

    public getRooms() {
        const rooms: Rooms = this.commService.returnRooms();
        return rooms;
    }

    public getDisplayRoom(room: Room): DisplayRoom {
        return {
            _id: room._id,
            name: (room.name) ? room.name : room.participants.map((participant) => participant.username).join(', '),
            participants: room.participants,
            messages: room.messages,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt
        };
    }

    public getRoomAvatar(room: Room): string {
        if (room.participants.length === 2) {
            const participant = room.participants.find(
                (participant) => participant._id !== this.authService.returnUser()?._id
            )
            if (participant) {
                return participant.avatar;
            }
        }
        return room.participants.map(
            (participant) => participant.avatar
        ).join(', ');
    }

    public getRoomAvatarStyle(room: Room): string {
        return (room.participants.length === 2) ? 'bottts' : 'initials';
    }

    public checkActive(roomId: string): boolean {
        const currentLocation: string = this.location.path();
        const currentId = currentLocation.substring(currentLocation.lastIndexOf('/') + 1);
        return roomId === currentId;
    }

    public getRoomUpdatedAt(room: Room): string {
        return format(new Date(room.updatedAt), 'h:mm aaa');
    }

    public changeRoom(roomId: RawObjectId) {
        this.commService.retrieveMessages(roomId);
    }

    public createRoom() {
        this.addLoading = true;
        this.commService.createRoom()
            .then((room: Room) => {
                this.addLoading = false;
                // add room to socket server
                const socketRoom: SocketRoom = {
                    _id: room._id,
                    name: (room.name) ? room.name : null,
                    participants: room.participants.map((participant: User): SocketRoomUser => {
                        const { _id, username, avatar, tag, email, createdAt, updatedAt } = participant;
                        const socketUser: SocketRoomUser = {
                            _id,
                            username,
                            avatar,
                            tag,
                            email,
                            createdAt,
                            updatedAt
                        }
                        return socketUser;
                    }),
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                }
                this.socketService.addRoom(socketRoom);
            })
            .catch(() => {
                this.addLoading = false;
            });
    }
}
