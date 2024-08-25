const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    name: {type:String},
    tasks:{ type: Array}
})

const Task = mongoose.model('Task',taskSchema);

module.exports = Task;
