# Web Speech API Angular2
Speech Recognition functionality of the Web Speech API in Angular2 application

### Speech Recognition

Speech recognition involves receiving speech through a device's microphone, which is then checked by a speech recognition service against a list of grammar (basically, the vocabulary you want to have recognised in a particular app.) When a word or phrase is successfully recognised, it is returned as a result (or list of results) as a text string, and further actions can be initiated as a result.

The Web Speech API has a main controller interface for this — SpeechRecognition — plus a number of closely-related interfaces for representing grammar, results, etc. Generally, the default speech recognition system available on the device will be used for the speech recognition — most modern OSes have a speech recognition system for issuing voice commands. Think about Dictation on Mac OS X, Siri on iOS, Cortana on Windows 10, Android Speech, etc.

-----   

#### Chrome support

As mentioned earlier, Chrome currently supports speech recognition with prefixed properties, therefore at the start of our code we include these lines to feed the right objects to Chrome, and non-prefix browsers, like Firefox:

    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent  

#### Properties

* __SpeechRecognition.lang__: Sets the language of the recognition. Setting this is good practice, and therefore recommended.
* __SpeechRecognition.interimResults__: Defines whether the speech recognition system should return interim results, or just final results. Final results are good enough for this simple demo.
* __SpeechRecognition.maxAlternatives__: Sets the number of alternative potential matches that should be returned per result. 

              recognition.continuous = false;
              recognition.lang = 'en-US';
              recognition.interimResults = false;
              recognition.maxAlternatives = 1;

#### Event handlers

* SpeechRecognition.onaudiostart
    
    Fired when the user agent has started to capture audio.
    
* SpeechRecognition.onaudioend

    Fired when the user agent has finished capturing audio.
    
* SpeechRecognition.onend

    Fired when the speech recognition service has disconnected.
    
* SpeechRecognition.onerror

    Fired when a speech recognition error occurs.
    
* SpeechRecognition.onnomatch

    Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    
* SpeechRecognition.onresult

    Fired when the speech recognition service returns a result — a word or phrase has been positively recognized and this has been communicated back to the app.
    
* SpeechRecognition.onstart

    Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition. 

#### Method

* SpeechRecognition.abort()

    Stops the speech recognition service from listening to incoming audio, and doesn't attempt to return a SpeechRecognitionResult.
    
* SpeechRecognition.start()

    Starts the speech recognition service listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    
* SpeechRecognition.stop()

    Stops the speech recognition service from listening to incoming audio, and attempts to return a SpeechRecognitionResult using the audio captured so far. 
    
-----   

#### Starting the speech recognition

    recognition.start();

#### Receiving and handling results

    recognition.onresult = function(event) {
      var last = event.results.length - 1;
      console.log(event.results[last][0].transcript);
      console.log('Confidence: ' + event.results[0][0].confidence);
    }

The SpeechRecognitionEvent.results property returns a SpeechRecognitionResultList object containing SpeechRecognitionResult objects. It has a getter so it can be accessed like an array — so the [last] returns the SpeechRecognitionResult at the last position. Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual recognised words. These also have getters so they can be accessed like arrays — the [0] therefore returns the SpeechRecognitionAlternative at position 0 

#### Stopping the speech recognition

    recognition.stop(); 

#### Handling error in the speech recognition

SpeechRecognition.onerror handles cases where there is an actual error with the recognition successfully — the SpeechRecognitionError.error property contains the actual error returned:

    recognition.onerror = function(event) {
      console.log(event.error);
    }
    
-----   

# Web Speech API in Angular2

### Angular2 Service using Web Speech API 

    import { Injectable, NgZone } from '@angular/core';
    import { Observable } from 'rxjs/Rx';
    import * as _ from "lodash";

    interface IWindow extends Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }

    @Injectable()
    export class SpeechRecognitionService {
        speechRecognition: any;

        constructor(private zone: NgZone) {
        }

        record(): Observable<string> {

            return Observable.create(observer => {
                const { webkitSpeechRecognition }: IWindow = <IWindow>window;
                this.speechRecognition = new webkitSpeechRecognition();
                //this.speechRecognition = SpeechRecognition;
                this.speechRecognition.continuous = true;
                //this.speechRecognition.interimResults = true;
                this.speechRecognition.lang = 'en-us';
                this.speechRecognition.maxAlternatives = 1;

                this.speechRecognition.onresult = speech => {
                    let term: string = "";
                    if (speech.results) {
                        var result = speech.results[speech.resultIndex];
                        var transcript = result[0].transcript;
                        if (result.isFinal) {
                            if (result[0].confidence < 0.3) {
                                console.log("Unrecognized result - Please try again");
                            }
                            else {
                                term = _.trim(transcript);
                                console.log("Did you said? -> " + term + " , If not then say something else...");
                            }
                        }
                    }
                    this.zone.run(() => {
                        observer.next(term);
                    });
                };

                this.speechRecognition.onerror = error => {
                    observer.error(error);
                };

                this.speechRecognition.onend = () => {
                    observer.complete();
                };

                this.speechRecognition.start();
                console.log("Say something - We are listening !!!");
            });
        }

        DestroySpeechObject() {
            if (this.speechRecognition)
                this.speechRecognition.stop();
        }

    }

### Component using above service 

    import { Component, OnInit, OnDestroy} from '@angular/core';
    import { SpeechRecognitionService } from './speech-recognition.service';

    @Component({
        selector: 'my-app',
        templateUrl: './App/app.component.html'
    })

    export class AppComponent implements OnInit, OnDestroy {
        showSearchButton: boolean;
        speechData: string;

        constructor(private speechRecognitionService: SpeechRecognitionService) {
            this.showSearchButton = true;
            this.speechData = "";
        }

        ngOnInit() {
            console.log("hello")
        }

        ngOnDestroy() {
            this.speechRecognitionService.DestroySpeechObject();
        }

        activateSpeechSearchMovie(): void {
            this.showSearchButton = false;

            this.speechRecognitionService.record()
                .subscribe(
                //listener
                (value) => {
                    this.speechData = value;
                    console.log(value);
                },
                //errror
                (err) => {
                    console.log(err);
                    if (err.error == "no-speech") {
                        console.log("--restatring service--");
                        this.activateSpeechSearchMovie();
                    }
                },
                //completion
                () => {
                    this.showSearchButton = true;
                    console.log("--complete--");
                    this.activateSpeechSearchMovie();
                });
        }

    }

### Usage

**Before using project Install dependencies by typing below command in CMD**:

    npm install --save --save-dev
    
### Output

**Initial State:**

![screenshot_19](https://cloud.githubusercontent.com/assets/10474169/20865887/8fa9f69c-b9d2-11e6-923f-49f5127462f8.png)

**Example1:**

![screenshot_20](https://cloud.githubusercontent.com/assets/10474169/20865889/8fab5f1e-b9d2-11e6-9117-28d9e2603853.png)

**Example2:**

![screenshot_21](https://cloud.githubusercontent.com/assets/10474169/20865888/8faa89d6-b9d2-11e6-8fdd-b6ff8926fe56.png)

#### Reference

[Text Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API).

[API Reference](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
