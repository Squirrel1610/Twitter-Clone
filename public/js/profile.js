$(document).ready(() => {
    if(selectedTab === "replies"){
        loadReplies();
    }else{
        loadPosts();
    }
})

function loadPosts(){
    $.get("/api/posts", 
    {
        postedBy: profileUserId,
        pinned: true
    }, results => {
        outputPinnedPost(results, $(".pinnedPostContainer"));
    })

    $.get("/api/posts", 
    {
        postedBy: profileUserId,
        isReply: false
    }, results => {
        outputPosts(results, $(".postsContainer"));
    })
}

function loadReplies(){
    $.get("/api/posts", 
    {
        postedBy: profileUserId,
        isReply: true
    }, results => {
        outputPosts(results, $(".postsContainer"));
    })
}

