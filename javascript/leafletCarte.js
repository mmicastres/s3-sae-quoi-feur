//const data = document.getElementById("data");
const countTotal = document.getElementById("total");
const submit_recherche = document.getElementById("submit_recherche");
const recherche_form = document.getElementById("recherche");

// Définition de la carte : 

var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);



let endpoint = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/accidents-corporels-de-la-circulation-millesime/records"


let year = "2018"

let recherche = "toulouse"
let req = `?where=com_name like "${recherche}" or com_code like "${recherche}"`


let url = endpoint + req + `and an = ${year}`
url_encoded = encodeURI(url)

const max = 1000;
nb_par_pages = 100;

async function getAccidents(ville,annee){
    var accidents = []
    var req = `?where=com_name like "${ville}" or com_code like "${ville}" and an = ${annee} &limit=${nb_par_pages}`
    var url = endpoint + req
    url_encoded = encodeURI(url)
    console.log(url_encoded);
    const response = await fetch(url_encoded)
    data = await response.json()
    console.log(data);
    if (data.total_count > nb_par_pages){
        nb_pages = Math.ceil(max/nb_par_pages)
        console.log("nombre de pages : "+nb_pages);
        for (let i = 0; i < nb_pages; i++) {
            const page = i;
            var req = `?where=com_name like "${ville}" or com_code like "${ville}" and an = ${annee} &limit=${nb_par_pages}`+`&offset=${nb_par_pages*page }`
            var url = endpoint + req
            url_encoded = encodeURI(url)
            console.log(url_encoded);
            const response = await fetch(url_encoded)
            data = await response.json()
            accidents = accidents.concat(data.results)
        }
    }
    else{
        accidents = data.results
    }
    console.log(accidents);
    return [data.total_count,accidents]
}


let total,accidents 
window.onload = async function() {
    [total,accidents] = await getAccidents("Castres",2018)
    countTotal.innerText = total
    console.log(accidents.length);
    updateMap(accidents)
}

recherche_form.addEventListener("submit", async function(event){
    event.preventDefault()
    let ville = document.getElementById("ville").value
    let annee = document.getElementById("annee").value
    console.log(ville,annee);
    [total,accidents] = await getAccidents(ville,annee)
    countTotal.innerText = total
    console.log(accidents.length);
    updateMap(accidents)
}
)

var carFlippedMort = L.icon({
    iconUrl: 'carFlippedMort.svg',
    iconSize: [38, 95]
});

var carFlippedMin = L.icon({
    iconUrl: 'carFlippedMin.svg',
    iconSize: [38, 95]
});

var carFlippedGrave = L.icon({
    iconUrl: 'carFlippedGrave.svg',
    iconSize: [38, 95]
});

function gravite(accident){
    let max = 0
    for (const gravite of accident.grav) {
        let grav = 0
        if (gravite == "Indemne") grav = 0
        if (gravite == "Blessé") grav = 1
        if (gravite == "Tué") grav = 2
        if (grav > max) max = grav
    }
    return max

}

function updateMap(accidents){
    let center
    // remove all markers
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    for (let i = 0; i < accidents.length; i++) {
        const accident = accidents[i];
        if (accident.coordonnees && accident.coordonnees.lat && accident.coordonnees.lon){
            center = accident.coordonnees
            let lat = accident.coordonnees.lat
            let lng = accident.coordonnees.lon
            grav = gravite(accident)
            icon = carFlippedMin
            gravite_label = ""
            if (grav == 2) {icon = carFlippedMort; gravite_label = "Mort"}
            if (grav == 1) {icon = carFlippedGrave; gravite_label = "Grave"}
            if (grav == 0) {icon = carFlippedMin; gravite_label = "Léger"}
            let marker = L.marker([lat,lng],{icon: icon}).addTo(map);
            marker.bindPopup(`<b>${accident.com_name}</b><br>${accident.adr}</br>${gravite_label}`)
        }
    }
    map.setView([center.lat,center.lon], 13);

}
getAccidents("mirande",2018)

// var map = L.map('map').setView([51.505, -0.09], 13); 