const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const isConnected = () => !!(SUPA_URL && SUPA_KEY);

async function supa(path, opts = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
    },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchTrips() {
  const trips = await supa('trips?select=*&order=created_at.asc');
  const routes = await supa('routes?select=*&order=created_at.asc');
  let priceMap = {};
  const routeIds = routes.map(r => r.id);
  if (routeIds.length > 0) {
    const checks = await supa(
      `price_checks?route_id=in.(${routeIds.join(',')})&order=checked_at.desc&limit=100`
    );
    for (const c of checks) {
      if (!priceMap[c.route_id]) priceMap[c.route_id] = [];
      if (priceMap[c.route_id].length < 9) priceMap[c.route_id].push(c.price);
    }
    for (const id of Object.keys(priceMap)) priceMap[id].reverse();
  }
  return trips.map(t => ({
    id: t.id, name: t.name, color: t.color,
    routes: routes.filter(r => r.trip_id === t.id).map(r => ({
      id: r.id, from: r.from_code, fromCity: r.from_city,
      to: r.to_code, toCity: r.to_city, depart: r.depart,
      ret: r.ret || '', flex: r.flex || 3, threshold: r.threshold,
      passengers: r.passengers || 1, currentPrice: r.current_price || null,
      history: priceMap[r.id] || [], lastScan: 'auto',
    })),
  }));
}

export async function createTrip(trip) {
  await supa('trips', { method: 'POST', body: { id: trip.id, name: trip.name, color: trip.color } });
}

export async function deleteTrip(tripId) {
  await supa(`trips?id=eq.${tripId}`, { method: 'DELETE' });
}

export async function createRoute(tripId, route) {
  await supa('routes', {
    method: 'POST',
    body: {
      id: route.id, trip_id: tripId,
      from_code: route.from, from_city: route.fromCity,
      to_code: route.to, to_city: route.toCity,
      depart: route.depart, ret: route.ret || null,
      flex: route.flex, threshold: route.threshold,
      passengers: route.passengers,
      current_price: route.currentPrice || null,
    },
  });
}

export async function updateRoute(route) {
  await supa(`routes?id=eq.${route.id}`, {
    method: 'PATCH',
    body: {
      from_code: route.from, from_city: route.fromCity,
      to_code: route.to, to_city: route.toCity,
      depart: route.depart, ret: route.ret || null,
      flex: route.flex, threshold: route.threshold,
      passengers: route.passengers,
    },
  });
}

export async function deleteRoute(routeId) {
  await supa(`routes?id=eq.${routeId}`, { method: 'DELETE' });
}
