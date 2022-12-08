const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        userTo: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        userFrom: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
        notificationType: { type: String },
        entityId: { type: mongoose.SchemaTypes.ObjectId },
        opened: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
)

NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
    let data = {
        userTo,
        userFrom,
        notificationType,
        entityId
    }

    //delete if it already have in db
    await Notification.deleteOne(data).catch(err => console.log(err.message));
    return Notification.create(data).catch(err => console.log(err.message));
}


var Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;