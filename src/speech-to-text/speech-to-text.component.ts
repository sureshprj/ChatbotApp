import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { VoiceRecognitionService } from '../service/voice-recognition.service';
import { Configuration, OpenAIApi } from 'openai';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.css'],
  providers: [VoiceRecognitionService]
})
export class SpeechToTextComponent {

  @Output() targetText = new EventEmitter<any>();
  
  fields: any = [
    "deviceName",
    "deviceSerialno"
  ];

  inputText: string = "";
  errorMessage$?: Observable<string>;
  transcript$?: Observable<string>;
  listening: boolean = false;

  Item = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": "You are a helpful assistant that parses unstructured device informtion into structured JSON data. The JSON should consist of the following information: "
      }
    ],
    temperature: 0,
    max_tokens: 100,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  }
  
  configuration = new Configuration({
    apiKey: "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"
  });

  openai = new OpenAIApi(this.configuration);

  public async openAIResponse(prompt: any) {
    
    await this.openai.createChatCompletion(prompt).then((x:any) => {
      console.log(x)
      this.targetText.emit(x.data.choices[0].message.content)
      this.Item.messages.pop();
    })
  }
  
  constructor(
    private router: Router,
    public route: ActivatedRoute,
    public service: VoiceRecognitionService) {
      this.service.init()
  }

  analyze(){
    this.analzeObj(this.inputText)
  }
  startService(): void {
    this.listening = true;
    this.service.start();
    this.transcript$ = this.service.onResult().pipe(
      map(data => {
        return data.content;
      })
    );
  }

  stopService() {
    this.service.stop();
    this.listening = false;
    this.analzeObj(this.service.text)
  }

  analzeObj(userInput:string){
    let prompt: string = "";
    prompt += userInput;
    //console.log(this.service.overallResult);
    this.Item.messages[0].content += this.concatinateTheValue();
    let data = {
      "role": "user",
      "content": prompt
    }
    this.Item.messages.push(data);
    this.openAIResponse(this.Item);
  }
  concatinateTheValue() {
    let prompt: string = '';
    prompt += "the json object should contain following fields "
    this.fields.forEach((item:any, index:number) => {
       prompt += item + ",";
    })

    prompt += ". In general, if certain information is not stated, set the respective field to null. Also the JSON object should be fully closed and completed."
    return prompt;
  } 

}
