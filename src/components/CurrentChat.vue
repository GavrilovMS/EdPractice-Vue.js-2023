<template>
  <div class="panel panel-primary main">
    <div class="panel-heading panel-head">
      <div class="row clearfix">
        <div class="col-md-6">
          <h2 v-if="isChatChosen">{{ currentChatData.name }}</h2>
        </div>
        <div class="col-md-6 text-right">
          <h6 v-if="isChatChosen"> Password: {{ currentChatData.password }}</h6>
        </div>
      </div>
    </div>
    <div class="panel-body">
      <div class="col-md-12 scroll" @scroll="handleScrollUp" ref="chatContainer">
        <div v-if="!isChatChosen" class="vertical-center">
          <h3>Choose a chat...</h3>
        </div>
        <div v-else class="col-md-6">
          <div class="panel panel-info" v-for="mes in messages" v-bind:key="mes.id">
            <div class="panel-heading clearfix">
              <div class="pull-left">{{ mes.customerUsername }}</div>
              <div class="pull-right">{{ mes.date | formatDate }}</div>
            </div>
            <div class="panel-body" :class="{ 'long-content': mes.content.length > 20 }">
              {{ mes.content }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="isChatChosen" class="row">
        <div class="col-md-11">
          <input v-model.trim="content" @keydown.enter="sendMessage" type="text" class="form-control" placeholder="Your message...">
        </div>
        <div class="col-xs-1">
          <button type="button" class="btn btn-default create-chat" v-on:click="sendMessage">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { sendMessageToServer } from '@/utils/ws';
import { eventBus } from '@/App.vue';
import api from '@/utils/api'

export default {
  name: 'CurrentChat',
  props: ['messages', 'isChatChosen', 'currentChatData', 'userData', 'chatChosenCheckout'],
  data() {
    return {
      content: '',
      mesPage: 1
    };
  },
  methods: {
    sendMessage() {
      if (this.content != ''){
        sendMessageToServer({
          customerId: this.userData.userId,
          customerUsername: this.userData.nickname,
          roomId: this.currentChatData.id,
          content: this.content,
        });
        }
      this.content = '';
    },
    scrollWithChatUpdate() {
      this.$nextTick(() => {
          const chatContainer = this.$refs.chatContainer;
          chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    },
    scrollWithMessageReceiving() {
      this.$nextTick(() => {
          const chatContainer = this.$refs.chatContainer;
          const top = chatContainer.scrollTop;
          const height = chatContainer.scrollHeight;
          if (height - top < 700) { 
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
      });
    },
    handleScrollUp(event) {
      const curHeight = event.target.scrollHeight;
      if (event.target.scrollTop === 0 && event.target.scrollHeight != 0) {
        api.getMessages(this.currentChatData.id, this.mesPage)
        .then(response => {
          if (response.data) {
            this.$emit('push:messages', response.data.reverse())
          } 
          this.mesPage+=1;
          this.$nextTick(() => {
            event.target.scrollTop = event.target.scrollHeight - curHeight;
          });  
        })
        .catch(e => {
          if (e.response) {
          if (e.response.status == 404){
            this.$emit('delete:chats', this.currentChatData.id);
            this.$emit('update:messages', []);
            this.$emit('update:currentChatData', {id: 0, name: '', password: ''})
            this.chatChosenCheckout();
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
    mesPageUpdate(){
      this.mesPage = 1;
    }
  },
  filters: {
    formatDate(value){
      const date = new Date(value);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(2);
      return `${hours}:${minutes} ${day}.${month}.${year}`;
    }
  },
  mounted: function() {
    eventBus.$on('chat-update', this.mesPageUpdate);
    eventBus.$on('chat-update', this.scrollWithChatUpdate);
    eventBus.$on('message-receive', this.scrollWithMessageReceiving);
  }
};
</script>

<style>
.vertical-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  line-height: 100%; 
}
</style>