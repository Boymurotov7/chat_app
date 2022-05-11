import { io } from "https://cdn.socket.io/4.5.0/socket.io.esm.min.js"
const host = 'http://localhost:4000'
const userId = window.localStorage.getItem('userId')
const token = window.localStorage.getItem('token')
let lastUser = window.localStorage.getItem('lastUser')
let currentUser = window.localStorage.getItem('currentUser')

if(!token) window.location = '/login'

lastUser = JSON.parse(lastUser)
currentUser = JSON.parse(currentUser)

const socket = io(host)

socket.emit('users:get', userId, (data) => renderUsers(data))
lastUser && socket.emit(
	'messages:get', 
	{ from: userId, to: lastUser.user_id }, 
	(data) => {
		renderMessages(data, { user: lastUser, me: currentUser })
	}
)

function renderUsers (users) {
	// chatsList.innerHTML = null
	for(let user of users) {

		if(userId == user.user_id) {
			window.localStorage.setItem('currentUser', JSON.stringify(user))
			profileImg.src = host + user.file
			profileUsername.textContent = user.username
			continue
		}

		const li = document.createElement('li')
		const img = document.createElement('img')
		const p = document.createElement('p')

		li.dataset.userId = user.user_id

		li.className = 'chats-item'

		img.src = host + user.file
		p.textContent = user.username

		li.append(img, p)
		chatsList.append(li)

		li.onclick = () => {
			window.localStorage.setItem('lastUser', JSON.stringify(user))
			lastUser = user
			socket.emit(
				'messages:get', 
				{ from: userId, to: user.user_id }, 
				(data) => {
					renderMessages(data, { user: user, me: currentUser })
				}
			)
		}
	}
}

function renderMessages (messages, { user, me }) {
	userHeader.textContent = user.username
	chatsWrapper.innerHTML = ''
	for(let message of messages) {
		if(message.message_type == 'text') {
			chatsWrapper.innerHTML += ` 
				<div class="msg-wrapper ${message.message_from == userId ? 'msg-from' : ''}">
                    <img src="${message.message_from == userId ? host + me.file : host + user.file}">
                    <div class="msg-text">
                        <p class="msg-author">${message.message_from == userId ? me.username : user.username}</p>
                        <p class="msg">${message.message_body}</p>
                        <p class="time">${message.message_time}</p>
                    </div>
                </div>
			`
		}

		if(message.message_type == 'file') {
			chatsWrapper.innerHTML += ` 
			<div class="msg-wrapper ${message.message_from == userId ? 'msg-from' : ''}">
	            <img src="${message.message_from == userId ? host + me.file : host + user.file}">
	            <div class="msg-text">
	                <p class="msg-author">${message.message_from == userId ? me.username : user.username}</p>
	                <object data="${host + '/files/' + message.message_body}" class="msg object-class"></object>
                    <a href="${host}/download?fileName=${message.message_body}">
                        <img src="./img/download.png" width="25px" />
                    </a>
	                <p class="time">${message.message_time}</p>
	            </div>
	        </div>
	    `
		}
	}
}

form.onsubmit = event => {
	event.preventDefault()
	textInput.value.trim() && sendTextMessage(textInput.value)
	form.reset()
}

uploads.onchange = () => {
	const file = { file: uploads.files[0], type: uploads.files[0].type, name: uploads.files[0].name } 
	socket.emit('messages:post', { file, to: lastUser.user_id, from: userId }, message => {
		chatsWrapper.innerHTML += ` 
			<div class="msg-wrapper msg-from">
	            <img src="${host + currentUser.file}">
	            <div class="msg-text">
	                <p class="msg-author">${currentUser.username}</p>
	                <object data="${host + '/files/' + message.message_body}" class="msg object-class"></object>
                    <a href="${host}/download?fileName=${message.message_body}">
                        <img src="./img/download.png" width="25px" />
                    </a>
	                <p class="time">${message.message_time}</p>
	            </div>
	        </div>
	    `
	})
}

function sendTextMessage (value) {
	socket.emit('messages:post', { text: value, to: lastUser.user_id, from: userId }, message => {
		chatsWrapper.innerHTML += ` 
			<div class="msg-wrapper msg-from">
	            <img src="${host + currentUser.file}">
	            <div class="msg-text">
	                <p class="msg-author">${currentUser.username}</p>
	                <p class="msg">${message.message_body}</p>
	                <p class="time">${message.message_time}</p>
	            </div>
	        </div>
	    `
	})
}


socket.on('new message', message => {
	if(message.message_from != lastUser.user_id) {
		let items = document.querySelectorAll(`#chatsList li`)

		items.forEach(item =>{
			if(item.dataset.userId == message.message_from) {
				item.style.backgroundColor = 'green'
			}
		})
		return
	}

	if(message.message_type == 'text') {
		chatsWrapper.innerHTML += ` 
			<div class="msg-wrapper">
	            <img src="${host + lastUser.file}">
	            <div class="msg-text">
	                <p class="msg-author">${lastUser.username}</p>
	                <p class="msg">${message.message_body}</p>
	                <p class="time">${message.message_time}</p>
	            </div>
	        </div>
		`
	}

	if(message.message_type == 'file') {
		chatsWrapper.innerHTML += ` 
			<div class="msg-wrapper">
	            <img src="${host + lastUser.file}">
	            <div class="msg-text">
	                <p class="msg-author">${lastUser.username}</p>
	                <object data="${host + '/files/' + message.message_body}" class="msg object-class"></object>
                    <a href="${host}/download?fileName=${message.message_body}">
                        <img src="./img/download.png" width="25px" />
                    </a>
	                <p class="time">${message.message_time}</p>
	            </div>
	        </div>
		`
	}
	console.log(message)
})

socket.on('new user', data => renderUsers(data))

