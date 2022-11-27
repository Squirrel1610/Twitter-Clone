$(document).ready(() => {
    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })
})

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