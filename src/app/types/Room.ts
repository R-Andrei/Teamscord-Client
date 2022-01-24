import { ResponseMessageList, Message } from "./Message";
import { RawObjectId } from "./Misc";
import { ResponseUser, SocketRoomUser, SocketUser, User } from "./User";

export interface Room {
    // actual room object; not all rooms have a name
    _id: RawObjectId;
    name?: string | null;
    participants: User[];
    loaded: boolean;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ResponseRoom {
    // used when receiving a room from the server
    // typescript doesn't like to "guess" the properties of the object
    _id?: RawObjectId;
    name?: string | null;
    participants?: ResponseUser[];
    messages?: ResponseMessageList[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DisplayRoom {
    // this interface is used for display
    // it always has a name because if it is null
    // it is generated from participant names
    _id: RawObjectId;
    name: string;
    participants: User[];
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export type Rooms = Room[];
export type ResponseRoomList = ResponseRoom[];

export interface ResponseRooms {
    data?: ResponseRoomList;
}

export interface SocketRoom {
    _id: RawObjectId;
    name: string | null;
    participants: SocketRoomUser[];
    createdAt: Date;
    updatedAt: Date;
}