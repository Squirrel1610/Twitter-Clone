const mongoose = require("mongoose");
require("dotenv").config();

class Database {
    constructor(){
        this.connect();
    }

    async connect(){
        try {
            await mongoose.connect(process.env.MONGODB_URL);

            console.log("MongoDB connect success");
        } catch (error) {
            console.log(error.message);
            console.log("MongoDB connect fail");
            process.exit(1);
        }
    }
}

module.exports = new Database();