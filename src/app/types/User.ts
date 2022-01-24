import { RawObjectId } from "./Misc";
import { SocketRoom } from "./Room";

export interface User {
    _id: RawObjectId;
    username: string;
    tag: string;
    email: string;
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
    createdAt: Date;
    updatedAt: Date;
}

export interface UserUpdateProps {
    username?: string;
    tag?: string;
    email?: string;
    token?: string;
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
    createdAt: Date;
    updatedAt: Date;
}

export interface SocketUser extends SocketRoomUser {
    status: string;
    rooms: SocketRoom[];
}
