export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by this browser.");
      return;
    }

    // Add high-accuracy options
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
          );
          const data = await response.json();

          if (data && data.localityInfo) {
            const address = data.localityInfo.administrative[0]?.name || "N/A";
            const city = data.city || "N/A";
            const state = data.localityInfo.administrative[1]?.name || "N/A";
            const zipCode = data.postcode || "N/A";

            resolve({
              latitude,
              longitude,
              address,
              city,
              state,
              zipCode,
              error: null,
            });
          } else {
            reject("Unable to retrieve address.");
          }
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          reject("Failed to fetch address from coordinates.");
        }
      },
      (error) => {
        reject(`Error fetching location: ${error.message}`);
      },
      options // <-- Pass the high accuracy options here
    );
  });
};
