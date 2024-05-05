# TODO

1. Zastititi sve stranice od pristupa preko URL ako korisnik nije ulogovan
2. Ograniciti duzinu pitanja, komentara i ostalih input polja na odredjen broj karaktera

## single-job-short

1. Srediti parametre oglasa u .html

## job-listing

1. Hover style za buttons (ne radi iz nekog razloga)
2. Dodati meni komponentu
3. Popuniti gradove i zanimanja

# Questions

1. Filtriranje poslova - grad, profesija, ..jos nesto?
2. Za dovlacenje podataka o poslu i prikaz oglasa potrebni su slika i ime majstora - cuvati to u tabeli o poslu ili pisati join upit (napisao)
3. Mozda nije lose cuvati profilnu kao base64 a slike iz galerije u assets


# Notes

1. Dodao polje avgRate kod usera, to treba azurirati svaki put kad neko da ocenu
2. Dodao polje jobId kod komentara, da kada se pregleda pojedinacan posao mogu da se vide svi komentari/pitanja
vezana za taj posao (default vrednost je 0 i to predstavlja komentarisanje na profilu majstora kada jobId nije
ni potreban)

## Dokumentacija za style
https://tailwindcss.com/docs/place-items