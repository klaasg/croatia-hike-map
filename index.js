var map = undefined;
var data = undefined;
var types = undefined;
var language = navigator.language;

function parseData(text) {
    let data = [];
    for (let line of text.split('\n')) {
        try {
            let split = line.split(';');
            data.push({
                date: new Date(split[0]),
                coord: {
                    lat: split[1].split('°')[0],
                    lon: split[1].split(',')[1].split('°')[0].trim()
                },
                type: split[2],
                noteNL: split[3],
                noteEN: split[4],
                image: split[5]
            });
        } catch {} // Catches CSV header and ending newline
    }
    return data;
}

function parseTypes(text) {
    let types = {};
    let i = 0;
    for (let line of text.split('\n')) {
        if (i === 0) { i++; continue; } // CSV header
        try {
            let split = line.split(';');
            if (split[0] === "") { continue; } // Ending newline
            types[split[0]] ={
                textNL: split[1],
                textEN: split[2],
                color: split[3]
            }
        } catch {}
    }
    return types;
}

function createMap() {
    let map = L.map("map",
        {
            center: [44.0, 16.0],
            zoom: window.innerWidth > 900 ? 8 : 6
        }
    );
    L.control.scale().addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Source on <a href="https://github.com/klaasg/croatia-hike-map" target="_blank" rel="noopener noreferrer">GitHub</a>'
    }).addTo(map);

    return map;
}

function makePopup(point, startDate) {
    let options = {};
    let content = "";
    // const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    // point.date.toLocaleDateString(language, dateOptions)
    if (language.includes("nl")) {
        content += `<h4>Dag ${(point.date-startDate) / (1000*3600*24) + 1}: <span style="color: ${types[point.type].color};">${types[point.type].textNL}</span></h4>`;
        content += `<p>${point.noteNL || ""}</p>`;
    } else {
        content += `<h4>Dag ${(point.date-startDate) / (1000*3600*24) + 1}: <span style="color: ${types[point.type].color};">${types[point.type].textEN}</span></h4>`;
        content += `<p>${point.noteEN || ""}</p>`;
    }
    if (point.image) {
        options.minWidth = window.innerWidth > 750 ? 500 : 250;
        options.maxWidth = window.innerWidth > 750 ? 500 : 250;
        content += `<a class="popup-image" href="img/${point.image}" target="_blank"><img src="img/${point.image}"></img></a>`;
    }
    options.autoPanPadding = L.point(25, 25);

    return L.popup(options).setContent(content);
}

function addMarkers(map, data, types) {
    let startDate = data[0].date;
    for (let point of data) {
        let marker = L.marker([point.coord.lat, point.coord.lon], {
            icon: eval(`${types[point.type].color}Icon`)
        }).addTo(map);
        marker.bindPopup(makePopup(point, startDate));
    }
}

function drawMap() {
    if (data && types) {
        map = createMap();
        addMarkers(map, data, types);
    }
}

if (!language.includes('nl')) {
    document.title = "My hike through Croatia";
}

fetch("data.csv")
    .then(res => res.text())
    .then(text => {
        data = parseData(text);
        drawMap();
    });
fetch("types.csv")
    .then(res => res.text())
    .then(text => {
        types = parseTypes(text);
        drawMap();
    });

