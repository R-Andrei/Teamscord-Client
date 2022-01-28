import { RawObjectId } from "./Misc";
import { SocketRoom } from "./Room";

export enum UserStatuses {
    online = 'Online',
    offline = 'Offline',
    busy = 'Busy',
    away = 'Away'
}

export interface UserStatusesOption {
    key: number;
    value: string;
    label: string;
}

export interface User {
    _id: RawObjectId;
    username: string;
    tag: string;
    email: string;
    avatar: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    token?: string;
}

export interface MessageUser {
    _id: RawObjectId;
    username: string;
    tag: string;
    email: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProfileUpdateProps {
    avatar?: string;
    language?: string;
}

export interface UserUpdateProps {
    username?: string;
    tag?: string;
    email?: string;
    token?: string;
    status?: string;
}

export interface LoginUserProps {
    email: string;
    password: string;
}

export interface ResponseUser {
    _id?: RawObjectId;
    username?: string;
    tag?: string;
    email?: string;
    avatar?: string;
    language?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: string;
    token?: string;
}

export interface SocketRoomUser {
    _id: RawObjectId;
    username: string;
    tag: string;
    email: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SocketUser extends SocketRoomUser {
    status: string;
    rooms: SocketRoom[];
}

export type UserStatusesOptions = UserStatusesOption[];
