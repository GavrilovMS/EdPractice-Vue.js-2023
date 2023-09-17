<template>
    <div>
        <div class="col-xs-2">
            
        </div>
        <div class="col-lg-4">
            <div class="panel panel-primary main">
                <div class="panel-heading panel-head">
                    <h2>Users</h2>
                </div>
                <div class="panel-body">
                    <div class="col-md-12 scroll" @scroll="handleUsersScroll">
                        <div v-if="!this.customers.length" class="vertical-center">
                            <h3>No users here...</h3>
                        </div>
                        <div v-else>
                            <div class="customers" v-for="customer in this.customers" v-bind:key="customer.id">
                                <button class="customersbutton  col-xs-7" aria-label="Left Align" v-on:click="changeCustomer(customer.id)">
                                    id:{{ customer.id }}
                                    name:"{{ customer.username }}"
                                    role:"{{ customer.role }}"
                                </button>
                                <button class="customersbutton  col-xs-2" aria-label="Left Align" v-on:click="deleteCustomer(customer.id)">
                                    delete
                                </button>
                                <button v-if="!isAdmin(customer)" class="customersbutton col-xs-3" aria-label="Left Align" v-on:click="makeCustomerAdmin(customer.username)">
                                    make admin
                                </button>
                                <button v-else class="customersbutton col-xs-3" aria-label="Left Align">
                                    already admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
        <div class="col-lg-4">
            <div class="panel panel-primary main">
                <div class="panel-heading panel-head">
                    <h2>Chats</h2>
                </div>
                <div class="panel-body">
                    <div class="col-md-12 scroll" @scroll="handleRoomsScroll">
                        <div v-if="!this.rooms.length" class="vertical-center">
                            <h3>No rooms here...</h3>
                        </div>
                        <div v-else>
                            <div class="chats" v-for="room in this.rooms" v-bind:key="room.id">
                                <button class="chatsbutton col-md-10" aria-label="Left Align">
                                    id:{{ room.id }}
                                    name: "{{ room.name }}"
                                </button>
                                <button class="chatsbutton col-md-2" aria-label="Left Align" v-on:click="deleteRoom(room.id)">
                                    delete
                                </button>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xs-2">

        </div>
    </div>
</template>

<script>

import api from "@/utils/api"

export default {
  name: 'AdminMode',
  props: ['userData'],
  data: function(){
    return {
        customers: [],
        rooms: [],
        customersPage: 1,
        roomsPage: 1,
        roomsPageSize: 30,
        customersPageSize: 30
    }
  },
  methods: {
    getCustomers(page, pageSize){
      try {
        api.getCustomers(page, pageSize)
          .then(response => {
              this.customers = this.customers.concat(response.data);
              const cur_customer = this.customers.find(obj => obj.id === this.userData.userId);
              const index = this.customers.indexOf(cur_customer);
              if (index !== -1) {
                  this.getCustomers(this.customers.length, 1);
                  this.customers.splice(index, 1);
              }
          })
      } catch (e) {
        if (e.response) {
          const data = e.response.data;
          console.log(data)
          console.log(e)
        }
        else {
          console.log(e)
        }
      }
    },
    getRooms(page, pageSize){
      try {
        api.getRooms(page, pageSize)
          .then(response => {
              this.rooms = this.rooms.concat(response.data);
          })
      } catch (e) {
        if (e.response) {
          const data = e.response.data;
          console.log(data)
          console.log(e)
        }
        else {
          console.log(e)
        }
      }
    },
    deleteRoom(roomId){
      try {
        api.deleteRoom(roomId);
        this.getRooms(this.rooms.length, 1);
        const room = this.rooms.find(obj => obj.id === roomId);
        const index = this.rooms.indexOf(room);
        if (index !== -1) {
          this.rooms.splice(index, 1);
        }
      } catch (e) {
        if (e.response) {
          const data = e.response.data;
          console.log(data)
          console.log(e)
        }
        else {
          console.log(e)
        }
      }
    },
    deleteCustomer(customerId){
      try {
        api.deleteCustomer(customerId);
        this.getCustomers(this.customers.length, 1);
        const customer = this.customers.find(obj => obj.id === customerId);
        const index = this.customers.indexOf(customer);
        if (index !== -1) {
            this.customers.splice(index, 1);
        }
      } catch (e) {
        if (e.response) {
          const data = e.response.data;
          console.log(data)
          console.log(e)
        }
        else {
          console.log(e)
        }
      }
    },
    makeCustomerAdmin(username){
      try {
        api.makeAdmin(username);
        const customer = this.customers.find(obj => obj.username === username);
        customer.role = "ROLE_ADMIN";
      } catch (e) {
        if (e.response) {
          const data = e.response.data;
          console.log(data)
          console.log(e)
        }
        else {
          console.log(e)
        }
      }
    },
    isAdmin(customer){
        if (customer.role === 'ROLE_ADMIN')
            return true;
        if (customer.role === 'ROLE_USER')
            return false;
    },
    handleRoomsScroll(event){
      const scroll = event.target;
      if ((scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 1){
        this.getRooms(this.roomsPage, this.roomsPageSize);
        this.roomsPage++;
      }
    },
    handleUsersScroll(event){
      const scroll = event.target;
      if ((scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 1){
        this.getCustomers(this.customersPage, this.customersPageSize);
        this.customersPage++;
      }
    }
  },
  beforeMount: function() {
    this.getCustomers(0, this.customersPageSize);
    this.getRooms(0, this.roomsPageSize);
  }
};
</script>

<style>
.customers {
    width: 100%;
    height: 20px;
    margin-top: 3px;
    margin-bottom: 3px;
}

.chats {
    width: 100%;
    height: 20px;
    margin-top: 3px;
    margin-bottom: 3px;
}
.customersbutton {
    font-size: small;
    background-color: #d9edf7;
    text-align: left;
    border: 1px;
}

.customersbutton:active {
    background-color: #a6e1f6;
}

.chatsbutton {
    font-size: small;
    background-color: #d9edf7;
    text-align: left;
    border: 1px;
}

.chatsbutton:active {
    background-color: #a6e1f6;
  }

.vertical-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    line-height: 100%; 
  }
</style>