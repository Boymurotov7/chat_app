import { fetch, fetchAll } from '../../utils/postgres.js'
import path from 'path'
import fs from 'fs'
import jwt from'jsonwebtoken'


const generateJwt = (id,username,password) => {
    return jwt.sign(
        { id, username,password},
        process.env.SECRET_KEY,
        {expiresIn: "24h"})    
}


export default (io, socket) => {
	socket.on('users:login', async (data, callback) => {
		const user = await fetch(
			'select * from users where username = $1 and password = crypt($2, password)',
			data.username, data.password
		)

		if(user) {
			const token = generateJwt(user.user_id,user.username,user.password)
			return callback({
				status: 200,
				message: 'The user logged in!',
				userId: user.user_id,
				token,
			})
		}

		callback({
			status: 401,
			message: 'Wrong password or username!',
			userId: null
		})

	})

	socket.on('users:register', async (data, callback) => {
		try {
			const { username, password, file } = data
			if ( !username || !password || !file){
				return new Error ("invalid password or email")
			} 
			
			fs.writeFileSync(path.join(process.cwd(), 'uploads', 'images', file.fileName), file.file)

			const user = await fetch(
				`insert into users (username, password, file) values($1, crypt($2, gen_salt('bf')), $3) 
					returning *, concat('/images/', file) as file
				`,
				username,
				password,
				file.fileName,
			)
			const token = generateJwt(user.user_id,user.username,user.password)
			if(user) {
				socket.broadcast.emit('new user', [user])
				return callback({
					status: 200,
					message: 'The user registered!',
					userId: user.user_id,
					token,
				})
			}

		} catch(error) {
			callback({
				status: 401,
				message: error.message,
				userId: null
			})
		}
	})


	socket.on('users:get', async (userId, callback) => {
		const users = await fetchAll(`
			select
				user_id,
				username,
				concat('/images/', file) as file
			from users
		`)

		await fetch(`
			update users set
				user_socket_id = $1
			where user_id = $2
		`, socket.id, userId)

		return callback(users)
	})

}