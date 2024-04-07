CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    birthday DATE NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    ulogaK BOOLEAN DEFAULT FALSE,
    ulogaM BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) NOT NULL
);


INSERT INTO user (username, firstname, lastname, password, birthday, phone, location, ulogaK, ulogaM, email)
VALUES 
('korisnik1', 'Ime1', 'Prezime1', 'lozinka1', '2000-01-01', '123456789', 'Lokacija1', TRUE, FALSE, 'korisnik1@example.com'),
('korisnik2', 'Ime2', 'Prezime2', 'lozinka2', '2000-02-02', '987654321', 'Lokacija2', TRUE, FALSE, 'korisnik2@example.com'),
('korisnik3', 'Ime3', 'Prezime3', 'lozinka3', '2000-03-03', '555555555', 'Lokacija3', TRUE, FALSE, 'korisnik3@example.com');


select * from user;

