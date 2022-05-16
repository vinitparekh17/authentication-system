const mongoose = require('mongoose');
const { MONGO_URI } = process.env

exports.connect = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("Mongoose connected!"))
        .catch(e => {
            console.log(e)
            process.exit(1)
        })
}
