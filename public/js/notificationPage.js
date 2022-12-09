$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outputNotificationList(data, $(".resultsContainer"));
    })
})

//mark all notification all read
$("#markNotificationAsRead").click(() => markNotificationAsOpened())