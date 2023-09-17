<template>
    <div>
        <div class="panel panel-primary main">
            <div class="panel-heading panel-head">
                <h2>
                    Your chats
                </h2>
            </div>
            <div v-if="isCreating">
                <div class="panel-body">
                    <h4>Create new chat</h4>
                    <div class="form-group">
                        <div class="col-xs-6">
                            <strong>Chat name:</strong>
                            <input v-model.trim="newChatName" class="form-control" />
                            <button type="button" class="btn btn-default create-chat1" v-on:click="createChat">
                                Create
                            </button>
                        </div>
                        <div class="col-xs-6">
                            <strong>Password:</strong>
                            <input v-model.trim="newChatPassword" class="form-control" />
                            <button type="button" class="btn btn-default create-chat1" v-on:click="creatingCheckout">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="isJoining">
                <div class="panel-body">
                    <h4>Join chat</h4>
                    <div class="form-group">
                        <div class="col-xs-6">
                            <strong>Name:</strong>
                            <input v-model.trim="newChatName" class="form-control" />
                            <button type="button" class="btn btn-default create-chat1" v-on:click="joinChat">
                                Join
                            </button>
                        </div>
                        <div class="col-xs-6">
                            <strong>Password:</strong>
                            <input v-model.trim="newChatPassword" class="form-control" />
                            <button type="button" class="btn btn-default create-chat1" v-on:click="joiningCheckout">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-body" v-if="!isJoining && !isCreating">
                <div class="col-xs-12 scroll">
                    <div class="userchats" v-for="chat in chats" :key="chat.id">
                        <button :class="{'btn chatsbutton-not btn-sm': isUpdated(chat.id), 'btn chatsbutton btn-sm': !isUpdated(chat.id)}" @click="changeChat(chat.id)">
                            {{ chat.name }}
                        </button>
                      </div>
                </div>
                <div class="col-xs-6">
                    <button type="button" class="btn btn-default create-chat" v-on:click="joiningCheckout">
                        Join
                    </button>
                </div>
                <div class="col-xs-6">
                    <button type="button" class="btn btn-default create-chat" v-on:click="creatingCheckout">
                        Create
                    </button>
                </div>
            </div>
        </div>
        <div v-if="isCreatingError">
            <div class="alert alert-danger al">
                <span class="glyphicon glyphicon-exclamation-sign"></span> {{creatingErrorMessage}}
            </div>
        </div>
        <div v-if="isJoiningError">
            <div class="alert alert-danger al">
               <span class="glyphicon glyphicon-exclamation-sign"></span> {{joiningErrorMessage}}
            </div>
        </div>
    </div>
</template>

<script>
import { eventBus } from '@/App.vue';
import api from '@/utils/api'

export default {
    name: 'UserChats',
    props: ['logOut','chats', 'chatsUpdated', 'messages','isChatChosen', 'chatChosenCheckout','currentChatData'],
    data() {
        return {
            isCreating: false,
            isJoining: false,
            isCreatingError: false,
            isJoiningError: false,
            creatingErrorMessage: '',
            joiningErrorMessage: '',
            newChatName: '',
            newChatPassword: '',
            
        }
    },
    methods: {
        joiningCheckout() {
            this.isJoining = !this.isJoining;
            this.isJoiningError = false;
            this.newChatName = '';
            this.newChatPassword = '';
            this.joiningErrorMessage = '';
        },
        creatingCheckout() {
            this.isCreating = !this.isCreating;
            this.isCreatingError = false;
            this.newChatName = '';
            this.newChatPassword = '';
            this.creatingErrorMessage = '';
        },
        createChat() {
            if (this.newChatName.length === 0 || this.newChatPassword === 0){
                this.isCreatingError = true;
                this.creatingErrorMessage = 'One of the fields is not filled in.'
            } else {
                api.createRoom(this.newChatName, this.newChatPassword)
                .then(response => {
                    if (response.data) {
                        this.$emit('push:chats', { id: response.data.id, name: response.data.name, password: this.newChatPassword });
                    }
                    this.newChatName = '';
                    this.newChatPassword = '';
                    localStorage.setItem('chats', JSON.stringify(this.chats));
                    this.creatingCheckout();
                })
                .catch(e => {this.isCreatingError = true;
                    if (e.response) {
                        if (e.response.status == 404){
                            this.logOut();
                        }
                        const data = e.response.data;
                        console.log(data)
                        console.log(e)
                        this.creatingErrorMessage = Object.values(data).join('\n');
                    }
                    else {
                        this.creatingErrorMessage = Object.values(e).join('\n');
                        console.log(e)
                    }
                })
            }
        },
        joinChat() {
            if (this.newChatName.length === 0 || this.newChatPassword === 0){
                this.isJoiningError = true;
                this.joiningErrorMessage = 'One of the fields is not filled in.'
            } else {
                api.joinRoom(this.newChatName, this.newChatPassword)
                .then(response => {
                    if (response.data) {
                        this.$emit('push:chats', { id: response.data.id, name: response.data.name, password: this.newChatPassword });
                    }
                    this.newChatName = '';
                    this.newChatPassword = '';
                    localStorage.setItem('chats', JSON.stringify(this.chats));
                    this.joiningCheckout();
                })
                .catch(e => {
                this.isJoiningError = true;
                    if (e.response) {
                        if (e.response.status == 404){
                            this.logOut();
                        }
                        const data = e.response.data;
                        console.log(data)
                        console.log(e)
                        this.joiningErrorMessage = Object.values(data).join('\n');
                    }
                    else {
                        console.log(e)
                        this.joiningErrorMessage = Object.values(e).join('\n');
                    }
                })
            }
        },
        changeChat(newChatID) {
            if (newChatID != this.currentChatData.id) {
                api.getMessages(newChatID, 0)
                .then(response => {
                    this.$emit('update:currentChatData', this.chats.find(obj => obj.id === newChatID))
                    this.$emit('delete:chatsUpdated', newChatID);
                    if (response.data) {
                        this.$emit('update:messages', response.data.reverse())
                    }
                    if (!this.isChatChosen){
                        this.chatChosenCheckout();
                    }
                    eventBus.$emit('chat-update');
                    
                })
                .catch(e => {
                    if (e.response) {
                        if (e.response.status == 404){
                            this.$emit('delete:chats', newChatID);
                        }
                        const data = e.response.data;
                        console.log(data)
                        console.log(e)
                    }
                    else {
                        console.log(e)
                    }
                })
            }
        },
        isUpdated(chatId) {
            if (this.chatsUpdated.length){
                return this.chatsUpdated.includes(chatId);
            } else {
                return false;
            }
        },

    },
    
}
</script>

<style>
.chatsbutton {
    width: 100%;
    font-size: medium;
    background-color: #d9edf7;
    text-align: left;
    border: 0px;
}
.chatsbutton-not {
    width: 100%;
    font-size: medium;
    background-color: #f2dede;
    text-align: left;
    border: 0px;
}

.userchats {
    width: 100%;
    height: 40px;
    margin-top: 2px;
    margin-bottom: 2px;
}

.create-chat {
    width: 100%;
}
  
.create-chat1 {
    width: 100%;
    margin-top: 10px;
}
  
</style>