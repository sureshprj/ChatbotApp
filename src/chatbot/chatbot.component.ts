import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VoiceRecognitionService } from '../service/voice-recognition.service';
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai';
import { SYSTEM_COMMAND } from '../constant';
import { map } from 'rxjs';
import _ from "lodash";
import { ActionTypes } from '../app/users/users.component';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {

  @Input() pageActions: Array<string> = [];
  @Output() onActionResponse = new EventEmitter<any>();;

  querytext: string | undefined;
  history : Array<string> = [
    "Give command for User Table Add,filter,update and delete",
  ]
  openai: OpenAIApi;
  configuration: Configuration;
  gpt_config = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": SYSTEM_COMMAND
      }
    ],
    temperature: 0,
    max_tokens: 100,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  }
  

  constructor(
    public service: VoiceRecognitionService) {
    this.configuration = new Configuration({
      apiKey: "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"
    });
    this.openai = new OpenAIApi(this.configuration);
    this.service.init();
  }


  /**
   * Speech to text part
   */
  listening: boolean = false;
  startService(): void {
    this.listening = true;
    this.service.start();
    this.service.onResult().pipe(
      map(data => {
        this.querytext = data.content;
        return data.content;
      })
    );
  }

  stopService() {
    this.service.stop();
    this.listening = false;
  }

  /**
   * Open API section
   * 
   */

  public async connectOpenAI(prompt: any) {
    console.log("THE FINAL PROMPT IS ", prompt);

    await this.openai.createChatCompletion(prompt).then((res: any) => {
      //this.targetText.emit(x.data.choices[0].message.content)
      console.log("Response from OPENAI:: ", res.data.choices[0].message.content)
      try {
        const response = JSON.parse(res.data.choices[0].message.content);
        this.onActionResponse.emit(response);
        this.history.push(this.onAction(response))
      }catch(ex){
        this.history.push("Invalid Command, Please try with different command")
      }
    })
  }
  
  onAction(event: any) {
    switch (event.useraction) {
      //Add the new user 
      case ActionTypes.ADD:
        return "User Added Successfully";
      case ActionTypes.UPDATE:
        return "User Updated Successfully";
      case ActionTypes.DELETE:
        return "User Deleted Successfully";
      case ActionTypes.VIEW:
        return "User fillterd Successfully";
    }
      return "";
  }
  
  triggerOpenAI(){
    let prompt:string = "";
    prompt += this.querytext;
    let gpt_config = _.cloneDeep(this.gpt_config);
    gpt_config.messages[0].content = SYSTEM_COMMAND.replaceAll("{{ACTIONS}}",this.getFormFields())
    let userPrompt = {
      "role": "user",
      "content": prompt
    }
    gpt_config.messages.push(userPrompt);
    this.connectOpenAI(gpt_config);
  }

  getFormFields(){
    let actions = "";
    this.pageActions.forEach((item:string) => {
      actions += item + ",";
    });
    return actions.slice(0,actions.length-1);
  }
}
