const PORT = process.env.PORT || 8900;

const io = require('socket.io')(PORT, {
  cors: {
    origin: [
      'https://paychat-app.netlify.app/',
      'http://localhost:3000',
    ],
  },
});

console.log(`Socket.IO server listening on port ${PORT}`);

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
  console.log(users);
};

const removeUser = (socketId) => {
  users = users.filter(
    (user) => user.socketId !== socketId
  );
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  //when ceonnect
  console.log('Socket connection established...');

  //take userId and socketId from user
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  //send and get message
  socket.on(
    'sendMessage',
    ({ senderId, receiverId, text, type }) => {
      const user = getUser(receiverId);
      if (user) {
        io.to(user.socketId).emit('getMessage', {
          senderId,
          text,
          type,
        });
      }
    }
  );

  //when disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});
