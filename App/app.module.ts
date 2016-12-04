import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SpeechRecognitionService } from './speech-recognition.service';

@NgModule({
    imports: [
        //angular builtin module
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        SpeechRecognitionService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {
}

