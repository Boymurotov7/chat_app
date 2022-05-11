import express from "express"
import path from "path"
import { createServer } from "http"
import { Server } from "socket.io"
import "./config.js"
const PORT = process.env.PORT || 4000

import userController from './modules/user/index.js'
import messageController from './modules/message/index.js'

const app = express() 
const httpServer = createServer(app)

app.use(express.static(path.join(process.cwd(), 'uploads')))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});



const io = new Server(httpServer,{
    cors:  {
      log:false,
      origin: "http://localhost:5000"
    }
})
io.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});
io.on("connection", (socket) => {
    userController(io, socket)
    messageController(io, socket)
})

httpServer.listen(PORT, () => console.log('backend server is running on ' + PORT))