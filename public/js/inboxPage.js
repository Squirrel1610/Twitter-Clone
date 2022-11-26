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

function createChatHtml(chatData){
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData);
    var latestMessage = "This is the latest message";

    return `<a href='/messages/${chatData._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`
}

function getChatName(chatData) {
    var chatName = chatData.chatName;
    
    if(!chatName){
        var arrOtherUsers = getOtherChatUsers(chatData.users);
        var namesArr = arrOtherUsers.map((user) => `${user.firstName} ${user.lastName}`);
        chatName = namesArr.join(", ");
    }

    return chatName;
}

function getOtherChatUsers(users){
    if(users.length == 1){
        return users;
    }else{
        return users.filter((user) => user._id !== userLoggedIn._id);
    }
}

function getChatImageElements(chatData){
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var groupChatClass = "";
    var chatImage = getUserChatImageElement(otherChatUsers[0]);
    
    if(otherChatUsers.length > 1){
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

function getUserChatImageElement(user){
    if(!user || !user.profilePic) return alert("User passed into function is invalid");

    return `<img src=${user.profilePic} alt="User's profile picture">`;
}