import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
    declarations: [
    SettingsComponent
  ],
    imports: [
        CommonModule,
        FormsModule, 
        ReactiveFormsModule,
    ],
    exports: [
        SettingsComponent
    ]
})
export class SettingsModule { }
