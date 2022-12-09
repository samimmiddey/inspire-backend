import { Server } from "socket.io";

const io = new Server({
   cors: {
      origin: "https://inspire-app.vercel.app"
   }
});

let onlineUsers = [];

// Add new user
const addNewUser = (userID, socketID) => {
   !onlineUsers.some(user => user.id === userID) && onlineUsers.push({
      userID: userID,
      socketID: socketID
   });
};

// Remove user
const removeUser = (socketID) => {
   onlineUsers = onlineUsers.filter(user => user.socketID !== socketID);
};

// Get user
const getUser = (userID) => {
   return onlineUsers.find(user => user.userID === userID);
};

io.on("connection", (socket) => {
   socket.on("newUser", (userID) => {
      addNewUser(userID, socket.id);
   });

   socket.on("sendNotification", ({ senderID, receiverID, pinID, type }) => {
      const receiver = getUser(receiverID);

      if (!receiver) {
         const sender = getUser(senderID);
         io.to(sender.socketID).emit("userOffline", {
            receiverID: receiverID,
            senderID: senderID,
            pinID: pinID,
            type: type
         })
      } else {
         io.to(receiver.socketID).emit("getNotification", {
            senderID: senderID,
            pinID: pinID,
            type: type
         });
      }
   })

   socket.on("disconnect", () => {
      removeUser(socket.id);
   })
});

io.listen(process.env.PORT || 5000);