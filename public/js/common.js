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

//when click reply modal
$("#replyModal").on("show.bs.modal", (e) => {
    var button = $(e.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);
    
    $.get(`/api/posts/${postId}`, (result) => {
        outputPosts(result, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal", (e) => {
    $("#originalPostContainer").html("");
})

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

    var replyFlag = "";
    if(postData.replyTo){
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


