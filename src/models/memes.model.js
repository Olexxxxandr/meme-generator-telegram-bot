const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MemesSchema = new Schema({
    picture: {
        type: String,
        required: true
    },
    capture: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

mongoose.model('memes', MemesSchema)