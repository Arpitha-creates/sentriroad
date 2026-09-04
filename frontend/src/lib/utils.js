export function urgencyColor(s) { if (s >= 80) return 'bg-red-500 text-white'; if (s >= 60) return 'bg-orange-500 text-white'; if (s >= 30) return 'bg-yellow-500 text-black'; return 'bg-green-500 text-white'; }
export function urgencyText(s) { if (s >= 80) return 'CRITICAL'; if (s >= 60) return 'HIGH'; if (s >= 30) return 'MEDIUM'; return 'LOW'; }
export function urgencyLeafletColor(s) { if (s >= 80) return 'red'; if (s >= 60) return 'orange'; if (s >= 30) return 'yellow'; return 'green'; }
export function formatINR(a) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a); }
export function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); }
export function formatTimeAgo(iso) { if (!iso) return '—'; const d = Date.now() - new Date(iso).getTime(); const h = Math.floor(d / 3600000); if (h < 1) return 'just now'; if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; }
export function citizenStatus(s) { const m = { reported: 'Reported', scored: 'Under Review', dispatched: 'Under Review', assigned_to_crew: 'Repair in Progress', crew_submitted: 'Repair in Progress', reviewing: 'Repair in Progress', repaired: 'Repaired', verified: 'Verified', rejected_by_crew_review: 'Repair in Progress' }; return m[s] || s; }
export const DEMO_ACCOUNTS = [
  { email: 'ravi@example.com', role: 'citizen', label: 'Ravi Kumar (Citizen)' },
  { email: 'anjali@example.com', role: 'citizen', label: 'Anjali Rao (Citizen)' },
  { email: 'suresh.authority@bbmp.gov.in', role: 'authority', label: 'Suresh (Authority)' },
  { email: 'ramesh.crew@bbmp.gov.in', role: 'crew', label: 'Ramesh (Crew)' },
  { email: 'manju.crew@bbmp.gov.in', role: 'crew', label: 'Manju (Crew)' },
];
