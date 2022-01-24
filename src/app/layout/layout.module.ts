import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';


@NgModule({
    declarations: [
        SidebarComponent,
        HeaderComponent
    ],
    imports: [
        CommonModule,
        NgbModule,
        RouterModule
    ],
    exports: [
        SidebarComponent,
        HeaderComponent
    ]
})
export class LayoutModule { }
