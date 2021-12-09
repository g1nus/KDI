const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

console.log("cleaning locations data..");

function parsePhoneNumber(strNumber){
  return strNumber.replace(/\s+/g, '')
}

function yesNoCheck(flag){
  if(flag == "yes" || flag == "Yes" || flag == "Oui" || flag == "oui" || flag == "OUI"){
    return true;
  }else{
    return false;
  }

  /*if(flag == "yes" || flag == "Yes"){
    return "Y";
  }else if (flag == "no" || flag == "No"){
    return "N";
  }else{
    return "unknown";
  }*/
}

//======================
//GREEN SPACES
//======================

let rawdata = fs.readFileSync('./input/espaces_verts.json');
let greenSpaces = JSON.parse(rawdata);
let greenSpacesClean = greenSpaces.map(space => {
  return {
    id: uuidv4(),
    name: space.fields.nom_ev || "no name",

    surfaceArea: space.fields.surface_totale_reelle || -1,
    type: space.fields.type_ev || "generic",
    category: space.fields.categorie || "generic",
    is24hrs: (space.fields.ouvert_ferme == "Non" ? false : true),
    location: {
      latitude: (space.fields.geom?.type == "MultiPolygon" ? (space.fields.geom?.coordinates[0][0][0][0] || -1) : (space.fields.geom?.coordinates[0][0][0] || -1)),
      longitude: (space.fields.geom?.type == "MultiPolygon" ? (space.fields.geom?.coordinates[0][0][0][1] || -1) : (space.fields.geom?.coordinates[0][0][1] || -1))
    }
  };
});

greenSpacesClean.forEach(space => {
  //console.log(space);
});

fs.writeFileSync('./output/green_spaces.json', JSON.stringify(greenSpacesClean));

//======================
//PEDESTRIAN AREAS
//======================

rawdata = fs.readFileSync('./input/aires-pietonnes.json');
let pedestrianArea = JSON.parse(rawdata);
let pedestrianAreaClean = pedestrianArea.map(pa => {
  return {
    id: uuidv4(),
    name: pa.fields.nom || "no name",

    location: {
      latitude: pa.geometry?.coordinates[0] || -1,
      longitude: pa.geometry?.coordinates[1] || -1
    }
  };
});


fs.writeFileSync('./output/pedestrianarea.json', JSON.stringify(pedestrianAreaClean));

//======================
//PARKING SPOTS
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geoJSON');
let parisParking = JSON.parse(rawdata).features.filter(feature => feature.properties.amenity == "parking");
let parisParkingClean = parisParking.map((parking) => {
  return {
    id: uuidv4(),
    name: parking.properties.parking || "no name",

    type: parking.properties.parking || "unknown",
    fee: yesNoCheck(parking.properties.fee),
    location: {
      latitude: parking.geometry.coordinates[0],
      longitude: parking.geometry.coordinates[1]
    }
  }
})

fs.writeFileSync('./output/parking_spots.json', JSON.stringify(parisParkingClean));

//======================
//ATM
//======================

rawdata = fs.readFileSync('./input/Paris_atm.geoJSON');
let parisAtm = JSON.parse(rawdata).features;
let parisAtmClean = parisAtm.map((atm) => {
  return {
    id: uuidv4(),
    name: atm.properties.name || "no name",

    provider: atm.properties.operator || atm.properties.brand || "unknown",
    wheelchairAccess: (atm.properties.wheelchair == "yes" ? true : false),
    is24hrs: (atm.properties.opening_hours == "24/7" ? true : false),
    location: {
      latitude: atm.geometry.coordinates[0],
      longitude: atm.geometry.coordinates[1]
    }
  }
})

fs.writeFileSync('./output/atms.json', JSON.stringify(parisAtmClean));

//======================
//BikeStation
//======================

rawdata = fs.readFileSync('./input/velib-disponibilite-en-temps-reel.json');
let bikeStations = JSON.parse(rawdata);
let bikeStationsClean = bikeStations.map(station => {
  return {
    id: uuidv4(),
    name: station.fields.name || "no name",

    capacity: station.fields.capacity || -1,
    isRenting: yesNoCheck(station.fields.is_renting),
    isReturning: yesNoCheck(station.fields.is_returning),
    location: {
      latitude: station.geometry.coordinates[0],
      longitude: station.geometry.coordinates[1]
    }
  };
});

fs.writeFileSync('./output/bikestations.json', JSON.stringify(bikeStationsClean));

//======================
//BikeTrack
//======================

rawdata = fs.readFileSync('./input/reseau-cyclable.json');
let bikeTrack = JSON.parse(rawdata);
let bikeTrackClean = bikeTrack.map(track => {
  return {
    id: uuidv4(),
    name: track.fields.voie || "no name",

    type: track.fields.typologie_simple || "generic",
    speedLimit: track.fields.statut || "no limit",
    isBidirectional: yesNoCheck(track.fields.bidirectionnel),
    hasForest: ((track.fields.bois == undefined || track.fields.bois == "Non") ? false : true),
    length: track.fields.length,
    location: {
      latitude: (track.geometry?.coordinates ? track.geometry.coordinates[0] : -1),
      longitude: (track.geometry?.coordinates ? track.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/biketracks.json', JSON.stringify(bikeTrackClean));

//======================
//taxi station
//======================

rawdata = fs.readFileSync('./input/bornes-dappel-taxi.json');
let taxiStation = JSON.parse(rawdata);
let taxiStationClean = taxiStation.map(station => {
  return {
    id: uuidv4(),
    name: station.fields.nom_station || "no name",

    phoneNumber: station.fields?.num_bat ? parsePhoneNumber(station.fields.num_bat) : "no number",
    location: {
      latitude: (station.geometry?.coordinates ? station.geometry.coordinates[0] : -1),
      longitude: (station.geometry?.coordinates ? station.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/taxistations.json', JSON.stringify(taxiStationClean));

//======================
//point of interest
//======================

rawdata = fs.readFileSync('./input/paris-autrement-balades-dans-les-arrondissements-peripheriques-poi.json');
let poi = JSON.parse(rawdata);
let poiClean = poi.map(point => {
  return {
    id: uuidv4(),
    name: point.fields.nom_poi || "no name",

    category: point.fields.categorie || "generic",
    description: point.fields.texte_description || "no description",
    keywords: point.fields.mot_cle.split(";"),
    website: point.fields.url_site,
    location: {
      latitude: (point.geometry?.coordinates ? point.geometry.coordinates[0] : -1),
      longitude: (point.geometry?.coordinates ? point.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/pois.json', JSON.stringify(poiClean));

//======================
//bus stops
//======================

rawdata = fs.readFileSync('./input/Paris_bus.geojson');
let busStop = JSON.parse(rawdata).features;
let busStopClean = busStop.map(stop => {
  return {
    id: uuidv4(),
    name: stop.properties.name || "no name",

    hasShelter: (stop.properties.shelter == "yes" ? true : false),
    wheelchairAccess: (stop.properties.wheelchair == "yes" ? true : false),
    location: {
      latitude: (stop.geometry?.coordinates ? stop.geometry.coordinates[0] : -1),
      longitude: (stop.geometry?.coordinates ? stop.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/busstops.json', JSON.stringify(busStopClean));

//======================
//bus stops
//======================

rawdata = fs.readFileSync('./input/Paris_subways.geojson');
let subwayStation = JSON.parse(rawdata).features;
let subwayStationClean = subwayStation.map(station => {
  return {
    id: uuidv4(),
    name: station.properties.name || "no name",

    wheelchairAccess: (station.properties.wheelchair == "yes" ? true : false),
    location: {
      latitude: (station.geometry?.coordinates ? station.geometry.coordinates[0] : -1),
      longitude: (station.geometry?.coordinates ? station.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/subwaystations.json', JSON.stringify(subwayStationClean));

//======================
//Wi-Fi hotspots
//======================

rawdata = fs.readFileSync('./input/sites-disposant-du-service-paris-wi-fi.json');
let wifiHotspot = JSON.parse(rawdata);
let wifiHotspotClean = wifiHotspot.map(hotspot => {
  return {
    id: uuidv4(),
    name: hotspot.fields.nom_site || "no name",

    status: hotspot.fields.etat2,
    location: {
      latitude: (hotspot.geometry?.coordinates ? hotspot.geometry.coordinates[0] : -1),
      longitude: (hotspot.geometry?.coordinates ? hotspot.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/wifihotspots.json', JSON.stringify(wifiHotspotClean));

function readDays(openDays) {
  let days = ["mo", "tu", "we", "th", "fr", "sa", "su"]
  let daysDict = {
    lundi: "mo",
    lundiapm: "mo",
    lelundi: "mo",
    mardi: "tu",
    mardiapm: "tu",
    mercredi: "we",
    mercrediapm: "we",
    jeudi: "th",
    jeudiapm: "th",
    vendredi: "fr",
    vendrediapm: "fr",
    samedi: "sa",
    samediapm: "sa",
    dimanche: "su",
    ledimanche: "su",
    dimancheapm: "su"  
  }
  if(openDays.length <= 1){
    if(openDays[0] == "touslesjours" || openDays[0] == "louslesjours"){
      return days;
    }else if(openDays[0].includes("auf")){
      let closedDay = daysDict[openDays[0].substring(openDays[0].indexOf("auf") + 3, openDays[0].length)];
      //console.log("closed day: ", closedDay);
      return days.filter(d => d != closedDay);
    }else if(openDays[0] == "mardiapmetvendrediapm"){
      return ["tu", "fr"];
    }else{
      return [daysDict["" + openDays[0]]]
    }
  }else{
    return openDays.map((day) => daysDict[day]);
  }
}

function extractHoursMarkets(market) {
  let workingDays = ["mo", "tu", "we", "th", "fr"];
  let openingHours = {
    mo: null,
    tu: null,
    we: null,
    th: null,
    fr: null,
    sa: null,
    su: null
  }

  let openDays = market.jours_tenue.replace(/\s+/g, '').split(",");
  //console.log("input > ", openDays);
  let cleanDays = readDays(openDays);
  //console.log("output > ", cleanDays);
  cleanDays.forEach((day) => {
    if(workingDays.includes(day)){
      openingHours[day] = {from: market.h_deb_sem_1, to: market.h_fin_sem_1}
    }else if(day == "sa"){
      openingHours[day] = {from: market.h_deb_sam, to: market.h_fin_sam}
    }else{
      openingHours[day] = {from: market.h_deb_dim, to: market.h_fin_dim}
    }
  })
  return openingHours;
}

function getHoursOSM(hoursString) {
  let weekDays = ["mo", "tu", "we", "th", "fr", "sa", "su"];
  let openingHours = {
    mo: null,
    tu: null,
    we: null,
    th: null,
    fr: null,
    sa: null,
    su: null
  }

  let rawString = hoursString.split(" ");
  rawString.forEach(function(str, idx) {
    //remove ending semicolon
    let sample = str.split(";")[0];
    //search for hours
    let hours = sample.split(",").filter((hr) => hr.length == 11 && hr[5] == "-" && hr[2] == ":" && hr[8] == ":");
    //if there are any hours
    if(idx > 0 && hours.length > 0){
      //search for days in the previous string token (can be multiple days separated by comma)
      let dayRanges = rawString[idx-1].split(",").map((str) => str.toLowerCase());
      //for each day(range)
      dayRanges.forEach((dayRange) => {
        //range of days (separated by -)
        let range = dayRange.split("-").filter((day) => {
          return weekDays.includes(day)
        });
        //console.log("weekdays > ", weekDays)
        //console.log("range > ", range)
        //get all the days included in the range
        let currentRange = [];
        let diff = 0;
        if(range.length > 1 && weekDays.indexOf(range[0]) < (weekDays.indexOf(range[1]) + 1)){
          diff = weekDays.indexOf(range[1]) - weekDays.indexOf(range[0]) + 1;
          //console.log("range day and index > ", range[0], weekDays.indexOf(range[0]), range[1], (weekDays.indexOf(range[1]) + 1));
          currentRange = [...weekDays].splice(weekDays.indexOf(range[0]), diff);
        }else if(range.length > 1 && weekDays.indexOf(range[0]) > (weekDays.indexOf(range[1]))){
          let sct1 = [...weekDays].splice(0, weekDays.indexOf(range[1]) + 1);
          let sct2 = [...weekDays].splice(weekDays.indexOf(range[0]));
          //console.log([...weekDays].splice(0, weekDays.indexOf(range[1]) + 1), [...weekDays].splice(weekDays.indexOf(range[0]), 7))
          currentRange = sct1.concat(sct2);
        }else{
          currentRange = range;
        }
        //console.log("outcome range > ", currentRange);
        //save hours of each day
        currentRange.forEach((day) => {
          openingHours[day] = hours.map((hr) => {return {from: hr.substring(0,5), to: hr.substring(6, 11)}})
        })
      })
    }
  })

  return openingHours;
}

//======================
//cinemas
//======================

rawdata = fs.readFileSync('./input/Paris_cinema.geojson');
let cinema = JSON.parse(rawdata).features;
let cinemaClean = cinema.map(cnm => {
  return {
    id: uuidv4(),
    name: cnm.properties.name || "no name",

    brand: cnm.properties.brand || "no brand",
    wheelchairAccess: (cnm.properties.wheelchair == "yes" ? true : false),
    openingHours: (cnm.properties.opening_hours && cnm.properties.opening_hours != "closed") ? getHoursOSM(cnm.properties.opening_hours) : null,
    location: {
      latitude: (cnm.geometry?.coordinates ? cnm.geometry.coordinates[0] : -1),
      longitude: (cnm.geometry?.coordinates ? cnm.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/cinemas.json', JSON.stringify(cinemaClean));

//======================
//museums
//======================

rawdata = fs.readFileSync('./input/Paris_museum.geojson');
let museum = JSON.parse(rawdata).features;
let museumClean = museum.map(msm => {
  return {
    id: uuidv4(),
    name: msm.properties.name || "no name",

    wheelchairAccess: (msm.properties.wheelchair == "yes" ? true : false),
    website: msm.properties.website,
    openingHours: msm.properties.opening_hours ? getHoursOSM(msm.properties.opening_hours) : null,
    location: {
      latitude: (msm.geometry?.coordinates ? msm.geometry.coordinates[0] : -1),
      longitude: (msm.geometry?.coordinates ? msm.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/museums.json', JSON.stringify(museumClean));

//======================
//coffee shop
//======================

rawdata = fs.readFileSync('./input/Paris_cafe.geojson');
let cafe = JSON.parse(rawdata).features;
let cafeClean = cafe.map((cf, idx) => {
  return {
    id: uuidv4(),
    name: cf.properties.name || "no name",

    cuisine: cf.properties.cuisine?.split(";") || "generic",
    hasWifi: (cf.properties.internet_access == "yes" ? true : false),
    wheelchairAccess: (cf.properties.wheelchair == "yes" ? true : false),
    hasTakeaway: (cf.properties.takeaway == "yes" ? true : false),
    openingHours: cf.properties.opening_hours ? getHoursOSM(cf.properties.opening_hours) : null,
    location: {
      latitude: (cf.geometry?.coordinates ? cf.geometry.coordinates[0] : -1),
      longitude: (cf.geometry?.coordinates ? cf.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/cafes.json', JSON.stringify(cafeClean));

//======================
//bar
//======================

rawdata = fs.readFileSync('./input/Paris_bar.geojson');
let bar = JSON.parse(rawdata).features;
let barClean = bar.map((br) => {
  return {
    id: uuidv4(),
    name: br.properties.name || "no name",

    cuisine: br.properties.cuisine?.split(";") || "generic",
    website: br.properties.website || "no website",
    phoneNumber: br.properties.phone ? parsePhoneNumber(br.properties.phone) : "no number",
    wheelchairAccess: (br.properties.wheelchair == "yes" ? true : false),
    openingHours: br.properties.opening_hours ? getHoursOSM(br.properties.opening_hours) : null,
    location: {
      latitude: (br.geometry?.coordinates ? br.geometry.coordinates[0] : -1),
      longitude: (br.geometry?.coordinates ? br.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/bars.json', JSON.stringify(barClean));

//======================
//shopping centre
//======================

rawdata = fs.readFileSync('./input/Paris_mall_depstore.geojson');
let shoppingCentre = JSON.parse(rawdata).features;
let shoppingCentreClean = shoppingCentre.map((sc) => {
  return {
    id: uuidv4(),
    name: sc.properties.name || "no name",

    type: sc.properties.shop || "generic",
    wheelchairAccess: (sc.properties.wheelchair == "yes" ? true : false),
    hasToilets: (sc.properties.toilets == "yes" ? true : false),
    openingHours: sc.properties.opening_hours ? getHoursOSM(sc.properties.opening_hours) : null,
    location: {
      latitude: (sc.geometry?.coordinates ? sc.geometry.coordinates[0] : -1),
      longitude: (sc.geometry?.coordinates ? sc.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/shoppingcentres.json', JSON.stringify(shoppingCentreClean));

//======================
//restaurant
//======================

rawdata = fs.readFileSync('./input/Paris_restaurant.geojson');
let restaurant = JSON.parse(rawdata).features;
let restaurantClean = restaurant.map((rsnt) => {
  return {
    id: uuidv4(),
    name: rsnt.properties.name || "no name",

    cuisine: rsnt.properties.cuisine?.split(";") || "generic",
    takeaway: (rsnt.properties.takeaway == "yes" ? true : false),
    phoneNumber: rsnt.properties.phone ? parsePhoneNumber(rsnt.properties.phone) : "no number",
    openingHours: rsnt.properties.opening_hours ? getHoursOSM(rsnt.properties.opening_hours) : null,
    location: {
      latitude: (rsnt.geometry?.coordinates ? rsnt.geometry.coordinates[0] : -1),
      longitude: (rsnt.geometry?.coordinates ? rsnt.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/restaurants.json', JSON.stringify(restaurantClean));

//======================
//bakeries
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geojson');
let bakery = JSON.parse(rawdata).features.filter(feature => feature.properties.shop == "bakery");
let bakeryClean = bakery.map((bkr) => {
  return {
    id: uuidv4(),
    name: bkr.properties.name || "no name",

    wheelchairAccess: (bkr.properties.wheelchair == "yes" ? true : false),
    openingHours: bkr.properties.opening_hours ? getHoursOSM(bkr.properties.opening_hours) : null,
    location: {
      latitude: (bkr.geometry?.coordinates ? bkr.geometry.coordinates[0] : -1),
      longitude: (bkr.geometry?.coordinates ? bkr.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/bakeries.json', JSON.stringify(bakeryClean));

//======================
//pharmacies
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geojson');
let pharmacy = JSON.parse(rawdata).features.filter(feature => feature.properties.amenity == "pharmacy");
let pharmacyClean = pharmacy.map((pmc) => {
  return {
    id: uuidv4(),
    name: pmc.properties.name || "no name",

    wheelchairAccess: (pmc.properties.wheelchair == "yes" ? true : false),
    openingHours: pmc.properties.opening_hours ? getHoursOSM(pmc.properties.opening_hours) : null,
    location: {
      latitude: (pmc.geometry?.coordinates ? pmc.geometry.coordinates[0] : -1),
      longitude: (pmc.geometry?.coordinates ? pmc.geometry.coordinates[1] : -1)
    }
  }
});

fs.writeFileSync('./output/pharmacies.json', JSON.stringify(pharmacyClean));

//======================
//open air markets
//======================

rawdata = fs.readFileSync('./input/marches-decouverts.json');
let oam = JSON.parse(rawdata);
let oamClean = oam.map(market => {
  return {
    id: uuidv4(),
    name: market.fields.nom_long || "no name",

    products: market.fields.produit || "generic",
    openingHours: extractHoursMarkets(market.fields),
    location: {
      latitude: (market.geometry?.coordinates ? market.geometry.coordinates[0] : -1),
      longitude: (market.geometry?.coordinates ? market.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/oams.json', JSON.stringify(oamClean));

//======================
//events
//======================

function extractEventOccurences(event) {
  //console.log("input > ", event.occurrences, "(", event.date_start, ", ", event.date_end, ")");
  let timeIntervals = event.occurrences?.split(";");
  //console.log("intervals > ", timeIntervals);
  let occurrences = [];
  if(event.occurrences){
    timeIntervals.forEach((interval) => {
      occurrences.push({
        day: new Date(interval.split("_")[0]).toISOString().split("T")[0],
        from: new Date(interval.split("_")[0]),
        to: new Date(interval.split("_")[1])
      })
    });
  }else if(event.date_start && event.date_end){
    occurrences.push({
      day: new Date(event.date_start).toISOString().split("T")[0],
      from: new Date(event.date_start),
      to: new Date(event.date_end)
    })
  }
  return occurrences;
}

function cleanHTML(string){
  let cleanString = "";
  console.log(string.length);
  let inTag = false;
  for(let c of string){
    if(c == "<"){
      inTag = true;
    }else if(c == ">"){
      inTag = false;
    }
    if(c != ">" && !inTag){
      cleanString = cleanString.concat(c);
    }
  }

  cleanString = cleanString.replace(/(\r\n|\n|\r)/gm, " ")
  return cleanString.replace(/\"/g, '\'');
}

rawdata = fs.readFileSync('./input/que-faire-a-paris-.json');
let event = JSON.parse(rawdata);
let eventClean = event.map((vnt) => {
  return {
    id: uuidv4(),

    title: vnt.fields.title || "no title",
    website: vnt.fields.url || "no website",
    description: vnt.fields.description ? cleanHTML(vnt.fields.description) : "no description",
    wheelchairAccess: vnt.fields.pmr == 1,
    blindAccess: vnt.fields.blind == 1,
    deafAccess: vnt.fields.deaf == 1,
    phoneNumber: vnt.fields.contact_phone ? parsePhoneNumber(vnt.fields.contact_phone) : "no number",
    typeOfAccess: vnt.fields.access_type,
    fee: vnt.fields.price_type,
    occurences: extractEventOccurences(vnt.fields),
    location: {
      latitude: (vnt.geometry?.coordinates ? vnt.geometry.coordinates[0] : -1),
      longitude: (vnt.geometry?.coordinates ? vnt.geometry.coordinates[1] : -1)
    }
  };
});

fs.writeFileSync('./output/events.json', JSON.stringify(eventClean));