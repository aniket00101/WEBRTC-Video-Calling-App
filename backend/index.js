import { Server } from "socket.io";

const socketport = import.meta.env?.PORT || process.env.PORT || 8000;

const io = new Server(socketport, {
  cors: true,
});

const emailTosocketIdMap = new Map();
const socketidtoemailmap = new Map();

io.on('connection', (socket) => {
  console.log(socket.id);
  socket.on('room:join', (data) => {
    console.log(data)
    const { email, room } = data
    emailTosocketIdMap.set(email, socket.id);
    socketidtoemailmap.set(socket.id, email);
    io.to(room).emit('user:joined', {email, id: socket.id})
    socket.join(room);
    io.to(socket.id).emit("room:join", data);

  });

  socket.on('user:call', ({to, offer}) => {
    io.to(to).emit('incomming:call', { from: socket.id, offer});
  });

  socket.on('call:accepted', ({to, ans}) => {
    io.to(to).emit("call:accepted", {from:socket.id, ans});
  })

  socket.on('peer:nego:needed', ({to, offer}) => {
    io.to(to).emit("peer:nego:needed", {from:socket.id, offer});
  })

  socket.on('peer:nego:done', ({to, ans}) => {
    io.to(to).emit("peer:nego:final", {from:socket.id, ans});
  })
    
});
