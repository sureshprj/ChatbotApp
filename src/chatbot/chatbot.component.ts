import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VoiceRecognitionService } from '../service/voice-recognition.service';
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai';
import { GPT_CONFIG, KEY_CONFIG, SYSTEM_COMMAND } from '../constant';
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
  processing: boolean = false;
  querytext: string | undefined;
  history : Array<string> = [
    "Give command for User Table Add,filter,update and delete",
  ]
  openai: OpenAIApi;
  configuration: Configuration;

  constructor(
    public service: VoiceRecognitionService) {
    this.configuration = new Configuration(KEY_CONFIG);
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
    this.processing = true;
    await this.openai.createChatCompletion(prompt).then((res: any) => {
      //this.targetText.emit(x.data.choices[0].message.content)
      console.log("Response from OPENAI:: ", res.data.choices[0].message.content)
      try {
        const response = JSON.parse(res.data.choices[0].message.content);
        this.onActionResponse.emit(response);
        this.history.push(this.onAction(response))
        this.querytext = "";
        this.processing = false;
      }catch(ex){
        this.history.push("Invalid Command, Please try with different command")
        this.processing = false;
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
    let gpt_config = _.cloneDeep(GPT_CONFIG);
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
