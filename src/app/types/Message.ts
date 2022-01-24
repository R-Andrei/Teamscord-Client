import { Room } from "./Room";
import { MessageUser, User } from "./User";


export interface Message {
    _id: string;
    roomId: string;
    sender: MessageUser;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ResponseMessage {
    _id?: string;
    roomId?: string;
    sender?: MessageUser;
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Messages = Message[];
export type ResponseMessageList = ResponseMessage[];

export interface ResponseMessages {
    data?: ResponseMessageList;
}