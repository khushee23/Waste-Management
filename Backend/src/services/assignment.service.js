import Worker from "../models/worker.model.js"

const toRad = (deg) => (deg * Math.PI) / 180

// Haversine in kilometers
const haversineKm = (a, b) => {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const sin1 = Math.sin(dLat / 2)
  const sin2 = Math.sin(dLng / 2)
  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const isValidLocation = (loc) =>
  loc &&
  typeof loc.lat === "number" &&
  typeof loc.lng === "number" &&
  Number.isFinite(loc.lat) &&
  Number.isFinite(loc.lng)

export const assignNearestWorker = async (binLocation) => {
  // NOTE: your current Worker model does NOT define a location field.
  // This service supports workers that *optionally* have `location: {lat, lng}` stored.
  if (!isValidLocation(binLocation)) return { worker: null, distanceKm: null }

  const workers = await Worker.find({})
  const withLocation = workers
    .map((w) => ({ w, loc: w.location }))
    .filter(({ loc }) => isValidLocation(loc))

  if (withLocation.length === 0) return { worker: null, distanceKm: null }

  let best = null
  for (const { w, loc } of withLocation) {
    const dist = haversineKm(binLocation, loc)
    if (!best || dist < best.distanceKm) best = { worker: w, distanceKm: dist }
  }

  return best || { worker: null, distanceKm: null }
}

