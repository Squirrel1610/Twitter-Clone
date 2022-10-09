$("#postTextarea").keyup(e => {
    var textbox = $(e.target);
    var value = textbox.val().trim();
    var submitButton = $("#submitPostButton");

    if(!value){
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

//submit to create post
$("#submitPostButton").click((event) => {
    var button = $(event.target);
    var textbox = $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    $.post("/api/posts", data, (postData) => {
        var html = createPostHtml(postData);
        $(".postsContainer").prepend(html);
        textbox.val("");
        button.prop("disabled", true);
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
            }else{
                button.removeClass("active");
            }
        }
    })
})

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

function createPostHtml(postData) {
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

    return `<div class='post' data-id='${postData._id}'>    
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
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
                                <button>
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



