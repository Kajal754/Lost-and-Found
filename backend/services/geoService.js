function parseCoordinatePair(latitude, longitude) {
  const missingLatitude = latitude === undefined || latitude === null || latitude === "";
  const missingLongitude = longitude === undefined || longitude === null || longitude === "";

  if (missingLatitude && missingLongitude) {
    return { hasCoordinates: false, coordinates: null };
  }
  if (missingLatitude || missingLongitude) {
    return { error: "Latitude and longitude must be provided together." };
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return { error: "Latitude or longitude is out of range." };
  }

  return {
    hasCoordinates: true,
    coordinates: { latitude: lat, longitude: lng },
  };
}

function parseNearbyFilter(query) {
  const hasLatitude = query.lat !== undefined;
  const hasLongitude = query.lng !== undefined;
  const hasRadius = query.radiusKm !== undefined;
  if (!hasLatitude && !hasLongitude && !hasRadius) {
    return { provided: false };
  }
  if (!hasLatitude || !hasLongitude || !hasRadius) {
    return { error: "Provide latitude, longitude and radiusKm together." };
  }

  const coordinateResult = parseCoordinatePair(query.lat, query.lng);
  const radiusKm = Number(query.radiusKm);
  if (coordinateResult.error) return coordinateResult;
  if (!coordinateResult.hasCoordinates || !Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 25) {
    return { error: "Provide valid coordinates and a radius from 0 to 25 km." };
  }

  return {
    provided: true,
    center: {
      lat: coordinateResult.coordinates.latitude,
      lng: coordinateResult.coordinates.longitude,
    },
    radiusKm,
  };
}

function distanceKm(a, b) {
  const radians = (value) => (value * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  const boundedH = Math.min(1, Math.max(0, h));
  return 6371 * 2 * Math.atan2(Math.sqrt(boundedH), Math.sqrt(1 - boundedH));
}

function filterItemsWithinRadius(items, center, radiusKm) {
  return items.reduce((matches, item) => {
    if (item.latitude == null || item.longitude == null) return matches;
    const lat = Number(item.latitude);
    const lng = Number(item.longitude);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      return matches;
    }

    const distance = distanceKm(center, { lat, lng });
    if (distance <= radiusKm) {
      matches.push({ ...item, distanceKm: Math.round(distance * 1000) / 1000 });
    }
    return matches;
  }, []);
}

module.exports = {
  parseCoordinatePair,
  parseNearbyFilter,
  distanceKm,
  filterItemsWithinRadius,
};
