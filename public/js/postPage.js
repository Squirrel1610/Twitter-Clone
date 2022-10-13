$(document).ready(() =>{
    $.get(`/api/posts/${postId}`, (result) => {
        outputPostsWithReplies(result, $(".postsContainer"))
    })
})