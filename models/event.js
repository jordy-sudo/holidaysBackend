const { Schema, model } = require('mongoose');

const eventSchema = Schema({
    title: {
        type: String,
        default: 'Vacation'
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    hasPdfDocument: {
        type: Boolean,
        default: false,
    },
    requestedDays: {
        type: Number,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    show:{
        type:Boolean,
        default:false,
    }
},
    {
        timestamps: true,
    });

eventSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id
    return object;
});

module.exports = model('Evento', eventSchema);