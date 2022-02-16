const mongoose = require('mongoose');

// Shortcut to Mongoose.Schema;
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    completion: {
        type: Boolean
    },
    image: {
        // URL
        type: String
    },
    status: {
        type: String,
        default: "Active"
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    modificationDate: {
        type: Date,
        default: Date.now
    },
    users: {
        creators: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        joiners: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        managers: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }]
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Tasks'
    }],
    settings: {
        colorScheme: {
            type: String,
            default: 'default'
        },
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notifications'
    }]
})

const Projects = mongoose.model('Projects', ProjectSchema, 'TaskManager_Project');

module.exports = Projects;