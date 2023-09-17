import axios from 'axios';

const URL = "http://localhost:8000";


export async function signIn(username, password){
    return await axios.post(URL + "/api/sign-in", { username: username, password: password }, {withCredentials: true});
}

export async function signUp(username, password){
    return await axios.post(URL + "/api/sign-up", { username: username, password: password }, {withCredentials: true});
}

export async function createRoom(name, password){
    return await axios.post(URL + "/api/room/create", { name: name, password: password }, {withCredentials: true});
}

export async function joinRoom(name, password){
    return await axios.post(URL + "/api/room/join", { name: name, password: password }, {withCredentials: true});
}

export async function getMessages(chatId, page){
    return await axios.get(URL + "/api/room/" + chatId + "/messages?page=" + page, {withCredentials: true});
}

export async function getRooms(page, pageSize){
    return await axios.get(URL + "/api/admin/rooms?page=" + page + "&size=" + pageSize, {withCredentials: true})
}

export async function getCustomers(page, pageSize){
    return await axios.get(URL + "/api/admin/customers?page=" + page + "&size=" + pageSize, {withCredentials: true});
}

export async function deleteRoom(roomId){
    return await axios.post(URL + "/api/admin/delete-room?id=" + roomId, {withCredentials: true});
}

export async function deleteCustomer(customerId){
    return await axios.post(URL + "/api/admin/delete-customer?id=" + customerId, {withCredentials: true});
}

export async function makeAdmin(username){
    return await axios.put(URL + "/api/admin/assign-admin?username=" + username, {withCredentials: true})
}

export default {
    signIn,
    signUp,
    createRoom,
    joinRoom,
    getMessages,
    getRooms,
    getCustomers,
    deleteRoom,
    deleteCustomer,
    makeAdmin
};