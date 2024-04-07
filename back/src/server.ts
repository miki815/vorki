import express from 'express';

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Adresa MySQL servera
  user: 'root',      // Korisničko ime
  password: 'miki',  // Lozinka
  database: 'vorki'       // Ime baze podataka
});

connection.connect((err) => {
  if (err) {
    console.error('Greška pri povezivanju s bazom podataka:', err);
    return;
  }
  console.log('Uspešno povezan sa bazom podataka');
  connection.query('SELECT * FROM user', (err, results) => {
    if (err) {
      console.error('Greška pri dohvatanju korisnika:', err);
      return;
    }
    console.log('Korisnici:', results);
  });
});

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(4000, () => console.log(`Express server running on port 4000`));