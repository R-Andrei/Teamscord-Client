import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginUserProps, ProfileUpdateProps, ResponseUser, User, UserUpdateProps } from '../types/User';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private user: User | null;
    private loading: boolean = false;

    constructor(
        private http: HttpClient
    ) {
        const storedUser = localStorage.getItem('user');
        const user = (storedUser) ? JSON.parse(storedUser) : null;
        this.user = user;
    }

    public retrieveUser(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.http.request('GET', 'auth/retrieve', {}).subscribe({
                'next': (res: ResponseUser) => {
                    try {
                        const user: User = this.buildUser(res);

                        this.setUser(user);
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                },
                'error': (err: Error) => {
                    reject(err);
                }
            });
        });
    }

    public isAuthenticated(): boolean {
        return !!this.user?.token;
    }

    public isAuthenticating(): boolean {
        return this.loading;
    }

    public returnUser(): User | null {
        return this.user;
    }

    public login(user: LoginUserProps): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.http.request('POST', 'auth/login', {
                body: user
            }).subscribe({
                'next': (res: ResponseUser) => {
                    try {
                        const user: User = this.buildUser(res);

                        this.setUser(user);
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                },
                'error': (err: Error) => {
                    reject(err);
                }
            });
        });
    }

    public logout(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.loading = true;
            this.http.request('POST', 'auth/logout', {
                body: {
                    _id: this.user?._id
                }
            }).subscribe({
                'next': (_) => {
                    // nothing happens here as we always log user out for some reason!
                },
                'error': (err: Error) => {
                    // we dun really care about errors here
                },
                'complete': () => {
                    this.loading = false;
                    this.removeUser();
                    resolve(true);
                }
            });
        });
    }


    public updateProfile(profileData: ProfileUpdateProps): Promise<ProfileUpdateProps> {
        this.loading = true;
        return new Promise((resolve, reject) => {
            this.http.request('POST', 'auth/profile/update', {
                body: {
                    _id: this.user?._id,
                    ...profileData
                }
            }).subscribe({
                'next': (_: any) => {
                    try {
                        const updateUser = this.user;
                        if (updateUser) {
                            // update user object
                            this.user = {
                                ...updateUser,
                                avatar: profileData.avatar || updateUser.avatar,
                                language: profileData.language || updateUser.language
                            };
                            this.loading = false;
                            resolve(profileData);

                        } else {
                            this.loading = false;
                            throw new Error('User is not authenticated');
                        }
                    } catch (err) {
                        this.loading = false;
                        reject(err);
                    }
                },
                'error': (err: Error) => {
                    this.loading = false;
                    reject(err);
                }
            });
        });
    }

    public removeUser(): void {
        this.user = null;
        localStorage.removeItem('user');
    }

    public updateUserStatus(status: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // first get current user
            const user: User | null = this.returnUser();
            if (user) {
                this.http.request<boolean>(
                    'POST',
                    'auth/profile/update-status',
                    { body: { userId: user._id, status } }
                ).subscribe({
                    'next': (_: boolean) => {
                        // if response is OK, update user status
                        const updateUser = {
                            ...user,
                            status
                        }
                        this.setUser(updateUser);
                        resolve(true);
                    },
                    'error': (err: Error) => {
                        reject(err);
                    }
                });
            } else {
                reject(false);
            }
        });
    }


    private buildUser(responseUser: ResponseUser): User {
        const {
            _id, username, tag, email,
            createdAt, updatedAt,
            token, status, avatar,
            language
        } = responseUser;
        if (
            _id && username && tag && email &&
            createdAt && updatedAt && token && status
            && avatar && language
        ) {
            const user: User = {
                _id, username, tag, email, status,
                createdAt, updatedAt, token, avatar,
                language
            };
            return user;
        } else {
            throw new Error('Invalid user data');
        }
    }

    private setUser(user: User): void {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }
}
