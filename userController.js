const { sql, poolPromise } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await poolPromise;
        let rolID = 1; // RolID 1 por defecto para cliente

        if (email.includes('@admin')) {
            rolID = 2; // Asignar rol de administrador si el email contiene @admin
        }

        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('hashedPassword', sql.NVarChar, hashedPassword)
            .input('rolID', sql.Int, rolID)
            .query(`INSERT INTO Usuarios (Nombre, Email, Password, RolID) 
                    VALUES (@nombre, @email, @hashedPassword, @rolID)`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');
        const user = result.recordset[0];
        if (user && await bcrypt.compare(password, user.Password)) {
            const token = jwt.sign({ userID: user.UsuarioID, rolID: user.RolID }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token, rolID: user.RolID });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserProfile = async (req, res) => {
    const userID = req.user.userID;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, userID)
            .query('SELECT UsuarioID, Email, Nombre, RolID FROM Usuarios WHERE UsuarioID = @UsuarioID');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getCustomers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.UsuarioID as id, u.Nombre as nombre, u.Email as email, COUNT(p.PedidoID) as totalCompras
            FROM Usuarios u
            LEFT JOIN Pedidos p ON u.UsuarioID = P.ClienteID
            GROUP BY u.UsuarioID, u.Nombre, u.Email
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getCustomers
};