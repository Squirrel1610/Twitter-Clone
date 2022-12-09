var connected = false;

var socket = io("http://localhost:5000");

socket.emit("setup", userLoggedIn);

socket.on("connected", () => {
    connected = true;
})

socket.on("message received", (newMessage) => {
    messageReceived(newMessage);
})

//receive from server
socket.on("notification received", () => {
    $.get("/api/notifications/latest", (notificationData) => {
        showNotificationPopUp(notificationData);
        refreshNotificationBadge();
    })
})

//send to server
function emitNotification(userId){
    if(userId == userLoggedIn._id) return;
    socket.emit("notification received", userId);
}