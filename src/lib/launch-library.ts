// Mizly Launch Library — vendor-neutral, PHI-free seeded go-live support content.
// Each entry powers Ask answers with a reliable structure:
// first 90 seconds, what to say, what to check, when to escalate, related content.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed content.

import { ITEMS, itemById, type ContentItem, type ContentType } from "./demo-data";

export type LaunchType = ContentType | "ask_answer_seed";

export interface LaunchEntry {
  id: string;
  title: string;
  type: LaunchType;
  summary: string;
  // Tags
  roles: string[];        // e.g. ["all roles", "inpatient nurse"]
  domains: string[];      // e.g. ["login", "printing"]
  phases: string[];       // e.g. ["cutover day 0", "stabilization week 1"]
  urgency: 1 | 2 | 3 | 4; // 1 educational … 4 patient-safety
  escalation: 1 | 2 | 3 | 4; // 1 ATE handles … 4 immediate command center
  // Structured answer payload
  first90: string[];
  whatToSay: string[];
  whatToCheck: string[];
  whenToEscalate: string;
  // Search hints
  keywords: string[];
  related_ids: string[]; // ContentItem ids in demo-data.ITEMS
  sanitized_approved: true;
  status: "published";
}

// --- Helper -------------------------------------------------------------
const k = (...x: string[]) => x;

// --- 25+ seeded entries -------------------------------------------------
export const LAUNCH_LIBRARY: LaunchEntry[] = [
  {
    id: "ll_login_access",
    title: "Login or access issue — first response",
    type: "playbook",
    summary: "A user can't log in or has lost access mid-shift. Triage scope before paging credentials.",
    roles: k("all roles"), domains: k("login"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Confirm the user is at their own workstation and using their own credentials.",
      "Ask: 'Did this work earlier today, or is this the first attempt?'",
      "Have them try a second workstation if one is free nearby.",
    ],
    whatToSay: [
      "'Let's check one more workstation before we open a ticket — it saves 10 minutes if it's local.'",
      "'I'll stay with you until you're back in.'",
    ],
    whatToCheck: [
      "Caps lock, keyboard layout, expired password prompt.",
      "Network indicator on the device — is the workstation online?",
      "Whether other users on the unit are signed in successfully.",
    ],
    whenToEscalate: "If two workstations fail AND the user is using correct credentials, route to access support. If the unit is unable to chart, escalate to command center.",
    keywords: k("login", "log in", "sign in", "can't access", "locked out", "access"),
    related_ids: ["p3", "c1", "l1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_password_reset",
    title: "Password reset or access delay",
    type: "playbook",
    summary: "User is waiting on a password reset and patients are queued. Bridge the gap.",
    roles: k("all roles"), domains: k("login"), phases: k("cutover day 0"),
    urgency: 3, escalation: 2,
    first90: [
      "Ask if a super-user or charge can co-sign so the workflow keeps moving.",
      "Confirm the reset request has been logged — if not, log it now with timestamp.",
      "Identify the most urgent pending task and hand-write it for back-loading.",
    ],
    whatToSay: [
      "'A reset usually takes a few minutes — let's keep the patient moving in the meantime.'",
      "'Write down what you'd have entered — I'll help you back-load it.'",
    ],
    whatToCheck: [
      "Is there a co-sign or proxy pathway approved by this org?",
      "Time of reset request — anything over 15 minutes warrants an escalation.",
      "Backlog of pending tasks behind the locked user.",
    ],
    whenToEscalate: "If reset > 15 minutes during active patient care, escalate to access team via command center.",
    keywords: k("password", "reset", "locked", "credential", "access delay"),
    related_ids: ["p3", "c3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_printer_issue",
    title: "Printer issue — wristband, label, or document",
    type: "playbook",
    summary: "Print job is failing or routing to the wrong device. Confirm context before reprinting.",
    roles: k("inpatient nurse", "registration", "all roles"), domains: k("printing"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Confirm the workstation's printer context matches the unit they're standing in.",
      "Check the nearest physical printer for jams, out-of-paper, or offline status.",
      "Try one reprint — do not stack multiple jobs before confirming output.",
    ],
    whatToSay: [
      "'Before we reprint, let's make sure your workstation is set to this floor's printer.'",
      "'I'll walk to the printer with you so we see it together.'",
    ],
    whatToCheck: [
      "Workstation printer context vs physical location.",
      "Printer status: paper, toner, network, queue.",
      "Was the patient encounter opened on this workstation, not a stale one?",
    ],
    whenToEscalate: "If the printer is offline at the device level OR multiple workstations route to the wrong device, escalate to the device team.",
    keywords: k("printer", "print", "printing", "wristband", "label", "document"),
    related_ids: ["c1", "p3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_wristband_label",
    title: "Wristband or specimen label not printing",
    type: "playbook",
    summary: "Identity-critical print is failing. Pause before improvising — labels and bands are patient-safety items.",
    roles: k("inpatient nurse", "lab / phlebotomy", "registration"), domains: k("printing"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4, escalation: 3,
    first90: [
      "Stop the workflow. Do not hand-write a wristband or label unless local policy explicitly allows it.",
      "Confirm patient identity verbally with the clinician at bedside.",
      "Reprint to a different label printer if one is reachable.",
    ],
    whatToSay: [
      "'Let's hold the draw / arm-band step until we have a printed label — I'll get one now.'",
      "'I'll walk this to the next printer with you.'",
    ],
    whatToCheck: [
      "Is this a unit-wide label failure or just this workstation?",
      "Does local downtime policy allow hand-written labels for this workflow?",
      "Are there any time-sensitive specimens or meds waiting on this label?",
    ],
    whenToEscalate: "Unit-wide label or wristband failure: immediate command center page with patient-safety flag.",
    keywords: k("wristband", "label", "specimen", "identity", "armband"),
    related_ids: ["c4", "p1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_patient_list",
    title: "Patient list looks wrong",
    type: "playbook",
    summary: "A clinician's list is missing patients or showing the wrong unit. Usually a context or filter problem.",
    roles: k("inpatient nurse", "inpatient provider", "all roles"), domains: k("patient lists"), phases: k("stabilization week 1"),
    urgency: 2, escalation: 1,
    first90: [
      "Ask which list they expect to see and which one is loaded.",
      "Check the workstation's unit / location context.",
      "Refresh the list once before troubleshooting filters.",
    ],
    whatToSay: [
      "'These lists are filter-driven — nine times out of ten it's a context, not a missing patient.'",
      "'Let's check your default list together.'",
    ],
    whatToCheck: [
      "Workstation location vs the unit they're covering.",
      "List filter, shift filter, or coverage assignment.",
      "Whether the patient was admitted to a different unit during cutover.",
    ],
    whenToEscalate: "If multiple users on the unit see the same wrong list AND a patient is missing from rounds, escalate to clinical informatics.",
    keywords: k("patient list", "list", "my list", "missing patient", "wrong patient"),
    related_ids: ["l1", "p3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_wrong_location",
    title: "Wrong unit or location context on workstation",
    type: "playbook",
    summary: "Workstation is configured for the wrong unit. Fix the context, don't fix each chart.",
    roles: k("all roles"), domains: k("patient lists"), phases: k("stabilization week 1"),
    urgency: 2, escalation: 1,
    first90: [
      "Confirm the workstation's current context out loud with the user.",
      "Switch context to the correct unit before opening any chart.",
      "Watch one workflow end-to-end with the corrected context.",
    ],
    whatToSay: [
      "'Quick fix — let's set this workstation to your unit so the lists and printers line up.'",
    ],
    whatToCheck: [
      "Default context for this workstation.",
      "Printer / label routing tied to that context.",
      "Whether other clinicians at this station also need the same fix.",
    ],
    whenToEscalate: "If context resets unexpectedly across multiple workstations on the unit, escalate to device support.",
    keywords: k("location", "unit", "wrong floor", "context", "workstation context"),
    related_ids: ["p3", "c1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_registration_downtime",
    title: "Registration is down — first 15 minutes",
    type: "playbook",
    summary: "Registration unresponsive during open hours. Paper-first, timestamp everything.",
    roles: k("registration", "front desk"), domains: k("registration", "downtime"), phases: k("cutover day 0"),
    urgency: 4, escalation: 3,
    first90: [
      "If the system has been down for more than 3 minutes, switch to paper now.",
      "Pull the downtime registration form. Start a new line with arrival time.",
      "Tell triage out loud that paper handoffs are coming.",
    ],
    whatToSay: [
      "'Paper for new arrivals starting now. I'll take the front of the line.'",
      "'We'll back-load every form when the system is back — keep your timestamps tight.'",
    ],
    whatToCheck: [
      "Stocked downtime forms at every active desk.",
      "A visible wall clock or wristwatch in the area capturing times.",
      "A named person responsible for back-loading once the system returns.",
    ],
    whenToEscalate: "Downtime > 15 minutes: command center with patient headcount and start time.",
    keywords: k("registration", "downtime", "system down", "front desk"),
    related_ids: ["p1", "c4", "l4", "v3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_slow_system",
    title: "System is slow — triage before escalating",
    type: "playbook",
    summary: "Clinicians describe the system as 'slow.' Quantify before you escalate.",
    roles: k("all roles"), domains: k("documentation", "order entry"), phases: k("stabilization week 1"),
    urgency: 2, escalation: 2,
    first90: [
      "Ask: 'How many seconds between click and response?' — a number changes the conversation.",
      "Watch one workflow end-to-end with a watch.",
      "Check if a single workstation is slow or if the unit is slow.",
    ],
    whatToSay: [
      "'I want to time one workflow with you so the ticket has a number.'",
    ],
    whatToCheck: [
      "Is one workstation slow, or the whole unit?",
      "Other apps on the same workstation — slow there too?",
      "Time of day spike (admission rush, shift change).",
    ],
    whenToEscalate: "Unit-wide slowness with delays > 5 seconds per click, OR any patient-safety workflow affected: command center with measured delay.",
    keywords: k("slow", "lag", "freeze", "performance", "spinning"),
    related_ids: ["p2", "c3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_order_entry",
    title: "Order entry confusion",
    type: "playbook",
    summary: "Provider can't find an order or the entry pattern changed. Triage build vs muscle-memory.",
    roles: k("inpatient provider", "ambulatory provider", "resident / fellow", "app"),
    domains: k("order entry"), phases: k("stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Ask the provider to show you exactly what they're searching.",
      "Try one synonym before assuming the order doesn't exist.",
      "Confirm patient context and encounter type — orders are filtered by both.",
    ],
    whatToSay: [
      "'Let's search one more way before we call this missing — sometimes the name shifted slightly.'",
    ],
    whatToCheck: [
      "Encounter type, patient class, and order filter.",
      "Whether a similar order exists under a different name.",
      "Provider's role and prescriptive authority.",
    ],
    whenToEscalate: "If the order genuinely cannot be placed AND it's time-sensitive (meds, blood, imaging prep), page clinical informatics. Document with the playbook below.",
    keywords: k("order", "order entry", "can't find order", "place order"),
    related_ids: ["p2", "s1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_med_workflow",
    title: "Medication workflow support",
    type: "playbook",
    summary: "Nurse can't administer or document a med. High-stakes — slow down and verify.",
    roles: k("inpatient nurse", "pharmacist"), domains: k("bcma / mar", "order entry"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4, escalation: 3,
    first90: [
      "Stop the workflow. Verify the right patient, right med, right time at the bedside.",
      "Check if the order is signed, active, and not on hold.",
      "If scanning fails, do not bypass scan unless local policy allows — confirm with charge nurse.",
    ],
    whatToSay: [
      "'Let's pause and confirm the order status before we troubleshoot scanning.'",
    ],
    whatToCheck: [
      "Order state: signed, active, scheduled window.",
      "Patient wristband legibility and printer routing.",
      "Pharmacy verification status.",
    ],
    whenToEscalate: "Any administration delay that risks missing a clinically critical window: page pharmacy + clinical informatics immediately.",
    keywords: k("medication", "med", "mar", "bcma", "administer", "pyxis", "barcode med"),
    related_ids: ["p2", "s1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_documentation",
    title: "Documentation help — note won't save",
    type: "playbook",
    summary: "A clinician's note won't save or sign. Preserve their text first, troubleshoot second.",
    roles: k("inpatient nurse", "inpatient provider", "all roles"), domains: k("documentation"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Tell the clinician to copy the note text to a safe place (clipboard) before any retry.",
      "Try save once. If it fails, do not click multiple times.",
      "Capture the exact error wording.",
    ],
    whatToSay: [
      "'Copy your text first — I don't want you to lose what you wrote.'",
    ],
    whatToCheck: [
      "Encounter is still open and on the correct patient.",
      "Required fields completed.",
      "Network indicator on the workstation.",
    ],
    whenToEscalate: "Same error on a second workstation OR another clinician sees it on the same unit: page clinical informatics.",
    keywords: k("note", "document", "documentation", "won't save", "can't save", "sign note"),
    related_ids: ["l2", "p2"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_signature_failure",
    title: "Provider unable to sign or complete action",
    type: "playbook",
    summary: "Signature or co-sign is failing. Confirm scope, then escalate by severity.",
    roles: k("inpatient provider", "ambulatory provider", "resident / fellow", "app"),
    domains: k("order entry", "documentation"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4, escalation: 3,
    first90: [
      "Ask: 'Is this failing for just you, or are others seeing it too?'",
      "If others — start the escalation timer now.",
      "Try a second workstation if safe to confirm scope.",
    ],
    whatToSay: [
      "'I'll stay right here with you while we figure this out.'",
      "'If this is unit-wide I'll page clinical informatics now.'",
    ],
    whatToCheck: [
      "Provider signed in with own credentials, not a shared session.",
      "Stale or locked workstation session.",
      "Pending orders that are time-sensitive (meds, blood, imaging prep).",
    ],
    whenToEscalate: "Unit-wide AND any time-sensitive order: page on-call clinical informatics within 5 minutes. Provide scope, headcount, severity, callback.",
    keywords: k("sign", "signature", "co-sign", "can't sign", "won't sign", "submit", "approve"),
    related_ids: ["p2", "s1", "l3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_build_or_bug",
    title: "Is this a build issue? — nurse triage pattern",
    type: "playbook",
    summary: "Nurse asks whether a missing option is a build problem. Triage before paging build.",
    roles: k("inpatient nurse", "app", "all roles"), domains: k("documentation", "order entry"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2, escalation: 2,
    first90: [
      "Have them show you exactly where the option is missing.",
      "Try the workflow on a second workstation to rule out local issue.",
      "Confirm with a super-user that the option used to exist for this role.",
    ],
    whatToSay: [
      "'Let's confirm a super-user expects to see it too before we call it a build gap.'",
    ],
    whatToCheck: [
      "Role / security class — was this option ever available to this role?",
      "Patient class / encounter type filter.",
      "Whether the option exists on a different unit or workstation.",
    ],
    whenToEscalate: "Super-user confirms the option should be there AND it's missing on multiple workstations: open a build ticket with screenshots per policy.",
    keywords: k("build", "missing option", "should be there", "used to work", "build issue"),
    related_ids: ["l3", "c3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_scanning",
    title: "Barcode / scanning support pattern",
    type: "playbook",
    summary: "Scanner is failing on labels, wristbands, or meds. Clean, reseat, then escalate.",
    roles: k("inpatient nurse", "lab / phlebotomy"), domains: k("bcma / mar", "printing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Try scanning a second, clean label or wristband first.",
      "Reseat the scanner cable if it's wired.",
      "Wipe the scanner window — adhesive residue is the most common cause.",
    ],
    whatToSay: [
      "'Let's try one fresh label before we call this a scanner failure.'",
    ],
    whatToCheck: [
      "Label print quality — smudged or partial codes will not scan.",
      "Scanner battery (if wireless) and pairing.",
      "Whether multiple scanners on the unit fail with the same labels.",
    ],
    whenToEscalate: "Multiple scanners fail across the unit OR meds are waiting on scan: page device support + clinical informatics.",
    keywords: k("scan", "scanner", "barcode", "won't scan"),
    related_ids: ["ll_wristband_label", "p2"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_workstation_device",
    title: "Bedside device or workstation issue",
    type: "playbook",
    summary: "Workstation is frozen, mouse/keyboard dead, or device offline. Move the workflow, fix the box later.",
    roles: k("all roles"), domains: k("documentation", "patient lists"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Move the user to the nearest working workstation before troubleshooting.",
      "Log the broken device's location and ID.",
      "If frozen, do one controlled reboot only.",
    ],
    whatToSay: [
      "'Let's get you on the next station and I'll handle this one — keep your workflow moving.'",
    ],
    whatToCheck: [
      "Power, network cable, monitor signal.",
      "Whether the device is on the right network / domain.",
      "Whether other devices on this circuit are also down.",
    ],
    whenToEscalate: "Multiple devices down in one area, or a critical bedside device (med room, code cart) is offline: page device support.",
    keywords: k("workstation", "device", "frozen", "mouse", "keyboard", "computer", "monitor"),
    related_ids: ["p3", "c1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_command_center",
    title: "Command center escalation — what to bring",
    type: "playbook",
    summary: "You're walking a ticket up. Bring scope, severity, screenshot policy, and a callback.",
    roles: k("all roles"), domains: k("documentation", "order entry"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 3,
    first90: [
      "Write three sentences before you walk: what broke, scope/severity, what you need.",
      "Confirm screenshot policy — capture only if allowed and no patient data is visible.",
      "Get a callback number from the requester.",
    ],
    whatToSay: [
      "'One factual sentence, one severity sentence, one ask sentence.'",
      "'Need an engineer on Unit X within 15 minutes. Callback: [extension].'",
    ],
    whatToCheck: [
      "Number of users affected.",
      "Patient-impact severity (none / workaround / blocking / safety).",
      "Whether a workaround exists and has been offered.",
    ],
    whenToEscalate: "Any patient-safety risk: bypass triage and page on-call clinical informatics immediately.",
    keywords: k("command center", "escalate", "escalation", "ticket", "page", "walk it up"),
    related_ids: ["p2", "l3", "c3", "v2"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_floor_triage",
    title: "Floor support triage — three workflows wobbling",
    type: "playbook",
    summary: "You're getting hit with three issues at once. Triage by patient impact, not by who asked first.",
    roles: k("all roles"), domains: k("documentation"), phases: k("cutover day 0"),
    urgency: 3, escalation: 2,
    first90: [
      "Out loud: 'I'm with you in five — let me check who has the highest patient impact first.'",
      "Walk past each issue once. Ask one question: 'Is the patient waiting on this?'",
      "Order your queue: patient-safety > blocking > educational.",
    ],
    whatToSay: [
      "'I see you. I'm working in priority order, not arrival order — back to you shortly.'",
    ],
    whatToCheck: [
      "Which issue blocks a clinical action vs which is a learning moment.",
      "Whether a super-user can take one of the three off your plate.",
      "Whether any issue is already a unit-wide pattern.",
    ],
    whenToEscalate: "Three+ blocking issues at once on one floor: pull a second consultant or page command center for floor support.",
    keywords: k("floor support", "triage", "three at once", "overwhelmed", "many issues"),
    related_ids: ["p3", "p4", "c3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_frustrated_user",
    title: "Frustrated user — 'the system is broken'",
    type: "scenario",
    summary: "Provider is venting in front of patients or staff. De-escalate first, fix second.",
    roles: k("all roles"), domains: k("documentation"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 1,
    first90: [
      "Walk over calmly. Drop your voice below theirs.",
      "Listen for ten full seconds before saying anything.",
      "Acknowledge the impact, not the diagnosis: 'This is slowing you down — I want to help.'",
    ],
    whatToSay: [
      "'I hear you. Let's step over here so I can watch one workflow with you.'",
      "'I'll either fix it or get someone here who can.'",
    ],
    whatToCheck: [
      "Is this a private 1:1 conversation or a public vent? Move it private.",
      "Is the underlying issue real (build/access) or muscle-memory drift?",
      "Has anyone else on the unit raised the same thing?",
    ],
    whenToEscalate: "If a clinician escalates publicly or aggressively, ask them aside — never debate in front of the unit. Loop in charge if needed.",
    keywords: k("frustrated", "angry", "broken", "system is broken", "yelling", "venting"),
    related_ids: ["l2", "l5", "s3", "p4"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_shift_handoff",
    title: "Shift handoff in 90 seconds",
    type: "playbook",
    summary: "Hand off your unit so the next shift consultant lands calm.",
    roles: k("all roles"), domains: k("documentation"), phases: k("stabilization week 1"),
    urgency: 1, escalation: 1,
    first90: [
      "Find the next consultant before they walk on the unit.",
      "Give three pieces: open issues, watch-items, unit mood.",
      "Walk them to the charge nurse for a quick handshake.",
    ],
    whatToSay: [
      "'Three things: what's open, what's wobbling, what the room feels like.'",
    ],
    whatToCheck: [
      "Any pending escalations or tickets still open.",
      "Any clinician you promised to circle back to.",
      "Where your downtime kit is stashed.",
    ],
    whenToEscalate: "If you can't physically meet the next consultant, leave a written handoff with the charge nurse.",
    keywords: k("handoff", "hand off", "shift change", "next shift"),
    related_ids: ["v1", "p3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_super_user_handoff",
    title: "Super-user handoff — what to leave behind",
    type: "playbook",
    summary: "You're stepping off and a super-user is taking your spot. Set them up to look great.",
    roles: k("all roles"), domains: k("documentation"), phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1, escalation: 1,
    first90: [
      "Name the two workflows the unit is still wobbling on.",
      "Show them where you've been standing — physical location matters.",
      "Introduce them to the charge nurse by first name.",
    ],
    whatToSay: [
      "'You've got this — here are the two things to watch and one person to know.'",
    ],
    whatToCheck: [
      "Open tickets and who owns them.",
      "Any commitments you made (e.g. 'I'll be back in 10').",
      "Whether the super-user has the contact list.",
    ],
    whenToEscalate: "If the unit isn't stable enough for super-user-only coverage, request an extended consultant shift through command center.",
    keywords: k("super user", "super-user", "handoff to super", "transition"),
    related_ids: ["p3", "p4", "v1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_downtime_kit",
    title: "Downtime kit — what's in your bag",
    type: "checklist",
    summary: "The four things every consultant carries before stepping on the floor.",
    roles: k("all roles"), domains: k("downtime"), phases: k("pre-go-live", "cutover day 0"),
    urgency: 1, escalation: 1,
    first90: [
      "Stock your bag the night before, not the morning of.",
      "Confirm forms are the current version.",
      "Wear your watch — wall clocks can fail with the system.",
    ],
    whatToSay: [
      "'Carry it every shift, even the quiet ones — the day you don't is the day you need it.'",
    ],
    whatToCheck: [
      "Two pens, two colors.",
      "Pre-stocked downtime registration and identity forms.",
      "Printed contact list (paper, not phone).",
      "Wristwatch.",
    ],
    whenToEscalate: "If forms are not stocked at the unit you're covering, raise with command center before shift start.",
    keywords: k("downtime kit", "what to carry", "bag", "first shift", "pre-shift"),
    related_ids: ["c1", "c2", "v3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_first_15",
    title: "First 15 minutes of go-live day",
    type: "playbook",
    summary: "The first 15 minutes set the tone for the whole shift. Land calm, find the charge, watch twice.",
    roles: k("all roles"), domains: k("documentation"), phases: k("cutover day 0"),
    urgency: 2, escalation: 1,
    first90: [
      "Walk in slowly. Find the charge nurse within 5 minutes.",
      "Introduce yourself by first name and role.",
      "Ask: 'What's the workflow you're most worried about right now?'",
    ],
    whatToSay: [
      "'Hi, I'm [first name] — I'll be on this unit for the next several hours, wave me over.'",
    ],
    whatToCheck: [
      "Where the busiest workstations are.",
      "Which two roles are most exposed today.",
      "Whether printers and scanners are live before clinicians arrive.",
    ],
    whenToEscalate: "If a critical device or workflow is already broken at start of shift, escalate before the first user hits it.",
    keywords: k("first 15", "first 15 minutes", "go-live day", "day one", "first shift", "starting shift"),
    related_ids: ["l1", "p3", "c1"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_post_golive",
    title: "Post-go-live stabilization — what changes",
    type: "playbook",
    summary: "Coverage thins out in week 2-4. Shift from in-the-moment fixes to teach-the-teacher.",
    roles: k("all roles"), domains: k("documentation"), phases: k("optimization weeks 2-4", "post-go-live"),
    urgency: 1, escalation: 1,
    first90: [
      "Spend more time with super-users than with end-users.",
      "Bring patterns back to command center daily — not weekly.",
      "Identify three workflows that still need a job aid.",
    ],
    whatToSay: [
      "'Let's solve this for everyone on the unit, not just for you.'",
    ],
    whatToCheck: [
      "Which issues keep repeating across shifts.",
      "Which super-users are confident vs which still need shadowing.",
      "Whether documentation gaps are being captured.",
    ],
    whenToEscalate: "Recurring issue logged 3+ times in a week: escalate as a build / optimization candidate.",
    keywords: k("stabilization", "post go-live", "week 2", "week 3", "optimization"),
    related_ids: ["p3", "l3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_rumor_control",
    title: "Rumor control — incorrect floor guidance",
    type: "scenario",
    summary: "A rumor is spreading on the unit. Confirm with command first, then reset the room.",
    roles: k("all roles"), domains: k("documentation"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Do not reassure based on guess. Confirm with command center first.",
      "Move to the most visible spot on the unit.",
      "Speak before anyone asks — get ahead of the question.",
    ],
    whatToSay: [
      "'I just checked with command — here's what's actually happening.'",
      "'I'll stand here for the next ten minutes — find me with questions.'",
    ],
    whatToCheck: [
      "Where the rumor started and how it's traveling.",
      "Whether the charge nurse is aligned on the corrected message.",
      "Whether any clinician needs a 1:1 reset after.",
    ],
    whenToEscalate: "If misinformation is affecting patient care decisions, escalate to charge + command center immediately.",
    keywords: k("rumor", "wrong information", "panic", "false", "misinformation", "conflicting guidance"),
    related_ids: ["s3", "p4", "l5"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_stop_troubleshooting",
    title: "When to stop troubleshooting and escalate",
    type: "playbook",
    summary: "Three-strike rule. Time-box your floor troubleshooting before walking it up.",
    roles: k("all roles"), domains: k("documentation"), phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 3,
    first90: [
      "Set a 10-minute timer in your head the moment you sit down with an issue.",
      "If three reasonable attempts fail, stop and write the three sentences for escalation.",
      "Tell the clinician what you're doing and why — keep them in the loop.",
    ],
    whatToSay: [
      "'I've tried the three things I'd try first — I'm walking this up so we don't lose more time.'",
    ],
    whatToCheck: [
      "Have I confirmed scope (one user vs many)?",
      "Have I confirmed severity (workaround vs blocking)?",
      "Have I captured what I tried so the next person doesn't repeat it?",
    ],
    whenToEscalate: "10 minutes + 3 attempts + no progress = escalate. Patient-safety issues skip the timer entirely.",
    keywords: k("stop troubleshooting", "when to escalate", "give up", "time box", "ten minutes"),
    related_ids: ["p2", "l3", "c3"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_ed_triage",
    title: "ED-specific triage support",
    type: "ask_answer_seed",
    summary: "ED workflows compress everything — registration, orders, meds — into minutes. Prioritize the door.",
    roles: k("ed"), domains: k("registration", "order entry", "documentation"),
    phases: k("cutover day 0"),
    urgency: 4, escalation: 3,
    first90: [
      "Stand near the door / triage desk, not at a workstation.",
      "Watch one full triage-to-bed cycle without intervening.",
      "Confirm downtime paper is stocked at triage.",
    ],
    whatToSay: [
      "'I'll be at triage for the next hour — flag me on anything that backs up the door.'",
    ],
    whatToCheck: [
      "Door-to-triage time and triage-to-bed time.",
      "Whether identity bands are printing reliably.",
      "Whether time-sensitive workflows (stroke, STEMI, sepsis) have a tested fallback.",
    ],
    whenToEscalate: "Any door delay > usual baseline OR any time-critical workflow failing: page command center immediately.",
    keywords: k("ed", "emergency", "emergency department", "triage door"),
    related_ids: ["ll_registration_downtime", "ll_wristband_label", "p1"],
    sanitized_approved: true, status: "published",
  },
];

// --- Match engine -------------------------------------------------------

export type MatchQuality = "strong" | "related" | "general";

export interface AskAnswer {
  matchQuality: MatchQuality;
  matchLabel: string;
  title: string;
  shortAnswer: string;
  first90: string[];
  whatToSay: string[];
  whatToCheck: string[];
  whenToEscalate: string;
  sourceEntry: LaunchEntry | null;
  related: {
    playbooks: ContentItem[];
    checklists: ContentItem[];
    lessons: ContentItem[];
    scenarios: ContentItem[];
    videos: ContentItem[];
  };
  sources: { id: string; title: string; type: string }[];
}

function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function scoreEntry(entry: LaunchEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = [
    entry.title,
    entry.summary,
    entry.keywords.join(" "),
    entry.domains.join(" "),
    entry.roles.join(" "),
  ].join(" ").toLowerCase();
  let s = 0;
  for (const tk of tokens) {
    if (entry.keywords.some(kw => kw.toLowerCase().includes(tk))) s += 3;
    if (hay.includes(tk)) s += 1;
  }
  return s;
}

export function askLaunch(query: string): AskAnswer {
  const tokens = tokenize(query).filter(t => t.length > 2);
  const ranked = LAUNCH_LIBRARY
    .map(e => ({ e, s: scoreEntry(e, tokens) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s);

  const top = ranked[0];
  let matchQuality: MatchQuality = "general";
  let matchLabel = "General guidance";
  if (top) {
    if (top.s >= 5) { matchQuality = "strong"; matchLabel = "Strong match"; }
    else { matchQuality = "related"; matchLabel = "Related match"; }
  } else {
    matchLabel = "Best available Mizly match";
  }

  const entry = top?.e ?? LAUNCH_LIBRARY[0]; // safe fallback to first-15 / login

  const relatedItems = (entry.related_ids
    .map(id => itemById(id))
    .filter(Boolean) as ContentItem[]);

  const pickType = (t: ContentType) => relatedItems.filter(i => i.content_type === t).slice(0, 3);

  // Also pull additional related entries from launch-library (as pseudo-sources)
  const extraSources = ranked.slice(1, 4).map(r => ({
    id: r.e.id, title: r.e.title, type: r.e.type,
  }));
  const baseSource = top
    ? [{ id: entry.id, title: entry.title, type: entry.type }, ...extraSources]
    : [{ id: entry.id, title: entry.title, type: entry.type }];

  return {
    matchQuality,
    matchLabel,
    title: entry.title,
    shortAnswer: top
      ? entry.summary
      : `I couldn't find an exact match in the Mizly library for that question. Here is the closest playbook — confirm with your floor lead before acting.`,
    first90: entry.first90,
    whatToSay: entry.whatToSay,
    whatToCheck: entry.whatToCheck,
    whenToEscalate: entry.whenToEscalate,
    sourceEntry: top ? entry : entry, // always cite something
    related: {
      playbooks: pickType("playbook"),
      checklists: pickType("checklist"),
      lessons: pickType("lesson"),
      scenarios: pickType("scenario"),
      videos: pickType("video"),
    },
    sources: baseSource,
  };
}

export const STARTER_QUESTIONS = [
  "I can't log in - my password is not working.",
  "The printer is not printing.",
  "Where do I find my patient list?",
  "My barcode scanner is not reading.",
  "The provider cannot sign. What do I check first?",
  "The unit is getting conflicting instructions. What do I say?",
];

// Expose library content types for badges
export function badgeForLaunchType(t: LaunchType): { label: string; cls: string } {
  switch (t) {
    case "playbook":  return { label: "Playbook",  cls: "bg-warning/15 text-warning" };
    case "checklist": return { label: "Checklist", cls: "bg-success/15 text-success" };
    case "lesson":    return { label: "Lesson",    cls: "bg-primary-soft text-primary" };
    case "scenario":  return { label: "Scenario",  cls: "bg-secondary text-secondary-foreground" };
    case "video":     return { label: "Video",     cls: "bg-accent text-accent-foreground" };
    case "ask_answer_seed": return { label: "Mizly answer", cls: "bg-primary-soft text-primary" };
  }
}

// Avoid unused import warnings in some bundlers
export const _ITEMS_LEN = ITEMS.length;
