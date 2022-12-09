$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if(xhr.status == 400){
            alert("Could not get chat list");
        }else{
            ouputChatList(data, $(".resultsContainer"));
        }
    })
})

function ouputChatList(chatList, container){
    if(chatList.length == 0){
        container.append(`<span class='noResults'>Nothing to show. </span>`);

    }else{
        chatList.forEach(chat => {
            var html = createChatHtml(chat);
            container.append(html);
        });
    }
}

