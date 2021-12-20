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

var locations = [];
var places = [];
var establishments = [];
var openHours = [];

//======================
//GREEN SPACES
//======================

let rawdata = fs.readFileSync('./input/espaces_verts.json');
let greenSpaces = JSON.parse(rawdata);
let greenSpacesClean = greenSpaces.map(space => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (space.fields.geom?.type == "MultiPolygon" ? (space.fields.geom?.coordinates[0][0][0][0] || -1) : (space.fields.geom?.coordinates[0][0][0] || -1)),
    longitude: (space.fields.geom?.type == "MultiPolygon" ? (space.fields.geom?.coordinates[0][0][0][1] || -1) : (space.fields.geom?.coordinates[0][0][1] || -1))
  })
  places.push({
    id: placeID,
    name: space.fields.nom_ev || "no name",
    locationId: locationID
  })
  return {
    id: uuidv4(),
    surfaceArea: space.fields.surface_totale_reelle || -1,
    type: space.fields.type_ev || "generic",
    category: space.fields.categorie || "generic",
    is24hrs: (space.fields.ouvert_ferme == "Non" ? false : true),

    placeId: placeID
  };
});


fs.writeFileSync('./output/adef_green_spaces.json', JSON.stringify(greenSpacesClean));

//======================
//PEDESTRIAN AREAS
//======================

rawdata = fs.readFileSync('./input/aires-pietonnes.json');
let pedestrianArea = JSON.parse(rawdata);
let pedestrianAreaClean = pedestrianArea.map(pa => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: pa.geometry?.coordinates[0] || -1,
    longitude: pa.geometry?.coordinates[1] || -1  
  })
  places.push({
    id: placeID,
    name: pa.fields.nom || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),

    placeId: placeID 
  };
});


fs.writeFileSync('./output/adef_pedestrianarea.json', JSON.stringify(pedestrianAreaClean));

//======================
//PARKING SPOTS
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geoJSON');
let parisParking = JSON.parse(rawdata).features.filter(feature => feature.properties.amenity == "parking");
let parisParkingClean = parisParking.map((parking) => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: parking.geometry.coordinates[0],
    longitude: parking.geometry.coordinates[1]
  })
  places.push({
    id: placeID,
    name: parking.properties.parking || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    type: parking.properties.parking || "unknown",
    fee: yesNoCheck(parking.properties.fee),

    placeId: placeID
  }
})

fs.writeFileSync('./output/adef_parking_spots.json', JSON.stringify(parisParkingClean));

//======================
//ATM
//======================

rawdata = fs.readFileSync('./input/Paris_atm.geoJSON');
let parisAtm = JSON.parse(rawdata).features;
let parisAtmClean = parisAtm.map((atm) => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: atm.geometry.coordinates[0],
    longitude: atm.geometry.coordinates[1]
  })
  places.push({
    id: placeID,
    name: atm.properties.name || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    provider: atm.properties.operator || atm.properties.brand || "unknown",
    wheelchairAccess: (atm.properties.wheelchair == "yes" ? true : false),
    is24hrs: (atm.properties.opening_hours == "24/7" ? true : false),
    
    placeId: placeID
  }
})

fs.writeFileSync('./output/adef_atms.json', JSON.stringify(parisAtmClean));

//======================
//BikeStation
//======================

rawdata = fs.readFileSync('./input/velib-disponibilite-en-temps-reel.json');
let bikeStations = JSON.parse(rawdata);
let bikeStationsClean = bikeStations.map(station => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: station.geometry.coordinates[0],
    longitude: station.geometry.coordinates[1]
  })
  places.push({
    id: placeID,
    name: station.fields.name || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    capacity: station.fields.capacity || -1,
    isRenting: yesNoCheck(station.fields.is_renting),
    isReturning: yesNoCheck(station.fields.is_returning),

    placeId: placeID
  };
});

fs.writeFileSync('./output/adef_bikestations.json', JSON.stringify(bikeStationsClean));

//======================
//BikeTrack
//======================

rawdata = fs.readFileSync('./input/reseau-cyclable.json');
let bikeTrack = JSON.parse(rawdata);
let bikeTrackClean = bikeTrack.map(track => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (track.geometry?.coordinates ? track.geometry.coordinates[0] : -1),
    longitude: (track.geometry?.coordinates ? track.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: track.fields.voie || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    type: track.fields.typologie_simple || "generic",
    speedLimit: track.fields.statut || "no limit",
    isBidirectional: yesNoCheck(track.fields.bidirectionnel),
    hasForest: ((track.fields.bois == undefined || track.fields.bois == "Non") ? false : true),
    length: track.fields.length,

    placeId: placeID
  };
});

fs.writeFileSync('./output/adef_biketracks.json', JSON.stringify(bikeTrackClean));

//======================
//taxi station
//======================

rawdata = fs.readFileSync('./input/bornes-dappel-taxi.json');
let taxiStation = JSON.parse(rawdata);
let taxiStationClean = taxiStation.map(station => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (station.geometry?.coordinates ? station.geometry.coordinates[0] : -1),
    longitude: (station.geometry?.coordinates ? station.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: station.fields.nom_station || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    phoneNumber: station.fields?.num_bat ? parsePhoneNumber(station.fields.num_bat) : "no number",
    
    placeId: placeID   
  };
});

fs.writeFileSync('./output/adef_taxistations.json', JSON.stringify(taxiStationClean));

//======================
//point of interest
//======================

rawdata = fs.readFileSync('./input/paris-autrement-balades-dans-les-arrondissements-peripheriques-poi.json');
let poi = JSON.parse(rawdata);
let poiClean = poi.map(point => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (point.geometry?.coordinates ? point.geometry.coordinates[0] : -1),
    longitude: (point.geometry?.coordinates ? point.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: point.fields.nom_poi || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    category: point.fields.categorie || "generic",
    description: point.fields.texte_description || "no description",
    keywords: point.fields.mot_cle,//point.fields.mot_cle.split(";"),
    website: point.fields.url_site,

    placeId: placeID
  };
});

fs.writeFileSync('./output/adef_pois.json', JSON.stringify(poiClean));

//======================
//bus stops
//======================

rawdata = fs.readFileSync('./input/Paris_bus.geojson');
let busStop = JSON.parse(rawdata).features;
let busStopClean = busStop.map(stop => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (stop.geometry?.coordinates ? stop.geometry.coordinates[0] : -1),
    longitude: (stop.geometry?.coordinates ? stop.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: stop.properties.name || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    hasShelter: (stop.properties.shelter == "yes" ? true : false),
    wheelchairAccess: (stop.properties.wheelchair == "yes" ? true : false),
    
    placeId: placeID
  };
});

fs.writeFileSync('./output/adef_busstops.json', JSON.stringify(busStopClean));

//======================
//bus stops
//======================

rawdata = fs.readFileSync('./input/Paris_subways.geojson');
let subwayStation = JSON.parse(rawdata).features;
let subwayStationClean = subwayStation.map(station => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (station.geometry?.coordinates ? station.geometry.coordinates[0] : -1),
    longitude: (station.geometry?.coordinates ? station.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: station.properties.name || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    wheelchairAccess: (station.properties.wheelchair == "yes" ? true : false),
    
    placeId: placeID
  };
});

fs.writeFileSync('./output/subwaystations.json', JSON.stringify(subwayStationClean));

//======================
//Wi-Fi hotspots
//======================

rawdata = fs.readFileSync('./input/sites-disposant-du-service-paris-wi-fi.json');
let wifiHotspot = JSON.parse(rawdata);
let wifiHotspotClean = wifiHotspot.map(hotspot => {
  let locationID = uuidv4();
  let placeID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (hotspot.geometry?.coordinates ? hotspot.geometry.coordinates[0] : -1),
    longitude: (hotspot.geometry?.coordinates ? hotspot.geometry.coordinates[1] : -1)
  })
  places.push({
    id: placeID,
    name: hotspot.fields.nom_site || "no name",
    locationId: locationID
  })

  return {
    id: uuidv4(),
    status: hotspot.fields.etat2,
    
    placeId: placeID
  };
});

fs.writeFileSync('./output/adef_wifihotspots.json', JSON.stringify(wifiHotspotClean));

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

function extractHoursMarkets(market, id) {
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
      openHours.push({
        id: uuidv4(),
        establishmentId: id,
        day: day,
        from: market.h_deb_sem_1,
        to: market.h_fin_sem_1
      })
    }else if(day == "sa"){
      openingHours[day] = {from: market.h_deb_sam, to: market.h_fin_sam}
      openHours.push({
        id: uuidv4(),
        establishmentId: id,
        day: day,
        from: market.h_deb_sam,
        to: market.h_fin_sam
      })
    }else{
      openingHours[day] = {from: market.h_deb_dim, to: market.h_fin_dim}
      openHours.push({
        id: uuidv4(),
        establishmentId: id,
        day: day,
        from: market.h_deb_dim,
        to: market.h_fin_dim
      })
    }
  })
  return openingHours;
}

function getHoursOSM(hoursString, id) {
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
          openHours.push({
            id: uuidv4(),
            establishmentId: id,
            day: day,
            from: hours.length == 2 ? hours[1].substring(0,5) : hours[0].substring(0,5),
            to: hours.length == 2 ? hours[1].substring(6, 11) : hours[0].substring(6, 11)
          })
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
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (cnm.geometry?.coordinates ? cnm.geometry.coordinates[0] : -1),
    longitude: (cnm.geometry?.coordinates ? cnm.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: cnm.properties.name || "no name",
    locationId: locationID
  })
  if(cnm.properties.opening_hours && cnm.properties.opening_hours != "closed"){
    getHoursOSM(cnm.properties.opening_hours, establishmentID)
  }
  
  return {
    id: elementID,
    brand: cnm.properties.brand || "no brand",
    wheelchairAccess: (cnm.properties.wheelchair == "yes" ? true : false),
    
    establishmentId: establishmentID
  };
});

fs.writeFileSync('./output/adef_cinemas.json', JSON.stringify(cinemaClean));

//======================
//museums
//======================

rawdata = fs.readFileSync('./input/Paris_museum.geojson');
let museum = JSON.parse(rawdata).features;
let museumClean = museum.map(msm => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (msm.geometry?.coordinates ? msm.geometry.coordinates[0] : -1),
    longitude: (msm.geometry?.coordinates ? msm.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: msm.properties.name || "no name",
    locationId: locationID
  })
  if(msm.properties.opening_hours && msm.properties.opening_hours != "closed"){
    getHoursOSM(msm.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    wheelchairAccess: (msm.properties.wheelchair == "yes" ? true : false),
    website: msm.properties.website,
    
    establishmentId: establishmentID
  };
});

fs.writeFileSync('./output/adef_museums.json', JSON.stringify(museumClean));

//======================
//coffee shop
//======================

rawdata = fs.readFileSync('./input/Paris_cafe.geojson');
let cafe = JSON.parse(rawdata).features;
let cafeClean = cafe.map((cf, idx) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (cf.geometry?.coordinates ? cf.geometry.coordinates[0] : -1),
    longitude: (cf.geometry?.coordinates ? cf.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: cf.properties.name || "no name",
    locationId: locationID
  })
  if(cf.properties.opening_hours && cf.properties.opening_hours != "closed"){
    getHoursOSM(cf.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    cuisine: cf.properties.cuisine || "generic",
    hasWifi: (cf.properties.internet_access == "yes" ? true : false),
    wheelchairAccess: (cf.properties.wheelchair == "yes" ? true : false),
    hasTakeaway: (cf.properties.takeaway == "yes" ? true : false),
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_cafes.json', JSON.stringify(cafeClean));

//======================
//bar
//======================

rawdata = fs.readFileSync('./input/Paris_bar.geojson');
let bar = JSON.parse(rawdata).features;
let barClean = bar.map((br) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (br.geometry?.coordinates ? br.geometry.coordinates[0] : -1),
    longitude: (br.geometry?.coordinates ? br.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: br.properties.name || "no name",
    locationId: locationID
  })
  if(br.properties.opening_hours && br.properties.opening_hours != "closed"){
    getHoursOSM(br.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    cuisine: br.properties.cuisine || "generic",
    website: br.properties.website || "no website",
    phoneNumber: br.properties.phone ? parsePhoneNumber(br.properties.phone) : "no number",
    wheelchairAccess: (br.properties.wheelchair == "yes" ? true : false),
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_bars.json', JSON.stringify(barClean));

//======================
//shopping centre
//======================

rawdata = fs.readFileSync('./input/Paris_mall_depstore.geojson');
let shoppingCentre = JSON.parse(rawdata).features;
let shoppingCentreClean = shoppingCentre.map((sc) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (sc.geometry?.coordinates ? sc.geometry.coordinates[0] : -1),
    longitude: (sc.geometry?.coordinates ? sc.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: sc.properties.name || "no name",
    locationId: locationID
  })
  if(sc.properties.opening_hours && sc.properties.opening_hours != "closed"){
    getHoursOSM(sc.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    type: sc.properties.shop || "generic",
    wheelchairAccess: (sc.properties.wheelchair == "yes" ? true : false),
    hasToilets: (sc.properties.toilets == "yes" ? true : false),
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_shoppingcentres.json', JSON.stringify(shoppingCentreClean));

//======================
//restaurant
//======================

rawdata = fs.readFileSync('./input/Paris_restaurant.geojson');
let restaurant = JSON.parse(rawdata).features;
let restaurantClean = restaurant.map((rsnt) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (rsnt.geometry?.coordinates ? rsnt.geometry.coordinates[0] : -1),
    longitude: (rsnt.geometry?.coordinates ? rsnt.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: rsnt.properties.name || "no name",
    locationId: locationID
  })
  if(rsnt.properties.opening_hours && rsnt.properties.opening_hours != "closed"){
    getHoursOSM(rsnt.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,

    cuisine: rsnt.properties.cuisine || "generic",
    takeaway: (rsnt.properties.takeaway == "yes" ? true : false),
    phoneNumber: rsnt.properties.phone ? parsePhoneNumber(rsnt.properties.phone) : "no number",
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_restaurants.json', JSON.stringify(restaurantClean));

//======================
//bakeries
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geojson');
let bakery = JSON.parse(rawdata).features.filter(feature => feature.properties.shop == "bakery");
let bakeryClean = bakery.map((bkr) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (bkr.geometry?.coordinates ? bkr.geometry.coordinates[0] : -1),
    longitude: (bkr.geometry?.coordinates ? bkr.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: bkr.properties.name || "no name",
    locationId: locationID
  })
  if(bkr.properties.opening_hours && bkr.properties.opening_hours != "closed"){
    getHoursOSM(bkr.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    wheelchairAccess: (bkr.properties.wheelchair == "yes" ? true : false),
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_bakeries.json', JSON.stringify(bakeryClean));

//======================
//pharmacies
//======================

rawdata = fs.readFileSync('./input/Paris_otherPlaces.geojson');
let pharmacy = JSON.parse(rawdata).features.filter(feature => feature.properties.amenity == "pharmacy");
let pharmacyClean = pharmacy.map((pmc) => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (pmc.geometry?.coordinates ? pmc.geometry.coordinates[0] : -1),
    longitude: (pmc.geometry?.coordinates ? pmc.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: pmc.properties.name || "no name",
    locationId: locationID
  })
  if(pmc.properties.opening_hours && pmc.properties.opening_hours != "closed"){
    getHoursOSM(pmc.properties.opening_hours, establishmentID)
  }

  return {
    id: elementID,
    wheelchairAccess: (pmc.properties.wheelchair == "yes" ? true : false),
    
    establishmentId: establishmentID
  }
});

fs.writeFileSync('./output/adef_pharmacies.json', JSON.stringify(pharmacyClean));

//======================
//open air markets
//======================

rawdata = fs.readFileSync('./input/marches-decouverts.json');
let oam = JSON.parse(rawdata);
let oamClean = oam.map(market => {
  let locationID = uuidv4();
  let establishmentID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (market.geometry?.coordinates ? market.geometry.coordinates[0] : -1),
    longitude: (market.geometry?.coordinates ? market.geometry.coordinates[1] : -1)
  })
  establishments.push({
    id: establishmentID,
    name: market.fields.nom_long || "no name",
    locationId: locationID
  })
  extractHoursMarkets(market.fields, establishmentID)

  return {
    id: elementID,
    products: market.fields.produit || "generic",
    
    establishmentId: establishmentID
  };
});

fs.writeFileSync('./output/adef_oams.json', JSON.stringify(oamClean));

//======================
//events
//======================

function extractEventOccurences(event, id) {
  //console.log("input > ", event.occurrences, "(", event.date_start, ", ", event.date_end, ")");
  let timeIntervals = event.occurrences?.split(";");
  //console.log("intervals > ", timeIntervals);
  let occurrences = [];
  if(event.occurrences){
    timeIntervals.forEach((interval) => {
      openHours.push({
        id: uuidv4(),
        establishmentId: id,
        day: "" + new Date(interval.split("_")[0]).toISOString().split("T")[0],
        from: "" + new Date(interval.split("_")[0]),
        to: "" + new Date(interval.split("_")[1])
      })
    });
  }else if(event.date_start && event.date_end){
    openHours.push({
      id: uuidv4(),
      establishmentId: id,
      day: "" + new Date(event.date_start).toISOString().split("T")[0],
      from: "" + new Date(event.date_start),
      to: "" + new Date(event.date_end)
    })
  }
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
  let locationID = uuidv4();
  let elementID = uuidv4();
  locations.push({
    id: locationID,
    latitude: (vnt.geometry?.coordinates ? vnt.geometry.coordinates[0] : -1),
    longitude: (vnt.geometry?.coordinates ? vnt.geometry.coordinates[1] : -1)
  })
  extractEventOccurences(vnt.fields, elementID)

  return {
    id: elementID,
    title: vnt.fields.title || "no title",
    website: vnt.fields.url || "no website",
    description: vnt.fields.description ? cleanHTML(vnt.fields.description) : "no description",
    wheelchairAccess: vnt.fields.pmr == 1,
    blindAccess: vnt.fields.blind == 1,
    deafAccess: vnt.fields.deaf == 1,
    phoneNumber: vnt.fields.contact_phone ? parsePhoneNumber(vnt.fields.contact_phone) : "no number",
    typeOfAccess: vnt.fields.access_type,
    fee: vnt.fields.price_type,

    locationId: locationID
  };
});

fs.writeFileSync('./output/adef_events.json', JSON.stringify(eventClean));

fs.writeFileSync('./output/adef_openHours.json', JSON.stringify(openHours));
fs.writeFileSync('./output/adef_locations.json', JSON.stringify(locations));
fs.writeFileSync('./output/adef_establishments.json', JSON.stringify(establishments));
fs.writeFileSync('./output/adef_places.json', JSON.stringify(places));