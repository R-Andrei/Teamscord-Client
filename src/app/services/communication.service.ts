import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
// @ts-ignore
import _ from 'lodash';

import { ResponseRoom, ResponseRoomList, ResponseRooms, Room, Rooms } from '../types/Room';
import { RawObjectId } from '../types/Misc';
import { MessageUser, ProfileUpdateProps, ResponseUser, User } from '../types/User';
import { ResponseMessage, ResponseMessageList, ResponseMessages } from '../types/Message';
import { AuthService } from './auth.service';
import { Message } from '../types/Message';
import { SocketService } from './sockets.service';



@Injectable({
    providedIn: 'root'
})
export class CommService {

    private rooms: Rooms = [];
    private currentRoomId: RawObjectId | null = null;
    private messageLoading: boolean = false;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private location: Location
    ) {
    }

    public returnRooms(): Rooms {
        return this.rooms;
    }

    public returnMessageLoading(): boolean {
        return this.messageLoading;
    }

    public returnRoom(_id: RawObjectId): Room | null {
        const room: Room | undefined = this.rooms.find(
            (room: Room): boolean => room._id === _id
        );
        if (room)
            return room;
        else
            return null;
    }

    public changeRoom() {
        const currentRoom = this.getCurrentRoom();
        if (currentRoom) {
            this.currentRoomId = currentRoom._id;
        } else {
            this.currentRoomId = null;
        }
    }

    public changeRoomPromise(): Promise<RawObjectId> {
        return new Promise<RawObjectId>((resolve, reject) => {
            const currentRoom = this.getCurrentRoom();
            if (currentRoom) {
                this.currentRoomId = currentRoom._id;
                resolve(currentRoom._id);
            } else {
                reject(new Error('No current room.'));
            }
        });
    }

    public retrieveRooms(_id: RawObjectId): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.http.request(
                'POST',
                'messages/rooms/retrieve',
                { body: { _id } }
            ).subscribe({
                'next': (res: ResponseRooms) => {
                    if (res.data) {
                        const rooms: Rooms = this.mapResponseRooms(res.data);
                        this.rooms = rooms;
                        resolve(true);
                    } else {
                        reject(new Error('Invalid response.'));
                    }
                },
                'error': (err: Error) => {
                    reject(err);
                }
            });
        });
    }

    public retrieveMessages(roomId: RawObjectId | null = null): void {
        // get room with either null id or param id
        const currentRoom = this.getCurrentRoom(roomId);

        // if not current room for some reason
        // it means something didn't work
        if (currentRoom) {

            // only retrieve messages for rooms that 
            // have not been retrieved before (loaded attribute)
            if (!currentRoom.loaded) {
                const currentRoomId = currentRoom._id;
                const lastMessage = (currentRoom.messages.length > 0)
                    ? currentRoom.messages[currentRoom.messages.length - 1].createdAt
                    : null;
                this.http.request(
                    'POST',
                    'messages/message/retrieve',
                    { body: { roomId: currentRoomId, lastTimestamp: lastMessage } }
                ).subscribe({
                    'next': (res: ResponseMessages) => {
                        if (res.data) {
                            const messages: Message[] = this.mapResponseMessages(res.data);
                            this.rooms = this.rooms.map(
                                (room: Room): Room => {
                                    if (room._id === currentRoom._id) {
                                        room.loaded = true;
                                        room.messages = _.orderBy([...room.messages, ...messages], ['createdAt'], ['asc']);
                                    }
                                    return room;
                                }
                            );
                        }
                    },
                    'error': (err: Error) => {
                        console.error(err);
                    }
                });
            }
        } else {
            console.error('No current room.');
        }
    }


    public sendMessage(roomId: RawObjectId, message: string): Promise<Message> {
        this.messageLoading = true;
        return new Promise<Message>((resolve, reject) => {
            const user: User | null = this.authService.returnUser();
            if (user) {
                const messageUser: MessageUser = {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    tag: user.tag,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
                this.http.request(
                    'POST',
                    'messages/message/send',
                    { body: { roomId, message, sender: messageUser } }
                ).subscribe({
                    'next': (res: ResponseMessage) => {
                        const { _id, roomId, sender, message, createdAt, updatedAt } = res;
                        if (_id && roomId && sender && message && createdAt && updatedAt) {
                            const validMessage: Message = {
                                _id,
                                roomId,
                                sender,
                                message,
                                createdAt: new Date(createdAt),
                                updatedAt: new Date(updatedAt)
                            };
                            this.rooms = this.rooms.map(
                                (room: Room): Room => {
                                    if (room._id === roomId) {
                                        room.updatedAt = new Date(updatedAt);
                                        room.messages.push(validMessage);
                                    }
                                    return room;
                                });
                            this.messageLoading = false;
                            resolve(validMessage);
                        } else {
                            this.messageLoading = false;
                            reject(new Error('Invalid message.'));
                        }
                    },
                    'error': (err: Error) => {
                        this.messageLoading = false;
                        reject(err);
                    },
                    'complete': (): void => {
                        this.messageLoading = false;
                    }
                });
            } else {
                this.messageLoading = false;
                reject(false);
            }
        });
    }

    public handleReceivedMessage(message: Message): void {
        this.rooms = this.rooms.map(
            (room: Room): Room => {
                if (room._id === message.roomId) {
                    room.updatedAt = new Date(message.createdAt);
                    room.messages.push(message);
                }
                return room;
            });
    }

    public getCurrentRoom(roomId: RawObjectId | null = null): Room | null {
        const currentLocation: string = this.location.path();
        const currentId = (roomId) ? roomId : currentLocation.substring(currentLocation.lastIndexOf('/') + 1);
        const room: Room | null = this.returnRoom(currentId);
        return room;
    }

    public updateRoomParticipantProfile(
        userId: RawObjectId,
        profileData: ProfileUpdateProps
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // map rooms to update
            const rooms: Rooms = this.rooms.map(
                (room: Room): Room => {
                    room.participants = room.participants.map(
                        (participant: User): User => {
                            if (participant._id === userId) {
                                const { language, avatar } = profileData;
                                return {
                                    ...participant,
                                    language: (language) ? language : participant.language,
                                    avatar: (avatar) ? avatar : participant.avatar
                                }
                            }
                            return participant;
                        }
                    );
                    return room;
                }
            );
            this.rooms = rooms;
            resolve(true);
        });
    }

    public addBuddyToRoom(roomId: RawObjectId, email: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.http.request(
                'POST',
                'messages/rooms/add-buddy',
                { body: { roomId, email } }
            ).subscribe({
                'next': (res: ResponseUser) => {
                    const {
                        _id, username, avatar, tag, email,
                        language, createdAt, updatedAt, status,
                    } = res;
                    if (_id && username && avatar && tag && email && language && createdAt && updatedAt && status) {
                        const validUser: User = {
                            _id, username, avatar, tag,
                            email, language, status,
                            createdAt: new Date(createdAt), 
                            updatedAt: new Date(updatedAt)
                        };
                        this.rooms = this.rooms.map(
                            (room: Room): Room => {
                                if (room._id === roomId) {
                                    room.participants.push(validUser);
                                }
                                return room;
                            }
                        );
                        resolve(true);
                    } else {
                        reject(new Error('Invalid user.'));
                    }
                },
                'error': (err: Error) => {
                    reject(err);
                },
                'complete': (): void => {
                    resolve(true);
                }
            });
        });
    }

    private mapResponseRooms(responseRooms: ResponseRoomList): Rooms {
        return responseRooms.map(
            (responseRoom: ResponseRoom): Room => {
                const { _id, name, participants, createdAt, updatedAt } = responseRoom;
                if (_id) {
                    return {
                        _id,
                        name: (name) ? name : null,
                        participants: (participants) ? participants?.map(
                            (participant: ResponseUser): User => this.buildUser(participant)
                        ).filter(
                            // filter out "invalid" users because typescript.
                            (participant: User): boolean => participant._id !== '$invalid$'
                        ) : [],
                        loaded: false,
                        messages: [],
                        createdAt: (createdAt) ? createdAt : new Date(),
                        updatedAt: (updatedAt) ? updatedAt : new Date()
                    };
                }
                else {
                    return {
                        _id: '$invalid$',
                        name: '$invalid$',
                        loaded: false,
                        participants: [],
                        messages: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        ).filter(
            // filter out "invalid" rooms because typescript.
            (room: Room): boolean => room._id !== '$invalid$'
        )
    }

    private buildUser(responseUser: ResponseUser): User {
        const {
            _id, username, tag, email,
            status, createdAt, updatedAt,
            avatar, language
        } = responseUser;
        if (
            _id && username && tag && email &&
            createdAt && updatedAt && status &&
            avatar && language
        ) {
            return {
                _id, username, tag, email,
                createdAt, updatedAt, status,
                avatar, language
            };
        } else {
            return {
                _id: '$invalid$',
                username: '$invalid$',
                tag: '$invalid$',
                avatar: '$invalid$',
                language: '$invalid$',
                email: '$invalid$',
                createdAt: new Date(),
                updatedAt: new Date(),
                status: '$invalid$'
            }
        }
    }

    private mapResponseMessages(responseMessages: ResponseMessageList): Message[] {
        return responseMessages.map(
            (responseMessage: ResponseMessage): Message => {
                const { _id, roomId, sender, message, createdAt, updatedAt } = responseMessage;
                if (
                    _id && roomId && sender && message &&
                    createdAt && updatedAt
                ) {
                    return {
                        _id,
                        roomId,
                        sender,
                        message,
                        createdAt: new Date(createdAt),
                        updatedAt: new Date(updatedAt)
                    };
                } else {
                    return {
                        _id: '$invalid$',
                        roomId: '$invalid$',
                        sender: {} as User,
                        message: '$invalid$',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            }
        ).filter(
            // filter out "invalid" messages because typescript.
            (message: Message): boolean => message._id !== '$invalid$'
        )
    }
}
