var data = {username: localStorage.username};
if (window.location.search) {
    data.addinfo = "Search: '" + window.location.search + "'";
}
if (window.is404) {
    if (data.addinfo) {
        data.addinfo += "; and on a 404 page";
    } else {
        data.addinfo = "404 page";
    }
}

fetch("/api/analytics", { method: 'POST', mode: 'cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' }, redirect: "follow", body: JSON.stringify(data)});