import { Server } from 'Socket.IO'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
        socket.emit("me", socket.id)
    
        socket.on("disconnect", () => {
            socket.broadcast.emit("callEnded")
        })
    
        socket.on("callUser", (data) => {
            io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
        })
    
        socket.on("answerCall", (data) => {
            io.to(data.to).emit("callAccepted", data.signal)
        })
    })


  }
  res.end()
}

export default SocketHandler