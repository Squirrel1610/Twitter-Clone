var typing = false;
var lastTypingTime;

$(document).ready(() => {
    //when enter chatpage
    socket.emit("join room", chatId);

    //client listen event that server send typing in the room
    socket.on("typing", () => {
        $(".typingDots").show();
    })

    //receive event server send when user stop typing
    socket.on("stop typing", () => {
        $(".typingDots").hide();
    })

    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        var messages = [];

        var lastSenderId = "";


        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);
            lastSenderId = message.sender._id;
        });

        var messagesHtml = messages.join("");
        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");

        markAllMessagesAsRead();
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
    updateTyping();

    //press enter
    if(event.which === 13 && !event.shiftKey){
        messageSubmitted();
        return false;
    } 
})

function updateTyping(){
    if(!connected) return;
    
    if(!typing){
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    var timeLength = 3000;

    setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if(timeDiff >= timeLength){
            typing = false;
            socket.emit("stop typing", chatId);
        }
    }, timeLength);
}

function messageSubmitted(){
    var content = $(".inputTextbox").val().trim();

    if(content){   
        sendMessage(content);
        $(".inputTextbox").val("");
        typing = false;
        socket.emit("stop typing", chatId);
    }
}

function sendMessage(content){
    $.post("/api/messages/", {chatId, content}, (data, status, xhr) => {
        if(xhr.status != 201){
            alert("Couldn't send message");    
            $(".inputTextbox").val(content);        
            return; 
        }else{
            addChatMessageHtml(data);

            socket.emit("new message", data);
        }
    })
}

function addChatMessageHtml(message) {
    if(!message || !message._id) {
        alert("Message is not valid");
        return;
    }

    var messageDiv = createMessageHtml(message, null, "");

    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId) {
    var sender = message.sender;
    var senderName = `${sender.firstName} ${sender.lastName}`;

    var currentSenderId = sender._id;
    var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    var isFirst = lastSenderId != currentSenderId;
    var isLast = nextSenderId != currentSenderId;

    var isMine = message.sender._id == userLoggedIn._id;
    var liClassName = isMine ? "mine" : "theirs";

    var nameElement = "";

    if(isFirst){
        liClassName += " first";

        if(!isMine){
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    var profileImage = "";
    if(isLast){
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`;
    }

    var imageContainer = "";
    if(!isMine){
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

//add message html to container
function addMessagesHtmlToPage(html) {
    $(".chatMessages").append(html);
}

function scrollToBottom(animated) {
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if(animated){
        container.animate({ scrollTop: scrollHeight}, "slow");
    }else{
        container.scrollTop(scrollHeight);
    }
}

function markAllMessagesAsRead(){
    $.ajax(
        {
            url: `/api/chats/${chatId}/messages/markAsRead`,
            type: "PUT",
            success: () => {
                refreshMessagesBadge();
            }
        }
    )
}


