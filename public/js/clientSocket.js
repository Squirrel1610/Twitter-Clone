var connected = false;

var socket = io("http://localhost:5000");

socket.emit("setup", userLoggedIn);

socket.on("connected", () => {
    connected = true;
})

socket.on("message received", (newMessage) => {
    messageReceived(newMessage);
})