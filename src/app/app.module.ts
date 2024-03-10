import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatDividerModule} from '@angular/material/divider'
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UsersComponent } from './users/users.component';
import { MatMenuModule  } from "@angular/material/menu"
import {MatListModule} from '@angular/material/list';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
