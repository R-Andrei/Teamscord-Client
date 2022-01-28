import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { format } from 'date-fns';

import { CommService } from 'src/app/services/communication.service';
import { Room } from 'src/app/types/Room';
import { getTextWidth } from 'src/app/utils';
import { Message, Messages } from 'src/app/types/Message';
import { SocketService } from 'src/app/services/sockets.service';
// @ts-ignore
import * as language from '../../../environments/internationalization.json';
import { LanguageProperties } from 'src/app/types/Misc';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

    // @ts-ignore: Unreachable code error
    @ViewChild('chat') chat: ElementRef;
    public readonly languageProperties: LanguageProperties = language;

    constructor(
        private commService: CommService,
        private socketService: SocketService,
        private authService: AuthService,
        private location: Location
    ) { }

    ngOnInit(): void {
        console.log('init');
    }

    public getCurrentLanguage(): string {
        const user = this.authService.returnUser();
        if (user)
            return user.language;
        return 'en';
    }

    public messageLoading(): boolean {
        return this.commService.returnMessageLoading();
    }

    public sendMessage(event?: Event): void {
        
        if (event) {
            // stop event from reaching onChange function
            // this will cause the input's height to not be expanded
            event.stopImmediatePropagation();
        }

        const room: Room | null = this.getRoom();
        if (room) {
            this.commService.sendMessage(room._id, this.chat.nativeElement.value)
                .then((message: Message) => {
                    this.socketService.sendMessage(message);
                    this.chat.nativeElement.value = '';
                }).catch((err) => {
                    console.error(err);
                });
        } else {
            window.alert('No room found to send message.');
        }
    }

    public onChange(event: any) {
        console.log('input event', event);
        // set style height to chat
        this.chat.nativeElement.style.height = "40px";
        if (`${this.chat.nativeElement.scrollHeight + 2}px` !== this.chat.nativeElement.style.height)
            this.chat.nativeElement.style.height = this.chat.nativeElement.scrollHeight + 2 + 'px';
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

    public getParticipantsText(text: string): string {
        const width: number = getTextWidth(text);
        if (width > 300) {
            const difference = 320 / width;
            const newText = text.substring(0, Math.floor(difference * text.length) - 3) + '...';

            return newText;
        }
        return text;
    }

    public getMessages(): Messages {
        const room: Room | null = this.getRoom();
        if (room) {
            this.chat.nativeElement.style.height = "40px";
        if (`${this.chat.nativeElement.scrollHeight + 2}px` !== this.chat.nativeElement.style.height)
            this.chat.nativeElement.style.height = this.chat.nativeElement.scrollHeight + 2 + 'px';
            return room.messages;
        }
        return [];
    }

    public formatMessageTimestamp(createdAt: Date): string {
        // format time is like: 'day hh:mm am/pm'
        // if date is today, then show time only
        // if date is yesterday, then show 'yesterday'
        // if date is older than yesterday, then show 'day month'
        const today = new Date();
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        const date = new Date(createdAt);
        if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            return format(date, 'hh:mm a');
        } else if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
            return `Yesterday at ${format(date, 'hh:mm a')}`;
        } else {
            return format(createdAt, 'eeee hh:mm a');
        }
    }

}
