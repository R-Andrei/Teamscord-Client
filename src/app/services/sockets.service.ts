import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { io, Socket } from 'socket.io-client';

import { AuthService } from './auth.service';
import { SocketRoomUser, SocketUser, User } from '../types/User';
import { Room, Rooms, SocketRoom } from '../types/Room';
import { CommService } from './communication.service';
import { Message } from '../types/Message';
import { RawObjectId } from '../types/Misc';



@Injectable({
    providedIn: 'root'
})
export class SocketService {

    private socket: Socket;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private commService: CommService,
        private location: Location
    ) {
        this.socket = io('ws://localhost:3002');
        this.socket.on('receiveMessage', (message: Message): void => {
            const senderId: RawObjectId = message.sender._id;
            const currentUser: User | null = authService.returnUser();
            if (currentUser) {
                console.log(`current user: ${currentUser._id}`);
                console.log(`received message from: ${senderId}`);
                if (senderId !== currentUser._id) {
                    this.commService.handleReceivedMessage(message);
                }
            } else {
                console.error('No user found.');
            }
        });
    }

    public initSocket(): void {
        const user: User | null = this.authService.returnUser();
        const rooms: Rooms = this.commService.returnRooms();

        if (user) {
            const socketRooms: SocketRoom[] = rooms.map((room: Room) => {
                const participants: SocketRoomUser[] = room.participants.map((participant: User) => {
                    return {
                        _id: participant._id,
                        username: participant.username,
                        tag: participant.tag,
                        email: participant.email,
                        createdAt: participant.createdAt,
                        updatedAt: participant.updatedAt
                    };
                });

                return {
                    _id: room._id,
                    name: (room.name) ? room.name : null,
                    participants,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                };
            });
            const socketUser: SocketUser = {
                _id: user._id,
                username: user.username,
                tag: user.tag,
                email: user.email,
                rooms: socketRooms,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                status: user.status,
            }
            this.socket.emit("userConnection", { user: socketUser, rooms: socketRooms });
        } else {
            console.error('No user found.');
        }
    }

    public sendMessage(message: Message): void {
        console.log('sending message to socket server');
        this.socket.emit('sendMessage', message);
    }

}
