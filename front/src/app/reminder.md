# TODO

1. Kalendar
2. Sredjivanje profila (na kraju)
3. Izdvajanje oglasa *** Uradjeno *** 
4. Sredjivanje podesavanja profila (na kraju)
5. Rezervacija (to moze i zajedno sa kalendarom)
6. Sredjivanje Menu-a i dodavanje svuda
7. Dodavanje svuda footer
8. Izlistavanje oglasa korisnika *** Uradjeno *** 
7. Dodavanje Mape u oglasima *** Uradjeno *** 
9. Zastititi sve stranice od pristupa preko URL ako korisnik nije ulogovan *** Uradjeno Riki 22.6. *** 
    Samo iskopirati *** canActivate: [authGuard] *** u sve rute koje je potrebno zastititi (app-routing-module)
10. Ograniciti duzinu pitanja, komentara i ostalih input polja na odredjen broj karaktera - maxLength atribut 
*** Uradjeno za login i register ***
11. Početna - backend

# Pages

1. Dodavanje oglasa korisnika *** Spojeno ***  
2. Dodavanje oglasa majstora (mozda i da se spoji da bude jedan pa na osnovu ID-a da se vidi da li je korisnik ili majstor) *** Spojeno *** 
3. Izlistavanje oglasa korisnika *** Spojeno *** 
4. Izlistavanje oglasa majstora (mozda i da se spoji pa da na osnovu boola se prikazu samo odredjeni oglasi ako spojimo iznad)*** Spojeno *** 
5. Profil majstora
6. Profil korisnika
7. Podesavanje profila majstora
8. Podesavanje profila korisnika (profil/podesvanje profila mozda da budu iste stranice samo sa *ngIf majstor/korisnik) 
9. Kalendar
10. Rezervacija termina
11. O nama
12. Zaboravljena lozinka *** Riki 19.6. ***
13. Prijava
14. Registracija
15. Stranica za neregistrovane


# Questions

1. Filtriranje poslova - grad, profesija, ..jos nesto? - Ne treba
2. Za dovlacenje podataka o poslu i prikaz oglasa potrebni su slika i ime majstora - cuvati to u tabeli o poslu ili pisati join upit (napisao) - Sredjeno
3. Mozda nije lose cuvati profilnu kao base64 a slike iz galerije u assets - Mislim da ne mora
4. Zasto je rate u tabeli rate tipa text? Da li ce biti neki problem ako prebacimo na float


# Notes

1. Dodao polje avgRate kod usera, to treba azurirati svaki put kad neko da ocenu - Ne mora, izracunas avg(rate) - Sredjeno
2. Dodao polje jobId kod komentara, da kada se pregleda pojedinacan posao mogu da se vide svi komentari/pitanja
vezana za taj posao (default vrednost je 0 i to predstavlja komentarisanje na profilu majstora kada jobId nije
ni potreban)

## Dokumentacija za style
https://tailwindcss.com/docs/place-items

