<template>
  <div id="loginform">
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h2>Login</h2>
      </div>
      <div class="panel-body">
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <strong>Your nickname:</strong>
              <input v-model.trim="newLogNickname" class="form-control" />
            </div>
          </div>
          <div class="col-xs-6">
            <div class="form-group">
              <strong>Your password:</strong>
              <input type="password" v-model.trim="newLogPassword" class="form-control" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <button type="button" class="btn btn-default btn-lg logout" v-on:click="logIn">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="logError" class="row">
      <div class="col-md-12">
        <div class="alert alert-danger al">
            <span class="glyphicon glyphicon-exclamation-sign"></span> {{ logErrorMessage }}
        </div>
      </div>
    </div>
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h2>Registration</h2>
      </div>
      <div class="panel-body">
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <strong>Your nickname:</strong>
              <input v-model.trim="newRegNickname" class="form-control" />
            </div>
          </div>
          <div class="col-xs-6">
            <div class="form-group">
              <strong>Your password:</strong>
              <input v-model.trim="newRegPassword" class="form-control" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-6">
            <div class="form-group">
              <button type="button" class="btn btn-default btn-lg logout" v-on:click="register">
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="regError">
      <div class="alert alert-danger al">
        <span class="glyphicon glyphicon-exclamation-sign"></span> {{ regErrorMessage }}
      </div>
    </div>
  </div>
</template>





  
<script>

import { connect } from '@/utils/ws';
import api from '@/utils/api'

export default {
  name: 'LogInForm',
  props: ['logInCheckout', 'userData','chats','chatsUpdate'],
  data() {
    return {
      newLogNickname: '',
      newLogPassword: '',
      newRegNickname: '',
      newRegPassword: '',
      logError: false,
      regError: false,
      logErrorMessage: '',
      regErrorMessage: ''
    }
  },
  methods: {
    logIn() {
      if (this.newLogNickname.length === 0 || this.newLogPassword.length === 0) {
        this.logError = true;
        this.logErrorMessage = 'One of the fields is not filled in.'
      } else {
        api.signIn(this.newLogNickname, this.newLogPassword)
        .then(response => {
          var newUserData = {isLogIn: true, nickname: response.data.username, userId: response.data.id, role: response.data.role};
          var newChats = response.data.rooms;
          this.$emit('update:userData', newUserData)
          localStorage.setItem('userData', JSON.stringify(newUserData))
          this.$emit('update:chats', newChats)
          localStorage.setItem('chats', JSON.stringify(newChats))
          connect(response.data.id);
            
          this.newLogNickname = '';
          this.newLogPassword = '';
        })
        .catch(e => {
          if (e.response) {
            this.logError = true;
            const data = e.response.data;
            console.log(data)
            console.log(e)
            this.logErrorMessage = Object.values(data).join('\n');
          }
          else {
            console.log(e)
          }
        }) 
      }
    },
    register() {
      if (this.newRegNickname.length === 0 || this.newRegPassword.length === 0){
        this.regError = true;
        this.regErrorMessage = 'One of the fields is not filled in.'
      }
      else {
        api.signUp(this.newRegNickname, this.newRegPassword)
        .then(response => {
          var newUserData = {isLogIn: true, nickname: response.data.username, userId: response.data.id, role: response.data.role};
          this.$emit('update:userData', newUserData)
          localStorage.setItem('userData', JSON.stringify(newUserData))
          
          this.newRegNickname = '';
          this.newRegPassword = '';
        })
        .catch(e =>{
          if (e.response) {
            this.regError = true;
            const data = e.response.data;
            console.log(data)
            this.regErrorMessage = Object.values(data).join('\n');
          }
          else {
            console.log(e)
          }
        })        
      }
    }
  }
}
</script>
  