import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import _ from 'lodash';

export class UserElement {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  //roles: string;
  constructor(id: number, firstName: string, lastname: string, email: string) {
    this.id = id;
    this.firstname = firstName;
    this.lastname = lastname;
    this.email = email;
   // this.roles = roles;
  }
}
export const ActionTypes = {
  "ADD": "ADD",
  "VIEW": "VIEW",
  "DELETE": "DELETE",
  "UPDATE": "UPDATE"
}
export type ACTION = "ADD" | "View" | "DELETE" | "UPDATE";

export interface UsersPageActions {
  useraction: ACTION,
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  //roles: Array<string>;
}
const ELEMENT_DATA: UserElement[] = [
  {
    id: 1,
    firstname: "iotnms",
    lastname: "admin",
    email: "iotnmsadmin@cisco.com",
   // roles: ["Super Admin", "Tenant Admin", "Device Operator"]
  },
  {
    id: 2,
    firstname: "Demo",
    lastname: "user",
    email: "demouser@cisco.com",
    // roles: ["Super Admin", "Tenant Admin", "Device Operator"]
  },
  {
    id: 3,
    firstname: "Prod",
    lastname: "admin",
    email: "prodadmin@cisco.com",
    // roles: ["Super Admin", "Tenant Admin", "Device Operator"]
  },
  {
    id: 4,
    firstname: "super",
    lastname: "user",
    email: "superuser@cisco.com",
    // roles: ["Super Admin", "Tenant Admin", "Device Operator"]
  }
];

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  filterText: string = "";
  actionsList = ["action", "id", "firstname", "lastname", "email"];
  displayedColumns: string[] = ['id', 'firstname', 'lastname', 'email'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  dataToDisplay = _.cloneDeep(ELEMENT_DATA)

  constructor(){
  }
 
  updateDataSource(newUsers: UserElement[]){
    this.dataToDisplay = newUsers;
    this.dataSource.data = this.dataToDisplay;
  }
  searchUser(){
    const filterValue = this.filterText;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onAction(event: UsersPageActions) {
    switch (event.useraction) {
      //Add the new user 
      case ActionTypes.ADD:
        this.addUser(event);
        break;
      case ActionTypes.UPDATE:
        this.updateUser(event);
        break;
      case ActionTypes.DELETE:
        this.deleteUser(event);
        break;
      case ActionTypes.VIEW:
        this.filterUser(event);
        break;
    }
  }

  addUser(user: any) {
    this.updateDataSource([...this.dataSource.data, this.getUserElement(user)])
  }
  filterUser(user:any) {
    const userObj:any = this.getUserElement(user);
    delete userObj.id;
    this.filterText = Object.keys(userObj).map((key:string)=>{
        return  userObj[key] ? `${userObj[key]}` : undefined;
    }).filter(e=>e).toString();
    this.filterText = this.filterText.replaceAll("*", "")
    this.searchUser();
  }

  deleteUser(user: any) {
    const index = this.findUser(user);
    if(index > -1){
      let newUsers = [...this.dataToDisplay];
      newUsers.splice(index,1);
      this.updateDataSource(newUsers)
    }else{
      console.error("Delete operation failed");
    }
  }
  updateUser(user: any) {
    const index = this.findUser(user.change_from);
    if(index > -1){
      const userObj:any = this.removeEmpty(this.getUserElement(user.change_to));
      const existingUser = this.dataToDisplay[index];
      const newUser = Object.assign({},{...existingUser},{...userObj},{id:existingUser.id})
      let newUsers = [...this.dataToDisplay];
      newUsers.splice(index,1,newUser);
      this.updateDataSource(newUsers)
    }else{
      console.error("Update operation failed");
    }
  }

  getUserElement(user:any):UserElement{
    let newUser: UserElement = new UserElement(
      user.id || this.dataSource.data.length,
      user.firstname || "",
      user.lastname || "",
      user.email || ""
    );
    return newUser;
  }
  
  findUser(user:UserElement){
    const findUser = this.dataToDisplay.filter(obj=>{
        if(obj.id === user.id){
          return true;
        }else if(obj.firstname === user.firstname){
          return true;
        }else if(obj.lastname === user.lastname){
          return true;
        }else if(obj.email === user.email){
          return true;
        }
        return false;
    });
    if(findUser.length){
      return this.dataToDisplay.indexOf(findUser[0])
    }else{
      return -1;
    }
  }
  removeEmpty(obj={}) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v));
  }

}
