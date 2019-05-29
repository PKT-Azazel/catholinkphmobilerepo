import { Component,ElementRef,ViewChild  } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http, Headers,RequestOptions } from '@angular/http';
import * as io from "socket.io-client";
import {AuthServiceProvider} from '../../providers/auth-service/auth-service';
import { BackEndConfig } from '../../backend.config';
import {FileService} from '../../providers/file/file.service';
@Component({
  selector: 'page-bfast-chat',
  templateUrl: 'bfast-chat.html'
})
export class BfastChatPage {
  apiEndpoint : string = BackEndConfig.API_ENDPOINT;
  headers;
  requestOptions;

  // chatroomdetails;  selectedChatroom
  @ViewChild('chatContents') private chatsContainer: ElementRef;
  socket = io(BackEndConfig.API_SOCKET_ENDPOINT);
  connectedUsers = [];
  user;
  connectedUsersInRoom = 0;

  chats: any = [];
  selectedChatRoom;
  chatRooms = [];
  selectedTab='chat';

  showAddModal = false;
  showEditModal = false;

  showLoading = false;
  showError = false;
  showSuccess = false;
  errorMessage = "";
  successMessage = "";
  showChatLoading = false;
  showChatError = false;
  isUserAdmin = false;

  showProfileEditModal = false;

  chatRoomToEdit;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: Http,
    public fileSvc : FileService,
    private authSvc : AuthServiceProvider) {
      this.headers = new Headers();
      this.headers.append('Authorization', this.authSvc.GetAuthToken());
      this.headers.append('Content-Type', 'application/json');
      this.requestOptions = new RequestOptions({ headers: this.headers , withCredentials: true }); 
  }

  ionViewDidEnter() {
    this.user = this.authSvc.GetCurrentUser();
    this.isUserAdmin = this.authSvc.CheckIfUserAdmin();


    this.socket.on('new-message', function (data) {
      if(data.message.room === this.selectedChatRoom._id) {
        this.chats.push(data.message);
        setTimeout(()=>{
          this.ScrollToBottom();
        },10)
        
      }
    }.bind(this));

    this.socket.on('chatroom-added', function (data) {
      this.chatRooms.push(data);
    }.bind(this));
    
    this.socket.on('chatroom-deleted', function (id) {
      for(let indx = 0;indx < this.chatRooms.length;indx++) {
        if(this.chatRooms[indx]._id === id) {
          this.chatRooms.splice(indx,1);
        }
      }
    }.bind(this));

    this.socket.on('chatroom-updated', function (bfastChatRoom) {
      for(let indx = 0;indx < this.chatRooms.length;indx++) {
        if(this.chatRooms[indx]._id === bfastChatRoom._id) {
          this.chatRooms[indx] = bfastChatRoom;
        }
      }
      if(this.chatRoomToEdit) {
        if(this.chatRoomToEdit._id === this.selectedChatRoom._id) {
          this.selectedChatRoom = bfastChatRoom;
        }
      }
    }.bind(this));

    this.socket.on('users-updated', function (data) {
      this.connectedUsers = data
      this.UpdateConnectedUsersInRoom();
      for(let indx = 0;indx < this.chatRooms.length;indx++) {
        if(this.chatRooms[indx]._id === data._id) {
          this.chatRooms[indx] = data;
        }
      }
      if(this.chatRoomToEdit) {
        if(this.chatRoomToEdit._id === this.selectedChatRoom._id) {
          this.selectedChatRoom = data;
        }
      }
    }.bind(this));

    this.socket.on('user-profile-updated', function (user) {
      for(let i = 0; i<this.connectedUsers.length;i++) {
        if(this.connectedUsers[i].info._id === user._id) {
          this.connectedUsers[i].info.fname = user.fname;
          this.connectedUsers[i].info.lname = user.lname;
          this.connectedUsers[i].info.image = user.image;
        }
      }
      if(this.user) {
        if(this.user._id === user._id) {
          this.user = user;
        }
      }
    }.bind(this));

    this.socket.on('chat-user-updated',function(bfastChat){
      for(let i = 0; i<this.chats.length;i++) {
        if(this.chats[i].userId === bfastChat.userId) {
          this.chats[i].fname = bfastChat.fname;
          this.chats[i].lname = bfastChat.lname;
          this.chats[i].image = bfastChat.image;
        }
      }
    }.bind(this));

    this.http.get(this.apiEndpoint + "bfast-chat-room/bfast-chat-rooms", this.requestOptions)
    .map(res =>  res.json()).subscribe(res => {
      this.chatRooms = res.data; 
      if(this.chatRooms.length > 0) {
        this.selectedChatRoom = this.chatRooms[0];
        this.InitializeChats(this.selectedChatRoom);
      } 
    })
  }

  UpdateConnectedUsersInRoom(){
    this.connectedUsersInRoom = 0;
    for(let i =0 ; i<this.connectedUsers.length;i++) {
      if(this.connectedUsers[i].roomJoined._id === this.selectedChatRoom._id) {
        this.connectedUsersInRoom ++;
      }
    }
  }

  CreatePrivateMessage(user) {
    if(user.info._id !== this.user._id) {
      let bfastChatRoom = {
        "chatRoomName" : user.info.fname + " " +user.info.lname + " - " + this.user.fname + " " + this.user.lname,
        "isPrivateRoom" : true,
        "privateMembers" : {
          members : [
            user.info._id,
            this.user._id
          ]
        }
      }

      this.http.get(this.apiEndpoint + "bfast-chat-room/bfast-chat-room-by-member?searchParams=" + this.user._id +"-"+ user.info._id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.data.length > 0) {
          this.InitializeChats(res.data[0]);
        } else {
          this.http.post(this.apiEndpoint + "bfast-chat-room/add-bfast-chat-room",bfastChatRoom, this.requestOptions)
          .map(res =>  res.json()).subscribe(res =>{
            if(res.success) {
              this.InitializeChats(res.data);
            }
          })
        }
      });

      
    }
  }

  ionViewWillLeave() {
    this.socket.emit('leave-room', this.user);
  }

  ScrollToBottom() {
    this.chatsContainer.nativeElement.scrollTop = this.chatsContainer.nativeElement.scrollHeight;
  }

  SendMessage(event,form) {
    
    event.preventDefault();
    if(this.user){
      let msgData = { 
        room: this.selectedChatRoom._id, 
        userId: this.user._id,
        fname: this.user.fname, 
        lname : this.user.lname,
        image : this.user.image,
        message: form.value.message 
      };

      new Promise((resolve, reject) => {
        this.http.post(this.apiEndpoint + "bfast-chat/", msgData)
          .map(res => res.json())
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      }).then((result) => {
          this.socket.emit('save-message', result);
          let inputMsgElement = document.getElementById("msg-input") as HTMLInputElement;
          inputMsgElement.value = "";
        }, (err) => {
          console.log(err);
      });
    }
  }

  InitializeChats(chatRoom){
    this.selectedChatRoom = chatRoom;
    this.selectedTab = "chat";
    this.showChatLoading = true;
    this.showChatError = false;
    if(this.user!==null) {

      this.socket.emit('leave-room', this.user);
      let newJoinedUserInfo = {
        info : this.user,
        roomJoined : this.selectedChatRoom
      }
      this.socket.emit('join-room', newJoinedUserInfo);

      new Promise((resolve, reject) => {
        this.http.get(this.apiEndpoint + "bfast-chat/" + chatRoom._id)
          .map(res => res.json())
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      }).then((res) => {
        this.chats = res;
        this.showChatLoading = false;
        setTimeout(()=>{
          this.ScrollToBottom();
        },10)
      }, (err) => {
        console.log(err);
      });
    } else {
      this.showChatLoading = false;
      this.showChatError = true;
    }
  }

  AddNewChatRoom(form,isPrivateRoom,privateMembers) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    
    let bfastChatRoom = {
      "chatRoomName" : form.value.chatRoomName,
      "isPrivateRoom" : isPrivateRoom,
      "privateMembers" : privateMembers
    }

    // Proceed to adding Religious Congregation Record
    this.http.post(this.apiEndpoint + "bfast-chat-room/add-bfast-chat-room",bfastChatRoom, this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.showLoading = false;
      if(res.success) {
        this.showSuccess = true;
        this.successMessage = "Room has been added successfully."

        // this.chatRooms.push(res.data);

        setTimeout(()=>{
          this.showSuccess = false;
          this.showAddModal = false;
        },1500);
      } else {
        this.errorMessage = res.err;
        this.showError = true;
      }
    })
  }


  DeleteChatRoom(id){
    if(confirm("Are you sure you want to delete this record?")) {

      this.http.delete(this.apiEndpoint + "bfast-chat-room/delete-bfast-chat-room?id=" + id, this.requestOptions)
      .map(res =>  res.json()).subscribe(res =>{
        if(res.success) {
          // for(let indx = 0;indx < this.chatRooms.length;indx++) {
          //   if(this.chatRooms[indx]._id === id) {
          //     this.chatRooms.splice(indx,1);
          //   }
          // }
          console.log("Record has been deleted successfully.")
        } 
      })
    }
  }

  OnEditModalShow(chatRoom) {
    this.chatRoomToEdit = chatRoom;

    setTimeout(()=>{
      this.showEditModal=true
    },10);
    
  }

  EditChatRoom(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";


    let bfastChatRoom = {
      _id : this.chatRoomToEdit._id,
      "chatRoomName" : form.value.chatRoomName
    }

    // Proceed to adding Religious Congregation Record
    this.http.put(this.apiEndpoint + "bfast-chat-room/update-bfast-chat-room?id=" + this.chatRoomToEdit._id,bfastChatRoom, this.requestOptions)
    .map(res =>  res.json()).subscribe(res =>{
      this.showLoading = false;
      if(res.success) {
        this.showSuccess = true;
        this.successMessage = "Record has been updated successfully."

        setTimeout(()=>{
          this.showSuccess = false;
          this.showEditModal = false;
        },1500);
      } else {
        this.errorMessage = res.err;
        this.showError = true;
      }
    })

  }

  OnEditProfileModalShow() {
    this.showProfileEditModal = true;
    setTimeout(()=>{
      let editProfileInputFile = document.getElementById("edit-profile-image-input") as HTMLInputElement;
      let editProfileImgPreview = document.getElementById("edit-profile-image-preview") as HTMLImageElement;
      //On Input file changed
      editProfileInputFile.addEventListener("change",function(){
        //Update Image Preview
        if(editProfileInputFile.files[0]) {
          editProfileImgPreview.src= window.URL.createObjectURL(editProfileInputFile.files[0]);
        } else {
          editProfileImgPreview.src = "//:0";
        }
      })
    },10);
  }

  EditProfile(form) {
    this.showLoading = true;
    this.showError = false;
    this.showSuccess = false;
    this.errorMessage = "";
    this.successMessage = "";

    let user = {
      fname : form.value.fname,
      lname : form.value.lname,
      email : form.value.email,
      image : this.user.image
    }

    //1) Get Image
    let editProfileInputFile = document.getElementById("edit-profile-image-input") as HTMLInputElement;
    let imagesFormData = new FormData();
    if(editProfileInputFile.files[0]){
      imagesFormData.append("user-profile-images", editProfileInputFile.files[0], editProfileInputFile.files[0]["name"]);
    } 

    //2)Upload Images
    this.fileSvc.httpUploadFiles(imagesFormData,"user-profile-images").subscribe(resImage=>{
      if (!resImage.success) {
        this.showLoading = false;
        this.errorMessage = (resImage.success !== "") ? resImage.err : "Failed to update record. Please try again.";
        this.showError = true;
      } else {
        //On Images Upload Success
        if(resImage.data.length >0) {
          resImage.data.forEach((element,i) => {
            user.image = element.secure_url.replace(/\\/g, "/");
          });
        } 

        this.authSvc.httpUpdateUserProfile(user,this.user._id).subscribe(res =>{
          this.showLoading = false;
          if(res.success) {
            this.showSuccess = true;
            this.successMessage = "Record has been updated successfully."
    
            setTimeout(()=>{
              this.showSuccess = false;
              this.showProfileEditModal = false;
            },1500);
          } else {
            this.errorMessage = res.err;
            this.showError = true;
          }
        })
      } //Upload Image "On Success -- (Else Statement)"
    }); //Upload Images Subscribe

    

  }

  IsString(val) {
    return typeof(val) === "string";
  }

}
