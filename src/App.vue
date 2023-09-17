<template>
  <div id="app">
    <!-- Подключение стилевого файла Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
      integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <header>
      <div class="navbar head">
        <div class="nav navbar-header">
          <div class="navbar-brand-container">
            <!-- Название сайта -->
            <h1 class="sitename">{{ sitename }}</h1>
            <!-- Кнопка "Admin mode" или "User mode" -->
            <button v-if="isAdmin() && !isAdminMode" type="button" class="btn btn-lg admin-mode" v-on:click="adminModeCheckout">
              Admin mode
            </button>
            <button v-if="isAdmin() && isAdminMode" type="button" class="btn btn-lg admin-mode" v-on:click="adminModeCheckout">
              User mode
            </button>
          </div>
        </div>
        <div class="nav navbar-right">
          <div class="navbar-brand-container">
            <div v-if="userData.isLogIn">
              <!-- Приветствие пользователя -->
              <div class="navbar-text hello">Hello, {{ userData.nickname }}!</div>
              <!-- Кнопка "Log out" -->
              <button type="button" class="btn btn-lg logout" v-on:click="logOut">
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div v-if="userData.isLogIn">
      <div v-if="isAdminMode" class="col-xs-12">
        <!-- Компонент AdminMode -->
        <AdminMode v-bind:userData="userData"/>
      </div>
      <div v-if="!isAdminMode" class="col-xs-12 col-sm-3">
        <!-- Компонент UserChats -->
        <UserChats v-bind:logOut="logOut" v-bind:chats="chats" @push:chats="chatsPush" @delete:chats="chatsDelete" v-bind:chatsUpdated="chatsUpdated" @delete:chatsUpdated="chatsUpdatedDelete" v-bind:messages="messages" @update:messages="messagesUpdate" v-bind:isChatChosen="isChatChosen" v-bind:chatChosenCheckout="chatChosenCheckout" v-bind:currentChatData="currentChatData" @update:currentChatData="currentChatDataUpdate"/>
      </div>
      <div v-if="!isAdminMode" class="col-xs-12 col-sm-9">
        <!-- Компонент CurrentChat -->
        <CurrentChat v-bind:messages="messages" @push:messages="messagesPush" @update:messages="messagesUpdate" v-bind:isChatChosen="isChatChosen" v-bind:chatChosenCheckout="chatChosenCheckout" v-bind:currentChatData="currentChatData" @update:currentChatData="currentChatDataUpdate" v-bind:userData="userData"/>
      </div>
    </div>
    <div v-else class="col-xs-12">
      <div class="col-xs-12 col-sm-3">
      </div>
      <div class="col-xs-12 col-sm-6">
        <!-- Компонент LogInForm -->
        <LogInForm v-bind:logInCheckout="logInCheckout" v-bind:userData="userData" @update:userData="userDataUpdate" v-bind:chats="chats" @update:chats="chatsUpdate" />
      </div>
      <div class="col-xs-12 col-sm-3">
      </div>
    </div>
  </div>
</template>

<script>
import UserChats from '@/components/UserChats'
import CurrentChat from '@/components/CurrentChat'
import LogInForm from '@/components/LogInForm'
import AdminMode from '@/components/AdminMode'
import { addHandler, connect, disconnect } from '@/utils/ws';
import Vue from 'vue';

export const eventBus = new Vue();

export default {
  name: 'App',
  data: function () {
    return {
      sitename: 'MurMur',
      userData: {
        isLogIn: false,
        nickname: '',
        userId: 0,
        role: ''
      },
      currentChatData: {
        id: 0,
        name: '',
        password: '',
      },
      isChatChosen: false,
      chats: [],
      chatsUpdated: [],
      messages: [],
      connection: null,
      isAdminMode: false
    }
  },
  components: {
    UserChats,
    CurrentChat,
    LogInForm,
    AdminMode
  },
  methods: {
    logInCheckout() {
      this.userData.isLogIn = !this.userData.isLogIn;
    },
    chatChosenCheckout(){
      this.isChatChosen = !this.isChatChosen;
    },
    adminModeCheckout(){
      this.isAdminMode = !this.isAdminMode;
    },
    isAdmin(){
      if (this.userData.role === 'ROLE_ADMIN')
        return true;
      if (this.userData.role === 'ROLE_USER')
        return false;
    },
    logOut() {
      this.logInCheckout();
      this.chatChosenCheckout();
      this.userData.nickname = '';
      this.userData.userId = 0;
      this.userData.role = '';
      this.chats = [];
      this.messages = [];
      this.currentChatData.id = 0;
      this.currentChatData.name = '';
      this.currentChatData.password = '';
      this.isAdminMode = false;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      localStorage.setItem('chats', JSON.stringify(this.chats));
      disconnect();
    },
    userDataUpdate(newUserData){
      this.userData = newUserData;
    },
    currentChatDataUpdate(newCurChatData){
      this.currentChatData = newCurChatData;
    },
    chatsUpdate(newChats){
      this.chats = newChats;
    },
    chatsPush(newChat){
      this.chats.push(newChat);
    },
    chatsDelete(chatId){
      const chat = this.chats.find(obj => obj.id === chatId);
      const index = this.chats.indexOf(chat);
      if (index !== -1) {
        this.chats.splice(index, 1);
        localStorage.setItem('chats', JSON.stringify(this.chats));
      }
    },
    messagesUpdate(newMessages){
      this.messages = newMessages;
    },
    messagesPush(newMessages){
      this.messages = newMessages.concat(this.messages);
    },
    
    chatsUpdatedDelete(chatId){
      const index = this.chatsUpdated.indexOf(chatId);
      if (index !== -1) {
        this.chatsUpdated.splice(index, 1);
      }
    },
    handleMessage(message){
      if (message.roomId === this.currentChatData.id){
        this.messages.push(message);
        if (this.messages.length % 20 === 1 && this.messages.length != 1){
          this.messages.splice(0, 1);
        }
        eventBus.$emit('message-receive');
      } 
      if (message.roomId != this.currentChatData.id && !this.chatsUpdated.includes(message.roomId)){
        this.chatsUpdated.push(message.roomId); 
      }
    }
  },
  created: function(){
    addHandler(this.handleMessage);
  },
  beforeMount: function() {
    this.userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {
        isLogIn: false,
        nickname: '',
        userId: 0,
        role: ''
      };
    if (this.userData.isLogIn){
      connect(this.userData.userId);
    }
    this.chats = localStorage.getItem('chats') ? JSON.parse(localStorage.getItem('chats')) : [];
  },
  
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
  margin-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
  
}

.sitename {
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;

}

.navbar-brand-container {
  display: flex;
  align-items: center;
}

.hello {
  font-size: large;
}

.logout {
  color: #2c3e50;
  margin-right: 25px;
  margin-top: 7px;
}

.admin-mode {
  color: #2c3e50;
}

.head {
  background-color: #2c3e50;
  color: white;
  margin-left: 15px;
  margin-right: 15px;
}

.main {
  height: 657px
}

.panel-head {
  height: 85px;
}


.scroll {
  height: 500px;
  overflow: auto;
  margin-bottom: 10px
}

.long-content {
  font-size: 14px;
  word-wrap: break-word;
}

.al {
  display: inline-block;
  font-size: 14px;
  word-wrap: break-word;
}
</style> 
