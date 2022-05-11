import { fetch, fetchAll } from '../../utils/postgres.js'
import path from 'path'
import fs from 'fs'

export default (io, socket) => {
	socket.on('messages:get', async (data, callback) => {
		const messages = await fetchAll(`
			select
				message_id,
				message_body,
				message_type,
				message_from,
				message_to,
				message_read,
				to_char(message_created_at, 'hh24:mm') as message_time
			from messages
			where (message_from = $1 and message_to = $2) OR
			(message_from = $2 and message_to = $1)
			order by message_id asc
		`, data.from, data.to)
		return callback(messages)
	})

	socket.on('messages:post', async (data, callback) => {
		if(data.text) {
			let message = await fetch(`
				insert into messages(
					message_body,
					message_type,
					message_from,
					message_to
				) values($1, $2, $3, $4)
				returning *, to_char(message_created_at, 'hh24:mm') as message_time
			`, data.text, 'text', data.from, data.to)

			let socketId = (await fetch('select user_socket_id from users where user_id = $1', data.to)).user_socket_id
			callback(message)
			io.to(socketId).emit('new message', message)
		}

		if(data.file) {

			fs.writeFileSync( path.join(process.cwd(), 'uploads', 'files', data.file.name), data.file.file )

			let message = await fetch(`
				insert into messages(
					message_body,
					message_type,
					message_from,
					message_to
				) values($1, $2, $3, $4)
				returning *, to_char(message_created_at, 'hh24:mm') as message_time
			`, data.file.name, 'file', data.from, data.to)

			let socketId = (await fetch('select user_socket_id from users where user_id = $1', data.to)).user_socket_id
			callback(message)
			io.to(socketId).emit('new message', message)
		}
	})

}