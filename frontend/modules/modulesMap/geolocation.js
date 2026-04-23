export function obterGeolocalizacao(map) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        map.setView([lat, lon], 17, {
          animate: true,
          duration: 1.5,
        });

        const userIcon = L.icon({
          iconUrl: '/assets/img/Localization (2).png',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        L.marker([lat, lon], { icon: userIcon, draggable: true })
          .addTo(map)
          .bindPopup('Você está aqui');

        resolve({ lat, lon }); // 🔥 aqui retorna
      },
      (err) => {
        map.setView([-8.0631, -34.8710], 16);
        reject(err);
      }
    );
  });
}