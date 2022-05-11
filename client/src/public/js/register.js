import { io } from "https://cdn.socket.io/4.5.0/socket.io.esm.min.js"

const socket = io('http://localhost:4000',{transports: ['websocket']})

form.onsubmit = event => {
	event.preventDefault()

	const username = usernameInput.value.trim()
	const password = passwordInput.value.trim()
	const fileRaw = uploadInput.files[0]

	if( !username || !password || !fileRaw ) return

	const file = { fileName: fileRaw.name, type: fileRaw.type, file: fileRaw }

	socket.emit(
		'users:register', 
		{ username, password, file }, 
		(response) => {
			console.log(response)
			if(response.status == 200) {
				window.localStorage.setItem('token', response.token)
				window.localStorage.setItem('userId', response.userId)
				window.location = '/'
			} else {
				messageText.textContent = response.message
				messageText.style.color = 'red'
			}
		}
	)
}
