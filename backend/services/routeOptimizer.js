/**
 * Route Optimization (Nearest-neighbor heuristic)
 */
function optimizeRoutes(workOrders, crews, depot = { lat: 12.9716, lng: 77.5946 }) {
  if (!workOrders.length || !crews.length) return { routes: [], summary: { total_stops: 0, total_distance_km: 0, optimization_method: "Nearest-neighbor heuristic (Optimization Prototype)" } };
  const sorted = [...workOrders].sort((a, b) => b.urgency_score - a.urgency_score);
  const assignments = crews.map((c) => ({ crew_id: c.id, crew_name: c.name, stops: [] }));
  sorted.forEach((wo, i) => { assignments[i % crews.length].stops.push(wo); });
  const routes = assignments.map((a) => {
    const unvisited = [...a.stops]; const optimized = []; let current = depot; let dist = 0;
    while (unvisited.length) { let ni = 0, nd = Infinity; for (let i = 0; i < unvisited.length; i++) { const d = haversine(current, unvisited[i].location.gps); if (d < nd) { nd = d; ni = i; } } const next = unvisited.splice(ni, 1)[0]; dist += nd; optimized.push(next); current = next.location.gps; }
    dist += haversine(current, depot);
    return { crew_id: a.crew_id, crew_name: a.crew_name, stops: optimized.map((wo) => ({ work_order_id: wo.id, report_id: wo.report_id, address: wo.location.address, gps: wo.location.gps, urgency_score: wo.urgency_score, damage_type: wo.damage_type })), total_distance_km: Math.round(dist * 10) / 10 };
  });
  const totalDist = routes.reduce((s, r) => s + r.total_distance_km, 0);
  return { routes, summary: { total_stops: sorted.length, total_distance_km: Math.round(totalDist * 10) / 10, optimization_method: "Nearest-neighbor heuristic (Optimization Prototype)", note: "An RL agent can replace this module without changing the interface." } };
}
function haversine(p1, p2) { const R = 6371; const dLat = (p2.lat - p1.lat) * Math.PI / 180; const dLng = (p2.lng - p1.lng) * Math.PI / 180; const a = Math.sin(dLat / 2) ** 2 + Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); }
module.exports = { optimizeRoutes };
