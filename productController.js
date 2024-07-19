const { sql, poolPromise } = require("./db");

const getAllProducts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Productos");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addProduct = async (req, res) => {
  const { Nombre, Precio, Stock, Descripcion, Imagen, CategoriaID } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Nombre", sql.NVarChar, Nombre)
      .input("Precio", sql.Decimal(10, 2), Precio)
      .input("Stock", sql.Int, Stock)
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("Imagen", sql.NVarChar, Imagen)
      .input("CategoriaID", sql.Int, CategoriaID)
      .query(`INSERT INTO Productos (Nombre, Precio, Stock, Descripcion, Imagen, CategoriaID) 
                    VALUES (@Nombre, @Precio, @Stock, @Descripcion, @Imagen, @CategoriaID);
                    SELECT SCOPE_IDENTITY() AS ProductoID;`);
    res
      .status(201)
      .json({
        ProductoID: result.recordset[0].ProductoID,
        Nombre,
        Precio,
        Stock,
        Descripcion,
        Imagen,
        CategoriaID,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { Nombre, Precio, Stock, Descripcion, Imagen, CategoriaID } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .input("Nombre", sql.NVarChar, Nombre)
      .input("Precio", sql.Decimal(10, 2), Precio)
      .input("Stock", sql.Int, Stock)
      .input("Descripcion", sql.NVarChar, Descripcion)
      .input("Imagen", sql.NVarChar, Imagen)
      .input("CategoriaID", sql.Int, CategoriaID)
      .query(`UPDATE Productos SET Nombre = @Nombre, Precio = @Precio, Stock = @Stock, Descripcion = @Descripcion, Imagen = @Imagen, CategoriaID = @CategoriaID 
                    WHERE ProductoID = @id;
                    SELECT * FROM Productos WHERE ProductoID = @id`);
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        // Eliminar el producto
        await pool.request().input('id', sql.Int, id).query('DELETE FROM Productos WHERE ProductoID = @id');
        
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getAllCategories = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Categorias");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductsByCategory = async (req, res) => {
  const { categoryID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("CategoriaID", sql.Int, categoryID).query(`
                SELECT p.*, c.Nombre as CategoriaNombre
                FROM Productos p
                JOIN Categorias c ON p.CategoriaID = c.CategoriaID
                WHERE p.CategoriaID = @CategoriaID
            `);
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }
    res.json({
      categoryName: result.recordset[0].CategoriaNombre,
      products: result.recordset,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getProductsByCategory,
};
