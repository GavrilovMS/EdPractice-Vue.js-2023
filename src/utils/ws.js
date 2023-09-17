import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'


var stompClient = null
const handlers = []

export function connect(customerId) {
    const socket = new SockJS('http://localhost:8000/ws')
    stompClient = Stomp.over(socket)
    stompClient.connect({}, frame => {
        console.log('Connected: ' + frame)
        stompClient.subscribe('/customer/' + customerId, message => {
            handlers.forEach(handler => handler(JSON.parse(message.body)))
        })
    })
}


export function addHandler(handler) {
    handlers.push(handler)
}

export function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect()
    }
    console.log("Disconnected")
}

export function sendMessageToServer(message) {
    stompClient.send("/app/message", {}, JSON.stringify(message))
}