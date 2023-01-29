function parseData(text) {
    let data = [];
    for (let line of text.split('\n')) {
        try {
            let split = line.split(';');
            data.push({
                date: split[0],
                coord: {
                    lat: split[1].split('°')[0],
                    lon: split[1].split(',')[1].split('°')[0].trim()
                },
                type: split[2],
            });
        } catch {}
    }
    return data;
}

function createMap() {
    let map= L.map("map",
        {
            center: [44.0, 16.0],
            zoom: window.innerWidth > 900 ? 7 : 6
        }
    );
    L.control.scale().addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Source on <a href="https://github.com/klaasg/croatia-hike-map" target="_blank" rel="noopener noreferrer">GitHub</a>'
    }).addTo(map);

    return map;
}

function addMarkers(map, data) {
    for (let point of data) {
        let marker = L.marker([point.coord.lat, point.coord.lon], {
            icon: goldIcon
        }).addTo(map);
    }
}

fetch("data.csv")
    .then(res => res.text())
    .then(text => {
        let data = parseData(text);
        let map = createMap();
        addMarkers(map, data);
    });

