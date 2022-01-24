import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
})
export class LayoutService {

    private settings: boolean = false;
    private login: boolean = false;

    constructor(
    ) {

    }

    public toggleLogin(): void {
        this.login = !this.login;
    }

    public getLogin(): boolean {
        return this.login;
    }

    public toggleSettings(): void {
        this.settings = !this.settings;
    }

    public getSettings(): boolean {
        return this.settings;
    }

}
