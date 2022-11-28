$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })
})

//click button change the chat name
$("#chatNameButton").click(() => {
    var chatName = $("#chatNameTextbox").val().trim();

    if(chatName){
        $.ajax({
            url: `/api/chats/${chatId}`,
            type: "PUT",
            data: {chatName},
            success: (data, status, xhr) => {
                if(xhr.status !== 204){
                    return alert("Could not change the chat name");
                }else{
                    location.reload();
                }
            }
        })
    }else{
        return alert("input chat name is empty");
    }  
})

//click button submit
$(".sendMessageButton").click(() => {
    // var message = $(".inputTextbox").val().trim();
    messageSubmitted();
})

$(".inputTextbox").keydown((event) => {
    //press enter
    if(event.which === 13 && !event.shiftKey){
        messageSubmitted();
        return false;
    } 
})

function messageSubmitted(){
    var content = $(".inputTextbox").val().trim();

    if(content){
        sendMessage(content);
        $(".inputTextbox").val("");
    }
}

function sendMessage(content){
    $.post("/api/messages/", {chatId, content}, (data, status, xhr) => {
        console.log(data);
    })
}