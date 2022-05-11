import { io } from "https://cdn.socket.io/4.5.0/socket.io.esm.min.js"

const socket = io('http://localhost:4000',{transports: ['websocket']})

form.onsubmit = event => {
	event.preventDefault()
	const username = usernameInput.value.trim()
	const password = passwordInput.value.trim()

	if( !username || !password ) return

	socket.emit(
		'users:login', 
		{ username, password }, 
		(response) => {
			if(response.status == 200) {
				window.localStorage.setItem('userId', response.userId)
				window.localStorage.setItem('token', response.token)
				window.location = '/'
			} else {
				messageText.textContent = response.message
				messageText.style.color = 'red'
			}
		}
	)
}
