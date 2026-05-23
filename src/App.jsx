import { useState, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_CLUB = { id: 1, name: "Riverview Soccer Club", location: "Pittsburgh, PA" };

// teamIds: all teams this user is associated with (as staff or via their players)
// staffId: links to MOCK_STAFF record (coaches/managers)
// playerIds: links to MOCK_PLAYERS this parent/guardian manages
const MOCK_USERS = [
  { id: 1, name: "Sarah Mitchell", phone: "+14125550100", role: "clubAdmin",      teamIds: [1,2,3], email: "sarah@riverview.org" },
  { id: 2, name: "Marcus Webb",    phone: "+14125550101", role: "coach",          teamIds: [1],     staffId: 101, email: "marcus@riverview.org" },
  { id: 3, name: "Priya Sharma",   phone: "+14125550102", role: "assistantCoach", teamIds: [1],     staffId: 102, email: "priya@riverview.org" },
  { id: 4, name: "Tom Gallagher",  phone: "+14125550103", role: "manager",        teamIds: [1],     staffId: 103, email: "tom@riverview.org" },
  { id: 5, name: "Rosa Torres",    phone: "+14125550201", role: "parent",         teamIds: [1],     playerIds: [1] },
  { id: 6, name: "Luis Rivera",    phone: "+14125550202", role: "parent",         teamIds: [1,2],   playerIds: [2] }, // Sam plays on two teams
];

// For demo: switch index to test different roles
// 0=Club Admin, 1=Coach Marcus, 2=Asst Coach Priya, 3=Manager Tom, 4=Rosa(parent/Jamie), 5=Luis(parent/Sam — 2 teams)
const MOCK_USER = MOCK_USERS[0];

const MOCK_TEAMS = [
  { id: 1, name: "U12 Lions",   ageGroup: "U12", gender: "Boys",  coachName: "Coach Marcus", settings: { trackPositions: true } },
  { id: 2, name: "U14 Falcons", ageGroup: "U14", gender: "Girls", coachName: "Coach Priya",  settings: { trackPositions: true } },
  { id: 3, name: "U10 Storm",   ageGroup: "U10", gender: "Co-ed", coachName: "Coach Dana",   settings: { trackPositions: false } },
];

// Team memberships — players can belong to multiple teams
const MOCK_TEAM_PLAYERS = [
  // U12 Lions (teamId 1)
  { teamId: 1, playerId: 1,  number: 1  },
  { teamId: 1, playerId: 2,  number: 4  },
  { teamId: 1, playerId: 3,  number: 5  },
  { teamId: 1, playerId: 4,  number: 8  },
  { teamId: 1, playerId: 5,  number: 10 },
  { teamId: 1, playerId: 6,  number: 9  },
  { teamId: 1, playerId: 7,  number: 11 },
  { teamId: 1, playerId: 8,  number: 2  },
  { teamId: 1, playerId: 9,  number: 6  },
  { teamId: 1, playerId: 10, number: 7  },
  { teamId: 1, playerId: 11, number: 3  },
  { teamId: 1, playerId: 12, number: 12 },
  // U14 Falcons (teamId 2) — Sam Rivera (id 2) also plays here
  { teamId: 2, playerId: 2,  number: 7  },
  { teamId: 2, playerId: 13, number: 1  },
  { teamId: 2, playerId: 14, number: 4  },
  { teamId: 2, playerId: 15, number: 9  },
  // U10 Storm (teamId 3)
  { teamId: 3, playerId: 16, number: 1  },
  { teamId: 3, playerId: 17, number: 2  },
];

const today = new Date();
const fmt  = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

const MOCK_EVENTS = [
  {
    id: 1, teamId: 1, type: "game", title: "vs Westfield FC",
    date: fmt(addDays(2)), time: "10:00 AM", location: "Riverside Park — Field 3",
    opponent: "Westfield FC", notes: "Arrive 30 min early for warm-up. Bring both home and away jerseys.",
    rsvps: { going: 9, maybe: 1, notGoing: 1, noResponse: 1 },
    playerRsvps: [
      { playerId: 1,  status: "going" },
      { playerId: 2,  status: "going" },
      { playerId: 3,  status: "notGoing", note: "Family commitment" },
      { playerId: 4,  status: "going" },
      { playerId: 5,  status: "maybe",   note: "Might be late" },
      { playerId: 6,  status: "going" },
      { playerId: 7,  status: "going" },
      { playerId: 8,  status: "going" },
      { playerId: 9,  status: "going" },
      { playerId: 10, status: "going" },
      { playerId: 11, status: "going" },
      { playerId: 12, status: "noResponse" },
    ],
  },
  {
    id: 2, teamId: 1, type: "practice", title: "Tuesday Practice",
    date: fmt(addDays(5)), time: "5:30 PM", location: "Riverview Training Center",
    notes: "Focus on set pieces and corner kicks.",
    rsvps: { going: 9, maybe: 2, notGoing: 0, noResponse: 1 },
    playerRsvps: [
      { playerId: 1,  status: "going" },
      { playerId: 2,  status: "going" },
      { playerId: 3,  status: "going" },
      { playerId: 4,  status: "going" },
      { playerId: 5,  status: "maybe" },
      { playerId: 6,  status: "going" },
      { playerId: 7,  status: "going" },
      { playerId: 8,  status: "maybe", note: "Dentist appt, may be 10 min late" },
      { playerId: 9,  status: "going" },
      { playerId: 10, status: "going" },
      { playerId: 11, status: "going" },
      { playerId: 12, status: "noResponse" },
    ],
  },
  {
    id: 3, teamId: 1, type: "game", title: "vs Cedar United",
    date: fmt(addDays(9)), time: "2:00 PM", location: "Cedar Hills Complex — Field 1",
    opponent: "Cedar United", notes: "",
    rsvps: { going: 8, maybe: 3, notGoing: 0, noResponse: 1 },
    playerRsvps: [
      { playerId: 1,  status: "going" },
      { playerId: 2,  status: "maybe" },
      { playerId: 3,  status: "going" },
      { playerId: 4,  status: "going" },
      { playerId: 5,  status: "maybe" },
      { playerId: 6,  status: "going" },
      { playerId: 7,  status: "going" },
      { playerId: 8,  status: "going" },
      { playerId: 9,  status: "maybe", note: "Out of town, checking travel" },
      { playerId: 10, status: "going" },
      { playerId: 11, status: "going" },
      { playerId: 12, status: "noResponse" },
    ],
  },
  {
    id: 4, teamId: 1, type: "practice", title: "Thursday Practice",
    date: fmt(addDays(12)), time: "5:30 PM", location: "Riverview Training Center",
    notes: "",
    rsvps: { going: 7, maybe: 1, notGoing: 1, noResponse: 3 },
    playerRsvps: [
      { playerId: 1,  status: "going" },
      { playerId: 2,  status: "going" },
      { playerId: 3,  status: "going" },
      { playerId: 4,  status: "notGoing", note: "School event" },
      { playerId: 5,  status: "going" },
      { playerId: 6,  status: "going" },
      { playerId: 7,  status: "going" },
      { playerId: 8,  status: "noResponse" },
      { playerId: 9,  status: "going" },
      { playerId: 10, status: "maybe" },
      { playerId: 11, status: "noResponse" },
      { playerId: 12, status: "noResponse" },
    ],
  },
  {
    id: 5, teamId: 1, type: "tournament", title: "Spring Invitational",
    date: fmt(addDays(18)), time: "8:00 AM", location: "Allegheny Sports Complex",
    notes: "Full day tournament. Bring snacks, water, and sunscreen. Schedule TBD.",
    rsvps: { going: 10, maybe: 1, notGoing: 0, noResponse: 1 },
    playerRsvps: [
      { playerId: 1,  status: "going" },
      { playerId: 2,  status: "going" },
      { playerId: 3,  status: "going" },
      { playerId: 4,  status: "going" },
      { playerId: 5,  status: "going" },
      { playerId: 6,  status: "going" },
      { playerId: 7,  status: "going" },
      { playerId: 8,  status: "going" },
      { playerId: 9,  status: "maybe", note: "Waiting on confirmation" },
      { playerId: 10, status: "going" },
      { playerId: 11, status: "going" },
      { playerId: 12, status: "noResponse" },
    ],
  },
];

const MOCK_PLAYERS = [
  { id: 1,  name: "Jamie Torres",  number: 1,  position: "GK",  photo: null, guardians: [{ name: "Rosa Torres",   phone: "(412) 555-0201", email: "rosa.torres@email.com",   relation: "Mother" }] },
  { id: 2,  name: "Sam Rivera",    number: 4,  position: "DEF", photo: null, guardians: [{ name: "Luis Rivera",   phone: "(412) 555-0202", email: "luis.rivera@email.com",   relation: "Father" }, { name: "Elena Rivera",  phone: "(412) 555-0203", email: "elena.rivera@email.com",  relation: "Mother" }] },
  { id: 3,  name: "Alex Kim",      number: 5,  position: "DEF", photo: null, guardians: [{ name: "Jin Kim",       phone: "(412) 555-0204", email: "jin.kim@email.com",       relation: "Father" }] },
  { id: 4,  name: "Morgan Lee",    number: 8,  position: "MID", photo: null, guardians: [{ name: "Dana Lee",      phone: "(412) 555-0205", email: "dana.lee@email.com",      relation: "Mother" }] },
  { id: 5,  name: "Casey Chen",    number: 10, position: "MID", photo: null, guardians: [{ name: "Wei Chen",      phone: "(412) 555-0206", email: "wei.chen@email.com",      relation: "Father" }] },
  { id: 6,  name: "Riley Patel",   number: 9,  position: "FWD", photo: null, guardians: [{ name: "Anika Patel",  phone: "(412) 555-0207", email: "anika.patel@email.com",   relation: "Mother" }, { name: "Raj Patel",     phone: "(412) 555-0208", email: "raj.patel@email.com",     relation: "Father" }] },
  { id: 7,  name: "Drew Santos",   number: 11, position: "FWD", photo: null, guardians: [{ name: "Maria Santos", phone: "(412) 555-0209", email: "maria.santos@email.com",  relation: "Mother" }] },
  { id: 8,  name: "Jordan Walsh",  number: 2,  position: "DEF", photo: null, guardians: [{ name: "Chris Walsh",  phone: "(412) 555-0210", email: "chris.walsh@email.com",   relation: "Father" }] },
  { id: 9,  name: "Avery Brooks",  number: 6,  position: "MID", photo: null, guardians: [{ name: "Tanya Brooks", phone: "(412) 555-0211", email: "tanya.brooks@email.com",  relation: "Mother" }] },
  { id: 10, name: "Quinn Ortega",  number: 7,  position: "FWD", photo: null, guardians: [{ name: "Carlos Ortega",phone: "(412) 555-0212", email: "carlos.ortega@email.com", relation: "Father" }] },
  { id: 11, name: "Skyler Nguyen", number: 3,  position: "DEF", photo: null, guardians: [{ name: "Linh Nguyen",  phone: "(412) 555-0213", email: "linh.nguyen@email.com",   relation: "Mother" }] },
  { id: 12, name: "Peyton Hall",   number: 12, position: "GK",  photo: null, guardians: [{ name: "Greg Hall",    phone: "(412) 555-0214", email: "greg.hall@email.com",     relation: "Father" }] },
];

// Extra players for U14 and U10 rosters
const MOCK_EXTRA_PLAYERS = [
  { id: 13, name: "Fallon Brady",   position: "GK",  photo: null, guardians: [{ name: "Kevin Brady",   phone: "(412) 555-0301", email: "kevin.brady@email.com",   relation: "Father" }] },
  { id: 14, name: "Devon Marsh",    position: "MID", photo: null, guardians: [{ name: "Paula Marsh",   phone: "(412) 555-0302", email: "paula.marsh@email.com",   relation: "Mother" }] },
  { id: 15, name: "Reese Coleman",  position: "FWD", photo: null, guardians: [{ name: "Andre Coleman", phone: "(412) 555-0303", email: "andre.coleman@email.com", relation: "Father" }] },
  { id: 16, name: "Wren Flores",    position: "GK",  photo: null, guardians: [{ name: "Sofia Flores",  phone: "(412) 555-0401", email: "sofia.flores@email.com",  relation: "Mother" }] },
  { id: 17, name: "Rory Okafor",    position: "DEF", photo: null, guardians: [{ name: "Emeka Okafor",  phone: "(412) 555-0402", email: "emeka.okafor@email.com",  relation: "Father" }] },
];

// All players combined
const ALL_PLAYERS = [...MOCK_PLAYERS, ...MOCK_EXTRA_PLAYERS];

const MOCK_STAFF = [
  { id: 101, name: "Marcus Webb",   role: "coach",          teamId: 1, email: "marcus@riverview.org", phone: "(412) 555-0101", photo: null },
  { id: 102, name: "Priya Sharma",  role: "assistantCoach", teamId: 1, email: "priya@riverview.org",  phone: "(412) 555-0102", photo: null },
  { id: 103, name: "Tom Gallagher", role: "manager",        teamId: 1, email: "tom@riverview.org",    phone: "(412) 555-0103", photo: null },
];

const MOCK_MESSAGES = [
  { id: 1, sender: "Coach Marcus",    time: "Yesterday 4:12 PM", text: "Great practice today team! See everyone Thursday." },
  { id: 2, sender: "Sam Rivera's Mom",time: "Yesterday 4:45 PM", text: "Thanks coach! Sam had a great time." },
  { id: 3, sender: "Coach Marcus",    time: "Today 8:00 AM",     text: "Reminder — game this Saturday at Riverside Park Field 3. Arrive by 9:30!" },
];

const mockSendOTP   = (phone) => new Promise((res) => setTimeout(() => res({ success: true }), 1200));
const mockVerifyOTP = (phone, code) => new Promise((res) => setTimeout(() => res(code === "1234" ? { user: MOCK_USER } : { error: "Invalid code" }), 900));

// ─── THEME ───────────────────────────────────────────────────────────────────

const T = {
  bg:         "#f4f6f9",
  surface:    "#ffffff",
  surfaceAlt: "#f0f3f8",
  border:     "#e2e8f0",
  borderMid:  "#cbd5e1",
  text:       "#0f172a",
  textMid:    "#475569",
  textSoft:   "#94a3b8",
  blue:       "#2563eb",
  blueLight:  "#eff6ff",
  blueMid:    "#bfdbfe",
  green:      "#16a34a",
  greenLight: "#f0fdf4",
  red:        "#dc2626",
  redLight:   "#fef2f2",
  amber:      "#d97706",
  amberLight: "#fffbeb",
  purple:     "#7c3aed",
  purpleLight:"#f5f3ff",
  headerBg:   "#ffffff",
  navBg:      "#ffffff",
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const EVENT_COLORS  = { game: T.red,    practice: T.blue,   tournament: T.amber, other: T.purple };
const EVENT_BG      = { game: T.redLight, practice: T.blueLight, tournament: T.amberLight, other: T.purpleLight };
const EVENT_LABELS  = { game: "GAME",   practice: "PRACTICE", tournament: "TOURNAMENT", other: "EVENT" };
const POS_COLORS    = { GK: "#b45309",  DEF: "#1d4ed8",   MID: "#15803d",  FWD: "#b91c1c" };
const POS_BG        = { GK: "#fef3c7",  DEF: "#dbeafe",   MID: "#dcfce7",  FWD: "#fee2e2" };
const ROLE_LABELS   = { clubAdmin: "Club Admin", coach: "Head Coach", assistantCoach: "Assistant Coach", manager: "Team Manager", parent: "Parent/Guardian" };
const ROLE_COLORS   = { clubAdmin: "#059669", coach: T.blue, assistantCoach: T.purple, manager: "#0891b2", parent: T.textMid };
const ROLE_BG       = { clubAdmin: "#ecfdf5", coach: T.blueLight, assistantCoach: T.purpleLight, manager: "#ecfeff", parent: T.surfaceAlt };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatEventDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const days = Math.round((d - new Date(fmt(today))) / 86400000);
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month   = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days === 0) return { label: "Today",    sub: month,   urgent: true };
  if (days === 1) return { label: "Tomorrow", sub: month,   urgent: true };
  if (days <= 6)  return { label: weekday,    sub: month,   urgent: false };
  return              { label: month,         sub: weekday, urgent: false };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

// Photo avatar — shows uploaded image or initials fallback
// onUpload is optional; if provided, renders a camera button overlay
function PhotoAvatar({ name, photo, onUpload, size = 40, color = T.blue, shape = "circle" }) {
  const fileRef = useRef();
  const radius = shape === "circle" ? "50%" : size * 0.28 + "px";
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: radius, overflow: "hidden", background: photo ? "transparent" : color + "18", border: `2px solid ${photo ? T.border : color + "30"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photo
          ? <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: size * 0.33, fontWeight: 700, color }}>{initials}</span>
        }
      </div>
      {onUpload && (
        <>
          <button
            onClick={() => fileRef.current.click()}
            style={{ position: "absolute", bottom: -2, right: -2, width: size * 0.38, height: size * 0.38, borderRadius: "50%", background: T.blue, border: `2px solid ${T.surface}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: size * 0.18 }}
          >📷</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => onUpload(ev.target.result);
            reader.readAsDataURL(file);
          }} />
        </>
      )}
    </div>
  );
}

function RsvpBar({ rsvps }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 2, height: 5, borderRadius: 99, overflow: "hidden", marginBottom: 7 }}>
        <div style={{ flex: rsvps.going,      background: T.green }} />
        <div style={{ flex: rsvps.maybe,      background: T.amber }} />
        <div style={{ flex: rsvps.notGoing,   background: T.red }} />
        <div style={{ flex: rsvps.noResponse, background: T.border }} />
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.textSoft }}>
        <span style={{ color: T.green,  fontWeight: 600 }}>✓ {rsvps.going}</span>
        <span style={{ color: T.amber,  fontWeight: 600 }}>? {rsvps.maybe}</span>
        <span style={{ color: T.red,    fontWeight: 600 }}>✗ {rsvps.notGoing}</span>
        <span>{rsvps.noResponse} no reply</span>
      </div>
    </div>
  );
}

function ContactBtn({ href, icon, label, detail }) {
  return (
    <a href={href} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px", textDecoration: "none" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: T.textSoft, fontWeight: 600, letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 12, color: T.textMid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{detail}</div>
      </div>
    </a>
  );
}

function BottomNav({ active, onNavigate }) {
  const items = [
    { key: "home",     label: "Home",     icon: "⚡" },
    { key: "schedule", label: "Schedule", icon: "📅" },
    { key: "roster",   label: "Roster",   icon: "👥" },
    { key: "teams",    label: "Teams",    icon: "🏆" },
    { key: "more",     label: "More",     icon: "⋯" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, display: "flex", padding: "8px 0 14px" }}>
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button key={item.key} onClick={() => onNavigate(item.key)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" }}>
            <div style={{ fontSize: 20 }}>{item.icon}</div>
            <div style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? T.blue : T.textSoft }}>{item.label}</div>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.blue }} />}
          </button>
        );
      })}
    </div>
  );
}

function ScreenHeader({ title, subtitle, right, backTo, onNavigate }) {
  return (
    <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", gap: 12 }}>
      {backTo && (
        <button onClick={() => onNavigate(backTo)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMid, fontSize: 16, flexShrink: 0 }}>←</button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: "-0.02em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.textSoft, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [phase,   setPhase]   = useState("phone");
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const sendOTP = async () => {
    if (phone.replace(/\D/g, "").length < 10) { setError("Please enter a valid phone number."); return; }
    setError(""); setLoading(true);
    await mockSendOTP(phone);
    setLoading(false); setPhase("otp");
  };

  const verify = async () => {
    setError(""); setLoading(true);
    const result = await mockVerifyOTP(phone, otp);
    setLoading(false);
    if (result.error) { setError(result.error); }
    else onLogin(result.user);
  };

  const inp = { width: "100%", background: T.surfaceAlt, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "13px 16px", color: T.text, fontSize: 16, fontFamily: "'DM Sans', sans-serif", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #e8f0fe 0%, #f4f6f9 50%, #fef9ec 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: "linear-gradient(135deg, #2563eb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 30px #2563eb30" }}>⚽</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 30, color: T.text, letterSpacing: "-0.03em" }}>GameGo</div>
        <div style={{ fontSize: 14, color: T.textMid, marginTop: 4 }}>Your team. Game on.</div>
      </div>

      <div style={{ width: "100%", maxWidth: 380, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px #0002" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTopColor: T.blue, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.7s linear infinite" }} />
            <div style={{ color: T.textSoft, fontSize: 14 }}>One moment...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {!loading && phase === "phone" && (
          <>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 6 }}>Welcome back</div>
            <div style={{ fontSize: 14, color: T.textMid, marginBottom: 24 }}>Enter your phone number to sign in.</div>
            <div style={{ fontSize: 11, color: T.textSoft, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>PHONE NUMBER</div>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} onKeyDown={(e) => e.key === "Enter" && sendOTP()} placeholder="(412) 555-0100" style={{ ...inp, letterSpacing: "0.04em" }} />
            {error && <div style={{ fontSize: 12, color: T.red, marginTop: 8 }}>{error}</div>}
            <button onClick={sendOTP} style={{ width: "100%", background: T.blue, border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 16 }}>
              Send Code →
            </button>
            <div style={{ fontSize: 12, color: T.textSoft, textAlign: "center", marginTop: 14 }}>We'll text you a one-time code. No password needed.</div>
          </>
        )}
        {!loading && phase === "otp" && (
          <>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 6 }}>Check your texts</div>
            <div style={{ fontSize: 14, color: T.textMid, marginBottom: 4 }}>We sent a 4-digit code to</div>
            <div style={{ fontSize: 15, color: T.text, fontWeight: 700, marginBottom: 24 }}>{phone}</div>
            <div style={{ fontSize: 11, color: T.textSoft, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>ENTER CODE</div>
            <input autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} onKeyDown={(e) => e.key === "Enter" && otp.length === 4 && verify()} placeholder="1234" maxLength={4} style={{ ...inp, fontSize: 28, textAlign: "center", letterSpacing: "0.3em" }} />
            {error && <div style={{ fontSize: 12, color: T.red, marginTop: 8 }}>{error}</div>}
            <div style={{ fontSize: 11, color: T.textSoft, marginTop: 8 }}>Hint: use <strong>1234</strong> for this demo</div>
            <button onClick={verify} disabled={otp.length < 4} style={{ width: "100%", background: otp.length === 4 ? T.blue : T.surfaceAlt, border: "none", borderRadius: 12, padding: "14px", color: otp.length === 4 ? "#fff" : T.textSoft, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: otp.length === 4 ? "pointer" : "not-allowed", marginTop: 16, transition: "all 0.2s" }}>
              Verify & Sign In
            </button>
            <button onClick={() => { setPhase("phone"); setOtp(""); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: T.textSoft, fontSize: 13, cursor: "pointer", marginTop: 12 }}>
              ← Use a different number
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────

function HomeScreen({ user, onNavigate, activeTeamId, onSwitchTeam }) {
  const visibleTeams = getVisibleTeams(user);
  const team       = MOCK_TEAMS.find((t) => t.id === activeTeamId);
  const players    = getTeamPlayers(activeTeamId);
  const events     = MOCK_EVENTS.filter((e) => e.teamId === activeTeamId).sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent  = events[0];
  const upcoming   = events.slice(1, 4);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; } .tap:active { opacity: 0.75; }`}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: "-0.02em" }}>GameGo</div>
          <div style={{ fontSize: 11, color: T.blue, fontWeight: 600 }}>{MOCK_CLUB.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>🔔</button>
          <PhotoAvatar name={user.name} photo={null} size={38} color={T.blue} />
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Team label + switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, color: T.text, letterSpacing: "-0.02em" }}>{team?.name}</div>
            <div style={{ fontSize: 13, color: T.textMid }}>{team?.ageGroup} · {team?.gender} · {players.length} players</div>
          </div>
          {visibleTeams.length > 1 && (
            <button onClick={() => onNavigate("teams")} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 12px", color: T.textMid, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Switch ▾</button>
          )}
        </div>

        {/* Next event hero */}
        {nextEvent && (() => {
          const { label, sub, urgent } = formatEventDate(nextEvent.date);
          const color = EVENT_COLORS[nextEvent.type];
          const bg    = EVENT_BG[nextEvent.type];
          return (
            <div onClick={() => onNavigate("event", nextEvent)} className="tap" style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: 18, padding: "20px", marginBottom: 14, cursor: "pointer", boxShadow: `0 2px 12px ${color}15` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "inline-block", background: color + "20", border: `1px solid ${color}40`, borderRadius: 6, padding: "2px 9px", fontSize: 10, fontWeight: 700, color, letterSpacing: "0.1em", marginBottom: 8 }}>
                    {EVENT_LABELS[nextEvent.type]} · NEXT UP
                  </div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{nextEvent.title}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: urgent ? color : T.text }}>{label}</div>
                  <div style={{ fontSize: 12, color: T.textSoft }}>{sub}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 13, color: T.textMid, marginBottom: 14, flexWrap: "wrap" }}>
                <span>🕐 {nextEvent.time}</span>
                <span>📍 {nextEvent.location}</span>
              </div>
              {nextEvent.notes && <div style={{ fontSize: 12, color: T.textMid, background: "#fff8", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>{nextEvent.notes}</div>}
              <RsvpBar rsvps={nextEvent.rsvps} />
            </div>
          );
        })()}

        {/* Upcoming */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSoft, letterSpacing: "0.08em" }}>COMING UP</div>
            <button onClick={() => onNavigate("schedule")} style={{ background: "none", border: "none", color: T.blue, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>See all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((ev) => {
              const { label } = formatEventDate(ev.date);
              const color = EVENT_COLORS[ev.type];
              return (
                <div key={ev.id} onClick={() => onNavigate("event", ev)} className="tap" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", boxShadow: "0 1px 4px #0001" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: EVENT_BG[ev.type], border: `1px solid ${color}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: "0.05em" }}>{EVENT_LABELS[ev.type].slice(0,3)}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: T.text, lineHeight: 1 }}>{new Date(ev.date + "T00:00:00").getDate()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: T.text, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                    <div style={{ fontSize: 12, color: T.textSoft }}>{label} · {ev.time}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>✓{ev.rsvps.going}</div>
                    <div style={{ fontSize: 11, color: T.textSoft }}>/{ev.rsvps.going + ev.rsvps.maybe + ev.rsvps.notGoing + ev.rsvps.noResponse}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat preview */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textSoft, letterSpacing: "0.08em" }}>TEAM CHAT</div>
            <button onClick={() => onNavigate("chat")} style={{ background: "none", border: "none", color: T.blue, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Open →</button>
          </div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px #0001" }}>
            {MOCK_MESSAGES.slice(-2).map((msg, i) => (
              <div key={msg.id} style={{ padding: "12px 16px", borderBottom: i < 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <PhotoAvatar name={msg.sender} photo={null} size={32} color={msg.sender.startsWith("Coach") ? T.blue : T.purple} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{msg.sender}</span>
                    <span style={{ fontSize: 11, color: T.textSoft }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.textMid, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msg.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}

// ─── ROSTER SCREEN ───────────────────────────────────────────────────────────

function RosterScreen({ user, onNavigate, activeTeamId, teamSettings }) {
  const [expandedId, setExpandedId]     = useState(null);
  const [tab, setTab]                   = useState("players");
  const [playerPhotos, setPlayerPhotos] = useState({});
  const [staffPhotos,  setStaffPhotos]  = useState({});

  const team = MOCK_TEAMS.find((t) => t.id === activeTeamId);
  const trackPositions = teamSettings.trackPositions;
  const sorted = [...getTeamPlayers(activeTeamId)].sort((a, b) => a.number - b.number);
  const teamStaff = MOCK_STAFF.filter((s) => s.teamId === activeTeamId);
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const canEditPlayerPhoto = (playerId) => {
    if (user.role === "parent") return (user.playerIds ?? []).includes(playerId);
    return false;
  };
  const canEditStaffPhoto = (staffId) => user.staffId === staffId;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; } .tap:active { opacity: 0.75; }`}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: "-0.02em" }}>Roster</div>
            <div style={{ fontSize: 12, color: T.textSoft }}>{team?.name} · {MOCK_PLAYERS.length} players</div>
          </div>
          <button style={{ background: T.blue, border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add</button>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {["players", "staff"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: "none", border: "none", borderBottom: tab === t ? `2.5px solid ${T.blue}` : "2.5px solid transparent", color: tab === t ? T.blue : T.textSoft, fontWeight: 600, fontSize: 13, padding: "10px 0 11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {t === "players" ? `Players (${sorted.length})` : `Staff (${teamStaff.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>

        {/* ── PLAYERS ── */}
        {tab === "players" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((player) => {
              const isOpen    = expandedId === player.id;
              const posColor  = trackPositions ? (POS_COLORS[player.position]  ?? T.blue) : T.blue;
              const posBg     = trackPositions ? (POS_BG[player.position]      ?? T.blueLight) : T.blueLight;
              const photo     = playerPhotos[player.id] ?? null;

              return (
                <div key={player.id} style={{ background: T.surface, border: `1.5px solid ${isOpen ? T.blue + "60" : T.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px #0001", transition: "border-color 0.15s" }}>
                  <div onClick={() => toggle(player.id)} className="tap" style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", cursor: "pointer" }}>

                    {/* Photo / initials */}
                    <PhotoAvatar
                      name={player.name}
                      photo={photo}
                      size={44}
                      color={posColor}
                      shape="circle"
                      onUpload={canEditPlayerPhoto(player.id) ? (dataUrl) => setPlayerPhotos((prev) => ({ ...prev, [player.id]: dataUrl })) : undefined}
                    />

                    {/* Jersey number badge */}
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: posBg, border: `1px solid ${posColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 13, color: posColor }}>{player.number}</span>
                    </div>

                    {/* Name + position */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{player.name}</div>
                      {trackPositions && <div style={{ fontSize: 11, color: posColor, fontWeight: 700, marginTop: 1 }}>{player.position}</div>}
                    </div>

                    <div style={{ color: T.textSoft, fontSize: 12, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</div>
                  </div>

                  {/* Expanded guardians */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 16px", background: T.surfaceAlt }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 12 }}>GUARDIANS</div>
                      {player.guardians.length === 0 && <div style={{ fontSize: 13, color: T.textSoft }}>No guardians on file.</div>}
                      {player.guardians.map((g, i) => (
                        <div key={i} style={{ marginBottom: i < player.guardians.length - 1 ? 14 : 0, paddingBottom: i < player.guardians.length - 1 ? 14 : 0, borderBottom: i < player.guardians.length - 1 ? `1px solid ${T.border}` : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            {/* Guardians get initials only, no photo upload */}
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.purpleLight, border: `1.5px solid ${T.purple}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.purple, flexShrink: 0 }}>
                              {g.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{g.name}</div>
                              <div style={{ fontSize: 12, color: T.textSoft }}>{g.relation}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <ContactBtn href={`sms:${g.phone}`}     icon="💬" label="TEXT"  detail={g.phone} />
                            <ContactBtn href={`mailto:${g.email}`}  icon="✉️" label="EMAIL" detail={g.email} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── STAFF ── */}
        {tab === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {teamStaff.map((member) => {
              const color = ROLE_COLORS[member.role] ?? T.blue;
              const bg    = ROLE_BG[member.role]    ?? T.blueLight;
              const label = ROLE_LABELS[member.role] ?? member.role;
              const photo = staffPhotos[member.id] ?? null;
              return (
                <div key={member.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px #0001" }}>
                  <PhotoAvatar
                    name={member.name}
                    photo={photo}
                    size={52}
                    color={color}
                    shape="circle"
                    onUpload={canEditStaffPhoto(member.id) ? (dataUrl) => setStaffPhotos((prev) => ({ ...prev, [member.id]: dataUrl })) : undefined}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{member.name}</div>
                    <div style={{ display: "inline-block", background: bg, border: `1px solid ${color}30`, borderRadius: 5, padding: "2px 9px", fontSize: 11, fontWeight: 700, color, letterSpacing: "0.06em", marginTop: 4 }}>
                      {label.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={`sms:${member.phone}`}    style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 16 }}>💬</a>
                    <a href={`mailto:${member.email}`} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 16 }}>✉️</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav active="roster" onNavigate={onNavigate} />
    </div>
  );
}

// ─── SCHEDULE SCREEN ─────────────────────────────────────────────────────────

const RSVP_META = {
  going:      { label: "Going",      color: T.green,  bg: T.greenLight,  icon: "✓" },
  maybe:      { label: "Maybe",      color: T.amber,  bg: T.amberLight,  icon: "?" },
  notGoing:   { label: "Can't Go",   color: T.red,    bg: T.redLight,    icon: "✗" },
  noResponse: { label: "No Reply",   color: T.textSoft, bg: T.surfaceAlt, icon: "—" },
};

function ScheduleScreen({ user, onNavigate, activeTeamId }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter]         = useState("all");

  const team   = MOCK_TEAMS.find((t) => t.id === activeTeamId);
  const events = MOCK_EVENTS
    .filter((e) => e.teamId === activeTeamId)
    .filter((e) => filter === "all" || e.type === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const filterOpts = [
    { key: "all",        label: "All" },
    { key: "game",       label: "Games" },
    { key: "practice",   label: "Practices" },
    { key: "tournament", label: "Tournaments" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; } .tap:active { opacity: 0.75; }`}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: "-0.02em" }}>Schedule</div>
            <div style={{ fontSize: 12, color: T.textSoft }}>{team?.name} · {events.length} event{events.length !== 1 ? "s" : ""}</div>
          </div>
          <button style={{ background: T.blue, border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add</button>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 6, paddingBottom: 12, overflowX: "auto" }}>
          {filterOpts.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              background: filter === f.key ? T.blue : T.surface,
              border: `1px solid ${filter === f.key ? T.blue : T.border}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600,
              color: filter === f.key ? "#fff" : T.textMid,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {events.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSoft }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: T.textMid }}>No events found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try a different filter or add a new event.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {events.map((event) => {
            const isOpen   = expandedId === event.id;
            const evColor  = EVENT_COLORS[event.type];
            const evBg     = EVENT_BG[event.type];
            const { label: dateLabel, sub: dateSub, urgent } = formatEventDate(event.date);
            const total    = event.rsvps.going + event.rsvps.maybe + event.rsvps.notGoing + event.rsvps.noResponse;

            // Group players by rsvp status for expanded view
            const grouped = { going: [], maybe: [], notGoing: [], noResponse: [] };
            (event.playerRsvps ?? []).forEach((r) => {
              const player = MOCK_PLAYERS.find((p) => p.id === r.playerId);
              if (player) grouped[r.status]?.push({ ...player, rsvpNote: r.note });
            });

            return (
              <div key={event.id} style={{ background: T.surface, border: `1.5px solid ${isOpen ? evColor + "60" : T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px #0001", transition: "border-color 0.15s" }}>

                {/* ── Collapsed row ── */}
                <div onClick={() => toggle(event.id)} className="tap" style={{ display: "flex", gap: 14, padding: "14px 16px", cursor: "pointer", alignItems: "center" }}>

                  {/* Date badge */}
                  <div style={{ width: 48, height: 52, borderRadius: 12, background: evBg, border: `1px solid ${evColor}25`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: evColor, letterSpacing: "0.06em" }}>
                      {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text, lineHeight: 1 }}>
                      {new Date(event.date + "T00:00:00").getDate()}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: evColor, background: evBg, border: `1px solid ${evColor}30`, borderRadius: 4, padding: "1px 7px", letterSpacing: "0.07em" }}>
                        {EVENT_LABELS[event.type]}
                      </div>
                      {urgent && <div style={{ fontSize: 10, fontWeight: 700, color: T.amber }}>· {dateLabel}</div>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: T.textSoft, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span>🕐 {event.time}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {event.location.split("—")[0].trim()}</span>
                    </div>
                  </div>

                  {/* RSVP count + chevron */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: T.green, fontWeight: 700 }}>✓ {event.rsvps.going}</div>
                    <div style={{ fontSize: 11, color: T.textSoft }}>of {total}</div>
                  </div>
                  <div style={{ color: T.textSoft, fontSize: 12, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 4, flexShrink: 0 }}>▾</div>
                </div>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${T.border}`, background: T.surfaceAlt }}>

                    {/* Full date + location */}
                    <div style={{ padding: "14px 16px 0" }}>
                      <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 3 }}>DATE & TIME</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </div>
                          <div style={{ fontSize: 13, color: T.textMid }}>{event.time}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 3 }}>LOCATION</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{event.location}</div>
                        </div>
                      </div>

                      {/* Notes */}
                      {event.notes ? (
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 4 }}>NOTES</div>
                          <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{event.notes}</div>
                        </div>
                      ) : null}
                    </div>

                    {/* RSVP summary bar */}
                    <div style={{ padding: "0 16px 14px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 8 }}>PLAYER RESPONSES</div>

                      {/* Bar */}
                      <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ flex: event.rsvps.going,      background: T.green }} />
                        <div style={{ flex: event.rsvps.maybe,      background: T.amber }} />
                        <div style={{ flex: event.rsvps.notGoing,   background: T.red }} />
                        <div style={{ flex: event.rsvps.noResponse, background: T.border }} />
                      </div>

                      {/* Stat pills */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                        {Object.entries(RSVP_META).map(([key, meta]) => (
                          event.rsvps[key] > 0 && (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, background: meta.bg, border: `1px solid ${meta.color}25`, borderRadius: 8, padding: "4px 10px" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.icon} {event.rsvps[key]}</span>
                              <span style={{ fontSize: 11, color: meta.color }}>{meta.label}</span>
                            </div>
                          )
                        ))}
                      </div>

                      {/* Player lists per status */}
                      {["going", "maybe", "notGoing", "noResponse"].map((status) => {
                        const players = grouped[status];
                        if (!players.length) return null;
                        const meta = RSVP_META[status];
                        return (
                          <div key={status} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: "0.07em", marginBottom: 6 }}>
                              {meta.icon} {meta.label.toUpperCase()} ({players.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {players.map((p) => (
                                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: "8px 12px" }}>
                                  <PhotoAvatar name={p.name} photo={null} size={28} color={T.blue} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>#{p.number} {p.name}</span>
                                    {p.rsvpNote && <div style={{ fontSize: 11, color: T.textSoft, marginTop: 1, fontStyle: "italic" }}>"{p.rsvpNote}"</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav active="schedule" onNavigate={onNavigate} />
    </div>
  );
}

// ─── PROFILE SCREEN ──────────────────────────────────────────────────────────

function ProfileScreen({ user, onUserUpdate, onNavigate }) {
  const [photo,    setPhoto]    = useState(user.photo ?? null);
  const [name,     setName]     = useState(user.name ?? "");
  const [email,    setEmail]    = useState(user.email ?? "");
  const [phone,    setPhone]    = useState(user.phone ?? "");
  const [saved,    setSaved]    = useState(false);
  const [editing,  setEditing]  = useState(false);

  const formatPhone = (val) => {
    const d = val.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  const handleSave = () => {
    onUserUpdate({ ...user, name, email, phone, photo });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp = {
    width: "100%", background: editing ? T.surface : T.surfaceAlt,
    border: `1.5px solid ${editing ? T.blue + "80" : T.border}`,
    borderRadius: 10, padding: "11px 14px", color: editing ? T.text : T.textMid,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "all 0.15s",
  };

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const roleColor = ROLE_COLORS[user.role] ?? T.blue;
  const roleBg    = ROLE_BG[user.role]    ?? T.blueLight;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => onNavigate("more")} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMid, fontSize: 16 }}>←</button>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text, letterSpacing: "-0.02em" }}>Profile</div>
        </div>
        {!editing
          ? <button onClick={() => setEditing(true)} style={{ background: T.blueLight, border: `1px solid ${T.blueMid}`, borderRadius: 10, padding: "7px 14px", color: T.blue, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
          : <button onClick={handleSave} style={{ background: T.blue, border: "none", borderRadius: 10, padding: "7px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
        }
      </div>

      <div style={{ padding: "28px 20px" }}>

        {/* Saved confirmation */}
        {saved && (
          <div style={{ background: T.greenLight, border: `1px solid ${T.green}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.green }}>Profile saved successfully.</span>
          </div>
        )}

        {/* Photo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <PhotoAvatar
            name={name || user.name}
            photo={photo}
            size={88}
            color={roleColor}
            shape="circle"
            onUpload={(dataUrl) => { setPhoto(dataUrl); setEditing(true); }}
          />
          <div style={{ marginTop: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text }}>{name || user.name}</div>
          <div style={{ display: "inline-block", background: roleBg, border: `1px solid ${roleColor}30`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: roleColor, letterSpacing: "0.07em", marginTop: 6 }}>
            {roleLabel.toUpperCase()}
          </div>
          {editing && <div style={{ fontSize: 12, color: T.textSoft, marginTop: 8 }}>Tap the photo to change it</div>}
        </div>

        {/* Fields */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px #0001", display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            { label: "FULL NAME",      value: name,  onChange: setName,  type: "text",  placeholder: "Your name" },
            { label: "EMAIL ADDRESS",  value: email, onChange: setEmail, type: "email", placeholder: "you@example.com" },
            { label: "PHONE NUMBER",   value: phone, onChange: (v) => setPhone(formatPhone(v)), type: "tel", placeholder: "(412) 555-0100" },
          ].map(({ label, value, onChange, type, placeholder }) => (
            <div key={label}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 7 }}>{label}</div>
              <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={!editing}
                style={{ ...inp, cursor: editing ? "text" : "default" }}
              />
            </div>
          ))}

          {/* Phone note */}
          <div style={{ fontSize: 11, color: T.textSoft, background: T.surfaceAlt, borderRadius: 8, padding: "9px 12px", lineHeight: 1.5 }}>
            📱 Your phone number is your login — contact your club admin to change it.
          </div>
        </div>

        {/* Cancel edit */}
        {editing && (
          <button onClick={() => { setEditing(false); setName(user.name ?? ""); setEmail(user.email ?? ""); setPhone(user.phone ?? ""); setPhoto(user.photo ?? null); }} style={{ width: "100%", background: "none", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px", color: T.textMid, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 14 }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MORE SCREEN ─────────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", background: value ? T.blue : T.borderMid, transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px #0003" }} />
    </button>
  );
}

function SettingRow({ label, description, value, onChange, coachOnly, userRole }) {
  const locked = coachOnly && userRole !== "coach";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: locked ? T.textSoft : T.text }}>{label}</div>
          {coachOnly && <div style={{ fontSize: 10, fontWeight: 700, color: T.blue, background: T.blueLight, border: `1px solid ${T.blueMid}`, borderRadius: 4, padding: "1px 6px", letterSpacing: "0.06em" }}>COACH</div>}
        </div>
        {description && <div style={{ fontSize: 12, color: T.textSoft, marginTop: 3, lineHeight: 1.5 }}>{description}</div>}
        {locked && <div style={{ fontSize: 11, color: T.amber, marginTop: 4 }}>Only the head coach can change this setting.</div>}
      </div>
      <Toggle value={value} onChange={locked ? () => {} : onChange} />
    </div>
  );
}

function MoreScreen({ user, onNavigate, teamSettings, setTeamSettings }) {
  const team = MOCK_TEAMS.find((t) => t.id === user.teamId);
  const isCoach = user.role === "coach";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: "-0.02em" }}>More</div>
        <div style={{ fontSize: 12, color: T.textSoft, marginTop: 1 }}>{team?.name}</div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Team Settings section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 4 }}>TEAM SETTINGS</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginBottom: 12 }}>Settings marked COACH can only be changed by the head coach.</div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "0 16px", boxShadow: "0 1px 4px #0001" }}>
            <SettingRow
              label="Track Player Positions"
              description="Show GK, DEF, MID, FWD labels on the roster and use position-based color coding."
              value={teamSettings.trackPositions}
              onChange={(v) => setTeamSettings((s) => ({ ...s, trackPositions: v }))}
              coachOnly={true}
              userRole={user.role}
            />
            <SettingRow
              label="Track Yellow & Red Cards"
              description="Show card counters during games and in player stats."
              value={teamSettings.trackCards ?? true}
              onChange={(v) => setTeamSettings((s) => ({ ...s, trackCards: v }))}
              coachOnly={true}
              userRole={user.role}
            />
            <div style={{ padding: "16px 0" }}>
              <SettingRow
                label="RSVP Reminders"
                description="Automatically remind players who haven't responded 48 hours before an event."
                value={teamSettings.rsvpReminders ?? true}
                onChange={(v) => setTeamSettings((s) => ({ ...s, rsvpReminders: v }))}
                coachOnly={false}
                userRole={user.role}
              />
            </div>
          </div>
        </div>

        {/* Account section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 12 }}>ACCOUNT</div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px #0001" }}>
            <div onClick={() => onNavigate("profile")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text }}>Profile</div>
              <div style={{ color: T.textSoft, fontSize: 14 }}>›</div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px", color: T.red, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Sign Out
        </button>

      </div>
      <BottomNav active="more" onNavigate={onNavigate} />
    </div>
  );
}

// ─── TEAMS SCREEN ────────────────────────────────────────────────────────────

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16","U17","U18","Adult"];
const GENDERS    = ["Boys","Girls","Co-ed"];

function TeamsScreen({ user, onNavigate, activeTeamId, onSwitchTeam, teamSettings, setTeamSettings }) {
  const isAdmin = isClubAdmin(user);
  const visibleTeams = getVisibleTeams(user);

  // Local state for add/edit modal
  const [editing,   setEditing]   = useState(null);  // null | "new" | teamId
  const [draftTeam, setDraftTeam] = useState({});
  const [localTeams, setLocalTeams] = useState(MOCK_TEAMS);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const visibleLocal = isAdmin ? localTeams : localTeams.filter((t) => (user.teamIds ?? []).includes(t.id));

  const openNew  = () => { setDraftTeam({ name: "", ageGroup: "U12", gender: "Boys" }); setEditing("new"); };
  const openEdit = (team) => { setDraftTeam({ ...team }); setEditing(team.id); };
  const saveTeam = () => {
    if (!draftTeam.name.trim()) return;
    if (editing === "new") {
      const newId = Math.max(...localTeams.map(t => t.id)) + 1;
      setLocalTeams(prev => [...prev, { ...draftTeam, id: newId, settings: { trackPositions: true } }]);
    } else {
      setLocalTeams(prev => prev.map(t => t.id === editing ? { ...t, ...draftTeam } : t));
    }
    setEditing(null);
  };
  const deleteTeam = (id) => {
    setLocalTeams(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
    if (activeTeamId === id && visibleLocal.length > 1) {
      onSwitchTeam(visibleLocal.find(t => t.id !== id)?.id ?? 1);
    }
  };

  const inp = { width: "100%", background: T.surface, border: `1.5px solid ${T.blueMid}`, borderRadius: 10, padding: "11px 14px", color: T.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; } .tap:active{opacity:0.75;}`}</style>

      {/* Header */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}`, padding: "14px 20px", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: "-0.02em" }}>Teams</div>
          <div style={{ fontSize: 12, color: T.textSoft }}>{MOCK_CLUB.name}</div>
        </div>
        {isAdmin && (
          <button onClick={openNew} style={{ background: T.blue, border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Team</button>
        )}
      </div>

      <div style={{ padding: "16px 20px" }}>

        {/* Role context note */}
        {isAdmin && (
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#065f46", fontWeight: 500 }}>
            👑 You're viewing all teams as Club Admin. Tap a team to switch to it, or use the edit controls to manage.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleLocal.map((team) => {
            const players = getTeamPlayers(team.id);
            const isActive = team.id === activeTeamId;
            const roleColor  = ROLE_COLORS["coach"];

            return (
              <div key={team.id} style={{ background: T.surface, border: `2px solid ${isActive ? T.blue : T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: isActive ? `0 2px 12px ${T.blue}20` : "0 1px 4px #0001" }}>

                {/* Team row — tap to switch */}
                <div onClick={() => onSwitchTeam(team.id)} className="tap" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer" }}>
                  {/* Color badge */}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: isActive ? T.blueLight : T.surfaceAlt, border: `1.5px solid ${isActive ? T.blue+"40" : T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isActive ? T.blue : T.textSoft, letterSpacing: "0.05em" }}>{team.gender?.slice(0,1) ?? "–"}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: isActive ? T.blue : T.text }}>{team.ageGroup}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{team.name}</div>
                      {isActive && <div style={{ fontSize: 10, fontWeight: 700, color: T.blue, background: T.blueLight, border: `1px solid ${T.blueMid}`, borderRadius: 5, padding: "1px 7px", letterSpacing: "0.06em" }}>ACTIVE</div>}
                    </div>
                    <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>
                      {team.gender} · {team.ageGroup} · {players.length} player{players.length !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: 12, color: T.textSoft }}>{team.coachName}</div>
                  </div>

                  {/* Admin actions */}
                  {isAdmin ? (
                    <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(team)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>✏️</button>
                      <button onClick={() => setConfirmDelete(team.id)} style={{ background: T.redLight, border: `1px solid ${T.red}20`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </div>
                  ) : (
                    <div style={{ color: T.textSoft, fontSize: 14 }}>{isActive ? "✓" : "›"}</div>
                  )}
                </div>

                {/* Delete confirmation inline */}
                {confirmDelete === team.id && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 16px", background: T.redLight, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>Delete "{team.name}"? This can't be undone.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setConfirmDelete(null)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: T.textMid, cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => deleteTeam(team.id)} style={{ background: T.red, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit modal */}
      {editing !== null && (
        <div style={{ position: "fixed", inset: 0, background: "#0007", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: T.surface, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", boxShadow: "0 -4px 30px #0002" }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.text, marginBottom: 20 }}>
              {editing === "new" ? "New Team" : "Edit Team"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 7 }}>TEAM NAME</div>
                <input value={draftTeam.name ?? ""} onChange={(e) => setDraftTeam(d => ({ ...d, name: e.target.value }))} placeholder="e.g. U12 Lions" style={inp} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 7 }}>AGE GROUP</div>
                  <select value={draftTeam.ageGroup ?? "U12"} onChange={(e) => setDraftTeam(d => ({ ...d, ageGroup: e.target.value }))} style={{ ...inp, appearance: "none" }}>
                    {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textSoft, letterSpacing: "0.1em", marginBottom: 7 }}>GENDER</div>
                  <select value={draftTeam.gender ?? "Boys"} onChange={(e) => setDraftTeam(d => ({ ...d, gender: e.target.value }))} style={{ ...inp, appearance: "none" }}>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setEditing(null)} style={{ flex: 1, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px", color: T.textMid, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
                <button onClick={saveTeam} disabled={!draftTeam.name?.trim()} style={{ flex: 2, background: draftTeam.name?.trim() ? T.blue : T.border, border: "none", borderRadius: 12, padding: "13px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, cursor: draftTeam.name?.trim() ? "pointer" : "not-allowed" }}>
                  {editing === "new" ? "Create Team" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="teams" onNavigate={onNavigate} />
    </div>
  );
}

// ─── PLACEHOLDER SCREEN ──────────────────────────────────────────────────────

function PlaceholderScreen({ title, icon, onNavigate, navKey }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap'); * { box-sizing: border-box; }`}</style>
      <ScreenHeader title={title} onNavigate={onNavigate} backTo="home" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, marginTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{icon}</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: T.textMid, maxWidth: 260, lineHeight: 1.6 }}>This screen is coming next. We'll build each section from here.</div>
      </div>
      <BottomNav active={navKey ?? title.toLowerCase()} onNavigate={onNavigate} />
    </div>
  );
}

// ─── PERMISSION HELPERS ──────────────────────────────────────────────────────

const isClubAdmin = (user) => user.role === "clubAdmin";
const isCoachOrAbove = (user) => ["clubAdmin","coach","assistantCoach","manager"].includes(user.role);
const canEditPlayer = (user, playerId) => isClubAdmin(user) || (user.role === "parent" && (user.playerIds ?? []).includes(playerId));
const canEditStaff  = (user, staffId)  => isClubAdmin(user) || user.staffId === staffId;
const canEditTeam   = (user) => isClubAdmin(user);

// Get teams visible to this user
const getVisibleTeams = (user) => {
  if (isClubAdmin(user)) return MOCK_TEAMS;
  return MOCK_TEAMS.filter((t) => (user.teamIds ?? []).includes(t.id));
};

// Get players for a given team
const getTeamPlayers = (teamId) => {
  const memberships = MOCK_TEAM_PLAYERS.filter((m) => m.teamId === teamId);
  return memberships.map((m) => {
    const player = ALL_PLAYERS.find((p) => p.id === m.playerId);
    return player ? { ...player, number: m.number } : null;
  }).filter(Boolean);
};

// ─── APP SHELL ───────────────────────────────────────────────────────────────

export default function App() {
  // ⚠️ TESTING: auto-login, restore login screen before launch
  const [user,          setUser]         = useState(MOCK_USER);
  const [screen,        setScreen]       = useState("home");
  const [activeTeamId,  setActiveTeamId] = useState(MOCK_USER.teamIds?.[0] ?? 1);
  const [teamSettings,  setTeamSettings] = useState(
    MOCK_TEAMS.find((t) => t.id === (MOCK_USER.teamIds?.[0] ?? 1))?.settings ?? { trackPositions: true }
  );

  const handleNavigate = (dest) => setScreen(dest);
  const handleUserUpdate = (updatedUser) => setUser(updatedUser);
  const handleSwitchTeam = (teamId) => {
    setActiveTeamId(teamId);
    setTeamSettings(MOCK_TEAMS.find((t) => t.id === teamId)?.settings ?? { trackPositions: true });
    setScreen("home");
  };

  // Uncomment to re-enable login:
  // if (!user) return <LoginScreen onLogin={(u) => { setUser(u); setActiveTeamId(u.teamIds?.[0] ?? 1); setScreen("home"); }} />;

  const sharedProps = { user, onNavigate: handleNavigate, activeTeamId };

  if (screen === "home")     return <HomeScreen     {...sharedProps} onSwitchTeam={handleSwitchTeam} />;
  if (screen === "roster")   return <RosterScreen   {...sharedProps} teamSettings={teamSettings} />;
  if (screen === "schedule") return <ScheduleScreen {...sharedProps} />;
  if (screen === "chat")     return <PlaceholderScreen title="Chat" icon="💬" navKey="chat" onNavigate={handleNavigate} />;
  if (screen === "teams")    return <TeamsScreen    {...sharedProps} onSwitchTeam={handleSwitchTeam} teamSettings={teamSettings} setTeamSettings={setTeamSettings} />;
  if (screen === "more")     return <MoreScreen     {...sharedProps} teamSettings={teamSettings} setTeamSettings={setTeamSettings} />;
  if (screen === "profile")  return <ProfileScreen  user={user} onUserUpdate={handleUserUpdate} onNavigate={handleNavigate} />;
  return <HomeScreen {...sharedProps} onSwitchTeam={handleSwitchTeam} />;
}
