CREATE TABLE IF NOT EXISTS `user` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `firstname` VARCHAR(255) NOT NULL,
    `lastname` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL
);

INSERT INTO user (username, firstname, lastname, password) VALUES
('korisnik1', 'Ime1', 'Prezime1', 'password1'),
('korisnik2', 'Ime2', 'Prezime2', 'password2'),
('korisnik3', 'Ime3', 'Prezime3', 'password3');

select * from user;

