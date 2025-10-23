mapboxgl.accessToken = "pk.eyJ1IjoiZG9tbGV0IiwiYSI6ImNsaTN5MXhseTA0bWMzZHBoNTlnaG1hYmUifQ.9IpTpyptAxhC6ZoUqKCd9w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/domlet/cljxrbgx0000c01rac7og3ym6",
  center: [-122.219355, 37.78352],
  zoom: 8,
  projection: "mercator",
  renderWorldCopies: false,
});
// fix full-screen bug
map.on("load", function () {
  map.resize();
});

datasets = [
  { name: "schools", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtFnRSJ__Rne8FH9igV93l42bsQE6PhFijwoQ4gimr5l5vlQJnljexLXOK4deup-0hLF0B-tDLA77u/pub?gid=1593214570&single=true&output=csv" },
  { name: "people", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtFnRSJ__Rne8FH9igV93l42bsQE6PhFijwoQ4gimr5l5vlQJnljexLXOK4deup-0hLF0B-tDLA77u/pub?gid=435305116&single=true&output=csv" },
  { name: "programs", url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtFnRSJ__Rne8FH9igV93l42bsQE6PhFijwoQ4gimr5l5vlQJnljexLXOK4deup-0hLF0B-tDLA77u/pub?gid=275662553&single=true&output=csv" },
];
categories = {
  // School groups
  uc: { color: "#002A56", outline: "black", source: "schools" },
  csu: { color: "#E61A37", outline: "black", source: "schools" },
  ccc: { color: "blue", outline: "black", source: "schools" },
  peralta: { color: "#0f4b90", outline: "black", source: "schools" },
  hbcu: { color: "aqua", outline: "black", source: "schools" },
  ncaa_d1: { color: "#0097D8", outline: "white", source: "schools" },
  ncaa_d2: { color: "#0097D8", outline: "white", source: "schools" },
  ncaa_d3: { color: "#0097D8", outline: "white", source: "schools" },
  // locations
  us: { color: "#9B59B6", outline: "black", source: "schools" },
  california: { color: "#E67E22", outline: "black", source: "schools" },
  mexico: { color: "#2ECC71", outline: "black", source: "schools" },
  canada: { color: "#E65722", outline: "black", source: "schools" },
  global: { color: "#F2CA27", outline: "black", source: "schools" },
  // 'us-non-california-public': { 'color': 'teal', 'outline': 'black', 'source': 'schools' },
  // 'us-non-california-private': { 'color': 'orange', 'outline': 'black', 'source': 'schools' },
  ccpa_2022: { color: "#006000", outline: "gold", source: "people" }, // green
  ccpa_2023: { color: "#006000", outline: "gold", source: "people" }, // green
  ccpa_2026: { color: "#006000", outline: "gold", source: "people" }, // green
  ccpa_staff_current: { color: "gold", outline: "#006000", source: "people" }, // green
  ccpa_staff_past: { color: "gold", outline: "#006000", source: "people" }, // green
  // Programs
  programs: { color: "gold", outline: "#006000", source: "programs" }, // green
  // Transit
  bart_routes: { color: "", outline: "", source: "map_style" },
  bart_stops: { color: "", outline: "", source: "map_style" },
  caltrain_routes: { color: "", outline: "", source: "map_style" },
  caltrain_stops: { color: "", outline: "", source: "map_style" },
  amtrak_routes: { color: "", outline: "", source: "map_style" },
  amtrak_stops: { color: "", outline: "", source: "map_style" },
};
// Create an array of all the categories above:
let categoryList = [];
for (var key in categories) {
  categoryList.push(key);
}

// First wait for the map to load!
map.on("load", () => {
  // add icons
  map.loadImage("icons/logo_sys_csu_24px_sq.png", (error, image) => {
    if (error) throw error;
    map.addImage("csu", image);
  });
  map.loadImage("icons/logo_sys_uc2_24px_sq.png", (error, image) => {
    if (error) throw error;
    map.addImage("uc", image);
  });
  map.loadImage("icons/logo-ccc.png", (error, image) => {
    if (error) throw error;
    map.addImage("ccc", image);
  });
  map.loadImage("icons/logo-peralta.png", (error, image) => {
    if (error) throw error;
    map.addImage("peralta", image);
  });
  map.loadImage("icons/logo-hbcu.png", (error, image) => {
    if (error) throw error;
    map.addImage("hbcu", image);
  });
  map.loadImage("icons/logo-ccpa.png", (error, image) => {
    if (error) throw error;
    map.addImage("ccpa", image);
  });
  map.loadImage("icons/logo-seniors.png", (error, image) => {
    if (error) throw error;
    map.addImage("seniors", image);
  });
  map.loadImage("icons/icon-programs.png", (error, image) => {
    if (error) throw error;
    map.addImage("programs", image);
  });
  // parse the CSVs and add the data
  for (let i = 0; i < datasets.length; i++) {
    $.ajax({
      type: "GET",
      url: datasets[i].url,
      dataType: "text",
      success: function (csvData) {
        csv2geojson.csv2geojson(
          csvData,
          {
            latfield: "latitude",
            lonfield: "longitude",
            delimiter: ",",
          },
          function (err, data) {
            if (err || data.features.length === 0) {
              console.log("⚠️ csv error!");
              // console.log(data);
            } else {
              console.log("it happened");
              console.log(data);
            }
            map.addSource(datasets[i].name, {
              type: "geojson",
              data: data,
            });
            const schools = map.getStyle().sources["schools"].data.features;
            const people = map.getStyle().sources["people"].data.features;
            const programs = map.getStyle().sources["programs"].data.features;
            // custom geocoder
            function forwardGeocoder(query) {
              const matchingFeatures = [];
              for (const feature of people) {
                if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
                  feature["place_name"] = `🦁 ${feature.properties.name}`;
                  feature["center"] = feature.geometry.coordinates;
                  matchingFeatures.push(feature);
                }
              }
              for (const feature of programs) {
                if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
                  feature["place_name"] = `💰 ${feature.properties.name}`;
                  feature["center"] = feature.geometry.coordinates;
                  matchingFeatures.push(feature);
                }
              }
              for (const feature of schools) {
                if (feature.properties.name.toLowerCase().includes(query.toLowerCase())) {
                  feature["place_name"] = `📚 ${feature.properties.name}`;
                  feature["center"] = feature.geometry.coordinates;
                  matchingFeatures.push(feature);
                }
              }
              return matchingFeatures;
            }
            // add the search box
            const geocoder = new MapboxGeocoder({
              accessToken: mapboxgl.accessToken,
              localGeocoder: forwardGeocoder,
              mapboxgl: mapboxgl,
              collapsed: false,
              proximity: { latitude: 37.78352, longitude: -122.219355 },
              clearAndBlurOnEsc: true,
              limit: 12, // limit to x results
            });

            map.addControl(geocoder, "top-left");
            // Listen for when the user selects a result
            geocoder.on("result", (e) => {
              console.log(e.result);
              addPopup("userSearch", e);
            });

            // add the +/- buttons
            map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

            // add map layers
            map.addLayer({
              id: "california",
              type: "circle",
              slot: "bottom",
              source: "schools",
              paint: {
                "circle-color": categories["california"].color,
                "circle-stroke-color": categories["california"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "state", "California"], ["!=", "system_acronym", "UC"], ["!=", "system_acronym", "CSU"], ["!=", "system_acronym", "CCC"]],
            });
            map.addLayer({
              id: "ccc",
              type: "symbol",
              source: "schools",
              layout: {
                "icon-image": "ccc",
                "icon-size": 0.16,
              },
              filter: ["any", ["==", "system_acronym", "CCC"], ["==", "system_acronym", "CCC, Peralta"]],
            });
            map.addLayer({
              id: "peralta",
              type: "symbol",
              source: "schools",
              layout: {
                "icon-image": "peralta",
                "icon-size": 0.065,
              },
              filter: ["all", ["==", "system_acronym", "CCC, Peralta"]],
            });
            map.addLayer({
              id: "hbcu",
              type: "symbol",
              source: "schools",
              layout: {
                "icon-image": "hbcu",
                "icon-size": 0.35,
              },
              filter: ["all", ["==", "hbcu", "TRUE"]],
            });
            map.addLayer({
              id: "mexico",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["mexico"].color,
                "circle-stroke-color": categories["mexico"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "country", "MX"]],
            });

            map.addLayer({
              id: "ncaa_d1",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["ncaa_d1"].color,
                "circle-stroke-color": categories["ncaa_d1"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "ncaa_div", "D1"]],
            });
            map.addLayer({
              id: "ncaa_d2",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["ncaa_d2"].color,
                "circle-stroke-color": categories["ncaa_d2"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "ncaa_div", "D2"]],
            });
            map.addLayer({
              id: "ncaa_d3",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["ncaa_d3"].color,
                "circle-stroke-color": categories["ncaa_d3"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "ncaa_div", "D3"]],
            });
            map.addLayer({
              id: "us",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["us"].color,
                "circle-stroke-color": categories["us"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "country", "US"], ["!=", "state", "California"]],
            });
            map.addLayer({
              id: "canada",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["canada"].color,
                "circle-stroke-color": categories["canada"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["==", "country", "CA"]],
            });
            map.addLayer({
              id: "global",
              type: "circle",
              source: "schools",
              layout: {
                visibility: "none",
              },
              paint: {
                "circle-color": categories["global"].color,
                "circle-stroke-color": categories["global"].outline,
                "circle-stroke-width": 1,
                "circle-radius": 7,
              },
              filter: ["all", ["!=", "country", "US"], ["!=", "country", "MX"], ["!=", "country", "CA"]],
            });
            // map.addLayer({
            //   'id': 'us-non-california-public',
            //   'type': 'circle',
            //   'source': 'schools',
            //   'paint': {
            //     'circle-color': categories['us-non-california-public'].color,
            //     'circle-stroke-color': categories['us-non-california-public'].outline,
            //     'circle-stroke-width': 1,
            //     'circle-radius': 7,
            //   },
            //   'filter': ['all',
            //     ['==', 'country', 'USA'],
            //     ['!=', 'state', 'CA'],
            //     ['!=', 'pub_priv', 'Public'],
            //   ],
            // });
            // map.addLayer({
            //   'id': 'us-non-california-private',
            //   'type': 'circle',
            //   'source': 'schools',
            //   'paint': {
            //     'circle-color': categories['us-non-california-private'].color,
            //     'circle-stroke-color': categories['us-non-california-private'].outline,
            //     'circle-stroke-width': 1,
            //     'circle-radius': 7,
            //   },
            //   'filter': ['all',
            //     ['==', 'country', 'USA'],
            //     ['!=', 'state', 'CA'],
            //     ['!=', 'pub_priv', 'Private'],
            //   ],
            // });
            map.addLayer({
              id: "ccpa_2022",
              type: "symbol",
              source: "people",
              layout: {
                "icon-image": "ccpa",
                "icon-size": 0.1,
                visibility: "none",
              },
              filter: ["all", ["==", "grad_year", "2022"]],
            });
            map.addLayer({
              id: "ccpa_2023",
              type: "symbol",
              source: "people",
              layout: {
                "icon-image": "ccpa",
                "icon-size": 0.1,
                // 'visibility': 'none'
              },
              filter: ["all", ["==", "grad_year", "2023"]],
            });
            map.addLayer({
              id: "ccpa_2026",
              type: "symbol",
              source: "people",
              layout: {
                "icon-image": "seniors",
                "icon-size": 0.2,
                visibility: "none",
              },
              filter: ["all", ["==", "grad_year", "2026"]],
            });
            map.addLayer({
              id: "ccpa_staff_past",
              type: "symbol",
              source: "people",
              layout: {
                "icon-image": "ccpa",
                "icon-size": 0.1,
                visibility: "none",
              },
              filter: ["all", ["==", "grad_year", "staff"], ["!=", "ccpa_end", "Present"]],
            });
            map.addLayer({
              id: "ccpa_staff_current",
              type: "symbol",
              source: "people",
              layout: {
                "icon-image": "ccpa",
                "icon-size": 0.1,
                // 'visibility': 'none'
              },
              filter: ["all", ["==", "grad_year", "staff"], ["==", "ccpa_end", "Present"]],
            });
            map.addLayer({
              id: "programs",
              type: "symbol",
              slot: "bottom",
              source: "programs",
              layout: {
                "icon-image": "programs",
                "icon-size": 0.07,
              },
            });
            map.addLayer({
              id: "csu",
              type: "symbol",
              slot: "top", // try to add CSUs on top
              source: "schools",
              layout: {
                "icon-image": "csu",
                // use a small size consistent with other symbol layers
                "icon-size": 1,
              },
              filter: ["all", ["==", "system_acronym", "CSU"]],
            });
            map.addLayer({
              id: "uc",
              type: "symbol",
              slot: "top", // try to add UCs on top
              source: "schools",
              layout: {
                // small reasonable default; the images used are ~24px so 0.16 matches other symbols
                "icon-image": "uc",
                "icon-size": 1,
              },
              paint: {
                "icon-halo-color": "#fff",
                "icon-halo-width": 2,
              },
              filter: ["all", ["==", "system_acronym", "UC"]],
            });
          }
        );
      },
    });
  }
});

// isochrones and city council districts
map.on("load", () => {
  // map.addSource("oakland-council-districts", {
  //   type: "geojson",
  //   // Use a URL for the value for the `data` property.
  //   data: "sources/City_of_Oakland_Council_Districts.geojson",
  // });
  map.addSource("iso", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });
  map.addLayer(
    {
      id: "isoLayer",
      type: "fill",
      source: "iso",
      paint: {
        "fill-color": "#FB02C9",
        "fill-opacity": 0.3,
      },
    },
    "poi-label"
  );
  // map.addLayer({
  //   id: "oakland-council-districts",
  //   type: "line",
  //   source: "oakland-council-districts",
  //   paint: {
  //     "line-width": 1,
  //     "line-color": "red",
  //     "line-opacity": 0.5,
  //     visibility: "none",
  //   },
  // });
});

// inspect a feature on click
map.on("click", ["csu"], (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ["csu"],
  });
});

// popup function
// slightly different behavior for search vs click
function addPopup(source, e) {
  const coords = e.result.geometry.coordinates;
  let website = e.result.properties.website;
  let image = e.result.properties.image;
  let html = "";
  let resultName = e.result.place_name;
  if (resultName.startsWith("🦁")) {
    console.log("The string begins with a lion!");
    let school = e.result.properties.school_decision;
    let degree = e.result.properties.degree;
    let profile_url = e.result.properties.profile_url;
    let ccpa_role = e.result.properties.ccpa_role;
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
    <p><strong>
    <a href='${profile_url}' target='_blank'>${resultName}</a></strong><br>
    <em> CCPA ${ccpa_role}</em></p>
    <p><strong>School:</strong><br>
    <a href="${website}" target='_blank'>${school}</a></p>
    <p><strong>Degree or Credential:</strong><br>
    ${degree}</p>`;
  } else if (resultName.startsWith("📚") || resultName.startsWith("💰")) {
    console.log("The string begins with a book!");
    let website = e.result.properties.website;
    let name = e.result.properties.name;
    let desc = e.result.properties.description;
    let image = e.result.properties.image;
    html = `<a href='${website}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong><a href="${website}" target='_blank'>${name}</a></strong></p>`;
  }
  new mapboxgl.Popup().setLngLat(coords).setHTML(html).addTo(map);
  // first properly prepare the object
  if (source == "userSearch") {
    console.log("User searched for:");
  } else if (source == "userClick") {
    console.log("User clicked on:");
  }
  // then format the popup content
}

// When a click event occurs on a feature in
// the ... layer, open a popup at
// the location of the feature, with
// description HTML from its properties.

map.on("click", categoryList, (e) => {
  // popup placement
  const coordinates = e.features[0].geometry.coordinates.slice();
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  // popup content
  let name = e.features[0].properties.name;
  let website = e.features[0].properties.website;
  let image = e.features[0].properties.image;
  let pubPriv = e.features[0].properties.pub_priv;
  let layer = e.features[0].layer.id;
  let html = "";
  // schools popups
  if (layer == "uc" || layer == "csu" || layer == "ccc" || layer == "peralta") {
    let location = e.features[0].properties.location;
    let system_acronym = e.features[0].properties.system_acronym;
    let system_long = e.features[0].properties.system_long;
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong><a href="${website}" target='_blank'>${name}</a></strong> is a ${pubPriv.toLowerCase()} school located in ${location}. This campus is part of the ${system_long} (${system_acronym}) system.`;
    // people popups
  } else if (layer == "ccpa_2022" || layer == "ccpa_2023") {
    let school = e.features[0].properties.school_decision;
    let year = e.features[0].properties.grad_year;
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong>CCPA Graduate:</strong><br>
        ${name} (<i>Class of ${year}</i>)</p>
        <p><strong>School choice:</strong><br>
        <a href="${website}" target='_blank'>${school}</a></p>`;
  } else if (layer == "ccpa_2026") {
    let school = e.features[0].properties.school_decision;
    let year = e.features[0].properties.grad_year;
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong>CCPA Senior:</strong><br>
        ${name} (<i>Class of ${year}</i>)</p>
        <p><strong>Current school:</strong><br>
        <a href="${website}" target='_blank'>${school}</a></p>`;
  } else if (layer == "ccpa_staff_current" || layer == "ccpa_staff_past") {
    let school = e.features[0].properties.school_decision;
    let degree = e.features[0].properties.degree;
    let profile_url = e.features[0].properties.profile_url;
    let ccpa_role = e.features[0].properties.ccpa_role;
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong>
          <a href='${profile_url}' target='_blank'>${name}</a></strong><br>
          <em> CCPA ${ccpa_role}</em></p>
        <p><strong>School:</strong><br>
          <a href="${website}" target='_blank'>${school}</a></p>
        <p><strong>Degree or Credential:</strong><br>
        ${degree}</p>`;
  } else if (layer == "programs") {
    let name = e.features[0].properties.name;
    let desc = e.features[0].properties.description;
    let address = e.features[0].properties.street_address;
    let image = e.features[0].properties.image;
    let website = e.features[0].properties.website;
    html = `<a href='${website}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong><a href="${website}" target='_blank'>${name}</a></strong></p><p>${address}<br/></p><p>${desc}</p>
        <p><a href='https://sites.google.com/ousd.org/ccpacollegeandcareer/summer-opportunities?authuser=0' target='_blank'>CCPA Summer Opportunities</a></p>`;
  } else if (layer == "hbcu") {
    let location = e.features[0].properties.location;
    let pub_priv = e.features[0].properties.pub_priv;
    let ncaa_div = e.features[0].properties.ncaa_div;
    let ncaa_conf = e.features[0].properties.ncaa_conf;
    let comment = e.features[0].properties.comment;
    let regionally_accredited = e.features[0].properties.regionally_accredited;
    let year_founded = e.features[0].properties.year_founded;
    if (regionally_accredited == "No") {
      regionally_accredited = "non-regionally accredited";
    } else {
      regionally_accredited = "regionally accredited";
    }
    if (ncaa_div != "") {
      if (ncaa_div == "D1") {
        ncaa_div = "Division I";
      } else if (ncaa_div == "D2") {
        ncaa_div = "Division II";
      } else {
        ncaa_div = "Division III";
      }
      ncaa_div_text = `<p><strong>NCAA:</strong> ${ncaa_div} <br>
            <a href='https://en.wikipedia.org/wiki/List_of_NCAA_conferences' target='_blank'>${ncaa_conf}</a></p>`;
    } else {
      ncaa_div_text = "";
    }
    if (comment != "") {
      comment_html = `<p><em>${comment}</em></p>`;
    } else {
      comment_html = "";
    }
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a>
        <p><strong><a href="${website}" target='_blank'>${name}</a></strong> is a ${pubPriv.toLowerCase()} ${regionally_accredited} HBCU school.</p>
        <p><strong>Founded:</strong> ${year_founded}</p>
        <p><strong>Location:</strong> ${location}</p>${ncaa_div_text}${comment_html}`;
  } else if (layer == "amtrak_stops") {
    // let name = e.features[0].properties.name
    let stationnam = e.features[0].properties.stationnam;
    let code = e.features[0].properties.code;
    let address1 = e.features[0].properties.address1;
    let city = e.features[0].properties.city;
    let STATE = e.features[0].properties.STATE;
    let stntype = e.features[0].properties.stntype;
    let statype = e.features[0].properties.statype;
    html = `<strong> Amtrak ${stntype.toLowerCase()} stop: <br>
          <a href='https://amtrakguide.com/stations/amtrak-stations-in-california/' target='_blank'>${stationnam} (${code})</strong></a><br>
         ${statype}<br>
        <strong>Address:</strong> ${address1}, ${city}, ${STATE}`;
  } else if (layer == "caltrain_stops") {
    let name = e.features[0].properties.stop_name;
    let stop_id = e.features[0].properties.stop_id;
    let zone_id = e.features[0].properties.zone_id;
    html = `<a href='https://caltrain.com/stations-zones' target='_blank'><strong>${name} Station</strong></a><br>
        <strong>Stop ID:</strong> ${stop_id}<br>
        <strong>Zone:</strong> ${zone_id}`;
  } else if (layer == "bart_stops") {
    let name = e.features[0].properties.Name;
    let desc = e.features[0].properties.Description;
    let website = "https://bart.gov/stations";
    html = `<img src='img/transit/bart.jpg' class='popup-img' /><p><strong><a href="${website}" target='_blank'>${name} BART Station</a></strong><br>${desc}</p>`;
  } else {
    html = `<a href='${image}' target='_blank'><img src='${image}' class='popup-img' /></a><br/>
        <p><strong><a href="${website}" target='_blank'>${name}</a></strong>`;
  }
  // popup, yay!
  new mapboxgl.Popup().setLngLat(coordinates).setMaxWidth("20em").setHTML(html).addTo(map);
});

map.on("mouseenter", categoryList, () => {
  map.getCanvas().style.cursor = "pointer";
});
map.on("mouseleave", categoryList, () => {
  map.getCanvas().style.cursor = "";
});
// show hide navigation
function toggleNav() {
  var sidebar = document.querySelector(".sidebar");
  var content = document.getElementById("content");

  if (sidebar.style.width === "0px" || sidebar.style.width === "") {
    sidebar.style.width = "250px";
    content.style.marginRight = "250px";
  } else {
    sidebar.style.width = "0";
    content.style.marginRight = "0";
  }
}
