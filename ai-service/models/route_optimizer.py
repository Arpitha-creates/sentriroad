"""Route Optimization (Nearest-neighbor heuristic)"""
import math

def haversine_km(p1, p2):
    R = 6371; dlat = math.radians(p2["lat"] - p1["lat"]); dlng = math.radians(p2["lng"] - p1["lng"])
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(p1["lat"])) * math.cos(math.radians(p2["lat"])) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def optimize_routes(work_orders, crews, depot=None):
    if depot is None: depot = {"lat": 12.9716, "lng": 77.5946}
    if not work_orders or not crews: return {"routes": [], "summary": {"total_stops": 0, "total_distance_km": 0, "optimization_method": "Nearest-neighbor heuristic"}}
    sorted_wos = sorted(work_orders, key=lambda w: w.get("urgency_score", 0), reverse=True)
    assignments = [{"crew_id": c["id"], "crew_name": c["name"], "stops": []} for c in crews]
    for i, wo in enumerate(sorted_wos): assignments[i % len(crews)]["stops"].append(wo)
    routes = []; total_dist = 0
    for a in assignments:
        unvisited = list(a["stops"]); optimized = []; current = depot; dist = 0
        while unvisited:
            ni = min(range(len(unvisited)), key=lambda i: haversine_km(current, unvisited[i].get("location", {}).get("gps", unvisited[i].get("gps", depot))))
            next_wo = unvisited.pop(ni); dist += haversine_km(current, next_wo.get("location", {}).get("gps", next_wo.get("gps", depot))); optimized.append(next_wo); current = next_wo.get("location", {}).get("gps", next_wo.get("gps", depot))
        dist += haversine_km(current, depot); total_dist += dist
        routes.append({"crew_id": a["crew_id"], "crew_name": a["crew_name"], "stops": [{"work_order_id": wo["id"], "address": wo.get("location", {}).get("address", ""), "gps": wo.get("location", {}).get("gps", {}), "urgency_score": wo.get("urgency_score", 0)} for wo in optimized], "total_distance_km": round(dist, 1)})
    return {"routes": routes, "summary": {"total_stops": len(sorted_wos), "total_distance_km": round(total_dist, 1), "optimization_method": "Nearest-neighbor heuristic (Optimization Prototype)", "note": "An RL agent can replace this module."}}
