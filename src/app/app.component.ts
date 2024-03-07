import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  deviceForm = {
    deviceName: "",
    deviceSerialno: ""
  }

  output(data:any){
    console.log(data)
    try {
      let deviceData = JSON.parse(data);
      this.deviceForm = {...deviceData};
    }catch(e){

    }
    
  }
}
