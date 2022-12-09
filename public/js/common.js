//Global variables
var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
    refreshNotificationBadge();
    refreshMessagesBadge();
})

$("#postTextarea, #replyTextarea").keyup(e => {
    var textbox = $(e.target);
    var value = textbox.val().trim();
    var isModal = textbox.parents(".modal").length == 1;
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton"); 

    if(!value){
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

//submit to create post, reply post
$("#submitPostButton, #submitReplyButton").click((event) => {
    var button = $(event.target);
    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if(isModal){
        var id = button.data().id;
        if(id == null) return alert("Button reply post does not have id");
        data.replyTo = id;
    }

    $.post("/api/posts", data, (postData) => {
        // if(postData.replyTo){
        //     location.reload();
        // }
        // else{
        //     var html = createPostHtml(postData);
        //     $(".postsContainer").prepend(html);
        //     textbox.val("");
        //     button.prop("disabled", true);
        // }

        if(postData.replyTo){
            emitNotification(postData.replyTo.postedBy);
        }
        
        location.reload();
    })
})

//like post
$(document).on("click", ".likeButton", (e) => {
    var button = $(e.target);
    var postId = getPostIdFromElement(button);
    
    $.ajax({
        url: `api/posts/${postId}/like`,
        type: "PUT",
        success: (post) => {
            button.find("span").text(post.likes.length || "");

            if(post.likes.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(post.postedBy);
            }else{
                button.removeClass("active");
            }
        }
    })
})

//retweet post
$(document).on("click", ".retweetButton", (e) => {
    var button = $(e.target);
    var postId = getPostIdFromElement(button);
    
    $.ajax({
        url: `api/posts/${postId}/retweet`,
        type: "POST",
        success: (post) => {
            button.find("span").text(post.retweetUsers.length || "");

            if(post.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
                emitNotification(post.postedBy);
            }else{
                button.removeClass("active");
            }
        }
    })
})

//when click reply modal
$("#replyModal").on("show.bs.modal", (e) => {
    var button = $(e.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);
    
    $.get(`/api/posts/${postId}`, (result) => {
        outputPosts(result.postData, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal", (e) => {
    $("#originalPostContainer").html("");
})

//click to view post
$(document).on("click", ".post", (e) => {
    var element = $(e.target);
    var postId = getPostIdFromElement(element);

    if(postId && !element.is("button")){
        window.location.href = `/posts/${postId}`;
    }
})

//open delete post modal
$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
})

//click delete post button
$("#deletePostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {

            if(xhr.status != 202) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

//click follow button
$(document).on("click", ".followButton", (e) =>{
    var button = $(e.target);
    var userId = button.data().user;
    
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {
            if(xhr.status == 404){
                alert("User not found");
                return;
            }
            
            var difference = 1;

            if(data.following && data.following.includes(userId)){
                button.addClass("following");
                button.text("Following");

                emitNotification(userId);
            }else{
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }
            
            var followersLabel = $("#followersValue");
            var followersText = followersLabel.text();
            followersText = parseInt(followersText);
            followersLabel.text(followersText + difference);
        }
    })

})

//input file change
$("#filePhoto").change( function () {
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e) => {
            var imagePreview = document.getElementById("imagePreview");
            imagePreview.src = e.target.result;

            if(cropper){
                cropper.destroy();
            }

            cropper = new Cropper(imagePreview, {
                aspectRatio: 1 / 1,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#coverPhoto").change( function () {
    if(this.files && this.files[0]){
        var reader = new FileReader();
        reader.onload = (e) => {
            var imagePreview = document.getElementById("coverPreview");
            imagePreview.src = e.target.result;

            if(cropper){
                cropper.destroy();
            }

            cropper = new Cropper(imagePreview, {
                aspectRatio: 16 / 9,
                background: false
            })
        }
        reader.readAsDataURL(this.files[0]);
    }
})

//click upload profilePicture button
$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(!canvas){
        alert("Can't get cropped image");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false, //J query not to convert form data to string
            contentType: false, //J query not to add contentType to header of request 
            success: () => location.reload()
        })
    })
})

//click upload coverPhoto button
$("#coverPhotoButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(!canvas){
        alert("Can't get cropped image");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false, //J query not to convert form data to string
            contentType: false, //J query not to add contentType to header of request 
            success: () => location.reload()
        })
    })
})

//open pin post modal
$("#confirmPinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#pinPostButton").data("id", postId);
})

//click pin post button
$("#pinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: {pinned: true},
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not pin the post");
                return;
            }
            
            location.reload();
        }
    })
})

//open unpin post modal
$("#unpinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#unpinPostButton").data("id", postId);
})

//click unpin post button
$("#unpinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: {pinned: false},
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not unpin the post");
                return;
            }
            
            location.reload();
        }
    })
})

//invite to the chat input key down
$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);

    var textbox = $(event.target);
    var value = textbox.val();

    if(value == "" && event.keyCode == 8){
        //reomve user from selection
        selectedUsers.pop();
        updateSelectedUserHtml();
        $(".resultsContainer").html("");
        
        if(selectedUsers.length == 0){
            $("#createChatButton").prop("disabled", true);
        }

        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == ""){
            $(".resultsContainer").html();
        }else{
            searchUser(value);
        }
    }, 1000)
})

//click create group chat
$("#createChatButton").click(() => {
    var data = JSON.stringify(selectedUsers);

    $.post("/api/chats", {users: data}, chat => {
        if(!chat || !chat._id){
            return alert("Invalid respond from server");
        }

        window.location.href = `/messages/${chat._id}`;
    })
})

//click on unread notification
$(document).on("click", ".notification.active", (e) => {
    var container = $(e.target);
    var notificationId = container.data().id;

    var href = container.attr("href");
    //stop the default of anchor tag
    e.preventDefault();

    var callback = () => window.location = href;
    markNotificationAsOpened(notificationId, callback);
})

//search user when create new message
function searchUser(searchTerm){
    $.get("/api/users", {search: searchTerm}, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    })
}

//select user for create new message
function outputSelectableUsers(results, container){
    container.html("");

    results.forEach(result => {
        //remove current user
        if(result._id == userLoggedIn._id 
            || selectedUsers.some((u) => u._id == result._id)){
            return;
        }

        var html = createUserHtml(result, false);
        
        var element = $(html);
        element.click(() => userSelected(result));

        container.append(element);
    }) 

    if(results.length == 0){
        container.append("<span class='noResults'>No results found</span>")
    }
}

//when user is selected
function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUserHtml();
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUserHtml() {
    var elements = [];
    
    selectedUsers.forEach(user => {
        var name = user.firstName + " " + user.lastName;
        var userElement = $(`<span class="selectedUser">${name}</span>`);
        elements.push(userElement);
    })

    $(".selectedUser").remove();
    $("#selectedUsers").prepend(elements);

}

//get postId from button such as like, reply, retweet
function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");
    //find the neareast element that has class post
    var rootElement = isRoot ? element : element.closest(".post");
    var postId = rootElement.data().id;
    if(!postId){
        return alert("Post id undefined");
    }
    return postId;
}

//HTML of the post
function createPostHtml(postData, largeFont = false) {
    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null; 
    postData = isRetweet ? postData.retweetData : postData;

    var postedBy = postData.postedBy;

    if(!postedBy._id){
        return alert("User object not populated");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(Date.now(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    
    var retweetText = '';
    if(isRetweet){
        retweetText = `<span>
                            <i class='fas fa-retweet'></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                       </span>`
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){
        if(!postData.replyTo._id){
            return alert("replyTo is not populated");
        }else if(!postData.replyTo.postedBy._id){
            return alert("replyTo.postedBy is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }

    var largeFontClass = largeFont ? "largeFont" : "";

    var buttons = "";
    var pinnedPostText = "";
    if (postData.postedBy._id == userLoggedIn._id) {
        
        var pinnedClass = "";
        var dataTarget = "#confirmPinModal";
        if(postData.pinned === true){
            pinnedClass = "active";
            dataTarget = "#unpinModal"
            pinnedPostText = "<i class='fas fa-thumbtack'></i> <span>Pinned post<span/>"
        }

        buttons = ` <button class='pinButton ${pinnedClass}' data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class='fas fa-thumbtack'></i></button>
                    <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>    
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}


function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

//show the post 
function outputPosts(results, container){
    container.html("");

    if(!Array.isArray(results)){
        results = [results];
    }

    if(results.length === 0 ){
        container.append("<span class='noResults'>Nothing to show</span>")
    }else{
        results.forEach(result => {
            var html = createPostHtml(result);
            container.append(html);
        });
    }  
}

//show posts in the view post page
function outputPostsWithReplies(results, container){
    container.html("");

    // the post which this post reply to
    if(results.replyTo && results.replyTo._id){
        var html = createPostHtml(results.replyTo);
        container.append(html);
    }

    //main post
    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    if(results.replies.length > 0){
        results.replies.forEach(reply => {
            var html = createPostHtml(reply);
            container.append(html);
        });
    }
    
}

//show the pinned post 
function outputPinnedPost(results, container){
    if(results.length === 0 ){
        container.hide();
        return;
    }

    container.html("");

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })
}

function outputUsers(results, container) {
    container.html("");

    if(results.length == 0 ){
        container.append("<span class='noResults'>No results</span>");
    }

    results.forEach(result => {
        var html = createUserHtml(result, true);
        container.append(html);
    });
}

function createUserHtml(userData, showFollowButton){
    var name = userData.firstName + ' ' + userData.lastName;

    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    var text = isFollowing ? "Following" : "Follow";
    var buttonClass = isFollowing ? "followButton following" : "followButton";

    var followButton = "";
    if(showFollowButton && userLoggedIn._id != userData._id){
        followButton = `<div class="followButtonContainer"> 
                            <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                        </div>`
    }


    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class='username'>@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
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

function messageReceived(newMessage){
    //if not in the messages page
    if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
        //show popup notification
        showMessagePopUp(newMessage)
    }else {
        addChatMessageHtml(newMessage);
    }

    refreshMessagesBadge();
}

function markNotificationAsOpened(notificationId = null, callback = null){
    if(callback == null){
        callback = () => {
            location.reload();
        }
    }

    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;

    $.ajax({
        url,
        type: "PUT",
        success: () => callback()
    })
}

function refreshMessagesBadge(){
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        let numResults = data.length;
        if(numResults > 0){
            $("#messagesBadge").text(numResults).addClass("active");
        }else{
            $("#messagesBadge").text("").removeClass("active");
        }
    })
}

function refreshNotificationBadge(){
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        let numResults = data.length;
        if(numResults > 0){
            $("#notificationsBadge").text(numResults).addClass("active");
        }else{
            $("#notificationsBadge").text("").removeClass("active");
        }
    })
}

function showNotificationPopUp(data){
    var html = createNotificationHtml(data);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");
    setTimeout(() => {
        element.fadeOut(400);
    }, 5000);
}

function showMessagePopUp(data){
    if(!data.chat.latestMessage._id){
        data.chat.latestMessage = data;
    }
    var html = createChatHtml(data.chat);
    var element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");
    setTimeout(() => {
        element.fadeOut(400);
    }, 5000);
}

function outputNotificationList(notifications, container){
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    });

    if(notifications.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>")
    }
}

function createNotificationHtml(notification){
    var userFrom = notification.userFrom;
    var notificationText = getNotificationText(notification);

    return `<a class='resultListItem notification' href='#'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailContainer ellipsis'>
                        ${notificationText}
                </div>
            </a>`
}

function getNotificationText(notification) {
    var userFrom = notification.userFrom;
    var notificationType= notification.notificationType;

    if(!userFrom || !notificationType){
        return alert("Notification hasn't been poupalted");
    }

    let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    let text;

    switch (notificationType) {
        case "follow":
            text = `${userFromName} followed you`;
            break;
        case "postLike":
            text = `${userFromName} liked your post`;
            break;
        case "reply":
            text = `${userFromName} replied to your post`;
            break;
        case "retweet":
            text = `${userFromName} retweeted your post`;
            break;
        default:
            break;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function outputNotificationList(notifications, container){
    notifications.forEach(notification => {
        var html = createNotificationHtml(notification);
        container.append(html);
    });

    if(notifications.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>")
    }
}

function createNotificationHtml(notification){
    var userFrom = notification.userFrom;
    var notificationText = getNotificationText(notification);
    var url = getNotificationUrl(notification);
    var className = notification.opened ? "" : "active";

    return `<a class='resultListItem notification ${className}' href='${url}' data-id='${notification._id}'>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailContainer ellipsis'>
                        ${notificationText}
                </div>
            </a>`
}

function getNotificationUrl(notification) {
    const notificationType = notification.notificationType;
    let url;

    switch (notificationType) {
        case "postLike":
        case "reply":
        case "retweet":
            url = `/posts/${notification.entityId}`;
            break;
        case "follow":
            url = `/profile/${notification.entityId}`;
            break;
        default: 
            url = "#";
            break;
    }

    return url;
}

function createChatHtml(chatData){
    var chatName = getChatName(chatData);
    var image = getChatImageElements(chatData);
    var latestMessage = getLatestMessage(chatData.latestMessage);
    var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active"; 

    return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText ellipsis'>${latestMessage}</span>
                </div>
            </a>`
}

function getLatestMessage(latestMessage){
    if(latestMessage){
        var sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return "New chat";
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