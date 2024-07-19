const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Ajusta la ruta según tu estructura

const Usuarios = sequelize.define('Usuarios', {
    UsuarioID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    RolID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = Usuarios;
