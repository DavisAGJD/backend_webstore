const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const { poolPromise } = require('./db');


const app = express();
const PORT = process.env.PORT || 5000; // Usa la variable de entorno PORT

app.use(bodyParser.json());

const allowedOrigins = ['https://front-webstore-1.onrender.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', (req, res) => {
  res.send("Hola, este es tu back");
});

app.get('/get/test/db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) as count FROM Usuarios');
    res.json({ count: result.recordset[0].count });
  } catch (err) {
    console.error('SQL error', err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/', orderRoutes);

app.use((req, res, next) => {
  res.status(404).send("Página no encontrada");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
