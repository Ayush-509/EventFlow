const users = new Map();

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    // User joins with their user ID
    socket.on("join", (userId) => {
  if (!userId) {
    console.log("Join ignored: userId missing");
    return;
  }

  users.set(String(userId), socket.id);

  console.log("User joined:", userId);
});

    // Real-time message delivery
    socket.on("sendMessage", (message) => {
      const receiverSocket = users.get(
        message.receiverId.toString()
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "receiveMessage",
          message
        );
      }
    });

    // Optional typing indicator
    socket.on("typing", ({ receiverId, senderName }) => {
      const receiverSocket = users.get(
        receiverId.toString()
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", {
          senderName,
        });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocket = users.get(
        receiverId.toString()
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit("stopTyping");
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }

      console.log("Socket Disconnected:", socket.id);
    });
  });
};

export default chatSocket;