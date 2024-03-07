import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
export enum SpeechEvent {
  Start,
  End,
  FinalContent,
  InterimContent
}

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {

  recognition = new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  public text = '';
  tempWords: any;
  status = 0;
  language!: string;

  constructor(private ngZone: NgZone) { }
  init() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-us';

    this.recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
      .map((result: any) => result[0])
      .map((result: any) => result.transcript).join('');
      this.tempWords = transcript;
      console.log(transcript);
    })
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    this.recognition.addEventListener('end', (condition: boolean) => {
      if (this.isStoppedSpeechRecog && this.status == 1) {
        this.status = 0
        this.recognition.stop();
      } else if (this.status !== 2){
        this.wordConcat();
        this.onResult();
        this.status = 2;
        this.recognition.start();
      }
    });
  }

  stop() {
    this.text = '';
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();
    this.status = 1;
  }

  wordConcat() {
    this.text = this.text + ' ' + this.tempWords ;
    this.tempWords = '';
  }

  onResult(): Observable<any> {
    return new Observable(observer => {
      this.recognition.onresult = (event: any) => {
        let interimContent = '';
        let finalContent = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalContent += event.results[i][0].transcript;
            this.ngZone.run(() => {
              observer.next({
                event: SpeechEvent.FinalContent,
                content: finalContent
              });
            });
          } else {
            interimContent += event.results[i][0].transcript;
            this.ngZone.run(() => {
              observer.next({
                event: SpeechEvent.InterimContent,
                content: interimContent
              });
            });
          }
        }
      };
    })
  }
}
