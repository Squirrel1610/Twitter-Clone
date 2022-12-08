$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outputNotificationList(data, $(".resultsContainer"));
    })
})

//mark all notification all read
$("#markNotificationAsRead").click(() => markNotificationAsOpened())

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
            text = `${userFromName} has just followed you`;
            break;
        case "postLike":
            text = `${userFromName} has just liked your post`;
            break;
        case "reply":
            text = `${userFromName} has just replied to your post`;
            break;
        case "retweet":
            text = `${userFromName} has just retweeted your post`;
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