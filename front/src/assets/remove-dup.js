const fs = require('fs');

// Učitaj ulazni fajl
const rawData = fs.readFileSync('city.json');
const data = JSON.parse(rawData);

// Ukloni duplikate po 'city'
const unique = [];
const seen = new Set();

for (const item of data) {
  if (!seen.has(item.city)) {
    unique.push(item);
    seen.add(item.city);
  }
}

// Sačuvaj rezultat u novi fajl
fs.writeFileSync('cities-cleaned.json', JSON.stringify(unique, null, 2));

console.log(`Učitano ${data.length} gradova, uklonjeno ${data.length - unique.length} duplikata.`);
console.log(`Završeno! Sačuvano ${unique.length} gradova bez duplikata u cities-cleaned.json`);
