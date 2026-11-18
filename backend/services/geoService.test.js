const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseCoordinatePair,
  parseNearbyFilter,
  distanceKm,
  filterItemsWithinRadius,
} = require("./geoService");

test("coordinate pairs accept valid values and reject missing or out-of-range values", () => {
  assert.deepEqual(parseCoordinatePair("28.37", "79.43"), {
    hasCoordinates: true,
    coordinates: { latitude: 28.37, longitude: 79.43 },
  });
  assert.equal(parseCoordinatePair(null, null).hasCoordinates, false);
  assert.ok(parseCoordinatePair(28, null).error);
  assert.ok(parseCoordinatePair(91, 79).error);
  assert.ok(parseCoordinatePair(28, 181).error);
});

test("nearby filters validate parameters and allow radii through 25 km", () => {
  assert.deepEqual(parseNearbyFilter({ lat: "28.37", lng: "79.43", radiusKm: "0.5" }), {
    provided: true,
    center: { lat: 28.37, lng: 79.43 },
    radiusKm: 0.5,
  });
  assert.equal(parseNearbyFilter({ lat: 0, lng: 0, radiusKm: 25 }).radiusKm, 25);
  assert.ok(parseNearbyFilter({ lat: 0, radiusKm: 1 }).error);
  assert.ok(parseNearbyFilter({ lat: 0, lng: 0, radiusKm: 26 }).error);
});

test("radius filtering includes the boundary and excludes missing or invalid coordinates", () => {
  const center = { lat: 0, lng: 0 };
  const boundary = { lat: 0, lng: (1 / 6371) * (180 / Math.PI) };
  const radiusKm = distanceKm(center, boundary);
  const results = filterItemsWithinRadius(
    [
      { id: "inside", latitude: 0.004, longitude: 0 },
      { id: "boundary", latitude: boundary.lat, longitude: boundary.lng },
      { id: "outside", latitude: 0.02, longitude: 0 },
      { id: "missing", latitude: null, longitude: null },
      { id: "invalid", latitude: 91, longitude: 0 },
    ],
    center,
    radiusKm
  );

  assert.deepEqual(results.map((item) => item.id), ["inside", "boundary"]);
  assert.equal(results[1].distanceKm, 1);
});
