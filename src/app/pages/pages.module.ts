import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { ParticipantsComponent } from './participants/participants.component';
import { ChatComponent } from './chat/chat.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivityComponent } from './activity/activity.component';
import { AutosizeModule } from 'ngx-autosize';


@NgModule({
    declarations: [
        PagesComponent,
        ParticipantsComponent,
        ChatComponent,
        ActivityComponent,
    ],
    imports: [
        CommonModule,
        NgbModule,
        AutosizeModule
    ],
    exports: [
        PagesComponent,
        ActivityComponent
    ]
})
export class PagesModule { }
