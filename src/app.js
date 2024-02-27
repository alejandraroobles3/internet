
const express = require('express');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT ||3000;


app.use(express.static('public'));

// Configura la conexión a la base de datos PostgreSQL en Azure
const client = new Client({
  user: "administrador",
  host: "mirada.postgres.database.azure.com",
  database: "mirada_analitica",
  password: "Ale123roblesmora",
  port: 5432,
  ssl: {
      rejectUnauthorized: false // Para evitar errores de certificado SSL si no tienes configurado un certificado personalizado
  }
});
client.connect();

// Ruta raíz, sirve el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
 
app.get('/data', async (req, res) => {
  try {
    const idCandidato = req.query.id_candidato; // Obtener el ID del candidato desde la consulta

    // Ejecutar las consultas utilizando el ID del candidato
    const [candidatoData, tabla2Data, tabla3Data] = await Promise.all([
      client.query('SELECT COUNT(dato.id_candidato) AS numero_de_datos FROM dato WHERE dato.id_candidato = $1;', [idCandidato]).then(result => result.rows),
      client.query('SELECT COUNT(dato.id_prediccion) FROM dato WHERE dato.id_candidato = $1 AND dato.id_prediccion = 1;', [idCandidato]).then(result => result.rows),
      client.query('SELECT COUNT(dato.id_prediccion) FROM dato WHERE dato.id_candidato = $1 AND dato.id_prediccion = 2;', [idCandidato]).then(result => result.rows)
    ]);

    // Construir un objeto con los resultados de las consultas
    const data = {
      candidato: candidatoData,
      tabla2: tabla2Data,
      tabla3: tabla3Data
    };

    // Enviar los resultados como respuesta
    res.json(data);
  } catch (error) {
    console.error('Error ejecutando las consultas:', error);
    res.status(500).json({ error: 'Error ejecutando las consultas' });
  }
});


app.listen(port, () => {
  console.log(`Servidor escuchando en :${port}`);
});

