const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    ci:{
        type: String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Empleado', 'Jefe', 'Administrador', 'rrhh'],
        default: 'Empleado',
    },
    position: {
        type: String, 
        required: true
    },
    boss: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    isActive: {
        type: Boolean, 
        default: true,
    },
    vacationDays: {
        type: Number,
        required: true,
        default: 0,
    },
    country:{
        type: String,
        required: true
    },
    department:{
        type: String,
        required: true
    },
    area:{
        type: String,
        required: true
    },
    dateOfJoining: {
        type: Date, 
        required: true,
        default: Date.now 
    }
},
{
    timestamps: true,
});

module.exports = model('Usuario', UserSchema);
