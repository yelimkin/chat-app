import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('send-message', (message) => {
      // 특정 방(채팅방)에 메시지 브로드캐스트
      socket.to(message.roomId).emit('receive-message', message);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  res.end();
};

export default SocketHandler;