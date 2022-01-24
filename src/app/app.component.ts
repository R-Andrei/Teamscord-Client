import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CommService } from './services/communication.service';
import { LayoutService } from './services/layout.service';
import { SocketService } from './services/sockets.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'client';

    constructor(
        private authService: AuthService,
        private layoutService: LayoutService,
        private commService: CommService,
        private socketService: SocketService
    ) {
        // first check if authenticated
        if (!this.authService.isAuthenticated()) {
            // toggle login if not
            this.layoutService.toggleLogin();
        } else {
            // if authenticated get user data
            this.authService.retrieveUser()
                .then((_: boolean) => {
                    // if user data is retrieved, retrieve rooms
                    const user = this.authService.returnUser();
                    if (user)
                        this.commService.retrieveRooms(user._id)
                            .then((_: boolean) => {
                                // after rooms are retrieved, get messages for current room
                                this.commService.retrieveMessages();
                                this.socketService.initSocket();
                            })
                            .catch((err: Error) => {
                                console.error(err);
                            });
                    else {
                        console.log('No user found.');
                    }
                })
                .catch((err: any) => {
                    console.error(err);
                });
        }
    }

    public settings(): boolean {
        return this.layoutService.getSettings();
    }

    public login(): boolean {
        return this.layoutService.getLogin();
    }
}
