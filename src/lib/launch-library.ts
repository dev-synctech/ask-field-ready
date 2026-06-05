// Mizly Launch Library — vendor-neutral, PHI-free seeded go-live support content.
// Each entry powers Ask answers with a reliable structure:
// first 90 seconds, what to say, what to check, when to escalate, related content.
// TODO: REMOVE BEFORE PRODUCTION LAUNCH — replace with Supabase-backed content.

import { ITEMS, itemById, type ContentItem, type ContentType } from "./demo-data";
import { retrieveKbSupport, type KbSupport } from "./kb-retrieval";

export type LaunchType = ContentType | "ask_answer_seed";
export type VisualAidKind = "screenshot" | "video" | "tasklet";
export type VendorFamily = "epic" | "cerner" | "oracle_health" | "meditech" | "sunquest" | "philips_careevent" | "unknown";
export type AskAction = "place" | "sign" | "cosign" | "modify" | "discontinue" | "document" | "scan" | "schedule" | "route" | "reconcile" | "review" | "unknown";

export interface VisualAid {
  kind: VisualAidKind;
  title: string;
  note: string;
  callouts?: string[];
  href?: string;
}

export interface LiveGuide {
  doThisFirst: string;
  whereToLook: string;
  whatToClick: string;
  whatShouldHappen: string;
  ifYouDontSeeIt: string;
  whatToSay: string;
  checkThis: string[];
  escalateWhen: string;
}

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
  vendor_family?: Exclude<VendorFamily, "unknown">;
  action?: Exclude<AskAction, "unknown">;
  is_deep_flow?: boolean;
  nav_trail?: string;
  visual_url?: string | null;
  visual_callouts?: string[];
  // Structured answer payload
  first90: string[];
  whatToSay: string[];
  whatToCheck: string[];
  whenToEscalate: string;
  walkthrough?: string[];
  ifThatFails?: string[];
  visualAids?: VisualAid[];
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
    keywords: k("printer", "print", "printing", "wristband", "label", "printed document", "print job"),
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
    keywords: k(
      "order", "orders", "order entry", "can't find order", "cannot find order",
      "order not showing", "order not populating", "orders not populating",
      "can't put in order", "cannot put in order", "can't place order", "cannot place order",
      "where do I put in orders", "where to enter order", "where to place order",
      "epic orders", "epic order entry", "cerner orders", "oracle health orders", "powerchart orders",
      "place order"
    ),
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
    keywords: k(
      "sign", "signature", "order signature", "order signing", "clinical signature",
      "co-sign", "cosign", "can't sign", "cannot sign", "unable to sign", "won't sign",
      "can't sign order", "cannot sign order", "unable to sign order", "order won't sign",
      "submit", "approve"
    ),
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
  {
    id: "ll_schedule_columns",
    title: "Schedule columns - exact walkthrough",
    type: "playbook",
    summary: "Change the schedule view by confirming the right context, opening column/view options, applying the column change, then saving only if local policy allows.",
    roles: k("scheduling", "front desk", "all roles"),
    domains: k("scheduling", "personalization"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    first90: [
      "Open the exact schedule view the user is working from.",
      "Confirm the top filters first: location/department, date range, provider/resource, and schedule view/template.",
      "Look for View, Options, Columns, Display, or Personalize before assuming the column is missing.",
    ],
    whatToSay: [
      "'First, let's confirm you're in the right schedule view. Columns are usually view-specific.'",
      "'If the column option is not available, this may be a locked template or role permission issue, not user error.'",
    ],
    whatToCheck: [
      "Right schedule view/template, location/department, date range, and provider/resource filter.",
      "Column picker or view options: add, remove, reorder, apply.",
      "Whether the user can personalize the view or whether the template is centrally controlled.",
      "Screen width, zoom, and filters if the column is selected but still not visible.",
    ],
    whenToEscalate: "If the column is not in the available list, the view is locked, or the same column is missing for multiple users in the same role, escalate as a scheduling template/build request with the exact column name, view name, role, and location.",
    walkthrough: [
      "Go to the schedule screen the user is actually using.",
      "Confirm location/department, date range, provider/resource, and schedule view/template.",
      "Open View / Options / Columns / Display / Personalize.",
      "Find the column list. Check the needed column. If drag-and-drop is allowed, place it where the user expects it.",
      "Select Apply. Verify the column shows on the schedule line.",
      "Save as default/my view only if local policy allows. Otherwise leave it as a one-time view change.",
    ],
    ifThatFails: [
      "No Columns/View option: check whether the schedule view is locked by role or template.",
      "Column is selected but not visible: widen the schedule pane, reset zoom, clear filters, refresh once, then retry.",
      "Column is not listed: escalate as a template/build request with the exact column name and impacted role.",
      "Only one user affected: check personalization or permission. Whole team affected: treat it as a template/build issue.",
    ],
    visualAids: [
      {
        kind: "screenshot",
        title: "Annotated Mizly screenshot: column picker path",
        note: "Sanitized mock screen with numbered circles. No vendor UI, logos, patient data, or organization names.",
        callouts: [
          "1 - Confirm the right schedule view.",
          "2 - Open View / Options / Columns.",
          "3 - Check the column and Apply.",
          "4 - Save only if local policy allows.",
        ],
      },
      {
        kind: "tasklet",
        title: "Tap path",
        note: "Schedule view -> View/Options -> Columns/Display -> Apply -> Verify schedule line.",
        callouts: [
          "Use the user's actual schedule view.",
          "Stop and escalate if the view is locked or the column is missing.",
        ],
      },
      {
        kind: "video",
        title: "Changing schedule columns in 60 seconds",
        note: "Short Mizly training clip that follows the same steps.",
        href: "/videos",
      },
    ],
    keywords: k("schedule", "scheduling", "appointment", "columns", "column", "change columns", "schedule line", "line", "grid", "view", "personalize", "add column", "remove column", "show column", "column settings"),
    related_ids: ["p18", "c12", "v14"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_billing_triage",
    title: "Billing issue - split it into three lanes",
    type: "playbook",
    summary: "Do not troubleshoot billing as one big bucket. Split it into charge capture, coding/status, or account/coverage, then follow that lane.",
    roles: k("billing", "front desk", "all roles"),
    domains: k("billing", "charge capture", "registration"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    first90: [
      "Ask which lane is wrong: charge missing, code/status wrong, or account/coverage wrong.",
      "Confirm whether one account/encounter is affected or the issue is repeating across a role/team.",
      "Capture the exact visible status or field name without patient identifiers.",
    ],
    whatToSay: [
      "'Let's split this first. Is the charge missing, is the status/code wrong, or is the account/coverage wrong?'",
      "'I am going to capture the status and route this to the right owner instead of guessing.'",
    ],
    whatToCheck: [
      "Charge capture lane: encounter, department/location, provider/resource, completion status.",
      "Coding/status lane: documentation/order/procedure status and whether it is waiting for review.",
      "Account/coverage lane: registration/coverage/account selection and whether the right team owns correction.",
    ],
    whenToEscalate: "Escalate if money-impacting workflow is blocked, the wrong lane is unclear after the three checks, or the same issue affects multiple users/encounters. Include lane, scope, exact status/field, role, and callback.",
    walkthrough: [
      "Ask: 'Which one is wrong: charge missing, code/status wrong, or account/coverage wrong?'",
      "If charge missing: verify encounter, department/location, provider/resource, and whether charge capture was completed.",
      "If code/status wrong: verify documentation/order/procedure status and whether it is waiting for review.",
      "If account/coverage wrong: verify account/coverage selection and route to the registration/billing owner. Do not improvise corrections.",
      "Capture lane, scope, exact status/field, who is blocked, and callback path.",
    ],
    ifThatFails: [
      "If you cannot identify the lane in two minutes, escalate with 'billing lane unclear' and the exact visible status.",
      "If one user is affected, check role/permission/personalization first.",
      "If multiple users see it, treat it as workflow/build/routing until the owning team confirms.",
      "If patient care or checkout flow is blocked, escalate now and close the loop with the requester within five minutes.",
    ],
    visualAids: [
      {
        kind: "screenshot",
        title: "Annotated Mizly screenshot: billing lane decision tree",
        note: "Sanitized mock visual showing the three lanes only. No account numbers, patient identifiers, vendor screens, or organization names.",
        callouts: [
          "1 - Charge capture: missing or wrong charge.",
          "2 - Coding/status: review or completion status.",
          "3 - Account/coverage: ownership and routing.",
        ],
      },
      {
        kind: "tasklet",
        title: "Two-minute lane check",
        note: "Pick the lane, capture scope, capture exact status/field, route to the owner.",
        callouts: [
          "One user = check role or permission first.",
          "Multiple users = treat as workflow/build/routing until confirmed.",
        ],
      },
      {
        kind: "video",
        title: "Walking a billing issue to the right owner",
        note: "Short Mizly clip showing how to explain the lane and close the loop.",
        href: "/videos",
      },
    ],
    keywords: k("billing", "charge", "charges", "charge capture", "claim", "coding", "coverage", "account", "invoice", "bill", "payment", "revenue", "missing charge", "wrong charge"),
    related_ids: ["c3", "p2", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_bed_control",
    title: "Patient placement / bed control issue",
    type: "playbook",
    summary: "A bed assignment is unclear or a placement is stalled. Confirm request, status, and owner before escalating.",
    roles: k("bed control", "inpatient nurse", "registration", "all roles"),
    domains: k("transfer", "patient placement", "handoff"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3, escalation: 2,
    first90: [
      "Restate the request without PHI: 'one placement is unclear on this unit.'",
      "Confirm the patient's current location and the destination unit.",
      "Check whether a placement order or status exists — and who owns the next step.",
    ],
    whatToSay: [
      "'Before we escalate, let's confirm the request, the status, and the next owner.'",
      "'I'll hold here with you until we know who owns the next step.'",
      "'I'll close the loop with the requester in five minutes either way.'",
    ],
    whatToCheck: [
      "Is the placement request active, on hold, or missing?",
      "Is this one patient or several waiting on the same bed?",
      "Did the request come from the right role on the right unit?",
    ],
    whenToEscalate: "If ownership is unclear after the request + status + owner check, OR a time-critical workflow (ED holding, ICU transfer, post-op recovery) is waiting > 15 minutes, escalate to command center with scope, severity, and callback.",
    keywords: k(
      "bed", "bed assignment", "bed control", "placement", "patient placement",
      "transfer", "move", "cannot move", "stalls", "shift change",
      "who owns", "waiting on placement", "without phi", "handoff",
    ),
    related_ids: ["p17", "c11", "l16", "s10", "v13"],
    sanitized_approved: true, status: "published",
  },
  {
    id: "ll_message_center_overload",
    title: "Message-center overload or wrong-pool routing",
    type: "playbook",
    summary: "Sort messages by ownership, urgency, and routing lane before clearing anything.",
    roles: k("provider", "clinic staff", "all roles"),
    domains: k("messages", "in-basket", "routing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    first90: [
      "Ask whether the messages are personal, pool, proxy, or routed work.",
      "Sort urgent follow-up before routine cleanup.",
      "Check folder, owner, status, and date filters.",
    ],
    whatToSay: [
      "'First, let's separate what is yours from what belongs to a pool.'",
      "'Do not clear anything yet. We need to confirm ownership first.'",
    ],
    whatToCheck: [
      "Personal vs pool/team vs proxy ownership.",
      "Urgent follow-up, result, callback, or time-sensitive message.",
      "Folder, status filter, owner, date range, and proxy settings.",
    ],
    whenToEscalate: "If urgent items are trapped, messages route to the wrong owner, or multiple users see the same wrong pool, escalate to the message-center owner with pool, role, count, and callback.",
    walkthrough: [
      "Confirm message ownership: personal, pool, proxy, or routed.",
      "Sort urgent follow-up before routine cleanup.",
      "Check folder, owner, status, and date filters.",
    ],
    ifThatFails: [
      "Wrong owner or pool: stop cleanup and escalate routing.",
      "Urgent follow-up trapped: notify the floor lead now.",
      "Multiple users affected: capture pool, role, count, and callback.",
    ],
    keywords: k("in-basket", "in basket", "inbox", "message", "messages", "47 messages", "200 items", "message overload", "too many messages", "proxy", "routing", "none are mine", "manage messages", "message center"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_registration_start",
    title: "New patient registration - where to start",
    type: "playbook",
    summary: "Start registration with identity, arrival context, and encounter type before optional fields.",
    roles: k("registration", "front desk"),
    domains: k("registration", "identity"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    first90: [
      "Confirm the required identity fields first.",
      "Choose the correct arrival or encounter type.",
      "Search for an existing record before creating anything new.",
    ],
    whatToSay: [
      "'Let's start with identity and encounter type before optional fields.'",
      "'If we see a possible match, we pause before creating anything new.'",
    ],
    whatToCheck: [
      "Identity fields required by local policy.",
      "Arrival reason, encounter type, and coverage lane.",
      "Existing-record search and duplicate-match warnings.",
    ],
    whenToEscalate: "If identity is unclear, a possible duplicate appears, or encounter type is uncertain, escalate to the registration lead before proceeding.",
    walkthrough: [
      "Confirm identity fields and arrival reason.",
      "Select the correct encounter type.",
      "Search before creating anything new.",
    ],
    ifThatFails: [
      "Possible match appears: stop and ask the registration lead.",
      "Encounter type unclear: pause before choosing a path.",
      "System slows or freezes: switch to downtime registration guidance.",
    ],
    keywords: k("register", "registration", "new registration", "new patient registration", "new patient", "check in", "check-in", "existing patient", "already in the system", "where do i start", "front desk", "encounter type", "arrival"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_duplicate_record",
    title: "Duplicate record or identity mismatch",
    type: "playbook",
    summary: "Stop record creation and route identity mismatches to the right owner before anyone edits.",
    roles: k("registration", "front desk", "all roles"),
    domains: k("registration", "identity", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    first90: [
      "Stop new record creation immediately.",
      "Preserve both records without merging or deleting.",
      "Capture the mismatch type without patient identifiers.",
    ],
    whatToSay: [
      "'Pause here. We do not merge or choose records from memory.'",
      "'I'll route this to the identity owner and close the loop.'",
    ],
    whatToCheck: [
      "Whether a new record was already created.",
      "Mismatch type: name, date, account, visit, or duplicate candidate.",
      "Which workflow is blocked and how urgent it is.",
    ],
    whenToEscalate: "Any duplicate or identity mismatch tied to active care should escalate immediately to the registration/identity owner or command center.",
    walkthrough: [
      "Stop new record creation immediately.",
      "Preserve both records without editing.",
      "Route to the registration identity owner.",
    ],
    ifThatFails: [
      "Active care is waiting: escalate to command center immediately.",
      "Owner unclear: use the registration lead path.",
      "Someone already edited a record: capture what changed and escalate.",
    ],
    keywords: k("duplicate", "duplicate record", "two records", "same person", "already registered", "already registration", "identity mismatch", "wrong record", "merge record", "mrn duplicate"),
    related_ids: ["p21", "c15", "v17"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_medication_exception",
    title: "Medication waste, refusal, late dose, or hard stop",
    type: "playbook",
    summary: "Treat medication exceptions as safety moments and confirm order status before advising.",
    roles: k("inpatient nurse", "pharmacy support"),
    domains: k("medication", "bcma", "mar", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    first90: [
      "Pause the medication workflow before bypassing anything.",
      "Name the exception: waste, refusal, late, held, or hard stop.",
      "Confirm the order status before advising next step.",
    ],
    whatToSay: [
      "'Let's pause. This is a medication-safety moment, not just documentation.'",
      "'I need to confirm the order status and local policy path first.'",
    ],
    whatToCheck: [
      "Exception type: waste, refusal, late dose, held dose, or hard stop.",
      "Order status: active, changed, discontinued, or pending review.",
      "Witness, pharmacy, or charge nurse requirements.",
    ],
    whenToEscalate: "If policy is unclear, a controlled workflow is involved, a hard stop appears, or care is delayed, escalate to charge nurse/pharmacy support.",
    walkthrough: [
      "Pause before bypassing the med workflow.",
      "Confirm exception type and order status.",
      "Check witness or policy requirement.",
    ],
    ifThatFails: [
      "Policy unclear: escalate to charge nurse/pharmacy support.",
      "Hard stop remains: do not bypass from memory.",
      "Care delayed: escalate with scope and callback now.",
    ],
    keywords: k("waste", "partial dose", "waste dose", "wasting", "refusal", "refused med", "late dose", "held dose", "hard stop", "medication", "med", "mar", "bcma", "controlled", "anesthesia", "macro", "right drugs", "standard general anesthesia"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_vitals_flowsheet",
    title: "Vitals or flowsheet not found",
    type: "playbook",
    summary: "Find vitals by chart context, flowsheet group, time column, and role view.",
    roles: k("inpatient nurse", "clinical staff"),
    domains: k("documentation", "vitals", "flowsheet"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    first90: [
      "Confirm chart, encounter, and role view.",
      "Find the flowsheet group before searching rows.",
      "Check the time column and date range.",
    ],
    whatToSay: [
      "'Let's confirm the chart context first. Flowsheet rows are usually view-specific.'",
      "'If the same row is missing for the team, we escalate as build/template.'",
    ],
    whatToCheck: [
      "Correct chart, encounter, role view, and flowsheet group.",
      "Time column, date range, and device-imported values.",
      "Whether one user or multiple users cannot see the row.",
    ],
    whenToEscalate: "If the same vitals row is missing for multiple users, the template is wrong, or time-sensitive vitals are blocked, escalate to clinical documentation/build owner.",
    walkthrough: [
      "Confirm chart, encounter, and role view.",
      "Open the right flowsheet group.",
      "Check time column and imported values.",
    ],
    ifThatFails: [
      "Row missing for one user: check role view or personalization.",
      "Row missing for multiple users: escalate build/template.",
      "Time-sensitive vitals blocked: escalate to clinical documentation owner.",
    ],
    keywords: k("vitals", "vital signs", "flowsheet", "flow sheet", "chart vitals", "document vitals", "where is the flowsheet", "row missing", "device imported", "manual entry"),
    related_ids: ["p23", "c17", "v19"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_pediatric_result_range",
    title: "Pediatric result or reference-range concern",
    type: "playbook",
    summary: "Pause unexpected pediatric or specialty result ranges and escalate before clinical action.",
    roles: k("inpatient nurse", "provider", "specialty support"),
    domains: k("results", "pediatrics", "nicu", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    first90: [
      "Do not reassure from memory.",
      "Confirm age, specialty, weight, or location context.",
      "Ask whether active care is waiting on the result.",
    ],
    whatToSay: [
      "'I am not going to guess on a result range. Let's escalate this cleanly.'",
      "'We will confirm context before anyone acts on it.'",
    ],
    whatToCheck: [
      "Age, specialty, weight-based, or location context.",
      "One result vs multiple results or users.",
      "Whether a clinician is about to act on the result.",
    ],
    whenToEscalate: "Any questionable pediatric, NICU, or specialty result range being used for active care should escalate to clinical owner or command center immediately.",
    walkthrough: [
      "Pause and do not reassure from memory.",
      "Confirm age or specialty context.",
      "Escalate if active care is waiting.",
    ],
    ifThatFails: [
      "Clinical action pending: escalate immediately.",
      "Multiple users see the issue: treat as build/result configuration.",
      "Context unclear: route to clinical owner.",
    ],
    keywords: k("pediatric", "pediatrics", "nicu", "reference range", "reference ranges", "adult reference", "adult ranges", "lab result", "lab results", "results", "wrong range", "weight based", "weight-based"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_mother_baby_linking",
    title: "Mother-baby chart linking question",
    type: "playbook",
    summary: "Confirm relationship context and ownership before linking or unlinking related charts.",
    roles: k("women's health", "inpatient nurse", "specialty support"),
    domains: k("mother-baby", "chart linking", "specialty safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    first90: [
      "Pause before creating or repairing links.",
      "Confirm the workflow requiring the link.",
      "Identify the local owner for cross-chart links.",
    ],
    whatToSay: [
      "'This is a cross-chart safety step. We are going to verify, not guess.'",
      "'I will confirm the local owner before anyone changes the link.'",
    ],
    whatToCheck: [
      "Workflow requiring the relationship link.",
      "Whether both chart contexts are correct.",
      "Local owner for linking, unlinking, or repair.",
    ],
    whenToEscalate: "If ownership is unclear, a wrong link may exist, or the specialty workflow is blocked, escalate to unit lead/clinical informatics.",
    walkthrough: [
      "Pause before changing any link.",
      "Confirm workflow and relationship context.",
      "Escalate to the local link owner.",
    ],
    ifThatFails: [
      "Possible wrong link: stop and escalate immediately.",
      "Owner unclear: use unit lead or clinical informatics.",
      "Active workflow blocked: escalate with severity and callback.",
    ],
    keywords: k("mother baby", "mother-baby", "baby chart", "mother chart", "link baby", "link the baby", "link mother's chart", "linking charts", "chart link", "cross chart", "newborn", "ob", "labor delivery"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_voice_recognition",
    title: "Voice recognition not working",
    type: "playbook",
    summary: "Separate microphone, profile, active field, and workstation before escalating dictation.",
    roles: k("provider", "clinical staff"),
    domains: k("voice recognition", "dictation", "device"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    first90: [
      "Confirm the right microphone is selected.",
      "Confirm the correct voice profile is loaded.",
      "Place the cursor in a dictation-ready field.",
    ],
    whatToSay: [
      "'Let's split this into microphone, profile, field, or workstation.'",
      "'Try one short phrase after we confirm the active text field.'",
    ],
    whatToCheck: [
      "Microphone selected, connected, and not muted.",
      "Correct user profile/session loaded.",
      "Cursor is inside a dictation-ready text field.",
    ],
    whenToEscalate: "If microphone, profile, active field, and one second workstation do not fix it, escalate to device or voice-recognition support.",
    walkthrough: [
      "Check microphone input and mute state.",
      "Confirm voice profile/session is correct.",
      "Test in one dictation-ready field.",
    ],
    ifThatFails: [
      "Second workstation works: report device issue.",
      "Profile will not load: escalate voice-recognition support.",
      "No field accepts dictation: escalate application/workflow lane.",
    ],
    keywords: k("voice recognition", "dictation", "dictate", "microphone", "mic", "voice profile", "speech", "speech recognition", "not working with the new system", "dragon"),
    related_ids: ["p26", "c20", "v22"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_bed_board_capacity",
    title: "Bed board or capacity view question",
    type: "playbook",
    summary: "Read capacity by filter, status legend, pending work, owner, and callback time.",
    roles: k("bed control", "charge nurse", "registration"),
    domains: k("bed control", "capacity", "placement"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    first90: [
      "Confirm unit, service, and time filter.",
      "Read the bed status legend before answering.",
      "Separate available, assigned, dirty, blocked, and pending beds.",
    ],
    whatToSay: [
      "'Let's read the status first. I will not promise a bed from color alone.'",
      "'I will confirm the owner and callback time before reporting back.'",
    ],
    whatToCheck: [
      "Unit/service filter, status legend, and time context.",
      "Pending assignment, cleaning, transfer, or discharge dependencies.",
      "Who owns the next bed status change.",
    ],
    whenToEscalate: "If capacity is unclear, placement is time-critical, or status ownership is unclear, escalate to bed-control/command center with scope and callback.",
    walkthrough: [
      "Confirm unit/service filter and time context.",
      "Read status legend before reporting capacity.",
      "Name owner and callback time.",
    ],
    ifThatFails: [
      "Status owner unclear: escalate to bed-control/command center.",
      "Time-critical placement waiting: escalate now.",
      "Board conflicts with floor report: verify with placement owner.",
    ],
    keywords: k("bed board", "available beds", "all available beds", "capacity", "hospital capacity", "see beds", "bed status", "dirty bed", "pending bed", "blocked bed", "bed assignment", "bed control", "placement board"),
    related_ids: ["p27", "c21", "v23"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_attestation_cosign",
    title: "Attestation or cosign routing question",
    type: "playbook",
    summary: "Confirm source action, owner role, routing status, and callback before explaining attestation.",
    roles: k("provider", "inpatient nurse", "clinical staff"),
    domains: k("attestation", "cosign", "orders", "messages"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    visual_url: "/visual-guides/attestation-cosign-routing.svg",
    visual_callouts: [
      "Confirm what created the signature task.",
      "Check who owns the next signature.",
      "Verify task status and routing visibility.",
      "Escalate with owner, status, and callback if blocked.",
    ],
    first90: [
      "Confirm what action created the attestation or cosign.",
      "Identify who owns the next signature by role.",
      "Check whether the owner can see the task.",
    ],
    whatToSay: [
      "'Let's confirm who owns the next signature before we chase screens.'",
      "'I will not guess the rule. I will confirm the routing and owner.'",
    ],
    whatToCheck: [
      "Source action that created the attestation/cosign.",
      "Owner role, task status, queue/pool, and routing visibility.",
      "Whether active orders, notes, or patient flow are blocked.",
    ],
    whenToEscalate: "If attestation or cosign blocks active work, escalate to clinical documentation/order owner with source action, owner role, status, and callback.",
    walkthrough: [
      "Confirm source action and owner role.",
      "Check task status and routing queue.",
      "Escalate if active work is blocked.",
    ],
    ifThatFails: [
      "Owner cannot see task: escalate routing.",
      "Clinical rule unclear: route to documentation/order owner.",
      "Active work blocked: escalate with callback now.",
    ],
    keywords: k("attestation", "attest", "cosign", "co-sign", "co sign", "verbally told me", "verbal order", "doctor verbally", "resident", "attending", "signature task", "order cosign"),
    related_ids: ["p28", "c22", "v24"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_critical_result_notification",
    title: "Critical result notification support",
    type: "playbook",
    summary: "Treat critical result alerts as time-sensitive and confirm owner, status, and callback.",
    roles: k("provider", "inpatient nurse", "clinical staff"),
    domains: k("results", "critical notification", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    first90: [
      "Treat the notification as time-sensitive.",
      "Confirm result type, alert status, and responsible role.",
      "Check whether acknowledgement is blocked.",
    ],
    whatToSay: [
      "'This is a critical-result workflow. I will not interpret it, but I will route it fast.'",
      "'Let's confirm who owns acknowledgement and whether they can see it.'",
    ],
    whatToCheck: [
      "Result type, alert status, and responsible role.",
      "Whether acknowledgement/routing is visible and working.",
      "Whether active clinical action is waiting on the notification.",
    ],
    whenToEscalate: "If a critical result notification cannot be acknowledged, routed, or owned, escalate to clinical owner or command center immediately.",
    walkthrough: [
      "Confirm result type and alert status.",
      "Check responsible owner can acknowledge.",
      "Escalate if acknowledgement is blocked.",
    ],
    ifThatFails: [
      "Owner cannot acknowledge: escalate immediately.",
      "Active care waiting: command center now.",
      "Routing unclear: clinical owner owns next step.",
    ],
    keywords: k("critical lab", "critical value", "critical result", "flagged critical", "lab value", "lab result", "notification", "alert", "acknowledge", "acknowledgement", "notify provider"),
    related_ids: ["p29", "c23", "v25"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_specialty_documentation",
    title: "Specialty safety documentation path",
    type: "playbook",
    summary: "Confirm specialty workflow, role view, and required section before documenting.",
    roles: k("inpatient nurse", "specialty support", "provider"),
    domains: k("documentation", "specialty", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    first90: [
      "Name the exact specialty workflow first.",
      "Confirm role view and encounter context.",
      "Find the required section before fields.",
    ],
    whatToSay: [
      "'Let's find the required section first so we do not document this in the wrong place.'",
      "'For safety workflows, we confirm the owner instead of guessing a nearby field.'",
    ],
    whatToCheck: [
      "Workflow type and required documentation section.",
      "Role view, encounter context, and timing.",
      "Local owner for missing or locked specialty section.",
    ],
    whenToEscalate: "If a required safety documentation section is missing or a specialty workflow is blocked, escalate to clinical documentation owner.",
    walkthrough: [
      "Name workflow type before hunting fields.",
      "Confirm role view and encounter context.",
      "Find required section before entry.",
    ],
    ifThatFails: [
      "Required section missing: escalate documentation owner.",
      "User wants nearby field: stop and confirm policy.",
      "Active specialty workflow blocked: escalate now.",
    ],
    keywords: k("surgical time-out", "surgical timeout", "time-out", "instrument count", "sponges", "sharps", "ventilator", "vent settings", "suicide risk", "risk assessment", "involuntary hold", "fetal heart", "fetal monitoring", "triage assessment", "esi scoring", "fall precautions", "wrong field", "document surgical", "document fetal", "document ventilator"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_weight_based_medication",
    title: "Weight-based medication or pediatric dose concern",
    type: "playbook",
    summary: "Pause dose questions and confirm weight context, order status, and review owner.",
    roles: k("inpatient nurse", "pharmacy support", "provider"),
    domains: k("medication", "pediatrics", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    first90: [
      "Do not calculate the dose from memory.",
      "Confirm weight source, time, and unit.",
      "Check order status before administration.",
    ],
    whatToSay: [
      "'I am not going to calculate this from memory. Let's verify the source and owner.'",
      "'If the dose context is unclear, we escalate before giving it.'",
    ],
    whatToCheck: [
      "Weight source, time captured, and unit of measure.",
      "Order status and whether pharmacy review is required.",
      "Age/specialty context and clinical owner.",
    ],
    whenToEscalate: "If weight, dose, unit of measure, or order status is unclear before administration, escalate to pharmacy/clinical owner immediately.",
    walkthrough: [
      "Do not calculate dose from memory.",
      "Confirm weight source and unit.",
      "Escalate before administration if unclear.",
    ],
    ifThatFails: [
      "Unit of measure unclear: stop and escalate.",
      "Pharmacy review pending: do not proceed.",
      "Dose questioned before administration: escalate immediately.",
    ],
    keywords: k("weight based", "weight-based", "calculated by weight", "dose calculated", "baby dose", "pediatric dose", "neonatal dose", "weight dose", "wrong dose", "doses calculated by weight"),
    related_ids: ["p31", "c25", "v27"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_med_doc_mismatch_lispro",
    title: "Insulin dose looks like it was charted on the wrong row",
    type: "playbook",
    summary: "If a medication dose shows on a row that does not match how it was given, use the approved correction workflow and escalate before changing a signed record.",
    roles: k("inpatient nurse", "pharmacy support", "clinical staff"),
    domains: k("medication", "flowsheet", "documentation"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    vendor_family: "epic",
    action: "modify",
    is_deep_flow: false,
    visual_url: null,
    first90: [
      "On the MAR - open the dose entry and compare route.",
      "Beside you - flag preceptor or charge RN before changes.",
      "In the system - use the approved correction workflow.",
    ],
    whatToSay: [
      "'Let's pause before changing a signed medication record.'",
      "'I want your preceptor or charge RN with us before this correction.'",
    ],
    whatToCheck: [
      "Medication route, administration status, and duplicate entries.",
      "Whether the mismatch is MAR documentation, flowsheet display, or build mapping.",
      "Facility-approved correction workflow and required reason comment.",
    ],
    whenToEscalate: "If correction is greyed out, role access is blocked, duplicate documentation is possible, or med safety is affected, escalate to pharmacy or the unit super-user. Do not delete a signed entry on your own.",
    walkthrough: [
      "On the MAR - open dose entry and compare route.",
      "Beside you - flag preceptor or charge RN.",
      "In the system - use approved correction workflow.",
    ],
    ifThatFails: [
      "If the correction option is greyed out, escalate to pharmacy or the unit super-user.",
      "If duplicate documentation is possible, stop and capture what you see.",
      "Do not delete a signed entry on your own.",
    ],
    keywords: k("insulin", "lispro", "humalog", "injection", "injection row", "insulin drip", "drip row", "drip", "infusion", "subcutaneous", "subq", "flowsheet wrong", "wrong flowsheet", "wrong row", "mar", "medication administration record", "epic lispro", "epic drip row", "epic mar", "epic flowsheet", "cerner mar", "oracle health mar", "correct medication documentation"),
    related_ids: ["p32", "c26", "v28"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_treatment_plan_locked",
    title: "Treatment plan line is greyed out - what now",
    type: "playbook",
    summary: "When a treatment plan line will not delete, it is usually locked by status. Use the supported status/edit workflow instead of forcing a delete.",
    roles: k("dental provider", "clinic staff", "front desk"),
    domains: k("dental", "treatment plan", "visit signing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "discontinue",
    is_deep_flow: false,
    visual_url: null,
    first90: [
      "On the plan - compare plan status and line status.",
      "In the editor - use the supported status field.",
      "Before signing - confirm the change with the provider.",
    ],
    whatToSay: [
      "'Greyed out usually means status, ownership, lock, or permission.'",
      "'Let's use the supported status path instead of forcing a delete.'",
    ],
    whatToCheck: [
      "Pending/accepted/signed/locked status.",
      "Owner role and current user's delete/edit permission.",
      "Visit state, signature state, charge/treatment linkage, and encounter lock.",
    ],
    whenToEscalate: "If the line status is locked too, the plan itself may be locked. Ask the provider or build/security owner to reopen it through the supported edit path.",
    walkthrough: [
      "On the plan - compare plan and line status.",
      "In the editor - use supported status field.",
      "Before signing - confirm with the provider.",
    ],
    ifThatFails: [
      "User lacks permission: route security/workflow owner.",
      "Visit lock active: escalate with visit state.",
      "Signing blocked: do not force sign; escalate cleanly.",
    ],
    keywords: k("dental", "wisdom", "treatment plan", "pending treatment plan", "delete treatment plan", "edit treatment plan", "greyed out", "grayed out", "delete button", "right click", "can't sign", "cannot sign", "sign visit", "epic wisdom", "epic dental"),
    related_ids: ["p33", "c27", "v29"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_or_scheduling_codes",
    title: "OR booking needs the surgeon's preferences",
    type: "playbook",
    summary: "OR cases may pull procedure codes, equipment, and case length from the surgeon's preference list. Start there before finalizing the booking.",
    roles: k("scheduler", "secretary", "front desk"),
    domains: k("scheduling", "procedure booking", "codes"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "schedule",
    is_deep_flow: true,
    nav_trail: "From the OR schedule -> Case Request -> Surgeon Card -> Preference List",
    visual_url: null,
    first90: [
      "In the case request - open the surgeon card.",
      "On the preference list - pick the planned procedure.",
      "On the booking - review codes, equipment, and length.",
    ],
    whatToSay: [
      "'Let's find the source first: order, preference list, or scheduling code list.'",
      "'We won't pick a similar code just to finish the appointment.'",
    ],
    whatToCheck: [
      "Procedure type, provider, location, and booking context.",
      "Order/request, preference list, scheduling code list, or provider preference source.",
      "Whether code list is missing, locked, filtered, or linked to a different provider context.",
    ],
    whenToEscalate: "If expected procedure codes are missing, locked, or provider-specific codes do not load, escalate to scheduling/procedure build owner with provider, procedure type, location, and callback.",
    walkthrough: [
      "In the case request - open the surgeon card.",
      "On the preference list - pick planned procedure.",
      "On the booking - review carried-over details.",
    ],
    ifThatFails: [
      "Code missing: do not choose a look-alike.",
      "Provider context wrong: correct context first.",
      "List locked or empty: escalate scheduling/procedure owner.",
    ],
    keywords: k("or procedure", "procedure", "book an appt", "book appointment", "scheduling codes", "doctor codes", "doctor's codes", "provider codes", "secretary", "preference list", "procedure code", "case request", "surgery scheduling", "periop", "epic scheduling", "epic cadence", "cerner scheduling", "oracle health scheduling"),
    related_ids: ["p34", "c28", "v30"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_ambulation_no_option",
    title: "Can't find wheelchair-to-bathroom under Transport",
    type: "playbook",
    summary: "Wheelchair-to-bathroom belongs with Mobility documentation, not off-unit Transport. Start in the mobility/ADL area before escalating.",
    roles: k("inpatient nurse", "clinical staff", "rehab support"),
    domains: k("documentation", "mobility", "flowsheet"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "cerner",
    action: "document",
    is_deep_flow: false,
    visual_url: "/visual-guides/ambulation-mobility-option.svg",
    visual_callouts: [
      "Start in ADL or Mobility, not off-unit transport.",
      "Expand collapsed rows before calling the option missing.",
      "Capture assist/device details in the approved field.",
      "Escalate if the option is missing for multiple users.",
    ],
    first90: [
      "In the ADL section - look under Mobility.",
      "Inside Mobility - expand the collapsed wheelchair options.",
      "After selecting - review timestamp and initials before signing.",
    ],
    whatToSay: [
      "'Let's name what actually happened before we pick a category.'",
      "'If the exact option is missing for everyone, that is a documentation-build question.'",
    ],
    whatToCheck: [
      "Actual activity: ambulated, transferred, transported, or toileted.",
      "Assist level, device, wheelchair use, bathroom destination, and local category.",
      "Whether 'other/comment' is allowed or structured documentation is required.",
    ],
    whenToEscalate: "If the required mobility option is missing, policy is unclear, or multiple users cannot document the activity, escalate to clinical documentation owner.",
    walkthrough: [
      "In the ADL section - look under Mobility.",
      "Inside Mobility - expand wheelchair options.",
      "After selecting - review timestamp and initials.",
    ],
    ifThatFails: [
      "Exact option missing: check local comment policy.",
      "Team-wide gap: escalate documentation build.",
      "Safety/therapy tracking affected: escalate sooner.",
    ],
    keywords: k("ambulated", "ambulate", "ambulation", "bathroom", "wheelchair", "ambulated to bathroom", "mobility", "activity", "transfer", "assistive device", "flowsheet option", "no options", "category", "toileting", "epic flowsheet", "cerner flowsheet", "oracle health flowsheet"),
    related_ids: ["p35", "c29", "v31"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_scan_document_workflow",
    title: "Scanning a paper document into the chart",
    type: "playbook",
    summary: "Paper documents go through Media Manager: choose document type, scan, then verify the document landed on the correct encounter.",
    roles: k("front desk", "registration", "clinic staff"),
    domains: k("scanning", "documents", "media"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "scan",
    is_deep_flow: true,
    nav_trail: "From the patient chart -> Top toolbar -> Media Manager -> Add New Media",
    visual_url: null,
    first90: [
      "Top toolbar - open Media Manager inside the chart.",
      "In Media Manager - add media and pick document type.",
      "After scanning - review encounter, pages, and image quality.",
    ],
    whatToSay: [
      "'Let's pick the document type and encounter first so the scan lands in the right place.'",
      "'After scanning, we verify page count and image quality before closing.'",
    ],
    whatToCheck: [
      "Document type, encounter context, scan/upload route, and approved document shell.",
      "Scanner availability, page count, image quality, and privacy check.",
      "Whether document type or encounter shell is missing or locked.",
    ],
    whenToEscalate: "If scanner is unavailable, document type is missing, encounter shell is unavailable, or wrong-attachment risk exists, escalate to registration/document-management owner.",
    walkthrough: [
      "Top toolbar - open Media Manager inside the chart.",
      "In Media Manager - pick the document type.",
      "After scanning - review encounter and image quality.",
    ],
    ifThatFails: [
      "Document type missing: escalate document-management owner.",
      "Scanner unavailable: route device support.",
      "Wrong encounter risk: stop and confirm owner.",
    ],
    keywords: k("scan", "scanning", "consent", "paper consent", "scan consent", "chart", "media manager", "media", "add new media", "document type", "encounter", "scanned document", "scan document", "upload document", "document shell", "scan button", "epic media manager", "epic scanning", "cerner scanning", "oracle health scanning"),
    related_ids: ["p36", "c30", "v32"],
    sanitized_approved: true,
    status: "published",
  },

  // Pack 03 - mined from scrubbed workflow inventory and transcripts.
  {
    id: "ll_powerchart_patient_context",
    title: "Wrong chart, encounter, or context before action",
    type: "playbook",
    summary: "If a user is unsure they are in the right chart or visit, stop the workflow and verify context before documenting, ordering, or printing.",
    roles: k("all roles", "provider", "inpatient nurse", "front desk"),
    domains: k("navigation", "patient context", "encounter"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "From the chart banner -> Patient identifiers -> Encounter/visit context -> Current activity",
    visual_url: null,
    first90: [
      "Stop the next click until context is verified.",
      "Read chart banner, encounter, location, and date aloud.",
      "Confirm the action belongs in this visit before continuing.",
    ],
    whatToSay: [
      "'Pause here. We verify the chart and encounter before we do anything else.'",
      "'I am checking context, not clinical content.'",
    ],
    whatToCheck: [
      "Chart banner, patient identifiers, encounter type, location, and visit date.",
      "Whether the user opened the chart from a worklist, schedule, message, or search result.",
      "Whether the planned action belongs to the current encounter.",
    ],
    whenToEscalate: "If identity, encounter, or visit ownership is unclear, escalate to the registration/identity owner or floor lead before any action is taken.",
    walkthrough: [
      "On the banner - verify identifiers and encounter.",
      "In the visit list - confirm location and date.",
      "Before action - confirm this is the correct workflow context.",
    ],
    ifThatFails: [
      "Encounter unclear: stop and route to registration/identity owner.",
      "Wrong chart risk: do not document, order, print, or scan.",
      "Active care waiting: escalate through the floor lead now.",
    ],
    keywords: k("wrong chart", "wrong patient", "wrong encounter", "wrong visit", "patient context", "encounter context", "chart banner", "visit context", "powerchart context", "verify patient", "verify encounter", "opened wrong chart", "current encounter"),
    related_ids: ["p21", "c15", "v17"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_patient_list_missing_patient",
    title: "Patient is missing from a list or worklist",
    type: "playbook",
    summary: "When a patient is not on a list, check filters, relationship, location, and assignment before assuming the patient is missing.",
    roles: k("provider", "inpatient nurse", "clinic staff"),
    domains: k("patient list", "worklist", "assignment"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "From patient list/worklist -> Filters -> Location/relationship -> Refresh",
    visual_url: null,
    first90: [
      "Confirm the user is on the expected list.",
      "Check location, relationship, date, and status filters.",
      "Refresh once after filters are corrected.",
    ],
    whatToSay: [
      "'Let's check the list rules before we call the patient missing.'",
      "'One filter can hide the right patient.'",
    ],
    whatToCheck: [
      "List name, location, provider/team relationship, date range, and discharge/active status.",
      "Whether the patient appears for another role or on a different list.",
      "Whether the assignment or relationship needs to be updated by the owning team.",
    ],
    whenToEscalate: "If filters are correct and the patient is still missing for multiple users or a care task is blocked, escalate to the list/worklist owner with role, list name, location, and callback.",
    walkthrough: [
      "On the list - confirm list name.",
      "In filters - check location, status, and relationship.",
      "After refresh - compare one other approved list view.",
    ],
    ifThatFails: [
      "One user affected: check personalization, role, or relationship.",
      "Multiple users affected: escalate list/worklist build.",
      "Care task blocked: route through floor lead with callback.",
    ],
    keywords: k("patient list", "worklist", "patient not on list", "missing from list", "not showing on list", "my list", "provider list", "rounding list", "location filter", "relationship filter", "refresh list", "patient not showing", "powerchart list"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_recurring_medication_renewal",
    title: "Recurring medication or renewal is not showing",
    type: "playbook",
    summary: "For recurring medication questions, confirm order status, medication list context, renewal lane, and pharmacy review before advising.",
    roles: k("provider", "clinic nurse", "pharmacy support"),
    domains: k("medication", "orders", "renewal"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    first90: [
      "Confirm whether this is new, refill, renew, or discontinue.",
      "Check active, historical, pending, and expired medication views.",
      "Confirm pharmacy or provider review status.",
    ],
    whatToSay: [
      "'Let's name the lane first: new, refill, renew, or stop.'",
      "'I will not advise a medication change from memory.'",
    ],
    whatToCheck: [
      "Medication list view, order status, expiration, pending status, and pharmacy review.",
      "Whether the user is in the right encounter and role context.",
      "Whether local policy requires provider, pharmacy, or nurse ownership.",
    ],
    whenToEscalate: "If medication status, renewal ownership, or pharmacy review is unclear, escalate to pharmacy support or the clinical owner before the medication workflow continues.",
    walkthrough: [
      "Name the medication lane.",
      "Check active, pending, historical, and expired views.",
      "Confirm owner before continuing.",
    ],
    ifThatFails: [
      "Medication not visible: check encounter and view filters.",
      "Ownership unclear: escalate to pharmacy/clinical owner.",
      "Patient care waiting: route with urgency and callback.",
    ],
    keywords: k("recurring medication", "recurring med", "refill", "renewal", "renew medication", "medication not showing", "med not showing", "active meds", "pending medication", "expired medication", "pharmacy review", "prescription renewal", "med list", "medication list"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_smarttool_missing",
    title: "SmartPhrase, SmartText, SmartList, or SmartLink is missing",
    type: "playbook",
    summary: "A SmartPhrase, SmartText, SmartList, or SmartLink you expected isn't showing up in the note.",
    roles: k("provider", "clinic staff", "all roles"),
    domains: k("documentation", "personalization", "smarttools"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    is_deep_flow: true,
    nav_trail: "From note editor -> Insert/search tool -> Personal/shared tools -> Template owner",
    visual_url: null,
    first90: [
      "Identify the tool type before troubleshooting.",
      "Search exact name and one known synonym.",
      "Check personal vs shared ownership.",
    ],
    whatToSay: [
      "'Let's figure out which kind of tool this is first, so we ask the right person.'",
      "'If it's yours, we fix it in personalization. If it belongs to the team, we route it.'",
    ],
    whatToCheck: [
      "What kind of tool you're looking for: a phrase, a text block, a pick list, or a link.",
      "The exact name (and one likely alternate spelling), and whether it's your personal tool or a shared one.",
      "Whether only you can't see it, or the whole role/team can't see it.",
    ],
    whenToEscalate: "If a shared tool or template piece is missing for more than one person, send it to the documentation template team with the tool name, the note type, and the role affected.",
    walkthrough: [
      "In note editor - identify tool type.",
      "Search exact name and one synonym.",
      "Confirm personal, shared, or template-owned.",
    ],
    ifThatFails: [
      "One user: check personalization or sharing.",
      "Whole role: escalate template/build owner.",
      "Clinical note blocked: escalate with note type and role.",
    ],
    keywords: k("smartphrase", "smart phrase", "smarttext", "smart text", "smartlist", "smart list", "smartlink", "smart link", "dot phrase", "phrase missing", "text missing", "list missing", "link missing", "note tool", "personalization lab", "epic smarttools", "epic note template"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_smartset_order_set_missing",
    title: "SmartSet or order set is missing",
    type: "playbook",
    summary: "The order set you're looking for isn't showing up where you expect it.",
    roles: k("provider", "resident / fellow", "specialty support"),
    domains: k("orders", "order sets", "smartsets"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "place",
    is_deep_flow: true,
    nav_trail: "From order entry -> Order set search -> Encounter/role filters -> Favorites/recent",
    visual_url: null,
    first90: [
      "Confirm the order context and encounter type.",
      "Search exact name and one approved synonym.",
      "Check favorites, recent, and available order sets.",
    ],
    whatToSay: [
      "'Before we call it missing, let me make sure we're in the right visit type.'",
      "'If it's just not available for this role, I'll get it routed cleanly.'",
    ],
    whatToCheck: [
      "The encounter type, department, provider role, and any diagnosis context that filters the list.",
      "Whether you're looking at favorites and recent only, or the full search for all available order sets.",
      "Whether only one provider can't find it, or no one on that role/team can.",
    ],
    whenToEscalate: "If the order set still doesn't appear after checking context and searching, send it to the order set team with the exact name, the role, the visit type, the location, and how urgent the order is.",
    walkthrough: [
      "In order entry - confirm encounter and role.",
      "Search exact name and approved synonym.",
      "Compare favorites/recent against all available.",
    ],
    ifThatFails: [
      "Only one user: check favorites or access.",
      "Whole role: escalate order set build.",
      "Time-sensitive order blocked: page clinical informatics.",
    ],
    keywords: k("smartset", "smart set", "orderset", "order set", "order set missing", "can't find smartset", "cannot find smartset", "favorite orders", "order favorites", "order set search", "not in favorites", "epic smartset", "cerner order set", "powerplan", "order plan"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_ed_prearrival_not_showing",
    title: "ED prearrival or tracking-board patient is not showing",
    type: "playbook",
    summary: "For ED board issues, check arrival status, filter, location, and assignment before creating duplicate work.",
    roles: k("ed provider", "ed nurse", "unit clerk"),
    domains: k("emergency", "tracking board", "prearrival"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "From ED tracking board -> Prearrival/expected tab -> Filters -> Refresh",
    visual_url: null,
    first90: [
      "Confirm expected vs arrived status.",
      "Check board filter, location, and date/time window.",
      "Refresh once before creating new work.",
    ],
    whatToSay: [
      "'Let's confirm whether this is expected, arrived, or filtered out.'",
      "'We do not create a second record just because the board view is hiding it.'",
    ],
    whatToCheck: [
      "Prearrival/expected status, arrival time, location, bed/room, and tracking-board filters.",
      "Whether registration, triage, or provider assignment owns the next step.",
      "Whether the patient appears under a different board tab or status.",
    ],
    whenToEscalate: "If ED flow is blocked or the patient cannot be located after status/filter checks, escalate to ED charge or tracking-board owner with location, status, and callback.",
    walkthrough: [
      "On the board - check expected vs arrived.",
      "In filters - verify location and time window.",
      "After refresh - compare the next likely board tab.",
    ],
    ifThatFails: [
      "Still not visible: ask registration/triage owner.",
      "Duplicate risk: stop and escalate.",
      "Care team waiting: route through ED charge now.",
    ],
    keywords: k("prearrival", "pre-arrival", "ed board", "tracking board", "launchpoint", "ed launchpoint", "patient not on board", "not showing on board", "expected patient", "arrived patient", "triage board", "ed tracking", "emergency board"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_ed_discharge_workflow_blocked",
    title: "ED discharge is blocked or paperwork is not ready",
    type: "playbook",
    summary: "ED discharge blocks usually come from disposition, instructions, orders, printing, or sign-off. Split the lane before escalating.",
    roles: k("ed provider", "ed nurse", "unit clerk"),
    domains: k("emergency", "discharge", "printing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "document",
    first90: [
      "Name the blocked lane: disposition, instructions, orders, print, or sign-off.",
      "Confirm discharge status and required owner.",
      "Check printer route only after status is complete.",
    ],
    whatToSay: [
      "'Let's split the discharge block first so we do not chase the printer for a status issue.'",
      "'I will confirm the missing owner and close the loop.'",
    ],
    whatToCheck: [
      "Disposition, discharge order, instructions, medication/reconciliation status, print route, and signature.",
      "Whether the provider, nurse, clerk, or registration owner has the next task.",
      "Whether the patient is waiting on paperwork, transport, or final clinical action.",
    ],
    whenToEscalate: "If discharge is delayed after lane and owner checks, escalate to ED charge or discharge workflow owner with the blocked lane and callback.",
    walkthrough: [
      "Name the blocked discharge lane.",
      "Confirm required owner and status.",
      "Check print route after status is complete.",
    ],
    ifThatFails: [
      "Owner unclear: route through ED charge.",
      "Print failure only: use printer playbook.",
      "Patient flow delayed: escalate with blocked lane now.",
    ],
    keywords: k("ed discharge", "discharge workflow", "discharge paperwork", "can't discharge", "cannot discharge", "discharge instructions", "disposition", "discharge order", "print discharge", "nursing discharge", "provider discharge", "emergency discharge"),
    related_ids: ["p3", "c1", "v3"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_dynamic_note_template_missing",
    title: "Note type or dynamic documentation template is missing",
    type: "playbook",
    summary: "When the expected note template is missing, confirm encounter, role, note type, and specialty before using another template.",
    roles: k("provider", "inpatient nurse", "therapy", "ancillary"),
    domains: k("documentation", "notes", "templates"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "cerner",
    action: "document",
    is_deep_flow: true,
    nav_trail: "From documentation -> New note/document -> Type/template search -> Role/specialty context",
    visual_url: null,
    first90: [
      "Confirm the note belongs in this encounter.",
      "Search the expected note type and one approved synonym.",
      "Check role, specialty, and location context.",
    ],
    whatToSay: [
      "'Let's avoid using a nearby note type until we confirm the right template.'",
      "'If the template is missing for everyone, that is a build issue.'",
    ],
    whatToCheck: [
      "Encounter type, note type, role view, specialty, location, and template ownership.",
      "Whether the same template appears for another approved user in the same role.",
      "Whether local policy allows an alternate note type.",
    ],
    whenToEscalate: "If the expected note template is missing for a role/team or policy is unclear, escalate to clinical documentation/template owner with note type, role, specialty, and callback.",
    walkthrough: [
      "In documentation - confirm encounter.",
      "Search note type and approved synonym.",
      "Check role/specialty context before alternate template.",
    ],
    ifThatFails: [
      "One user affected: check role or access.",
      "Whole role affected: escalate template build.",
      "Alternate note requested: confirm policy first.",
    ],
    keywords: k("dynamic documentation", "dyn doc", "note template", "template missing", "note type missing", "new note", "write note", "write my note", "where do i write my note", "where is the note", "start a note", "document type", "clinical note", "therapy note", "provider note", "can't find note", "cannot find note", "wrong note type", "documentation template"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_claim_attachment_missing",
    title: "Claim needs an attachment or documentation packet",
    type: "playbook",
    summary: "A claim needs a document attached before it can go out, and we have to make sure it is the right one.",
    roles: k("biller", "claims rep", "revenue cycle"),
    domains: k("billing", "claims", "attachments"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Confirm the payer/request lane and claim status.",
      "Verify the document exists and is final.",
      "Check attachment owner before sending.",
    ],
    whatToSay: [
      "'Let me confirm what the payer is asking for and that the document is final before anything goes out.'",
      "'We only attach approved, signed documents — and only on the right account.'",
    ],
    whatToCheck: [
      "The claim status and which payer or request is asking for the document.",
      "That the document is final and signed, and that it belongs to this account and visit.",
      "Whether you have permission to attach it yourself, or it has to go through the attachment queue.",
    ],
    whenToEscalate: "If the document, the account, or who attaches it isn't clear, send it to the claims team lead with the payer, the document type, and the claim status.",
    walkthrough: [
      "Open the claim lane and status.",
      "Confirm requested document and final status.",
      "Attach or route through the approved owner.",
    ],
    ifThatFails: [
      "Document not final: do not send it.",
      "Account mismatch risk: stop and escalate.",
      "Queue/permission blocked: route claims owner.",
    ],
    keywords: k("claim attachment", "attach claim", "claim document", "documentation packet", "payer request", "attachment queue", "missing attachment", "send attachment", "claim needs document", "billing attachment", "hb claim attachment"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_claim_refresh_vs_resubmit",
    title: "Claim needs refresh, resubmit, or hold decision",
    type: "playbook",
    summary: "A claim looks stuck and you are not sure whether to refresh it, resubmit it, or hold it — these are different actions.",
    roles: k("biller", "claims rep", "revenue cycle"),
    domains: k("billing", "claims", "status"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Ask what changed since the claim was last reviewed.",
      "Check claim status, edits, and hold reason.",
      "Confirm owner before refresh or resubmit.",
    ],
    whatToSay: [
      "'Refresh, resubmit, and hold are three different actions. Let me check the status before we pick one.'",
      "'I'll write down why it was held or edited before we do anything to it.'",
    ],
    whatToCheck: [
      "The current claim status, the hold or edit reason, and when it last changed.",
      "Whether new documentation, coding, charges, or coverage changed since the claim went out.",
      "What your workflow calls for: refresh, resubmit, hold, or send to someone else.",
    ],
    whenToEscalate: "If you can't tell which action is right, or the same edit keeps coming back after one approved try, send it to the claims team lead with the status, the edit reason, and what changed.",
    walkthrough: [
      "Confirm what changed.",
      "Check status, edit, and hold reason.",
      "Use approved owner path for refresh/resubmit decision.",
    ],
    ifThatFails: [
      "Edit repeats: stop repeated resubmits.",
      "Change source unclear: route revenue owner.",
      "Payer deadline risk: escalate with urgency.",
    ],
    keywords: k("refresh claim", "resubmit claim", "refresh or resubmit", "refresh or resubmit this claim", "resubmit this claim", "refresh this claim", "claim resubmit", "claim refresh", "hold reason", "claim hold", "claim edit", "billing edit", "claim status", "repeat edit", "claim won't go", "claim not going out", "hb refresh", "hb resubmit"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_detail_bill_request",
    title: "Detailed bill request needs the right account lane",
    type: "playbook",
    summary: "A detailed bill request should be handled from the account/billing lane after account, request type, and delivery owner are confirmed.",
    roles: k("biller", "front desk", "revenue cycle"),
    domains: k("billing", "account", "statement"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Confirm this is a detailed bill request.",
      "Verify account/encounter lane without collecting identifiers in chat.",
      "Route through the approved billing owner.",
    ],
    whatToSay: [
      "'Let's confirm the request type and account lane before we route it.'",
      "'Do not paste account or patient identifiers into the support note.'",
    ],
    whatToCheck: [
      "Request type, account/billing lane, encounter/account ownership, delivery method, and approved owner.",
      "Whether the user is asking for a statement, itemized bill, or claim detail.",
      "Whether policy requires billing office ownership.",
    ],
    whenToEscalate: "If account ownership, delivery method, or policy is unclear, route to the billing office/revenue owner with non-PHI request summary and callback.",
    walkthrough: [
      "Name the request type.",
      "Confirm account lane without identifiers.",
      "Route through approved billing owner.",
    ],
    ifThatFails: [
      "Wrong account risk: stop and route billing owner.",
      "Delivery policy unclear: do not improvise.",
      "Requester upset: close loop with owner and callback.",
    ],
    keywords: k("detail bill", "detailed bill", "request a detailed bill", "request a detail bill", "detailed bill request", "itemized bill", "billing statement", "statement request", "account bill", "patient bill", "bill request", "itemized statement", "hb detail bill"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_adjustment_approval_stuck",
    title: "Adjustment or approval is stuck",
    type: "playbook",
    summary: "Adjustment issues need amount/status lane, approval owner, and policy check before anyone changes the account.",
    roles: k("biller", "revenue cycle", "claims rep"),
    domains: k("billing", "adjustments", "approvals"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Confirm adjustment type and current status.",
      "Identify approval owner or workqueue.",
      "Do not change amounts without policy owner.",
    ],
    whatToSay: [
      "'Let's find the approval owner before anyone changes the account.'",
      "'I will capture the status and route it instead of guessing.'",
    ],
    whatToCheck: [
      "Adjustment type, reason/status, amount threshold, approval queue, owner, and last action.",
      "Whether one account is affected or a workqueue is backing up.",
      "Whether policy requires supervisor or revenue owner approval.",
    ],
    whenToEscalate: "If approval owner is unclear, threshold/policy is unclear, or a workqueue is backing up, escalate to revenue/billing supervisor with status, queue, and callback.",
    walkthrough: [
      "Check adjustment type and status.",
      "Find approval queue or owner.",
      "Route through policy owner before account changes.",
    ],
    ifThatFails: [
      "Approval owner unclear: route billing supervisor.",
      "Amount/policy unclear: do not adjust.",
      "Workqueue backlog: escalate scope and count.",
    ],
    keywords: k("adjustment", "adjustments", "approval", "approvals", "adjustment approval", "approval stuck", "billing approval", "account adjustment", "write off", "write-off", "adjustment reason", "approval queue", "workqueue adjustment"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_hb_account_status_dnb_or_billed",
    title: "Hospital account status is unclear",
    type: "playbook",
    summary: "You opened a hospital account and the billing status isn't clear — it could be open, on hold (not yet billed), billed, or closed.",
    roles: k("biller", "revenue cycle", "customer service"),
    domains: k("hospital billing", "account", "dnb"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Hospital Account -> Account summary/status -> Billing or DNB edits -> Workqueue/owner",
    first90: [
      "Open the hospital account and read the current status.",
      "Check for DNB, billing, or closed-state blockers.",
      "Identify the workqueue or owner before changing anything.",
    ],
    whatToSay: [
      "'Let me name the account status before we troubleshoot the bill.'",
      "'I'm checking whether this is held from billing, already billed, or closed — they each have a different next step.'",
    ],
    whatToCheck: [
      "The current account status (open, held from billing, billed, or closed) and the reason it's in that state.",
      "Whether one account is affected, or the same problem is stacking up in a work queue.",
      "Whether the blocker is documentation, coding, a charge, coverage, or the claim itself.",
    ],
    whenToEscalate: "If the status or who owns the account isn't clear, send it to the hospital billing lead with the status, the hold reason, and the work queue name.",
    walkthrough: [
      "Open the hospital account.",
      "Read status and DNB/billing reason.",
      "Route to the accountable owner.",
    ],
    ifThatFails: [
      "Status missing: check filters and account context.",
      "DNB reason unclear: route billing owner.",
      "Queue trend: escalate count and owner.",
    ],
    keywords: k("har status", "hospital account status", "account status", "open account", "dnb", "discharged not billed", "billed status", "closed account", "stop bill", "billing status", "account billing state", "hb account status", "hospital account review"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_dnb_edit_or_stop_bill_owner",
    title: "DNB edit or stop-bill needs an owner",
    type: "playbook",
    summary: "An account is being held from billing because of an edit, and we need to find who actually owns it before clearing anything.",
    roles: k("biller", "claims rep", "revenue cycle"),
    domains: k("hospital billing", "dnb", "edits"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Hospital Account -> DNB/edit list -> Edit detail -> Owner or workqueue",
    first90: [
      "Open the DNB or edit detail.",
      "Name the blocker category before resolving anything.",
      "Route to the owner lane if it is not yours.",
    ],
    whatToSay: [
      "'Held-from-billing edits belong to whoever owns the underlying fix. Let me find who that is first.'",
      "'We shouldn't clear an edit unless the work behind it is actually done.'",
    ],
    whatToCheck: [
      "The edit code or category, the message it shows, and when it was last updated.",
      "Whether the blocker is documentation, coding, a charge, coverage, the claim, or system routing.",
      "Whether this edit is actually yours to fix, or you're just seeing it because the account sits in a shared queue.",
    ],
    whenToEscalate: "If you can't tell who owns the edit or how to clear it safely, send it to the hospital billing lead with the edit category, the status, and the queue name.",
    walkthrough: [
      "Open DNB/edit detail.",
      "Identify blocker category and owner.",
      "Resolve only owned edits; route the rest.",
    ],
    ifThatFails: [
      "Not your owner lane: route it.",
      "Edit repeats after resolution: escalate pattern.",
      "Patient flow or deadline risk: flag urgency.",
    ],
    keywords: k("dnb edit", "dnb edits", "discharged not billed edit", "resolve dnb edit", "billing related dnb edit", "charging related dnb edit", "stop bill", "stop bill edit", "dnb workqueue", "dnb owner", "dnb blocker", "clear dnb", "hb dnb"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_claim_edit_workqueue_owner",
    title: "Claim edit is in the wrong owner lane",
    type: "playbook",
    summary: "A claim is sitting in an edit work queue and we need to know which exact error to fix and who owns it.",
    roles: k("biller", "claims rep", "revenue cycle"),
    domains: k("claims", "workqueue", "edits"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Claim edit workqueue -> Claim/edit detail -> Error owner -> Retest or route",
    first90: [
      "Open the claim edit detail.",
      "Identify the exact edit code and owner.",
      "Fix only the edit assigned to your lane.",
    ],
    whatToSay: [
      "'A claim can sit in more than one queue, so let's find the exact edit that's yours.'",
      "'Don't fix the other edits just because you can see them — that creates new problems.'",
    ],
    whatToCheck: [
      "The claim status, the exact edit code, and the error message it shows.",
      "Whether the edit is about coding, coverage, a modifier, a charge, documentation, or the clearinghouse.",
      "Whether the claim will need a refresh, a resubmit, or to be sent on once your edit is fixed.",
    ],
    whenToEscalate: "If you can't tell who owns the edit, or the same edit spans multiple teams, send it to the claims team lead with the edit code, the queue, and the claim status.",
    walkthrough: [
      "Open claim edit detail.",
      "Name edit code and owner.",
      "Resolve owned edit or route.",
    ],
    ifThatFails: [
      "Multiple queues: handle your assigned code only.",
      "Owner unclear: route claims supervisor.",
      "Edit repeats: capture retest result.",
    ],
    keywords: k("claim edit", "claim edits", "claim edit workqueue", "claim edit wq", "claim error", "claim errors sidebar", "claim error sidebar", "claim in multiple workqueues", "multiple claim workqueues", "error code owner", "edit owner", "fix claim error", "responsible for error code", "hb claim edit"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_clearinghouse_error_refresh_retest",
    title: "Clearinghouse error needs refresh/retest",
    type: "playbook",
    summary: "The clearinghouse rejected a claim — fix it once, retest, and only then resend instead of resubmitting blindly.",
    roles: k("biller", "claims rep", "revenue cycle"),
    domains: k("claims", "clearinghouse", "edits"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Claim edit -> Clearinghouse/external status -> Correction -> Refresh/retest result",
    first90: [
      "Open the clearinghouse or external-status error.",
      "Capture the exact error text and owner lane.",
      "Correct once, then refresh or retest per policy.",
    ],
    whatToSay: [
      "'Let's fix the error, retest it once, then send it. Don't keep resubmitting blindly.'",
      "'I'll write down the exact error so the right person can act on it.'",
    ],
    whatToCheck: [
      "The exact error text the clearinghouse returned, and which payer it came from.",
      "Whether the fix is a modifier, coding, coverage, a charge, or documentation.",
      "Whether the same error comes back after one approved correction and retest.",
    ],
    whenToEscalate: "If the same error comes back after one approved correction, or you can't tell who owns the fix, send it to the claims team lead with the error text and what you tried.",
    walkthrough: [
      "Open external status/error.",
      "Correct the owned blocker.",
      "Refresh/retest once and document result.",
    ],
    ifThatFails: [
      "Error repeats: stop resubmitting.",
      "Owner unclear: route claims owner.",
      "Deadline risk: escalate payer urgency.",
    ],
    keywords: k("clearinghouse error", "external status code", "external status", "claim scrubber", "scrubber error", "claim retest", "rapid retest", "refresh to retest", "refresh clearinghouse", "claim clearinghouse", "claim error retest", "claim failed clearinghouse"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_late_charge_or_split_claim",
    title: "Late charge or split claim is holding billing",
    type: "playbook",
    summary: "A charge came in after the claim already went out, and we need to decide if it's a late charge, a split claim, or a billing-owner call.",
    roles: k("biller", "charge capture", "revenue cycle"),
    domains: k("charges", "claims", "hospital billing"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Hospital Account -> Charges/transactions -> Claim status -> Late charge or split-claim owner",
    first90: [
      "Confirm the account and service date.",
      "Check whether the charge is late, held, or split.",
      "Route to charge or claims owner before forcing billing.",
    ],
    whatToSay: [
      "'Let me figure out if this is a charge that came in late or a claim-status problem — they're different.'",
      "'I don't want to force the bill until we know who owns this.'",
    ],
    whatToCheck: [
      "The date of service, the charge status, and whether the charge is flagged as a late charge.",
      "The claim status and whether the visit was already billed or split into multiple claims.",
      "Whether documentation, coding, or coverage changed after the original claim went out.",
    ],
    whenToEscalate: "If you can't tell whether to add it as a late charge or split the claim, or your workflow doesn't allow a manual push, send it to the charge capture lead with the account and what changed.",
    walkthrough: [
      "Open account charge/transaction view.",
      "Check service date and claim status.",
      "Route late-charge or split-claim owner.",
    ],
    ifThatFails: [
      "Charge missing: use charge-capture path.",
      "Claim already billed: route claims owner.",
      "Policy unclear: do not manually force.",
    ],
    keywords: k("late charge", "late charges", "late charge split claim", "split claim", "process late charge", "late charge on split claim", "charge posted after claim", "charge after billing", "claim already billed charge", "manual charge billing", "charge timing", "hb late charge"),
    related_ids: ["p7", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_sbo_guarantor_balance_statement_call",
    title: "Guarantor has a balance or statement question",
    type: "playbook",
    summary: "A patient or guarantor is calling about a balance or a statement, and we need to answer from the right account lane.",
    roles: k("customer service", "self-pay", "revenue cycle"),
    domains: k("sbo", "guarantor", "statement"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Guarantor/account lookup -> Balance or statement summary -> Notes/owner -> Close-loop action",
    first90: [
      "Confirm this is a guarantor balance or statement question.",
      "Open the approved account/guarantor lane.",
      "Check statement status before quoting next steps.",
    ],
    whatToSay: [
      "'Let me pull up the right account before I answer about the balance or statement.'",
      "'Please don't paste account numbers or patient info into the chat — I'll look it up here.'",
    ],
    whatToCheck: [
      "Which guarantor or account the caller is asking about, and the current statement status.",
      "What they actually need: an explanation of the statement, a payment plan, a coverage check, or a handoff to the billing office.",
      "Whether your workflow requires a note or a specific call disposition before closing.",
    ],
    whenToEscalate: "If the balance source or statement state isn't clear, or the answer needs a policy call, send it to the patient billing office lead with a non-PHI summary and a callback number.",
    walkthrough: [
      "Open guarantor/account lane.",
      "Read balance and statement status.",
      "Document or route the approved close-loop action.",
    ],
    ifThatFails: [
      "Wrong account risk: stop and verify lane.",
      "Coverage dispute: route coverage owner.",
      "Upset caller: document and hand off owner.",
    ],
    keywords: k("guarantor balance", "balance inquiry", "statement inquiry", "sbo statement", "sbo balance", "customer service call", "patient statement", "account balance question", "statement status", "why did i get a bill", "guarantor account", "hospital account lookup", "self pay statement"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_sbo_payment_plan_or_self_pay_followup",
    title: "Payment plan or self-pay follow-up is unclear",
    type: "playbook",
    summary: "A caller is asking about a payment plan or self-pay follow-up — check the plan status before promising any change.",
    roles: k("customer service", "self-pay", "revenue cycle"),
    domains: k("sbo", "payment plan", "self-pay"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Guarantor/account -> Payment plan or self-pay follow-up -> Workqueue/notes -> Owner",
    first90: [
      "Open the guarantor/account lane.",
      "Check payment plan or self-pay follow-up status.",
      "Confirm policy owner before promising changes.",
    ],
    whatToSay: [
      "'Let me check the plan before I tell the caller what's going to happen.'",
      "'If changing the plan needs an approval, I'll route it instead of guessing.'",
    ],
    whatToCheck: [
      "The current payment plan or self-pay follow-up status, and the next due date.",
      "What they're actually asking for: a new plan, a missed payment, an adjustment, or a handoff to financial assistance.",
      "Whether your workflow requires a supervisor, self-pay specialist, or financial counselor to make the change.",
    ],
    whenToEscalate: "If the plan policy, the right person to change it, or the financial assistance handoff isn't clear, send it to the patient billing office supervisor with a clean summary and a callback number.",
    walkthrough: [
      "Open guarantor/account.",
      "Check payment plan or self-pay follow-up status.",
      "Route policy owner before changing terms.",
    ],
    ifThatFails: [
      "Plan missing: check account lane.",
      "Policy unclear: route owner.",
      "Queue backlog: escalate count and due dates.",
    ],
    keywords: k("payment plan", "payment plan question", "self-pay follow-up", "self pay follow up", "self-pay account", "self pay account", "missed payment", "payment arrangement", "financial assistance", "bad debt", "follow up workqueue", "follow-up workqueue", "sbo payment", "sbo self pay"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_coverage_filing_order_term_delete",
    title: "Coverage filing order, term, or delete decision",
    type: "playbook",
    summary: "Insurance coverage on an account looks wrong — decide whether to end it, delete it, or change the order it bills in.",
    roles: k("registration", "customer service", "revenue cycle"),
    domains: k("coverage", "insurance", "sbo"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Registration or account -> Coverage area -> Filing order/effective dates -> Owner",
    first90: [
      "Open the account or encounter coverage lane.",
      "Check active dates and filing order.",
      "Term old valid coverage; delete only if added in error.",
    ],
    whatToSay: [
      "'Let me see if this coverage was valid at some point, or just added by mistake.'",
      "'The order it bills in matters too, so I'm checking that before we attach anything.'",
    ],
    whatToCheck: [
      "The coverage status, effective dates, and which order it bills in (primary, secondary, tertiary).",
      "Whether the coverage was ever valid for any past visit.",
      "Which action this actually needs: add new coverage, attach it to this visit, end it, delete an error, or change the order.",
    ],
    whenToEscalate: "If the effective dates, the billing order, or the end-versus-delete decision isn't clear, send it to the registration coverage lead with the account context and a callback number.",
    walkthrough: [
      "Open coverage lane.",
      "Check dates and filing order.",
      "Term valid-old coverage; delete error-only coverage.",
    ],
    ifThatFails: [
      "Wrong account risk: stop.",
      "Coverage date unclear: route coverage owner.",
      "Balance transfer concern: involve billing owner.",
    ],
    keywords: k("coverage filing order", "filing order", "edit filing order", "add new coverage", "attach coverage", "term coverage", "delete coverage", "coverage effective date", "effective to field", "insurance filing order", "coverage was valid", "coverage added in error", "old insurance coverage", "new insurance coverage", "sbo coverage"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_account_activity_communication_needed",
    title: "Account activity communication needs routing",
    type: "playbook",
    summary: "A billing message needs to go to the right team with a clean note before the item is closed.",
    roles: k("biller", "customer service", "revenue cycle"),
    domains: k("billing", "communication", "account activity"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 2,
    vendor_family: "epic",
    action: "route",
    nav_trail: "Hospital Account -> Account activity/communication -> Recipient owner -> Status/note",
    first90: [
      "Open the account activity or communication area.",
      "Confirm recipient owner and activity type.",
      "Add a clean note before routing or closing.",
    ],
    whatToSay: [
      "'This is a handoff, so let me confirm who it's going to and leave a clean note.'",
      "'The next team needs to know exactly what we're asking for.'",
    ],
    whatToCheck: [
      "What kind of activity this is and which team needs to receive it.",
      "Whether the message is for coding, charges, coverage, claims, the patient billing office, or self-pay.",
      "Whether your workflow needs a specific note, status, or follow-up queue before you close it.",
    ],
    whenToEscalate: "If you can't tell who should receive it, or what status to leave it in, send it to the revenue cycle lead with the account, the activity type, and a callback number.",
    walkthrough: [
      "Open account activity/communication.",
      "Select owner and activity type.",
      "Route with clean note and follow-up status.",
    ],
    ifThatFails: [
      "Owner unclear: route revenue lead.",
      "Status locked: check security/queue.",
      "Repeated misroutes: escalate workflow pattern.",
    ],
    keywords: k("account activity", "account activities", "communication workflow", "billing communication", "send communication", "route account activity", "recipient owner", "billing indicator", "account note", "follow up note", "customer service handoff", "revenue handoff"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_provider_inbasket_folder_filter_overload",
    title: "Provider In Basket is overloaded or filtered wrong",
    type: "playbook",
    summary: "Your In Basket is overflowing and the filters are hiding the messages that actually need a reply.",
    roles: k("provider", "resident / fellow", "clinic support"),
    domains: k("in basket", "messages", "provider efficiency"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "In Basket -> Folder list -> Pool/proxy view -> Priority/status/date filters -> Message detail",
    first90: [
      "Identify the folder, pool, or proxy view.",
      "Sort by priority, due date, or message type.",
      "Do not bulk-resolve messages to reduce the count.",
    ],
    whatToSay: [
      "'Let's find the messages that actually need a reply first. Then we can clean up the rest.'",
      "'We're sorting, not deleting. Nothing gets closed until we know what it is.'",
    ],
    whatToCheck: [
      "Which folder is open, and whether you're looking at your own messages, a shared pool, or someone else's view.",
      "Sort and filter settings: priority, date range, unread, due today.",
      "Whether urgent items (results, refills, signatures) are buried under FYI messages.",
    ],
    whenToEscalate: "If urgent messages are hidden, going to the wrong person, or every provider in the group is seeing the same problem, send it to provider support with the folder name, the view, and how many messages are stuck.",
    walkthrough: [
      "Name the current folder and view.",
      "Sort by urgency and owner.",
      "Route wrong-pool or hidden urgent work.",
    ],
    ifThatFails: [
      "Wrong pool: use message-routing playbook.",
      "Filter hides work: reset date/status filters.",
      "Urgent follow-up blocked: escalate now.",
    ],
    keywords: k("provider inbasket", "provider in basket", "inbasket overloaded", "in basket overloaded", "in basket overflowing", "inbasket overflowing", "too many in basket messages", "inbasket folders", "in basket folders", "message folder filter", "pool view", "proxy view", "delegate view", "provider messages filter", "unread messages", "due messages", "message priority", "in basket lessons learned"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_provider_inbasket_result_or_refill_followup",
    title: "Provider In Basket result or refill follow-up is unclear",
    type: "playbook",
    summary: "A result, refill, or follow-up message is unclear — open it and find the actual action it needs before marking it done.",
    roles: k("provider", "clinic support", "nurse"),
    domains: k("in basket", "results", "refills"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "route",
    is_deep_flow: true,
    nav_trail: "In Basket -> Message detail -> Result/refill/follow-up action -> Route/done owner",
    first90: [
      "Open the message detail, not just the folder row.",
      "Identify result, refill, signature, or follow-up type.",
      "Confirm owner before marking done or routing.",
    ],
    whatToSay: [
      "'Let's open the message and figure out what it actually needs us to do.'",
      "'Done means the next person can act on it — not just that it's off your screen.'",
    ],
    whatToCheck: [
      "What kind of message it is (result, refill, signature, or follow-up) and the current status.",
      "Which buttons are showing — reply, route, sign, done — and which one matches the action.",
      "Whether the message is for you personally, the pool, a proxy view, or the covering provider.",
    ],
    whenToEscalate: "If a time-sensitive result, refill, or follow-up can't be acted on or routed, send it to the clinic lead with the message type, the status, and a callback number.",
    walkthrough: [
      "Open message detail.",
      "Classify action type.",
      "Route, complete, or escalate with owner.",
    ],
    ifThatFails: [
      "Action button missing: check role/proxy view.",
      "Owner unclear: route clinic/provider support.",
      "Time-sensitive result/refill: escalate now.",
    ],
    keywords: k("inbasket result", "in basket result", "result message", "refill message", "rx refill inbasket", "rx refill in basket", "follow up message", "follow-up message", "done button missing", "cannot mark done", "can't close inbasket", "can't close in basket", "route result message", "provider refill queue", "in basket follow up", "provider message action"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_smarttools_placeholder_prompt_unresolved",
    title: "SmartTool prompt or placeholder did not resolve",
    type: "playbook",
    summary: "A note has leftover *** or unfilled prompts that did not fill in — resolve them before the note is signed.",
    roles: k("provider", "clinic support", "clinical documentation"),
    domains: k("smarttools", "notes", "documentation"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    is_deep_flow: true,
    nav_trail: "Note editor -> SmartTool/SmartText/SmartPhrase -> Prompt or placeholder -> Required field/sign",
    first90: [
      "Keep the note open and find the unresolved text.",
      "Confirm tool type and required prompt.",
      "Resolve prompts before the provider signs.",
    ],
    whatToSay: [
      "'Let's fill in the leftover prompts before this note gets signed.'",
      "'If the tool is blank for everyone, that's a template problem and we'll route it.'",
    ],
    whatToCheck: [
      "What's still unfilled in the note (stars, brackets, or a blank prompt).",
      "Whether the tool belongs to you, is shared with the team, or is part of the note template.",
      "Whether one person sees the problem or everyone using that tool does.",
    ],
    whenToEscalate: "If a shared tool is broken, a required prompt won't fill in, or the note can't be signed, send it to documentation support with the tool name and the note type.",
    walkthrough: [
      "Find unresolved placeholder.",
      "Confirm SmartTool type and prompt.",
      "Resolve before sign or route owner.",
    ],
    ifThatFails: [
      "Personal tool only: personalization owner.",
      "Shared tool broken: content/build owner.",
      "Signed note affected: use correction/addendum path.",
    ],
    keywords: k("smarttools", "smart tools", "smarttool", "smart tool", "smartphrase prompt", "smart phrase prompt", "smarttext prompt", "smart text prompt", "smartlist prompt", "smart list prompt", "placeholder not resolving", "unresolved placeholder", "wildcard in note", "*** in note", "smartlink blank", "smart link blank", "prompt won't resolve", "prompt wont resolve", "note placeholder"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_smartset_section_or_order_not_selected",
    title: "SmartSet section or expected order is not selected",
    type: "playbook",
    summary: "An expected order in a SmartSet is not selected — it may be hidden, in the wrong section, or filtered out by context.",
    roles: k("provider", "resident / fellow", "clinical support"),
    domains: k("smartsets", "orders", "provider efficiency"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "place",
    is_deep_flow: true,
    nav_trail: "Chart -> Orders/SmartSet -> Section/accordion -> Selected orders -> Required fields/sign",
    first90: [
      "Confirm encounter, department, and visit context.",
      "Expand the expected SmartSet section.",
      "Check selected orders and required fields.",
    ],
    whatToSay: [
      "'Let's open the right section before we say the order is missing.'",
      "'Even when the order is there, it still needs the required fields filled in before signing.'",
    ],
    whatToCheck: [
      "Which encounter, department, and visit type you're in — the order set changes with context.",
      "Whether the section is collapsed, the order is unchecked, or it's hidden because of role or location.",
      "Whether this is a personal favorites issue or a shared template the team uses.",
    ],
    whenToEscalate: "If the right section or order is missing for the correct role and context, or required fields can't be completed, send it to provider support with the order set name and what's blocked.",
    walkthrough: [
      "Open SmartSet in correct context.",
      "Expand section and select expected order.",
      "Complete required fields before signing.",
    ],
    ifThatFails: [
      "Hidden section: expand/search within set.",
      "Order unavailable: check role/location context.",
      "Required field blocked: escalate exact field.",
    ],
    keywords: k("smartset section", "smart set section", "smartset order not selected", "smart set order not selected", "smartset unchecked", "smartset hidden section", "smartset accordion", "smartset required field", "smartset won't sign", "smartset wont sign", "expected order not in smartset", "order missing from smartset", "provider smartset", "provider smart set", "smartset tips"),
    related_ids: ["p2", "c3", "v10"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_inpatient_clinical_review_data_hidden",
    title: "Inpatient clinical review data is hidden or incomplete",
    type: "playbook",
    summary: "Labs, vitals, or other data aren't showing in clinical review — usually a filter, a date range, or source data that isn't final yet.",
    roles: k("inpatient provider", "resident / fellow", "floor consultant"),
    domains: k("clinical review", "patient lists", "results"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Patient list -> Clinical review/summary -> Date/filter/source -> Detail view",
    first90: [
      "Confirm the patient list and selected patient.",
      "Check date range, filters, and source section.",
      "Open detail before calling data missing.",
    ],
    whatToSay: [
      "'Most of the time it's a filter or a date range. Let me check that first.'",
      "'If the lab or vital isn't final yet, the summary won't show it.'",
    ],
    whatToCheck: [
      "The patient list, the selected patient, the date range, and any active filters.",
      "Whether the data is just hidden, or is preliminary, unsigned, or not yet resulted.",
      "Whether one patient is affected, or every provider on the unit sees the same gap.",
    ],
    whenToEscalate: "If final data is missing for more than one user, or a rounding decision is blocked, send it to provider support with the list name, the section, and the filters in use.",
    walkthrough: [
      "Open patient list and selected patient.",
      "Check clinical review filters/date.",
      "Open source detail and route owner.",
    ],
    ifThatFails: [
      "Hidden by filter: reset date/status.",
      "Source not final: check source workflow.",
      "Multi-user gap: escalate as build/data issue.",
    ],
    keywords: k("clinical review", "provider clinical review", "inpatient clinical review", "clinical review data missing", "clinical review not showing", "labs not showing clinical review", "vitals not showing clinical review", "patient summary missing", "overview missing", "snapshot missing", "chart review missing", "patient lists clinical review", "provider inpatient list", "rounding review"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_provider_note_copy_forward_or_refresh_wrong",
    title: "Provider note copy-forward or refresh looks wrong",
    type: "playbook",
    summary: "A note pulled forward an old assessment or stale data from a previous visit — fix it before the note is signed.",
    roles: k("provider", "resident / fellow", "clinical documentation"),
    domains: k("notes", "documentation", "provider efficiency"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    is_deep_flow: true,
    nav_trail: "Note editor -> Copy-forward/refresh/imported data -> Current encounter -> Sign",
    first90: [
      "Confirm the note belongs to this encounter.",
      "Identify copied, refreshed, or imported content.",
      "Review stale data before signing.",
    ],
    whatToSay: [
      "'Let's check what got pulled in from the last visit before this note is signed.'",
      "'I can help spot what came forward, but the provider decides what's still accurate.'",
    ],
    whatToCheck: [
      "That the note belongs to today's visit, not a previous one.",
      "Which sections were copied or refreshed from an older note.",
      "Whether anything stale needs to be fixed before signing, or corrected with an addendum after.",
    ],
    whenToEscalate: "If a note is already signed with the wrong content, or copy-forward is breaking for more than one provider, send it to documentation support with the note type and what came through wrong.",
    walkthrough: [
      "Confirm encounter and source note.",
      "Find copied/refreshed sections.",
      "Review before sign or use correction path.",
    ],
    ifThatFails: [
      "Already signed: use addendum/correction path.",
      "Tool refresh broken: route content owner.",
      "Clinical accuracy concern: provider owner decides.",
    ],
    keywords: k("copy forward", "copy-forward", "copied forward", "note copy forward", "refresh note", "refresh data note", "note pulled old data", "old assessment in note", "old plan in note", "stale note data", "imported data wrong", "wrong data in note", "provider note refresh", "inpatient provider notes", "note carried forward"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_surgical_workflow_case_ready_blocked",
    title: "Surgical workflow is not ready or case status is blocked",
    type: "playbook",
    summary: "A surgical case will not move to ready — usually a missing document, order, or consent is blocking it.",
    roles: k("or support", "provider", "scheduler", "periop support"),
    domains: k("surgery", "periop", "case status"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Surgery/case board -> Case detail/status -> Required docs/orders/consent -> Owner",
    first90: [
      "Open the case detail and read current status.",
      "Check required docs, orders, and consent.",
      "Escalate if patient movement or procedure timing is blocked.",
    ],
    whatToSay: [
      "'Let's name what's actually missing — the status will move once the blocker is cleared.'",
      "'If this case is time-sensitive, I'll get the right person on it right now.'",
    ],
    whatToCheck: [
      "Case status, location, and the procedure on the schedule.",
      "Whether consent, the H&P or pre-op note, orders, or a pre-op task is still open.",
      "Whether just this case is stuck, or every case on the board is stuck the same way.",
    ],
    whenToEscalate: "If the case can't move, the patient can't be transported, or consent or orders are missing close to start time, send it to the surgery team lead or command center with the case status and a callback.",
    walkthrough: [
      "Open case status/detail.",
      "Check required docs/orders/consent.",
      "Route periop owner with blocker.",
    ],
    ifThatFails: [
      "Consent missing: use consent playbook.",
      "Orders missing: use order-entry path.",
      "Case not advancing: escalate periop owner.",
    ],
    keywords: k("surgical workflow", "surgery workflow", "surgical workflow efficiency", "case not ready", "case readiness", "preop not ready", "pre-op not ready", "or case not ready", "case status blocked", "surgery case status", "case board blocked", "case won't advance", "case wont advance", "procedure readiness", "surgery orders missing", "periop checklist blocked"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_radiant_protocol_ready_for_exam_blocked",
    title: "Radiant protocol or ready-for-exam status is blocked",
    type: "playbook",
    summary: "A radiology exam will not move to ready — could be the order, the protocol, patient prep, or transport.",
    roles: k("radiology tech", "provider", "scheduler", "transport"),
    domains: k("radiology", "imaging", "protocol"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Imaging order/exam -> Protocol/status -> Patient prep/transport -> Modality owner",
    first90: [
      "Separate order status from exam readiness.",
      "Check protocol, prep, and transport status.",
      "Route modality owner if timing is blocked.",
    ],
    whatToSay: [
      "'Let's figure out which step is stuck — the order, the protocol, patient prep, or transport.'",
      "'I'll get the exact status before we call the imaging team.'",
    ],
    whatToCheck: [
      "Order status, protocol status, exam status, and modality (CT, MRI, X-ray, ultrasound).",
      "Whether patient prep is done and transport is on the way.",
      "Whether one exam is stuck, or the whole modality queue is backed up.",
    ],
    whenToEscalate: "If the exam can't move because of protocol, prep, transport, or unclear ownership, send it to the imaging team with the exam status, the location, and a callback.",
    walkthrough: [
      "Open imaging order/exam detail.",
      "Check protocol and ready status.",
      "Route modality owner with blocker.",
    ],
    ifThatFails: [
      "Protocol pending: route radiology owner.",
      "Prep incomplete: route clinical owner.",
      "Transport delay: escalate patient movement.",
    ],
    keywords: k("radiant protocol", "radiology protocol", "protocol pending", "protocol blocked", "ready for exam", "exam not ready", "exam delayed", "radiant exam status", "modality queue", "ct protocol", "mri protocol", "xray ready", "ultrasound ready", "radiology patient prep", "radiology transport", "radiant workflow"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_prescription_printer_routing_wrong",
    title: "Prescription is printing to the wrong printer",
    type: "playbook",
    summary: "A prescription printed to the wrong printer — route it to the approved prescription printer and watch for duplicates.",
    roles: k("provider", "clinic support", "front desk"),
    domains: k("printing", "prescriptions", "orders"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Prescription/order -> Print action -> Printer selector/route -> One controlled reprint",
    first90: [
      "Keep the prescription/order screen open.",
      "Confirm the approved prescription printer route.",
      "Send one controlled reprint only after verifying printer.",
    ],
    whatToSay: [
      "'Before we reprint, let me make sure it's going to the prescription printer this time.'",
      "'We'll print it once so we don't end up with two scripts floating around.'",
    ],
    whatToCheck: [
      "Which printer is selected in the print menu, and whether it's the approved prescription printer.",
      "Whether the printer is online, offline, missing from the list, or out of paper.",
      "Whether a copy already printed somewhere else — we don't want duplicates of a controlled script.",
    ],
    whenToEscalate: "If the prescription printer is missing or offline, a duplicate may already exist, or the medication can't be sent, send it to device support with the printer name and what you saw.",
    walkthrough: [
      "Open prescription print action.",
      "Verify printer route/status.",
      "Print once and confirm output.",
    ],
    ifThatFails: [
      "Printer missing: device/support owner.",
      "Duplicate risk: stop and escalate.",
      "Prescription status blocked: provider/pharmacy owner.",
    ],
    keywords: k("print prescription", "print prescriptions", "prescription printer", "rx printer", "wrong prescription printer", "troy printer", "t printer", "how to print prescriptions", "printer for prescription", "prescription not printing", "rx not printing", "prescription printed wrong printer", "print rx", "paper prescription printer"),
    related_ids: ["p3", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_beaker_specimen_label_accession",
    title: "Lab specimen label or accession workflow is blocked",
    type: "playbook",
    summary: "Specimen label/accession questions are patient-safety workflows. Confirm order, specimen, label, and lab owner before reprinting or relabeling.",
    roles: k("lab", "inpatient nurse", "provider"),
    domains: k("lab", "specimen", "labels"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Pause before reprinting or relabeling.",
      "Confirm order, specimen, label, and collection status.",
      "Escalate if identity or specimen status is unclear.",
    ],
    whatToSay: [
      "'Pause here. Specimen labels are patient-safety items.'",
      "'We confirm order and specimen status before any reprint.'",
    ],
    whatToCheck: [
      "Order status, specimen type, collection time/status, label status, accession status, and printer route.",
      "Whether the issue is one specimen, one printer, or a lab-wide workflow.",
      "Whether local policy allows reprint or requires lab owner intervention.",
    ],
    whenToEscalate: "If order/specimen identity, collection status, or accession status is unclear, escalate to lab owner or command center before reprint, relabel, or accession action.",
    walkthrough: [
      "Stop before reprint/relabel.",
      "Confirm order, specimen, and collection status.",
      "Route lab owner if anything is unclear.",
    ],
    ifThatFails: [
      "Identity unclear: escalate immediately.",
      "Printer issue only: use label/printer playbook.",
      "Lab-wide block: command center with scope.",
    ],
    keywords: k("beaker", "lab specimen", "specimen label", "accession", "accessioning", "lab label", "label specimen", "reprint specimen", "specimen not printing", "collection status", "lab order", "lab accession", "wrong specimen label", "specimen workflow"),
    related_ids: ["c4", "p1", "v3"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_radiant_imaging_order_status",
    title: "Imaging order, protocol, or exam status is unclear",
    type: "playbook",
    summary: "Radiology workflow questions need order status, exam status, protocol ownership, and location before anyone changes the workflow.",
    roles: k("radiology tech", "provider", "scheduler"),
    domains: k("radiology", "imaging", "orders"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    first90: [
      "Confirm order status and exam status separately.",
      "Check location, modality, and protocol owner.",
      "Capture exact status before escalating.",
    ],
    whatToSay: [
      "'Let's separate the order from the exam status first.'",
      "'I will not change protocol or status without the imaging owner.'",
    ],
    whatToCheck: [
      "Order status, exam status, modality, location, protocol status, scheduling status, and responsible owner.",
      "Whether the question is scheduling, protocol, result, or workflow ownership.",
      "Whether one exam or multiple exams are affected.",
    ],
    whenToEscalate: "If protocol, exam status, or imaging owner is unclear, escalate to radiology/imaging workflow owner with modality, status, location, and callback.",
    walkthrough: [
      "Separate order status from exam status.",
      "Confirm modality, location, and protocol owner.",
      "Escalate with exact status and callback.",
    ],
    ifThatFails: [
      "Protocol unclear: route imaging owner.",
      "Order missing: use order-entry lane.",
      "Patient movement delayed: escalate with urgency.",
    ],
    keywords: k("radiant", "radiology", "imaging order", "exam status", "protocol", "protocol status", "modality", "xray", "x-ray", "ct order", "mri order", "ultrasound order", "radiology status", "imaging exam", "study status", "radiant fundamentals"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_anesthesia_macro_record_blocked",
    title: "Anesthesia macro, event, or case record is blocked",
    type: "playbook",
    summary: "Anesthesia documentation blocks need event, macro, medication, handoff, and case status checks before workaround advice.",
    roles: k("crna anesthesia", "anesthesia provider", "or support"),
    domains: k("anesthesia", "documentation", "medication"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "document",
    first90: [
      "Pause before adding a workaround entry.",
      "Confirm case status, event, macro, and medication context.",
      "Escalate if record completeness or med safety is affected.",
    ],
    whatToSay: [
      "'Let's not force a workaround in an anesthesia record.'",
      "'I will capture event, macro, and case status for the right owner.'",
    ],
    whatToCheck: [
      "Case status, event time, macro/template, medication documentation, handoff state, and signing status.",
      "Whether the issue is documentation display, missing macro, medication workflow, or case ownership.",
      "Whether the case is active, closing, or being handed off.",
    ],
    whenToEscalate: "If the anesthesia record, medication documentation, or handoff is blocked during active case care, escalate to anesthesia super-user/clinical informatics or command center immediately.",
    walkthrough: [
      "Confirm case status and event.",
      "Check macro/template and med context.",
      "Escalate active-case blocks immediately.",
    ],
    ifThatFails: [
      "Active case affected: command center now.",
      "Macro missing: route anesthesia build owner.",
      "Medication documentation unclear: involve pharmacy/clinical owner.",
    ],
    keywords: k("anesthesia", "crna", "anesthesia record", "case record", "macro", "anesthesia macro", "event missing", "case event", "handoff", "anesthesia medication", "or record", "periop anesthesia", "anesthesia documentation", "record won't sign", "case won't close"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_diagnosis_needed_for_order",
    title: "Diagnosis or indication is needed before an order can move",
    type: "playbook",
    summary: "If an order cannot move forward, confirm order context, diagnosis/indication linkage, and signing status before escalating.",
    roles: k("provider", "inpatient support", "clinic support"),
    domains: k("orders", "diagnosis", "order entry"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "place",
    is_deep_flow: true,
    nav_trail: "Chart -> Orders -> New order/order composer -> Diagnosis or indication field -> Sign/submit",
    visual_url: null,
    first90: [
      "Confirm the order and encounter context.",
      "Check whether diagnosis or indication is required.",
      "Retry sign only after the required field is complete.",
    ],
    whatToSay: [
      "'The order is asking for context before it can move.'",
      "'Let's confirm the diagnosis or indication lane before retrying sign.'",
    ],
    whatToCheck: [
      "Order name, encounter type, ordering role, required diagnosis/indication field, and sign status.",
      "Whether the diagnosis is missing, unmatched, inactive, or not associated to this order.",
      "Whether this affects one order, one provider, or a full order set.",
    ],
    whenToEscalate: "If the required diagnosis/indication field is complete but the order still will not sign, escalate to provider support or clinical informatics with order name, role, encounter, and error text.",
    walkthrough: [
      "Open the order details.",
      "Find required diagnosis or indication.",
      "Associate the approved item, then sign.",
    ],
    ifThatFails: [
      "Diagnosis not available: route provider-support owner.",
      "Order set affected: escalate as build/context issue.",
      "Patient care delayed: command center with exact blocker.",
    ],
    visualAids: [
      {
        kind: "tasklet",
        title: "Order diagnosis gate",
        note: "Mizly-safe mini flow: order context -> required diagnosis/indication -> sign status -> escalation packet.",
        callouts: [
          "1 - Confirm encounter and order.",
          "2 - Check required diagnosis/indication.",
          "3 - Retry sign once.",
          "4 - Escalate with exact error.",
        ],
      },
    ],
    keywords: k("diagnosis needed", "diagnosis required", "indication required", "associate diagnosis", "link diagnosis", "order diagnosis", "order needs diagnosis", "cannot sign order diagnosis", "dx required", "diagnosis for order", "diagnosis not linked"),
    related_ids: ["p2", "c22", "v24"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_order_status_unsigned_initiated",
    title: "Order is initiated, pending, or unsigned",
    type: "playbook",
    summary: "Separate draft, initiated, pending, and signed order states before telling the user to re-enter anything.",
    roles: k("provider", "nurse", "clinical support"),
    domains: k("orders", "signing", "status"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "sign",
    is_deep_flow: true,
    nav_trail: "Chart -> Orders -> Orders profile/status column -> Unsigned/pending/initiated state -> Sign/submit",
    visual_url: null,
    first90: [
      "Read the exact order status aloud.",
      "Confirm whose signature or action is next.",
      "Use the status lane before re-ordering.",
    ],
    whatToSay: [
      "'Let's name the status first so we do not duplicate the order.'",
      "'If it is waiting on a signer, we route that owner instead of re-entering.'",
    ],
    whatToCheck: [
      "Status text, signer/authorizing role, order source, active vs held state, and error banner.",
      "Whether the order is unsigned, pending cosign, initiated but not submitted, or held for review.",
      "Whether duplicate orders already exist.",
    ],
    whenToEscalate: "If the correct signer cannot complete the order or active patient care is waiting, escalate to provider support/clinical informatics with status, owner, and order name.",
    walkthrough: [
      "Open the order profile.",
      "Read status and signer owner.",
      "Route the next action without duplicating.",
    ],
    ifThatFails: [
      "Unsigned: find signer workflow.",
      "Pending cosign: use cosign lane.",
      "Status unclear: escalate with screenshot-free error text.",
    ],
    keywords: k("order unsigned", "unsigned order", "order pending", "pending order", "initiated order", "order initiated", "order is initiated", "initiated but not signed", "not signed", "order not signed", "cannot submit order", "order status", "order stuck", "order won't sign", "order wont sign", "sign order"),
    related_ids: ["p2", "c22", "v24"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_discontinue_cancel_order_safely",
    title: "Discontinue, cancel, or remove an order safely",
    type: "playbook",
    summary: "Before stopping an order, confirm status, ownership, clinical impact, and local cancellation path.",
    roles: k("provider", "nurse", "clinical support"),
    domains: k("orders", "discontinue", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    vendor_family: "cerner",
    action: "discontinue",
    is_deep_flow: true,
    nav_trail: "Chart -> Orders -> Active/pending order -> More/actions -> Discontinue/cancel reason -> Sign",
    visual_url: null,
    first90: [
      "Confirm the order is the one intended.",
      "Check active, pending, duplicate, or future status.",
      "Use the approved discontinue/cancel reason.",
    ],
    whatToSay: [
      "'Before we remove anything, let's confirm status and owner.'",
      "'We won't delete an active order just to clear the screen.'",
    ],
    whatToCheck: [
      "Order status, duplicate orders, linked tasks/results, future start, and discontinuation reason.",
      "Whether the requester owns the clinical decision to stop the order.",
      "Whether downstream tasks, medication administration, collection, or procedure scheduling is affected.",
    ],
    whenToEscalate: "If stopping the order affects active care or the correct action is greyed out, escalate to the ordering provider, charge nurse, or clinical informatics before acting.",
    walkthrough: [
      "Identify exact order and status.",
      "Confirm owner can stop it.",
      "Document reason through approved path.",
    ],
    ifThatFails: [
      "Action greyed out: check role/status.",
      "Downstream workflow active: involve clinical owner.",
      "Duplicate order: escalate before cleanup.",
    ],
    keywords: k("discontinue order", "cancel order", "remove order", "delete order", "stop order", "dc order", "d/c order", "order duplicate", "duplicate order", "order greyed out", "order grayed out", "cannot discontinue", "cannot cancel order"),
    related_ids: ["p7", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_home_med_rec_not_complete",
    title: "Home medication reconciliation is incomplete",
    type: "playbook",
    summary: "Medication reconciliation questions need source, status, reviewer, and sign-off checks before edits.",
    roles: k("provider", "nurse", "pharmacist", "pharmacy tech"),
    domains: k("medication", "reconciliation", "home meds"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "reconcile",
    is_deep_flow: true,
    nav_trail: "Chart -> Medication history/home meds -> Reconciliation status -> Reviewer/signature -> Orders",
    visual_url: null,
    first90: [
      "Confirm reconciliation type and status.",
      "Identify who owns review or signature.",
      "Pause before changing medication details.",
    ],
    whatToSay: [
      "'Let's confirm whether this is history, reconciliation, or an active order.'",
      "'I won't change med details from memory; we route the owner if unclear.'",
    ],
    whatToCheck: [
      "Home med source, reconcile status, reviewer role, signature status, and active orders created from it.",
      "Whether the question is missing medication, duplicate medication, wrong status, or unable to sign.",
      "Whether pharmacy, provider, or nursing owns the next step locally.",
    ],
    whenToEscalate: "If medication reconciliation is blocking discharge, admission orders, or medication safety, escalate to pharmacy/provider support or command center immediately.",
    walkthrough: [
      "Separate history from active orders.",
      "Check reconciliation status and owner.",
      "Escalate safety-blocked med reconciliation.",
    ],
    ifThatFails: [
      "Missing source: route med history owner.",
      "Cannot sign: capture status and signer.",
      "Discharge blocked: escalate now.",
    ],
    keywords: k("med rec", "medication reconciliation", "home med", "home meds", "home medications", "reconcile meds", "reconcile medication", "med history", "medication history", "home meds not complete", "cannot reconcile", "discharge med rec", "admission med rec"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_allergy_or_reaction_blocks_order",
    title: "Allergy or reaction field is blocking medication workflow",
    type: "playbook",
    summary: "Treat allergy blocks as safety checks: verify alert, reaction context, order status, and clinical owner.",
    roles: k("provider", "nurse", "pharmacist"),
    domains: k("medication", "allergy", "safety"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Chart -> Allergies/adverse reactions -> Medication order alert -> Acknowledge/route owner",
    visual_url: "/visual-guides/allergy-reaction-block.svg",
    visual_callouts: [
      "Read the allergy or reaction context before action.",
      "Compare the alert to the medication/order being blocked.",
      "Identify who owns the clinical decision.",
      "Escalate if override or reaction status is unclear.",
    ],
    first90: [
      "Do not bypass the allergy alert.",
      "Confirm reaction field and order status.",
      "Bring in clinical owner if unclear.",
    ],
    whatToSay: [
      "'This is a medication safety stop, so we slow down.'",
      "'I can help route the alert, not decide whether it is clinically okay.'",
    ],
    whatToCheck: [
      "Allergy list, reaction field, severity field, alert text, order status, and override/acknowledgement ownership.",
      "Whether the allergy entry is missing, duplicated, incomplete, or blocking a specific order.",
      "Whether pharmacy or provider needs to review before proceeding.",
    ],
    whenToEscalate: "If an allergy alert blocks medication ordering/admin or the user is unsure whether to override, escalate to pharmacy/provider owner before the medication moves.",
    walkthrough: [
      "Read alert and reaction context.",
      "Confirm medication order status.",
      "Route clinical decision owner.",
    ],
    ifThatFails: [
      "Reaction missing: route allergy documentation owner.",
      "Override unclear: pharmacy/provider review.",
      "Medication due now: command center with urgency.",
    ],
    keywords: k("allergy", "allergies", "reaction", "adverse reaction", "allergy alert", "allergy warning", "reaction field", "medication allergy", "allergy blocks order", "cannot order medication allergy", "override allergy", "allergy hard stop"),
    related_ids: ["p31", "c25", "v27"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_result_not_visible_or_acknowledge_blocked",
    title: "Result is not visible or acknowledgement is blocked",
    type: "playbook",
    summary: "For result questions, confirm context, filter, result status, and acknowledgement owner before escalating.",
    roles: k("provider", "nurse", "lab support", "clinical support"),
    domains: k("results", "review", "acknowledgement"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Chart -> Results/results review -> Date/status/filter -> Responsible owner/acknowledgement",
    visual_url: null,
    first90: [
      "Confirm chart, encounter, and date range.",
      "Check result status and display filter.",
      "Escalate blocked critical acknowledgement immediately.",
    ],
    whatToSay: [
      "'Let's separate hidden-by-filter from not resulted yet.'",
      "'If acknowledgement is blocked, we route that owner now.'",
    ],
    whatToCheck: [
      "Result date range, status, ordering context, responsible role, filter, and acknowledgement path.",
      "Whether the result is preliminary, final, corrected, hidden by view, or routed to another owner.",
      "Whether the result is time-sensitive or critical.",
    ],
    whenToEscalate: "If the result is critical/time-sensitive or acknowledgement cannot be completed, escalate to clinical owner/command center with result type, status, owner, and callback.",
    walkthrough: [
      "Check chart and date range.",
      "Confirm result status and filter.",
      "Route blocked acknowledgement.",
    ],
    ifThatFails: [
      "Not resulted: confirm order/specimen status.",
      "Hidden by view: adjust filter/date.",
      "Ack blocked: escalate immediately.",
    ],
    keywords: k("result not showing", "results not showing", "lab result not visible", "result missing", "cannot acknowledge result", "acknowledge result", "critical result", "result acknowledgement", "final result", "preliminary result", "corrected result", "results review", "result filter"),
    related_ids: ["p29", "c23", "v25"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_inbasket_message_wrong_pool",
    title: "In Basket message is in the wrong pool or owner queue",
    type: "playbook",
    summary: "Message-routing issues need owner, pool, proxy, folder, status, and urgency checks before moving work.",
    roles: k("provider", "office clerk", "clinic support"),
    domains: k("in basket", "messages", "routing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "route",
    is_deep_flow: true,
    nav_trail: "In Basket/message center -> Folder/pool -> Message owner/status -> Route/forward/resolve path",
    visual_url: null,
    first90: [
      "Identify personal, pool, or proxy ownership.",
      "Check folder, status, and urgency.",
      "Do not bulk-resolve to clean the queue.",
    ],
    whatToSay: [
      "'Let's find who owns the work before moving the message.'",
      "'We will not delete or resolve messages just to reduce the count.'",
    ],
    whatToCheck: [
      "Message folder, pool, owner, proxy/delegate view, status, urgency flag, and date range.",
      "Whether routing is wrong for one message, one pool, one user, or many users.",
      "Whether patient-care follow-up is waiting on the message.",
    ],
    whenToEscalate: "If messages are routing to the wrong pool for multiple users or urgent follow-up is blocked, escalate to ambulatory/provider support with pool, folder, status, and count.",
    walkthrough: [
      "Classify personal, pool, or proxy.",
      "Check status and folder filters.",
      "Route with owner and callback.",
    ],
    ifThatFails: [
      "One message: route owner path.",
      "Wrong pool: escalate routing build.",
      "Urgent follow-up blocked: escalate now.",
    ],
    keywords: k("in basket", "inbasket", "in basket message", "in basket message is in the wrong pool", "message is in the wrong pool", "wrong pool", "wrong pool owner queue", "message center", "message pool", "pool message", "proxy inbox", "delegate inbox", "provider messages", "message routing", "route message", "wrong owner", "wrong message owner", "folder messages", "cannot close message", "resolve message"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_note_unsigned_missing_required_field",
    title: "Note will not save or sign because something is missing",
    type: "playbook",
    summary: "A note-signing block usually needs note type, encounter, required fields, cosign, and ownership checks.",
    roles: k("provider", "nurse", "clinical support"),
    domains: k("documentation", "notes", "signing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "sign",
    is_deep_flow: true,
    nav_trail: "Chart -> Notes/documentation -> Note type -> Required fields/errors -> Sign/submit",
    visual_url: null,
    first90: [
      "Read the sign error exactly.",
      "Check note type and encounter context.",
      "Complete required fields before retrying sign.",
    ],
    whatToSay: [
      "'The note is telling us what gate is still open.'",
      "'Let's fix the required field, not rebuild the whole note.'",
    ],
    whatToCheck: [
      "Note type, encounter, author role, required fields, attestation/cosign, and error banner.",
      "Whether the note is draft, unsigned, pending cosign, or locked by another context.",
      "Whether the same note type signs for another user in the same role.",
    ],
    whenToEscalate: "If required fields are complete but signing still fails, escalate to documentation/provider support with note type, role, encounter, and error text.",
    walkthrough: [
      "Read the error banner.",
      "Find required field or cosign gate.",
      "Retry sign once after correction.",
    ],
    ifThatFails: [
      "Required field missing: complete approved field.",
      "Cosign pending: route signer owner.",
      "Same error after correction: escalate.",
    ],
    keywords: k("note won't sign", "note wont sign", "cannot sign note", "note not signing", "note save error", "cannot save note", "required field", "missing required field", "unsigned note", "draft note", "note error", "sign note", "submit note"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_signed_note_addendum_correction",
    title: "Signed note needs addendum or correction",
    type: "playbook",
    summary: "After a note is signed, use the approved addendum/correction lane instead of editing the original text.",
    roles: k("provider", "clinical support"),
    domains: k("documentation", "notes", "correction"),
    phases: k("stabilization week 1", "optimization"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "modify",
    is_deep_flow: true,
    nav_trail: "Chart -> Notes -> Signed note -> Addendum/correction action -> Sign addendum",
    visual_url: null,
    first90: [
      "Confirm the note is already signed.",
      "Use addendum or correction, not direct edit.",
      "Capture reason using local policy language.",
    ],
    whatToSay: [
      "'Because it is signed, we use the correction path.'",
      "'Let's avoid changing the original signed text directly.'",
    ],
    whatToCheck: [
      "Signed/locked status, author owner, addendum availability, correction reason, and cosign needs.",
      "Whether the note belongs to the right encounter and author.",
      "Whether the change is factual correction, late entry, or wrong-note/wrong-encounter concern.",
    ],
    whenToEscalate: "If the note is in the wrong chart/encounter or addendum/correction is unavailable, escalate to documentation owner or clinical informatics before changing anything.",
    walkthrough: [
      "Confirm signed status.",
      "Open addendum/correction lane.",
      "Sign the correction through policy path.",
    ],
    ifThatFails: [
      "Addendum unavailable: check author/status.",
      "Wrong encounter: escalate immediately.",
      "Cosign needed: route signer owner.",
    ],
    keywords: k("addendum", "note addendum", "signed note correction", "correct signed note", "amend note", "amendment", "late entry", "edit signed note", "change signed note", "wrong note", "note correction", "modify signed note"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_order_favorites_or_personal_list_missing",
    title: "Favorite order, personal list, or shortcut is missing",
    type: "playbook",
    summary: "Missing shortcuts can be personalization, search, role, location, or build availability. Confirm lane before rebuilding.",
    roles: k("provider", "clinic support", "inpatient support"),
    domains: k("orders", "personalization", "favorites"),
    phases: k("cutover day 0", "stabilization week 1", "optimization"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "place",
    nav_trail: "Orders -> Favorites/recent/personal lists -> All search -> Personalization or build owner",
    visual_url: null,
    first90: [
      "Search exact name and one synonym.",
      "Check favorites, recent, and all orders.",
      "Separate personal shortcut from build availability.",
    ],
    whatToSay: [
      "'Let's see if the order exists before we rebuild the shortcut.'",
      "'If all users are missing it, that is not personalization.'",
    ],
    whatToCheck: [
      "Favorites, recent list, personal list, specialty/location context, order availability, and role.",
      "Whether the item is missing for one user or everyone in the same role/location.",
      "Whether the user expects a favorite, preference list, SmartSet, PowerPlan, or order set.",
    ],
    whenToEscalate: "If the order exists but cannot be favorited or is missing for a full role/location, escalate to personalization/build owner with context and exact expected item.",
    walkthrough: [
      "Search outside favorites first.",
      "Check personal vs shared availability.",
      "Escalate full-role missing items.",
    ],
    ifThatFails: [
      "One user: personalization lane.",
      "All users: build/availability lane.",
      "Order not found: use order-entry escalation.",
    ],
    keywords: k("favorite order", "favorite orders", "favorites missing", "order favorites", "personal list", "preference list missing", "quick order", "shortcut missing", "order not in favorites", "cannot find favorite", "favorite not showing", "favorites not showing", "personalization"),
    related_ids: ["p7", "c3", "v10"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_patient_list_filter_or_relationship",
    title: "Patient is hidden by list filter, relationship, or view",
    type: "playbook",
    summary: "When a patient is missing from a list, check filter, relationship, location, date range, and refresh before escalation.",
    roles: k("provider", "nurse", "office clerk"),
    domains: k("patient list", "worklist", "filters"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Patient list/worklist -> List name -> Filters/relationship/location -> Refresh -> Search fallback",
    visual_url: null,
    first90: [
      "Confirm the user is on the right list.",
      "Check relationship, location, and date filters.",
      "Refresh once before creating new work.",
    ],
    whatToSay: [
      "'One filter can make the right patient disappear.'",
      "'Let's prove whether the patient is missing or just hidden.'",
    ],
    whatToCheck: [
      "List name, relationship/team assignment, location, service, date range, active/discharged filter, and refresh state.",
      "Whether the patient appears through search or another approved list.",
      "Whether the patient is missing for one user or one whole role/team.",
    ],
    whenToEscalate: "If the patient cannot be found through approved search or is hidden for an entire role/team, escalate to patient-list/worklist owner with list, filters, role, and location.",
    walkthrough: [
      "Verify list name.",
      "Remove/adjust filters carefully.",
      "Search approved fallback before escalation.",
    ],
    ifThatFails: [
      "One user: relationship or personalization.",
      "Whole team: list build/rules issue.",
      "Care waiting: escalate with urgency.",
    ],
    keywords: k("patient hidden", "patient not on list", "missing from list", "relationship filter", "provider relationship", "location filter", "date filter", "active patients", "discharged filter", "rounding list filter", "worklist filter", "list refresh", "patient list filter"),
    related_ids: ["p3", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_provider_handoff_or_signout_missing",
    title: "Provider handoff or signout is missing or outdated",
    type: "playbook",
    summary: "Handoff questions need patient-list context, responsible owner, last update, and signout visibility checks.",
    roles: k("provider", "inpatient support"),
    domains: k("handoff", "signout", "patient list"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "document",
    nav_trail: "Patient list -> Handoff/signout column or activity -> Last update/owner -> Save/route",
    visual_url: null,
    first90: [
      "Confirm the correct patient list first.",
      "Check last update, owner, and visibility.",
      "Do not rewrite clinical handoff content yourself.",
    ],
    whatToSay: [
      "'Let's find where the signout is supposed to live for this team.'",
      "'I can help with the workflow, but the clinical content stays with the provider.'",
    ],
    whatToCheck: [
      "List, service/team, handoff column/activity, last update time, owner, visibility, and save status.",
      "Whether the issue is missing handoff, outdated handoff, wrong team view, or unable to save.",
      "Whether shift change or active care depends on it.",
    ],
    whenToEscalate: "If handoff/signout is unavailable during shift change or cannot save for a team, escalate to provider support or command center with team, list, and blocker.",
    walkthrough: [
      "Open team list.",
      "Find handoff/signout lane.",
      "Route save/visibility blocker.",
    ],
    ifThatFails: [
      "Wrong list: correct team/service view.",
      "Cannot save: escalate provider workflow owner.",
      "Shift change blocked: command center.",
    ],
    keywords: k("handoff", "signout", "sign out", "provider handoff", "patient handoff", "handoff missing", "handoff outdated", "signout missing", "signout not saving", "team handoff", "shift change handoff", "provider signout"),
    related_ids: ["p14", "c7", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_periop_case_status_not_advancing",
    title: "Perioperative case status is not advancing",
    type: "playbook",
    summary: "Case-status blocks need location, phase, required event, documentation, and owner checks before manual workarounds.",
    roles: k("or support", "nurse", "anesthesia provider", "front desk"),
    domains: k("periop", "surgery", "case status"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Surgery/periop board -> Case -> Phase/status -> Required event/documentation -> Owner",
    visual_url: null,
    first90: [
      "Confirm case, location, and current phase.",
      "Check required event or documentation gate.",
      "Escalate active case delays immediately.",
    ],
    whatToSay: [
      "'Let's identify which status gate is holding the case.'",
      "'We will not force the case forward without the required owner.'",
    ],
    whatToCheck: [
      "Case status, location, phase, required event, required documentation, anesthesia/nursing owner, and board filter.",
      "Whether the case is pre-op, intra-op, recovery, closed, cancelled, or pending handoff.",
      "Whether transport, documentation, anesthesia event, or scheduling ownership is blocking movement.",
    ],
    whenToEscalate: "If a live case, room turnover, transport, or anesthesia documentation is blocked, escalate to periop charge/anesthesia support or command center immediately.",
    walkthrough: [
      "Read case phase and status.",
      "Find required event/documentation gate.",
      "Escalate active-case blockers.",
    ],
    ifThatFails: [
      "Event missing: route event owner.",
      "Board filter issue: adjust view once.",
      "Live case delayed: command center now.",
    ],
    keywords: k("case status", "periop status", "surgery case", "or case", "case not advancing", "case won't move", "preop status", "intraop status", "pac u status", "recovery status", "surgical workflow", "case board", "perioperative board", "room status"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_procedure_macro_not_applying",
    title: "Procedure macro or template is not applying",
    type: "playbook",
    summary: "When a macro does not apply, confirm context, template ownership, required fields, and whether it is personal or shared.",
    roles: k("provider", "or support", "clinical support"),
    domains: k("macros", "procedure documentation", "templates"),
    phases: k("cutover day 0", "stabilization week 1", "optimization"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Procedure note/documentation -> Macro/template menu -> Personal/shared source -> Required fields",
    visual_url: null,
    first90: [
      "Confirm the documentation context first.",
      "Check personal vs shared macro source.",
      "Search exact macro name and synonym.",
    ],
    whatToSay: [
      "'Let's confirm whether the macro is missing or just unavailable in this context.'",
      "'If it is shared, we route the owner; if personal, we check personalization.'",
    ],
    whatToCheck: [
      "Procedure context, note type, macro name, owner, shared/personal status, required fields, and role/location.",
      "Whether the macro appears in another approved note type or for another user in the same role.",
      "Whether the issue is missing macro, disabled macro, required-field block, or signature block.",
    ],
    whenToEscalate: "If a shared procedure macro is missing for multiple users or blocks required documentation, escalate to documentation/build owner with context and macro name.",
    walkthrough: [
      "Confirm note/procedure context.",
      "Check personal vs shared source.",
      "Route missing shared macros.",
    ],
    ifThatFails: [
      "Personal macro: personalization lane.",
      "Shared macro missing: build owner.",
      "Required field block: documentation owner.",
    ],
    keywords: k("procedure macro", "macro not applying", "macro missing", "macro won't work", "macro wont work", "template not applying", "procedure template", "procedure documentation macro", "personal macro", "shared macro", "macro disabled", "macro not firing", "macro not showing"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_discharge_or_departure_blocked",
    title: "Discharge or departure workflow is blocked",
    type: "playbook",
    summary: "Discharge blocks need status, required documentation, orders, education, and owner checks before workaround advice.",
    roles: k("provider", "nurse", "case manager", "front desk"),
    domains: k("discharge", "handoff", "orders"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Chart -> Discharge/departure workflow -> Required items -> Orders/instructions -> Sign/complete",
    visual_url: null,
    first90: [
      "Confirm what discharge step is blocked.",
      "Check required orders, instructions, and signatures.",
      "Escalate if patient flow is waiting.",
    ],
    whatToSay: [
      "'Let's find the exact discharge gate instead of clicking around.'",
      "'If the patient is waiting to leave, we escalate with the blocker and owner.'",
    ],
    whatToCheck: [
      "Discharge status, required documents, medication reconciliation, instructions, education, follow-up, orders, and signature owner.",
      "Whether the block is provider-owned, nursing-owned, case-management-owned, or registration-owned.",
      "Whether the patient is physically waiting on the workflow.",
    ],
    whenToEscalate: "If discharge/departure is delayed by a system block after first-pass checks, escalate to command center with blocked step, owner, and patient-flow impact.",
    walkthrough: [
      "Name the blocked discharge gate.",
      "Find required owner item.",
      "Escalate patient-flow delays.",
    ],
    ifThatFails: [
      "Provider item missing: route provider owner.",
      "Nursing item missing: route charge/clinical owner.",
      "Patient waiting: command center.",
    ],
    keywords: k("discharge blocked", "cannot discharge", "discharge won't complete", "discharge wont complete", "departure blocked", "ed discharge blocked", "discharge instructions", "discharge paperwork", "discharge order", "patient cannot leave", "complete discharge", "discharge checklist", "depart process"),
    related_ids: ["p11", "c6", "v11"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_transfer_transport_task_stuck",
    title: "Transfer, transport, or patient-movement task is stuck",
    type: "playbook",
    summary: "Patient-movement blocks need status, sending/receiving owner, bed/transport dependency, and callback checks.",
    roles: k("nurse", "transporter", "bed control", "front desk"),
    domains: k("patient movement", "transport", "bed control"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Patient movement/bed board -> Transfer or transport task -> Status/owner -> Callback/escalation",
    visual_url: null,
    first90: [
      "Confirm sending and receiving location.",
      "Check task status, owner, and dependency.",
      "Escalate active movement delays with callback.",
    ],
    whatToSay: [
      "'Let's separate bed assignment, transport, and receiving-unit readiness.'",
      "'I will capture the owner and callback so this does not float.'",
    ],
    whatToCheck: [
      "Transfer/transport task status, sending unit, receiving unit, bed status, transport owner, and pending dependency.",
      "Whether the issue is one patient, one unit, or a board-wide delay.",
      "Whether the patient is waiting physically or care area throughput is affected.",
    ],
    whenToEscalate: "If movement is delayed after status/owner checks or bed assignment is unclear, escalate to bed control/transport/charge owner with status, dependency, and callback.",
    walkthrough: [
      "Name current movement status.",
      "Find owner and dependency.",
      "Escalate delayed physical movement.",
    ],
    ifThatFails: [
      "Bed unclear: bed-control owner.",
      "Transport pending: transport/charge owner.",
      "Receiving unit blocked: command center if urgent.",
    ],
    keywords: k("transfer stuck", "transport stuck", "transport task", "patient movement", "patient cannot move", "move patient", "receiving unit", "sending unit", "bed assignment", "transfer task", "transport request", "patient transfer", "movement delay", "placement delay"),
    related_ids: ["p17", "c11", "v13"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_reports_workqueue_filter_wrong",
    title: "Report or work queue is missing the expected items",
    type: "playbook",
    summary: "Report and work-queue misses are usually filter, date, location, owner, or status problems before they are build problems.",
    roles: k("office clerk", "biller", "nurse", "provider"),
    domains: k("reports", "work queue", "filters"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Reports/work queue -> Filter panel -> Date/location/status/owner -> Refresh/export if allowed",
    visual_url: null,
    first90: [
      "Confirm the report or queue name.",
      "Check date, location, status, and owner filters.",
      "Refresh once after filters are corrected.",
    ],
    whatToSay: [
      "'Let's prove whether the item is missing or filtered out.'",
      "'We will check the queue rules before calling it broken.'",
    ],
    whatToCheck: [
      "Report/queue name, date range, location, status, owner, role, and saved-view defaults.",
      "Whether another user with the same role sees the same count.",
      "Whether the report is live, cached, scheduled, or manually refreshed.",
    ],
    whenToEscalate: "If correct filters still miss expected items for a full role/team, escalate to reporting/work-queue owner with queue name, filters, count, and callback.",
    walkthrough: [
      "Read report or queue name.",
      "Check filters and saved view.",
      "Refresh once, then escalate scope.",
    ],
    ifThatFails: [
      "One user: saved view or role setup.",
      "Full team: queue/report rule issue.",
      "Time-sensitive work blocked: escalate now.",
    ],
    keywords: k("report missing", "report not showing", "report filter", "workqueue", "work queue", "queue missing", "queue filter", "wrong count", "missing from queue", "report count wrong", "saved view", "status filter", "owner filter", "date filter report", "report refresh"),
    related_ids: ["p7", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_charge_not_dropping_after_visit",
    title: "Charge is not dropping after documentation or visit close",
    type: "playbook",
    summary: "The visit is done but the charge has not shown up where billing expects it.",
    roles: k("biller", "clinic staff", "provider", "front desk"),
    domains: k("charge capture", "billing", "documentation"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Encounter/visit -> Documentation or procedure status -> Charge review/work queue -> Billing owner",
    visual_url: null,
    first90: [
      "Confirm encounter and service date.",
      "Check documentation, signature, and visit status.",
      "Review charge queue before manual charge entry.",
    ],
    whatToSay: [
      "'Let me check whether the charge already fired before we add anything by hand.'",
      "'If the note or the visit isn't closed yet, the charge may just still be waiting.'",
    ],
    whatToCheck: [
      "The visit and date of service, and whether the provider's note is signed.",
      "The visit status (open, closed, or pending) and the procedure status.",
      "Whether one visit is affected, or every visit for that provider or department is missing charges.",
    ],
    whenToEscalate: "If the documentation is complete but the charge still isn't there, send it to the charge capture lead with the visit, the trigger, the queue, and any hold reason.",
    walkthrough: [
      "Check visit and documentation status.",
      "Look for charge queue or hold reason.",
      "Escalate before manual workarounds.",
    ],
    ifThatFails: [
      "Unsigned doc: route signer owner.",
      "Charge hold: route revenue owner.",
      "Department-wide gap: command/revenue escalation.",
    ],
    keywords: k("charge not dropping", "charge did not drop", "charge missing", "charges missing", "drop charges", "charge capture", "charge review", "charge queue", "visit charge", "documentation charge", "procedure charge", "billing charge", "charge hold", "charge not showing"),
    related_ids: ["p7", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_authorization_or_referral_status_missing",
    title: "Authorization or referral status is missing",
    type: "playbook",
    summary: "Referral and authorization issues need order/request, appointment, coverage, status, and owner checks before rescheduling.",
    roles: k("front desk", "scheduler", "office clerk", "case manager"),
    domains: k("referral", "authorization", "scheduling"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Appointment/request -> Referral or authorization area -> Coverage/status -> Owner queue",
    visual_url: "/visual-guides/authorization-referral-status.svg",
    visual_callouts: [
      "Start from the appointment or request context.",
      "Check referral/auth status and coverage lane.",
      "Confirm owner queue before changing the visit.",
      "Escalate same-day blockers with callback.",
    ],
    first90: [
      "Confirm appointment or order/request context.",
      "Check referral, auth, and coverage status.",
      "Route owner before changing the appointment.",
    ],
    whatToSay: [
      "'Let's see whether the auth is missing, pending, or hidden by context.'",
      "'We will not cancel or move the visit until the owner is clear.'",
    ],
    whatToCheck: [
      "Appointment, order/request, referral link, authorization status, coverage, payer lane, owner queue, and date/time.",
      "Whether status is missing, pending, denied, expired, or attached to the wrong context.",
      "Whether the patient is present or the visit is time-sensitive.",
    ],
    whenToEscalate: "If authorization/referral status blocks a same-day visit or cannot be linked, escalate to referral/authorization owner with appointment context and callback.",
    walkthrough: [
      "Open appointment/request context.",
      "Check referral/auth status and coverage.",
      "Route owner before schedule changes.",
    ],
    ifThatFails: [
      "Pending auth: route auth owner.",
      "Wrong appointment link: scheduling owner.",
      "Patient waiting: escalate same-day.",
    ],
    keywords: k("authorization missing", "auth missing", "auth status", "authorization status", "referral missing", "referral status", "referral not linked", "auth not linked", "authorization not linked", "pending authorization", "denied authorization", "expired authorization", "same day auth", "referral queue"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_coverage_insurance_scan_or_card_missing",
    title: "Coverage or insurance card is missing from registration",
    type: "playbook",
    summary: "Insurance coverage or the insurance card image is missing from registration.",
    roles: k("registration", "front desk", "biller"),
    domains: k("registration", "coverage", "insurance"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Registration -> Coverage/insurance area -> Card image/document -> Encounter/account context",
    visual_url: null,
    first90: [
      "Confirm the correct person and encounter.",
      "Check active coverage and card image.",
      "Scan or route only through approved lane.",
    ],
    whatToSay: [
      "'Let me confirm the right person and the right visit before we add or change coverage.'",
      "'If the insurance card image is missing, I'll attach it to the correct visit.'",
    ],
    whatToCheck: [
      "That you're on the right patient and the right visit before anything else.",
      "Whether coverage is just missing, inactive, expired, duplicate, or only missing the card image.",
      "Whether this is a registration question, a billing question, or a document scanning question.",
    ],
    whenToEscalate: "If you can't verify coverage, or attaching the card could land on the wrong account, send it to the registration lead with the visit, the account, and the document type.",
    walkthrough: [
      "Verify identity and encounter/account.",
      "Check coverage and card image.",
      "Attach only through approved document lane.",
    ],
    ifThatFails: [
      "Coverage missing: registration/billing owner.",
      "Card scan missing: document lane.",
      "Wrong account risk: stop and escalate.",
    ],
    keywords: k("insurance card", "coverage missing", "insurance missing", "card scan", "scan insurance", "insurance scan", "coverage not showing", "payer missing", "coverage expired", "coverage inactive", "registration coverage", "billing coverage", "card image missing"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_lab_collection_task_not_complete",
    title: "Lab collection task or specimen status is stuck",
    type: "playbook",
    summary: "Lab collection issues need order status, collection task, specimen label, received status, and owner checks before recollecting.",
    roles: k("nurse", "lab tech", "ed support"),
    domains: k("lab", "specimen", "collection"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Orders/specimen collection -> Collection task -> Label/accession -> Received/result status",
    visual_url: null,
    first90: [
      "Confirm order and collection status.",
      "Check label/accession and received status.",
      "Do not recollect without clinical/lab owner.",
    ],
    whatToSay: [
      "'Let's see whether this is ordered, collected, received, or resulted.'",
      "'We do not recollect from a screen guess.'",
    ],
    whatToCheck: [
      "Order status, collection task, label/accession, collected time, received status, specimen type, and result status.",
      "Whether one specimen, one collector, one printer, or the lab queue is affected.",
      "Whether active care is waiting on the result.",
    ],
    whenToEscalate: "If specimen status is unclear, active care is waiting, or recollection is being considered, escalate to lab/clinical owner immediately.",
    walkthrough: [
      "Check order and collection task.",
      "Verify label/accession and received status.",
      "Route lab owner before recollecting.",
    ],
    ifThatFails: [
      "Task not complete: route collection owner.",
      "Specimen not received: lab owner.",
      "Care waiting: command center escalation.",
    ],
    keywords: k("specimen collection", "collection task", "lab collection", "specimen status", "specimen not received", "lab not received", "recollect", "recollection", "collected but not received", "lab task stuck", "specimen task", "collection status", "lab order status"),
    related_ids: ["p29", "c23", "v25"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_lab_label_reprint_or_wrong_printer",
    title: "Lab label needs reprint or printed to the wrong device",
    type: "playbook",
    summary: "Specimen-label questions are patient-safety moments: confirm order, label type, printer context, and reprint policy before acting.",
    roles: k("nurse", "lab tech", "registration"),
    domains: k("lab", "labels", "printing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Specimen/order -> Label print/reprint -> Printer context -> Verify label before use",
    visual_url: null,
    first90: [
      "Confirm the order and specimen.",
      "Check printer context before reprinting.",
      "Verify the new label before use.",
    ],
    whatToSay: [
      "'Before we reprint, let's confirm this is the correct specimen and device.'",
      "'We do one controlled reprint, then verify the label before it touches the tube.'",
    ],
    whatToCheck: [
      "Order, specimen type, label type, original print status, printer context, reprint reason, and label verification.",
      "Whether the wrong device, wrong location, label jam, or missing label caused the issue.",
      "Whether duplicate labels exist.",
    ],
    whenToEscalate: "If duplicate/wrong labels exist, the printer is misrouting, or label identity is uncertain, escalate to lab/device owner before collection.",
    walkthrough: [
      "Confirm order and specimen.",
      "Check printer/device context.",
      "Reprint only per policy and verify.",
    ],
    ifThatFails: [
      "Wrong printer: device/support owner.",
      "Duplicate labels: lab safety pause.",
      "Identity uncertain: stop and escalate.",
    ],
    keywords: k("lab label reprint", "lab label reprint wrong printer", "lab label reprint went to the wrong printer", "reprint label", "specimen label reprint", "wrong printer label", "wrong printer", "label printed wrong", "lab label missing", "specimen label missing", "label jam", "label not printing", "duplicate label", "print specimen label", "label printer"),
    related_ids: ["p3", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_radiology_exam_ready_transport_prep",
    title: "Imaging exam is delayed by prep, transport, or ready status",
    type: "playbook",
    summary: "Imaging delays need order, protocol, readiness, transport, location, and modality owner checks before promising timing.",
    roles: k("radiology tech", "nurse", "transport", "provider"),
    domains: k("radiology", "imaging", "transport"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Imaging order/exam -> Protocol/readiness -> Patient location/transport -> Modality owner",
    visual_url: null,
    first90: [
      "Confirm order and exam status.",
      "Check readiness, prep, and transport dependency.",
      "Name modality owner before promising time.",
    ],
    whatToSay: [
      "'Let's separate order status from readiness and transport.'",
      "'I will not promise a scan time until we know the owner.'",
    ],
    whatToCheck: [
      "Order status, protocol status, patient prep, readiness status, location, transport task, modality, and callback owner.",
      "Whether delay is order/protocol, nursing prep, transport, modality queue, or patient-location mismatch.",
      "Whether care area throughput is affected.",
    ],
    whenToEscalate: "If imaging readiness or transport blocks time-sensitive care, escalate to radiology/modality owner or command center with status and dependency.",
    walkthrough: [
      "Check order and exam status.",
      "Find prep or transport dependency.",
      "Route modality owner with callback.",
    ],
    ifThatFails: [
      "Protocol pending: radiology owner.",
      "Prep incomplete: clinical owner.",
      "Transport delayed: transport/command escalation.",
    ],
    keywords: k("imaging delay", "radiology delay", "exam delayed", "patient ready imaging", "ready for exam", "radiology transport", "imaging transport", "ct delayed", "mri delayed", "xray delayed", "ultrasound delayed", "exam ready", "patient prep", "modality queue", "scan time"),
    related_ids: ["p2", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_pharmacy_verification_or_med_queue_stuck",
    title: "Medication is waiting on pharmacy verification or queue review",
    type: "playbook",
    summary: "Medication queue blocks need order status, verification owner, due time, dispense/admin status, and safety impact checks.",
    roles: k("nurse", "provider", "pharmacist", "pharmacy tech"),
    domains: k("medication", "pharmacy", "verification"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Medication order -> Verification/status -> MAR/dispense context -> Pharmacy/clinical owner",
    visual_url: null,
    first90: [
      "Confirm medication order status.",
      "Check verification, due time, and dispense state.",
      "Escalate time-sensitive doses before delay.",
    ],
    whatToSay: [
      "'Let's see whether this is waiting on verification, dispense, or administration.'",
      "'If the dose is due now, we escalate the owner instead of guessing.'",
    ],
    whatToCheck: [
      "Order status, pharmacy verification status, due time, dispense status, MAR visibility, alert/hard stop, and owner.",
      "Whether one medication, one patient, one unit, or the pharmacy queue is affected.",
      "Whether active administration is delayed.",
    ],
    whenToEscalate: "If a due or urgent medication is waiting on unclear verification/dispense status, escalate to pharmacy/clinical owner immediately.",
    walkthrough: [
      "Check order and verification status.",
      "Compare due time and dispense state.",
      "Escalate delayed active doses.",
    ],
    ifThatFails: [
      "Pending verification: pharmacy owner.",
      "Dispense issue: pharmacy/device lane.",
      "Dose due now: command/clinical escalation.",
    ],
    keywords: k("pharmacy verification", "verify medication", "medication verification", "pharmacy queue", "med queue", "medication queue", "pending verification", "waiting on pharmacy", "pharmacy review", "med not verified", "med not available", "dispense status", "dose due", "med due now"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_barcode_med_admin_scan_mismatch",
    title: "Medication barcode scan does not match the order",
    type: "playbook",
    summary: "Barcode medication mismatch is a safety stop: verify patient, medication, order, package, scanner, and owner before continuing.",
    roles: k("nurse", "pharmacy support", "clinical support"),
    domains: k("medication", "barcode", "administration"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "MAR/med administration -> Patient scan -> Medication scan -> Mismatch alert -> Pharmacy/clinical owner",
    visual_url: null,
    first90: [
      "Stop before administering.",
      "Confirm patient, medication, and order match.",
      "Escalate unresolved barcode mismatch immediately.",
    ],
    whatToSay: [
      "'This is a safety stop. We do not bypass it from memory.'",
      "'Let's confirm patient, package, and order before anything is given.'",
    ],
    whatToCheck: [
      "Patient scan, medication package, order, dose, route, due time, barcode alert text, scanner/device, and pharmacy owner.",
      "Whether the issue is package barcode, wrong medication, wrong order, scanner/device, or timing.",
      "Whether the medication is due or urgent.",
    ],
    whenToEscalate: "If barcode mismatch persists or the medication is due/urgent, escalate to charge nurse/pharmacy support before administration.",
    walkthrough: [
      "Pause administration.",
      "Verify patient, order, and package.",
      "Route unresolved mismatch before giving.",
    ],
    ifThatFails: [
      "Package mismatch: pharmacy owner.",
      "Scanner issue: device lane.",
      "Urgent med due: charge/pharmacy now.",
    ],
    keywords: k("barcode mismatch", "med barcode", "medication barcode", "barcode not matching", "scan mismatch", "bcma mismatch", "scanner medication", "med won't scan", "med wont scan", "wrong barcode", "patient scan medication", "barcode alert", "med administration scan"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_therapy_eval_or_treatment_note_missing",
    title: "Therapy evaluation or treatment note is missing",
    type: "playbook",
    summary: "Therapy documentation questions need discipline, note type, visit context, required sections, and signature owner checks.",
    roles: k("therapy pt ot st", "clinical support"),
    domains: k("therapy", "documentation", "notes"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "document",
    nav_trail: "Chart -> Therapy documentation -> Eval/treatment note type -> Required sections -> Sign",
    visual_url: null,
    first90: [
      "Confirm discipline and visit context.",
      "Search eval/treatment note type.",
      "Check required sections before signing.",
    ],
    whatToSay: [
      "'Let's confirm the therapy discipline and note type first.'",
      "'If the template is missing for the whole team, that is build or role access.'",
    ],
    whatToCheck: [
      "Discipline, visit/encounter, eval vs treatment note, required sections, signer, and role/location.",
      "Whether the note is missing, hidden by context, incomplete, or unable to sign.",
      "Whether another therapist with the same role/location can see it.",
    ],
    whenToEscalate: "If therapy note type is missing for multiple users or required sections block signing, escalate to therapy documentation/build owner with role and context.",
    walkthrough: [
      "Confirm discipline and encounter.",
      "Find correct eval/treatment note type.",
      "Escalate team-wide missing templates.",
    ],
    ifThatFails: [
      "One user: role/personalization lane.",
      "Whole team: build/template owner.",
      "Care plan/signature blocked: escalate sooner.",
    ],
    keywords: k("therapy note", "therapy eval", "therapy evaluation", "pt note", "ot note", "st note", "speech therapy note", "physical therapy note", "occupational therapy note", "treatment note", "therapy documentation", "eval note missing", "therapy note missing", "therapy note won't sign"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_behavioral_health_treatment_plan_or_safety_assessment",
    title: "Behavioral health plan or safety assessment is blocking documentation",
    type: "playbook",
    summary: "Behavioral-health documentation blocks need plan status, assessment type, required section, owner, and safety escalation checks.",
    roles: k("behavioral health therapist", "behavioral health counselor", "nurse", "provider"),
    domains: k("behavioral health", "treatment plan", "safety assessment"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "document",
    is_deep_flow: true,
    nav_trail: "Chart -> Behavioral health documentation -> Treatment plan/safety assessment -> Required section/signature",
    visual_url: null,
    first90: [
      "Confirm plan or assessment type.",
      "Check status, owner, and required sections.",
      "Escalate safety-blocked documentation immediately.",
    ],
    whatToSay: [
      "'Let's identify whether this is a plan-status issue or a required safety section.'",
      "'If safety documentation is blocked, we route the clinical owner now.'",
    ],
    whatToCheck: [
      "Treatment-plan status, safety-assessment type, required sections, owner role, signature status, and encounter context.",
      "Whether the issue is missing template, locked plan, required field, cosign, or role access.",
      "Whether active safety workflow depends on it.",
    ],
    whenToEscalate: "If safety assessment, legal/safety hold, or treatment plan documentation is blocked, escalate to behavioral-health clinical owner or command center immediately.",
    walkthrough: [
      "Identify plan vs safety assessment.",
      "Check required section and owner.",
      "Escalate active safety blockers.",
    ],
    ifThatFails: [
      "Plan locked: status/owner lane.",
      "Template missing: documentation build owner.",
      "Safety workflow blocked: command escalation.",
    ],
    keywords: k("behavioral health", "bh treatment plan", "behavioral treatment plan", "safety assessment", "risk assessment", "crisis assessment", "treatment plan blocked", "treatment plan missing", "bh note", "behavioral health note", "safety plan", "master treatment plan", "plan locked"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_ob_fetal_monitor_or_fetalink_documentation",
    title: "OB fetal monitoring or delivery event documentation is not flowing",
    type: "playbook",
    summary: "OB fetal-monitoring questions need device/feed status, chart context, event timing, owner, and safety escalation checks.",
    roles: k("nurse", "provider", "ob support"),
    domains: k("ob", "fetal monitoring", "documentation"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "document",
    is_deep_flow: true,
    nav_trail: "OB chart -> Fetal monitoring/events -> Device/feed status -> Documentation owner",
    visual_url: null,
    first90: [
      "Confirm patient and OB chart context.",
      "Check device/feed and event timing.",
      "Escalate missing monitoring data immediately.",
    ],
    whatToSay: [
      "'This is a monitoring workflow, so we confirm context and feed status first.'",
      "'If data is not flowing, we route the owner now instead of charting around it.'",
    ],
    whatToCheck: [
      "OB chart context, device/feed status, event timing, monitor association, documentation section, and owner.",
      "Whether the issue is missing feed, wrong context, delayed event, device issue, or required field.",
      "Whether active fetal/maternal monitoring is affected.",
    ],
    whenToEscalate: "If monitoring data, delivery event, or safety documentation is missing during active care, escalate to OB clinical owner/device support/command center immediately.",
    walkthrough: [
      "Verify OB chart context.",
      "Check monitor/feed and event timing.",
      "Escalate active monitoring gaps.",
    ],
    ifThatFails: [
      "Feed missing: device/clinical owner.",
      "Wrong context: stop and correct owner path.",
      "Active care affected: command center now.",
    ],
    keywords: k("fetal monitoring", "fetal monitor", "fetalink", "ob monitoring", "ob documentation", "delivery event", "labor event", "monitor not flowing", "fetal strip", "maternal fetal", "ob event missing", "fetal data missing", "monitor association"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_avs_after_visit_summary_print_or_send",
    title: "After-visit summary or discharge instructions will not print or send",
    type: "playbook",
    summary: "AVS and instruction problems need encounter status, document readiness, printer/send path, language, and owner checks.",
    roles: k("front desk", "nurse", "provider", "clinic support"),
    domains: k("discharge", "avs", "printing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Encounter/discharge -> Instructions/AVS -> Print/send path -> Printer/portal/status",
    visual_url: null,
    first90: [
      "Confirm encounter and document readiness.",
      "Check print/send path and printer context.",
      "Escalate if patient departure is delayed.",
    ],
    whatToSay: [
      "'Let's confirm the summary is ready before we chase the printer.'",
      "'If the patient is waiting to leave, we route the blocker with urgency.'",
    ],
    whatToCheck: [
      "Encounter status, AVS/instruction readiness, required signatures, language/template, printer, portal/send path, and error text.",
      "Whether the problem is content not ready, document not generated, printer issue, or send/portal route.",
      "Whether discharge/departure is waiting on the document.",
    ],
    whenToEscalate: "If patient departure is delayed or AVS/instructions cannot generate after readiness checks, escalate to discharge/printing/document owner with exact error.",
    walkthrough: [
      "Check document readiness.",
      "Confirm print/send route.",
      "Escalate patient-departure blockers.",
    ],
    ifThatFails: [
      "Document incomplete: route signing owner.",
      "Printer issue: device lane.",
      "Patient waiting: command/discharge owner.",
    ],
    keywords: k("avs", "after visit summary", "visit summary", "discharge instructions", "instructions not printing", "avs not printing", "print avs", "send avs", "patient instructions", "departure instructions", "discharge print", "summary not generating", "portal send"),
    related_ids: ["p11", "c6", "v11"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_case_management_discharge_planning_task",
    title: "Case-management discharge planning task is stuck",
    type: "playbook",
    summary: "Case-management blockers need disposition, task status, authorization, placement, owner, and callback checks.",
    roles: k("case manager", "nurse", "bed control", "front desk"),
    domains: k("case management", "discharge planning", "placement"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Case-management worklist -> Discharge planning task -> Disposition/auth/placement status -> Owner",
    visual_url: null,
    first90: [
      "Confirm disposition or planning task.",
      "Check auth, placement, and owner status.",
      "Route callback before promising discharge timing.",
    ],
    whatToSay: [
      "'Let's separate system status from discharge-planning ownership.'",
      "'We will name the next owner and callback instead of promising timing.'",
    ],
    whatToCheck: [
      "Disposition, planning task, authorization, placement status, facility/agency lane, owner, and callback.",
      "Whether the issue is task routing, auth, placement, document readiness, or discharge order dependency.",
      "Whether patient flow or placement timing is affected.",
    ],
    whenToEscalate: "If discharge planning, authorization, or placement is blocked after owner/status checks, escalate to case-management/bed-control owner with dependency and callback.",
    walkthrough: [
      "Name disposition/planning task.",
      "Check auth/placement dependency.",
      "Route owner with callback.",
    ],
    ifThatFails: [
      "Auth pending: authorization owner.",
      "Placement unclear: case management/bed control.",
      "Discharge blocked: command escalation.",
    ],
    keywords: k("case management", "discharge planning", "case manager", "placement task", "disposition", "placement status", "auth placement", "case management task", "planning task", "facility placement", "agency referral", "discharge plan", "placement pending", "case management worklist"),
    related_ids: ["p17", "c11", "v13"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_eprescribe_pharmacy_send_failed",
    title: "ePrescribe or pharmacy send failed",
    type: "playbook",
    summary: "Prescription-send failures need pharmacy, routing status, medication/order status, signer, and fallback owner checks.",
    roles: k("provider", "clinic support", "pharmacy support"),
    domains: k("medication", "e-prescribe", "pharmacy"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Medication/order -> Pharmacy destination -> Send status/error -> Signer/pharmacy owner",
    visual_url: null,
    first90: [
      "Confirm medication and pharmacy destination.",
      "Read send status or error exactly.",
      "Check signer before re-sending.",
    ],
    whatToSay: [
      "'Let's confirm where the prescription was supposed to go before re-sending.'",
      "'We will not duplicate a prescription until we know the send status.'",
    ],
    whatToCheck: [
      "Medication/order, destination pharmacy, send status, signer, error text, patient-preferred pharmacy, and duplicate-send risk.",
      "Whether the issue is pharmacy missing, send failed, pending, wrong destination, or signature block.",
      "Whether the medication is time-sensitive.",
    ],
    whenToEscalate: "If send status is unclear, destination is wrong, or a time-sensitive medication cannot be sent, escalate to provider/pharmacy support with exact error.",
    walkthrough: [
      "Verify destination pharmacy.",
      "Read send status/error.",
      "Escalate before duplicate resend.",
    ],
    ifThatFails: [
      "Destination missing: update approved lane.",
      "Send failed: pharmacy/provider support.",
      "Urgent med: command/clinical owner.",
    ],
    keywords: k("eprescribe", "e-prescribe", "electronic prescription", "prescription failed", "rx failed", "pharmacy send failed", "send to pharmacy", "pharmacy destination", "prescription not sent", "rx not sent", "wrong pharmacy", "preferred pharmacy", "duplicate prescription", "resend prescription"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },

  // Pack 07 - real-question density for live Ask walkthroughs.
  {
    id: "ll_schedule_appointment_not_visible",
    title: "Appointment is not showing on the schedule",
    type: "playbook",
    summary: "Missing appointments usually come from date, provider/resource, location, status, or view filters before they are true build issues.",
    roles: k("scheduler", "front desk", "clinic support"),
    domains: k("scheduling", "appointment", "filters"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Schedule -> Date/provider/resource filter -> Appointment status/view -> Refresh",
    visual_url: "/visual-guides/schedule-appointment-missing.svg",
    visual_callouts: [
      "Confirm date, provider/resource, location, and schedule view.",
      "Open filters and check appointment status.",
      "Refresh once after clearing narrow filters.",
      "Escalate with view, status, role, and callback if still missing.",
    ],
    first90: [
      "Confirm the date, provider/resource, and location.",
      "Check appointment status and schedule view.",
      "Refresh once after clearing narrow filters.",
    ],
    whatToSay: [
      "'Let's prove the schedule context before we call the appointment missing.'",
      "'If the appointment exists in search but not here, we check filters and view next.'",
    ],
    whatToCheck: [
      "Date, provider/resource, department/location, schedule view, and appointment status.",
      "Canceled, arrived, no-show, hidden, filtered, or rescheduled status.",
      "Whether search finds the appointment outside the schedule grid.",
    ],
    whenToEscalate: "If the appointment exists but is hidden for multiple users in the same role/view, escalate to scheduling template/build owner with view, filters, status, and role.",
    walkthrough: [
      "Open the exact schedule view.",
      "Check date, provider/resource, and location.",
      "Clear narrow filters and refresh once.",
    ],
    ifThatFails: [
      "Search finds it: schedule filter/view issue.",
      "Search cannot find it: registration/scheduling owner.",
      "Multiple users affected: template/build escalation.",
    ],
    keywords: k("appointment not showing", "appointment missing", "appointment disappeared", "appt not showing", "appt missing", "schedule missing appointment", "schedule filter", "appointment status", "wrong schedule date", "provider schedule missing", "resource schedule missing", "cadence appointment missing", "epic cadence appointment"),
    related_ids: ["p18", "c12", "v14"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_schedule_template_slot_unavailable",
    title: "Schedule slot or template is not available",
    type: "playbook",
    summary: "Slot problems need provider/resource, visit type, template, time, location, and override rules before anyone overbooks.",
    roles: k("scheduler", "front desk", "clinic support"),
    domains: k("scheduling", "template", "slots"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "schedule",
    nav_trail: "Schedule -> Provider/resource -> Visit type -> Template/slot rules -> Hold/override status",
    visual_url: null,
    first90: [
      "Confirm provider/resource, visit type, and location.",
      "Check template date, slot type, and holds.",
      "Do not overbook until owner approves.",
    ],
    whatToSay: [
      "'Let's find out whether this is a template, slot-type, hold, or permission issue.'",
      "'We will not overbook from a guess; we need the owner if the slot is locked.'",
    ],
    whatToCheck: [
      "Provider/resource, location, visit type, slot type, date/time, template, and holds.",
      "Whether slot is frozen, held, full, restricted, mismatched by visit type, or hidden by filter.",
      "Who owns overbook or template-release approval.",
    ],
    whenToEscalate: "If the expected slot is locked, held, missing, or requires override approval, escalate to scheduling template owner with provider/resource, visit type, date/time, and requested action.",
    walkthrough: [
      "Open provider/resource schedule.",
      "Match visit type to slot type.",
      "Check holds, locks, and override rules.",
    ],
    ifThatFails: [
      "Wrong visit type: correct type before booking.",
      "Slot held/locked: route owner.",
      "Overbook requested: require approval path.",
    ],
    keywords: k("slot unavailable", "no slots", "template missing", "schedule template", "appointment slot", "slot type", "visit type slot", "hold slot", "frozen slot", "overbook", "template locked", "template unavailable", "cadence slot", "provider template", "resource template"),
    related_ids: ["p18", "c12", "v14"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_order_missing_due_to_encounter_context",
    title: "Order is not available in this encounter",
    type: "playbook",
    summary: "If an order will not appear, check encounter type, patient class, role, order mode, and synonyms before calling it missing.",
    roles: k("provider", "resident / fellow", "app", "inpatient nurse"),
    domains: k("orders", "order entry", "encounter context"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "place",
    is_deep_flow: true,
    nav_trail: "Chart -> Encounter banner -> Orders/Add Order -> Search/filter/order mode -> Details",
    visual_url: null,
    first90: [
      "Confirm patient and encounter first.",
      "Search one approved synonym.",
      "Check order mode and required filters.",
    ],
    whatToSay: [
      "'Let's confirm the encounter before we call the order missing.'",
      "'Orders can be filtered by patient class, role, location, or order mode.'",
    ],
    whatToCheck: [
      "Encounter type, patient class, location, provider role, and order mode.",
      "Order synonym, order set vs single order, facility/location filter, and status.",
      "Whether a similar order is available under an approved local name.",
    ],
    whenToEscalate: "If the expected order is unavailable after encounter, role, synonym, and filter checks, escalate to order build/clinical informatics with order name, role, encounter type, location, and urgency.",
    walkthrough: [
      "Check chart and encounter banner.",
      "Open Orders/Add Order.",
      "Search approved synonym and check filters.",
    ],
    ifThatFails: [
      "Wrong encounter: switch context first.",
      "Order filtered by role/location: capture context.",
      "Time-sensitive order missing: escalate now.",
    ],
    keywords: k("order not available", "order missing", "order does not populate", "orders not populating", "cannot find order", "can't find order", "order search empty", "wrong encounter order", "encounter type order", "patient class order", "order mode", "epic order missing", "cerner order missing", "powerchart order missing"),
    related_ids: ["p2", "s1", "v10"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_order_locked_after_sign",
    title: "Signed order needs a safe change",
    type: "playbook",
    summary: "Once an order is signed, support the approved modify, discontinue, cancel, or new-order pathway instead of editing the signed order from memory.",
    roles: k("provider", "resident / fellow", "app", "inpatient nurse"),
    domains: k("orders", "signed order", "modify"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 3,
    vendor_family: "epic",
    action: "modify",
    nav_trail: "Chart -> Orders -> Signed/active order -> Modify/discontinue/cancel status -> Reason/comment",
    visual_url: null,
    first90: [
      "Read the order status aloud.",
      "Confirm what change is needed.",
      "Use approved modify or discontinue path.",
    ],
    whatToSay: [
      "'Because this is already signed, we need the safe correction path.'",
      "'Let's identify whether this is modify, discontinue, cancel, or new order.'",
    ],
    whatToCheck: [
      "Signed, active, held, pending, initiated, discontinued, or completed status.",
      "Requested change: dose, route, timing, duplicate, cancellation, or new order.",
      "Required reason/comment, cosign, and whether patient care is waiting.",
    ],
    whenToEscalate: "If the order is locked, clinically time-sensitive, or the correct correction pathway is unclear, escalate to provider owner or clinical informatics before changing it.",
    walkthrough: [
      "Open Orders and select the signed order.",
      "Read status and requested change.",
      "Use modify/discontinue/cancel only if available.",
    ],
    ifThatFails: [
      "Modify unavailable: check order status and role.",
      "Duplicate active order: route provider/clinical owner.",
      "Time-sensitive change: escalate immediately.",
    ],
    keywords: k("signed order locked", "signed order is locked", "change signed order", "modify signed order", "edit signed order", "order locked", "order is locked", "order needs to be changed", "cannot edit order", "can't edit order", "cancel signed order", "remove signed order", "order already signed", "order correction", "modify order after signing", "order locked after sign", "epic signed order", "cerner signed order"),
    related_ids: ["p28", "c22", "v24"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_note_sidebar_or_note_type_missing",
    title: "Note area or note type is hard to find",
    type: "playbook",
    summary: "When the note area is not obvious, check encounter context, collapsed panels, note type filters, specialty view, and role access.",
    roles: k("provider", "nurse", "therapy pt ot st", "clinical support"),
    domains: k("notes", "documentation", "navigation"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "cerner",
    action: "document",
    nav_trail: "Chart -> Documentation/Notes -> Sidebar or New Note -> Note type/filter -> Required sections",
    visual_url: null,
    first90: [
      "Confirm this is the right encounter.",
      "Look for collapsed notes/sidebar area.",
      "Search or filter note type.",
    ],
    whatToSay: [
      "'Let's find the note area before we troubleshoot the note itself.'",
      "'If the note type is missing for the whole role, that is not user error.'",
    ],
    whatToCheck: [
      "Encounter, documentation activity, collapsed sidebar, note type, specialty view, and role.",
      "Filter by author, date, status, service, or note type.",
      "Whether the note type is missing for one user or the entire team.",
    ],
    whenToEscalate: "If the required note type or documentation area is missing for multiple users in the same role/location, escalate to documentation build owner with role, location, encounter, and note type.",
    walkthrough: [
      "Open chart and confirm encounter.",
      "Find Notes/Documentation or collapsed sidebar.",
      "Choose note type and required sections.",
    ],
    ifThatFails: [
      "Sidebar hidden: expand edge panel.",
      "Note type missing: check filter and role.",
      "Team-wide missing type: build escalation.",
    ],
    keywords: k("where do i write my note", "where do i write my note the sidebar is hidden", "where is notes", "where are notes", "note area missing", "new note missing", "note type missing", "documentation sidebar", "sidebar hidden", "sidebar is hidden", "collapsed sidebar", "cannot find note", "can't find note", "dynamic documentation missing", "dyn doc missing", "powerchart note", "epic note type"),
    related_ids: ["p30", "c24", "v26"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_flowsheet_row_hidden_or_time_column_wrong",
    title: "Flowsheet row is missing or charting in the wrong time column",
    type: "playbook",
    summary: "Flowsheet problems usually start with group, row search, collapsed sections, time column, and role view before build escalation.",
    roles: k("inpatient nurse", "clinical staff", "rehab support"),
    domains: k("flowsheet", "documentation", "time column"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Chart -> Flowsheets -> Group/section -> Row search/collapsed rows -> Time column -> File/save",
    visual_url: "/visual-guides/flowsheet-row-time-column.svg",
    visual_callouts: [
      "Pick the correct flowsheet group.",
      "Expand or search for the missing row.",
      "Confirm the active time column before entry.",
      "Verify the entry filed before leaving the screen.",
    ],
    first90: [
      "Confirm the flowsheet group first.",
      "Expand collapsed sections or search row.",
      "Check the active time column.",
    ],
    whatToSay: [
      "'Let's make sure we are in the right group and time column before entering anything.'",
      "'If the row is missing for the team, we escalate the row/build, not the user.'",
    ],
    whatToCheck: [
      "Flowsheet group, section, row search, collapsed rows, time column, and save/file status.",
      "Whether row is hidden by role, view, specialty, time, or template.",
      "Whether charting landed in the wrong time column or wrong encounter.",
    ],
    whenToEscalate: "If the required row is missing for multiple users, charting files to the wrong column, or documentation affects safety/quality tracking, escalate to clinical documentation owner.",
    walkthrough: [
      "Open Flowsheets and pick group.",
      "Expand section or search row.",
      "Confirm time column before charting.",
    ],
    ifThatFails: [
      "Row hidden: check role/view/template.",
      "Wrong time column: correct per policy.",
      "Team-wide row gap: documentation owner.",
    ],
    keywords: k("flowsheet row missing", "flow sheet row missing", "row hidden", "collapsed row", "flowsheet section", "wrong time column", "charted wrong time", "time column wrong", "flowsheet filed wrong", "vitals row missing", "assessment row missing", "epic flowsheet row", "cerner flowsheet row"),
    related_ids: ["p23", "c17", "v19"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_mar_med_not_showing_due_time_filter",
    title: "Medication is not showing on the MAR",
    type: "playbook",
    summary: "MAR visibility depends on order status, due time, held/discontinued state, pharmacy verification, filters, and encounter context.",
    roles: k("inpatient nurse", "pharmacy support", "provider"),
    domains: k("medication", "mar", "visibility"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "MAR -> Date/time filter -> Scheduled/PRN/held view -> Order details -> Verification/dispense status",
    visual_url: "/visual-guides/mar-medication-filter.svg",
    visual_callouts: [
      "Check MAR date and time window.",
      "Review Scheduled, PRN, Held, and filter views.",
      "Confirm order status and due time.",
      "Escalate unclear verification or due-now meds.",
    ],
    first90: [
      "Confirm the order is active.",
      "Check MAR date/time and view filters.",
      "Check verification, hold, and dispense status.",
    ],
    whatToSay: [
      "'Let's see whether the medication is missing, hidden by time, or waiting on verification.'",
      "'If it is due now and unclear, we escalate before delaying care.'",
    ],
    whatToCheck: [
      "Order status, MAR date/time, scheduled/PRN/held filters, due time, and encounter.",
      "Pharmacy verification, dispense status, hold/discontinue status, and medication profile.",
      "Whether one medication, one patient, or the unit is affected.",
    ],
    whenToEscalate: "If an active due medication is not visible after MAR filters and status checks, escalate to pharmacy/clinical owner immediately.",
    walkthrough: [
      "Check order status first.",
      "Review MAR filters and due time.",
      "Verify pharmacy/dispense state.",
    ],
    ifThatFails: [
      "Hidden by filter: correct view.",
      "Pending verification: pharmacy owner.",
      "Due now and unclear: escalate immediately.",
    ],
    keywords: k("med not showing on mar", "medication not showing on mar", "mar medication missing", "mar filter", "due med missing", "med not visible", "medication profile missing", "scheduled meds missing", "prn med missing", "held medication", "pharmacy verification mar", "cerner mar missing", "epic mar missing"),
    related_ids: ["p22", "c16", "v18"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_document_scanned_to_wrong_encounter",
    title: "Scanned document may be attached to the wrong encounter",
    type: "playbook",
    summary: "Wrong-encounter document risk is a stop-and-route moment: verify context, do not rescan blindly, and escalate through document management.",
    roles: k("front desk", "registration", "clinic staff"),
    domains: k("scanning", "documents", "encounter"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "scan",
    nav_trail: "Media/documents -> Document details -> Encounter/date/type -> Correction owner",
    visual_url: "/visual-guides/document-wrong-encounter.svg",
    visual_callouts: [
      "Confirm document type first.",
      "Compare encounter/date before saving or rescanning.",
      "Check duplicate or wrong-attachment risk.",
      "Route correction to document-management owner.",
    ],
    first90: [
      "Stop before scanning another copy.",
      "Verify document type and encounter.",
      "Route wrong-encounter risk to owner.",
    ],
    whatToSay: [
      "'Let's stop here. I want to confirm where the document landed before we create duplicates.'",
      "'If it attached to the wrong encounter, document management owns the correction path.'",
    ],
    whatToCheck: [
      "Document type, encounter/date, upload time, image count, and owner.",
      "Whether the issue is wrong encounter, wrong document type, duplicate image, or failed scan.",
      "Approved correction path and whether rescan is allowed.",
    ],
    whenToEscalate: "If wrong-encounter attachment, duplicate document, or privacy risk is possible, escalate to registration/document-management owner before saving more scans.",
    walkthrough: [
      "Open document details.",
      "Compare encounter/date and document type.",
      "Route owner before duplicate scan.",
    ],
    ifThatFails: [
      "Wrong encounter risk: stop and escalate.",
      "Duplicate scan exists: document owner.",
      "Scanner failed only: device support.",
    ],
    keywords: k("scanned wrong encounter", "document scanned to wrong encounter", "wrong encounter scan", "document attached wrong encounter", "scan wrong visit", "media wrong encounter", "duplicate scanned document", "wrong document type", "scan landed wrong", "document management correction", "media manager wrong encounter", "epic media manager correction"),
    related_ids: ["p36", "c30", "v32"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_consent_missing_before_procedure",
    title: "Consent is missing before a procedure",
    type: "playbook",
    summary: "Consent questions need procedure context, document type, signed status, scan/link status, and clinical owner before a case proceeds.",
    roles: k("front desk", "nurse", "periop support", "clinic staff"),
    domains: k("consent", "procedure", "scanning"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Procedure/case -> Consents/documents -> Signed status -> Scan/link to encounter -> Owner",
    visual_url: "/visual-guides/consent-procedure-status.svg",
    visual_callouts: [
      "Confirm procedure/case and encounter context.",
      "Separate signed status from scan/link status.",
      "Check document type and encounter link.",
      "Escalate active procedure blockers immediately.",
    ],
    first90: [
      "Confirm the procedure and encounter.",
      "Check consent document status.",
      "Escalate missing signed consent now.",
    ],
    whatToSay: [
      "'Let's separate the clinical consent from the scan/link step.'",
      "'If signed consent is missing for an active procedure, we escalate immediately.'",
    ],
    whatToCheck: [
      "Procedure/case, encounter, consent type, signed status, scanned image, document link, and owner.",
      "Whether consent is not signed, signed but not scanned, scanned to wrong encounter, or hidden by document type.",
      "Whether procedure timing is affected.",
    ],
    whenToEscalate: "If signed consent is missing, linked to the wrong encounter, or procedure timing is affected, escalate to periop/clinical owner immediately.",
    walkthrough: [
      "Open procedure/case context.",
      "Find consents/documents.",
      "Confirm signed and linked status.",
    ],
    ifThatFails: [
      "Not signed: clinical owner.",
      "Signed but not scanned: document lane.",
      "Wrong encounter/link: stop and escalate.",
    ],
    keywords: k("consent missing", "missing consent", "procedure consent", "surgical consent", "paper consent", "consent not scanned", "signed consent missing", "consent wrong encounter", "consent document", "scan consent", "procedure missing consent", "case consent missing"),
    related_ids: ["p36", "c30", "v32"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_referral_order_not_ready_for_scheduling",
    title: "Referral or authorization is not ready for scheduling",
    type: "playbook",
    summary: "Referral scheduling depends on referral status, authorization, linked order, department, visit type, and owner before booking.",
    roles: k("scheduler", "front desk", "referral coordinator"),
    domains: k("referral", "authorization", "scheduling"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "schedule",
    nav_trail: "Referral/order -> Auth/referral status -> Linked appointment/order -> Scheduling lane -> Owner",
    visual_url: null,
    first90: [
      "Open referral or order status.",
      "Check authorization and linked appointment.",
      "Do not book if status blocks scheduling.",
    ],
    whatToSay: [
      "'Let's check whether this is a referral-status issue or a scheduling issue.'",
      "'If authorization is not ready, we route the owner instead of forcing the appointment.'",
    ],
    whatToCheck: [
      "Referral status, authorization status, linked order, department, visit type, scheduling instructions, and owner.",
      "Whether referral is pending review, missing auth, linked to wrong department, expired, or already scheduled.",
      "Callback path for patient-facing follow-up.",
    ],
    whenToEscalate: "If referral/auth status blocks booking or linkage is unclear, escalate to referral/authorization owner with status, department, visit type, and callback.",
    walkthrough: [
      "Open referral/order status.",
      "Check authorization and linkage.",
      "Route owner before booking around it.",
    ],
    ifThatFails: [
      "Auth pending: referral/auth owner.",
      "Wrong department: scheduling/referral owner.",
      "Patient waiting: callback owner needed.",
    ],
    keywords: k("referral not ready", "referral not linked", "auth not ready", "authorization not ready", "cannot schedule referral", "can't schedule referral", "referral status", "authorization status", "referral pending review", "referral missing auth", "linked order missing", "appointment referral link", "cadence referral", "epic referral scheduling"),
    related_ids: ["p34", "c28", "v30"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_result_routing_or_ack_owner_unclear",
    title: "Result needs acknowledgement or routing owner",
    type: "playbook",
    summary: "Result questions need result status, responsible owner, routing queue, acknowledgement state, and urgency before anyone closes it.",
    roles: k("provider", "nurse", "clinic support", "lab support"),
    domains: k("results", "acknowledgement", "routing"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Results -> Result detail -> Status/flag -> Responsible owner/queue -> Acknowledge/route",
    visual_url: null,
    first90: [
      "Open the result detail.",
      "Check flag, status, and owner.",
      "Do not close without owner clarity.",
    ],
    whatToSay: [
      "'I am not interpreting the result; I am finding status, owner, and routing.'",
      "'If acknowledgement is blocked and it is urgent, we escalate the owner now.'",
    ],
    whatToCheck: [
      "Result type, flag/critical status, responsible owner, queue, acknowledgement state, and route action.",
      "Whether it is missing, routed wrong, blocked from acknowledgement, or already acted on.",
      "Urgency and callback path.",
    ],
    whenToEscalate: "If a critical/urgent result cannot be acknowledged or owner/routing is unclear, escalate to clinical owner or command center immediately.",
    walkthrough: [
      "Open result details.",
      "Find status, owner, and queue.",
      "Acknowledge/route only if owner is clear.",
    ],
    ifThatFails: [
      "Owner unclear: clinical owner escalation.",
      "Ack action missing: role/access lane.",
      "Critical/urgent: command center now.",
    ],
    keywords: k("result routing", "result owner", "acknowledge result", "result acknowledgement", "result not acknowledged", "can't acknowledge result", "cannot acknowledge result", "result in wrong queue", "result routed wrong", "critical result routing", "result flag", "result status", "lab result acknowledgement"),
    related_ids: ["p29", "c23", "v25"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_workqueue_item_assigned_to_wrong_owner",
    title: "Workqueue item is in the wrong owner or pool",
    type: "playbook",
    summary: "Workqueue questions need queue, owner, status, filter, assignment rule, and route action before anyone resolves or reassigns.",
    roles: k("billing", "front desk", "clinic support", "admin"),
    domains: k("workqueue", "reports", "routing"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "route",
    nav_trail: "Workqueue/report -> Queue name -> Owner/status/filter -> Route/reassign action -> Notes",
    visual_url: "/visual-guides/workqueue-owner-routing.svg",
    visual_callouts: [
      "Confirm the exact queue name.",
      "Check owner, status, and assignment rule.",
      "Review filters before routing.",
      "Use only the approved route/reassign action.",
    ],
    first90: [
      "Confirm the exact queue name.",
      "Check owner, status, and filters.",
      "Route only through approved action.",
    ],
    whatToSay: [
      "'Let's identify whether this is filter, ownership, or assignment-rule behavior.'",
      "'We do not resolve items just to get them out of the wrong queue.'",
    ],
    whatToCheck: [
      "Queue name, item type, owner, status, date filter, assignment rule, and route/reassign action.",
      "Whether one item, one user, one role, or the whole queue is affected.",
      "Required note/comment and callback owner.",
    ],
    whenToEscalate: "If assignment rule appears wrong or the queue routes incorrectly for multiple users/items, escalate to workqueue/report owner with queue name, owner, status, filters, and examples without PHI.",
    walkthrough: [
      "Open queue and item details.",
      "Check owner, status, and filters.",
      "Use route/reassign only if approved.",
    ],
    ifThatFails: [
      "One item: route owner with note.",
      "Whole queue: report/build owner.",
      "No route action: permission/workflow lane.",
    ],
    keywords: k("workqueue wrong owner", "workqueue item assigned to wrong owner", "work queue wrong owner", "workqueue wrong pool", "work queue wrong pool", "assigned wrong owner", "assigned to wrong owner", "reassign workqueue", "route workqueue", "queue owner", "queue filter", "workqueue status", "report queue routing", "wq owner", "wq routing"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_scanner_or_badge_reader_not_working",
    title: "Scanner or badge reader is not working",
    type: "playbook",
    summary: "Device issues need workstation, cable/power, focus field, second device, and scope checks before replacing hardware.",
    roles: k("all roles", "inpatient nurse", "front desk", "lab tech"),
    domains: k("device", "scanner", "badge reader"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Current workflow -> Active field -> Device/cable/power -> Second scan/device -> Device support",
    visual_url: null,
    first90: [
      "Keep the user on the same screen.",
      "Confirm cursor is in the active field.",
      "Try one second scan or device.",
    ],
    whatToSay: [
      "'Before we call the device broken, let's make sure the screen is ready to receive the scan.'",
      "'We will test once, then route if it is device-wide.'",
    ],
    whatToCheck: [
      "Active field/focus, scanner light/beep, cable/power, workstation, and second device.",
      "Whether badge, wristband, medication, specimen, or document barcode is being scanned.",
      "One scanner, one workstation, or multiple devices affected.",
    ],
    whenToEscalate: "If the scanner/badge reader fails on a second safe test or multiple devices are affected, escalate to device support with location, workstation, scanner type, and workflow.",
    walkthrough: [
      "Click the active scan field.",
      "Check cable/power and scan once.",
      "Test second device if available.",
    ],
    ifThatFails: [
      "No beep/light: device support.",
      "Beep but no entry: focus/field issue.",
      "Medication safety workflow: escalate sooner.",
    ],
    keywords: k("scanner not working", "barcode scanner not working", "badge reader not working", "badge scanner", "scanner won't scan", "scanner wont scan", "barcode reader", "no beep scanner", "scanner beeps but nothing", "wristband scanner", "specimen scanner", "device scanner", "scanner focus field"),
    related_ids: ["p3", "c3", "v2"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_downtime_backload_queue_after_restore",
    title: "Backloading after downtime or paper workflow",
    type: "playbook",
    summary: "After downtime, backload by ownership, timestamp, priority, and verification instead of entering everything in random order.",
    roles: k("all roles", "registration", "inpatient nurse", "provider"),
    domains: k("downtime", "recovery", "backload"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 4,
    escalation: 4,
    vendor_family: "cerner",
    action: "document",
    is_deep_flow: true,
    nav_trail: "Downtime packet -> Priority stack -> Owner assignment -> Backload entry -> Verification/handoff",
    visual_url: "/visual-guides/downtime-backload-queue.svg",
    visual_callouts: [
      "Sort paper by safety priority before entry.",
      "Assign one owner per stack.",
      "Backload with original timestamps.",
      "Verify filing before closing the packet.",
    ],
    first90: [
      "Sort paper by patient-safety priority.",
      "Assign one owner per stack.",
      "Backload with original times.",
    ],
    whatToSay: [
      "'We are going to backload by priority and owner, not by whoever grabs the first paper.'",
      "'Original times and verification matter more than speed right now.'",
    ],
    whatToCheck: [
      "Downtime start/end time, paper forms, original timestamps, owner, and verification step.",
      "Priority: meds, orders, results, registration, discharge, then routine documentation.",
      "Whether any active care depends on the backload.",
    ],
    whenToEscalate: "If backload ownership is unclear, active-care data is missing, or multiple teams are entering the same paper, escalate to command center with scope and owner request.",
    walkthrough: [
      "Sort paper by priority.",
      "Assign owner and timestamps.",
      "Verify entry before closing packet.",
    ],
    ifThatFails: [
      "No owner: command center assignment.",
      "Duplicate backload risk: stop and reconcile.",
      "Active care affected: escalate now.",
    ],
    keywords: k("backload", "back loading", "downtime backload", "paper backload", "after downtime", "system restored", "recovery entry", "enter downtime forms", "downtime packet", "original time", "paper workflow recovery", "back enter", "system back up"),
    related_ids: ["p1", "c6", "v9"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_escalation_packet_for_command_center",
    title: "Build a clean escalation packet",
    type: "playbook",
    summary: "A good escalation gives command center scope, impact, exact blocker, what was tried, owner needed, and callback.",
    roles: k("all roles", "field support", "super-user"),
    domains: k("escalation", "command center", "handoff"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "cerner",
    action: "review",
    nav_trail: "Issue observed -> Scope/impact -> Checks tried -> Owner needed -> Callback/handoff",
    visual_url: "/visual-guides/escalation-packet.svg",
    visual_callouts: [
      "Name scope: one user, role, team, or unit.",
      "State impact and exact visible blocker.",
      "List what was tried safely.",
      "Send owner needed and callback without PHI.",
    ],
    first90: [
      "Name scope and patient-care impact.",
      "Capture exact screen/status/error.",
      "State owner needed and callback.",
    ],
    whatToSay: [
      "'I am going to send this cleanly so command can act on it without chasing us.'",
      "'Give me scope, impact, exact blocker, what we tried, and callback.'",
    ],
    whatToCheck: [
      "One user vs role/team/unit, patient-care or throughput impact, exact visible blocker, and time started.",
      "What was tried safely, what not to retry, owner/team needed, and callback.",
      "No patient identifiers, screenshots with PHI, passwords, or private links.",
    ],
    whenToEscalate: "Escalate immediately when safety, patient flow, medication, results, discharge, registration, or unit-wide access is blocked; include the packet fields and callback.",
    walkthrough: [
      "Write scope and impact.",
      "Add exact blocker and checks tried.",
      "Name owner needed and callback.",
    ],
    ifThatFails: [
      "Owner unclear: command center triage.",
      "Safety impact: escalate now.",
      "Missing facts: gather without PHI.",
    ],
    keywords: k("escalation packet", "what do i send command center", "command center ticket", "open ticket", "ticket details", "escalate issue", "what information to collect", "handoff issue", "scope impact callback", "issue summary", "floor lead escalation", "support ticket", "go-live ticket"),
    related_ids: ["p1", "c3", "v7"],
    sanitized_approved: true,
    status: "published",
  },
  // --- Pack 12: Specialty KB (access, ambulatory, smartlinks, portal, eye care) ---
  {
    id: "ll_p12_user_access_security_class",
    title: "User can't open something — looks like a security or access issue",
    type: "playbook",
    summary: "A user can't open a screen, a tab, or a tool, and it looks like their login or role doesn't have the right access.",
    roles: k("clinic staff", "provider", "front desk", "all roles"),
    domains: k("access", "security", "roles"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Login screen -> The blocked screen or tab -> User menu / settings -> Security/access lookup",
    first90: [
      "Have the user log out and back in once to refresh their session.",
      "Try the same workflow on a second workstation.",
      "Confirm exactly which screen or button is blocked.",
    ],
    whatToSay: [
      "'Let's make sure this is a security issue and not just a stuck session.'",
      "'If your role doesn't include this, I'll route the access request — don't share your password to test it.'",
    ],
    whatToCheck: [
      "Whether the user is logged in as themselves (not a shared or test login).",
      "Whether the same block appears on a second workstation with the same login.",
      "Whether one user is blocked, or every person in that role is blocked.",
    ],
    whenToEscalate: "If the user's role should include this screen, or a whole role is locked out, send it to the access and security team with the user, the role, the screen, and a callback number.",
    walkthrough: [
      "Confirm the exact blocked screen or button.",
      "Log out, log back in, and try a second workstation.",
      "Route to the access team if the role should include it.",
    ],
    ifThatFails: [
      "Greyed-out button only: check role and context.",
      "Whole role blocked: access and security team.",
      "Shared login in use: stop and use personal login.",
    ],
    keywords: k("can't log in", "cant log in", "can't open", "cannot open", "greyed out", "grayed out", "button missing", "tab missing", "access denied", "no access", "security error", "permission error", "role missing", "user security", "user access", "epic security class"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_user_profile_setup",
    title: "Personal profile, signature, or default settings are wrong",
    type: "playbook",
    summary: "A user's profile, signature line, default printer, or starting screen is set up wrong and is getting in the way of their work.",
    roles: k("provider", "clinic staff", "front desk"),
    domains: k("personalization", "profile", "settings"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 1,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Personalize / settings menu -> Profile -> Signature, default printer, or starting screen",
    first90: [
      "Open the personalize or settings menu from the top of the screen.",
      "Find the field that's wrong — signature, default printer, or starting tab.",
      "Save and have the user log out and back in to confirm.",
    ],
    whatToSay: [
      "'This is a settings fix on your account — it won't change anyone else's view.'",
      "'Once we save it, log out and back in so the new setting kicks in.'",
    ],
    whatToCheck: [
      "Which setting they want changed (signature, default department, default printer, or starting screen).",
      "Whether they have permission to change it themselves, or it needs an admin.",
      "Whether the change took effect after logging out and back in.",
    ],
    whenToEscalate: "If the setting is locked, requires admin rights, or the change doesn't stick after a fresh login, send it to the access and security team with the user and the exact setting.",
    walkthrough: [
      "Open personalize / settings.",
      "Change the field and save.",
      "Log out and back in to confirm.",
    ],
    ifThatFails: [
      "Field is locked: access and security team.",
      "Change doesn't stick: confirm correct login.",
      "Wrong default printer: device support if printer is missing.",
    ],
    keywords: k("personal profile", "signature wrong", "default printer", "default department", "default tab", "starting screen", "personalize settings", "user preferences", "profile setup", "set my signature", "change my signature", "change default"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_proxy_or_coverage_view",
    title: "Provider needs to cover another provider's work (proxy / coverage)",
    type: "playbook",
    summary: "A provider needs to see another provider's messages, results, or schedule because they're covering — and it isn't set up yet.",
    roles: k("provider", "clinic support"),
    domains: k("coverage", "proxy", "in basket"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "route",
    nav_trail: "In Basket / schedule -> Coverage or proxy view -> Add covering provider -> Date range",
    first90: [
      "Confirm who is covering whom, and for what date range.",
      "Open the coverage or proxy setup screen.",
      "Set the dates and the type of access (view only, or act on messages).",
    ],
    whatToSay: [
      "'Let's get the coverage dates exactly right before we open up the view.'",
      "'Coverage gives you their messages and schedule — you'll still sign as yourself.'",
    ],
    whatToCheck: [
      "Who is being covered, and the start and end dates.",
      "Whether the covering provider needs to just see messages, or also reply and sign.",
      "Whether the absent provider already set this up themselves, or it has to be set up for them.",
    ],
    whenToEscalate: "If the absent provider can't set it up and the covering provider doesn't have the rights either, send it to the ambulatory team lead with both names, the dates, and what access is needed.",
    walkthrough: [
      "Confirm covering and covered providers plus dates.",
      "Open coverage / proxy setup.",
      "Set dates and access level, then save.",
    ],
    ifThatFails: [
      "Setup is locked: ambulatory team lead.",
      "Missing messages: confirm the covering view is open.",
      "Cross-clinic coverage: confirm both departments are included.",
    ],
    keywords: k("proxy", "proxy access", "coverage", "covering provider", "out of office", "ooo provider", "cover messages", "in basket coverage", "provider coverage", "out sick coverage"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_ambulatory_telephone_encounter",
    title: "Telephone or patient-call encounter is open and needs to close cleanly",
    type: "playbook",
    summary: "A phone call with a patient was opened as an encounter and it needs to be documented, routed, and closed — not left hanging.",
    roles: k("clinic support", "nurse", "front desk", "provider"),
    domains: k("ambulatory", "telephone encounter", "documentation"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Chart -> Telephone or patient-call encounter -> Note / orders / messages -> Close encounter",
    first90: [
      "Open the encounter and confirm it's for today's call.",
      "Add a short note, any orders, and route to the right provider.",
      "Close the encounter so it doesn't sit open in the patient's chart.",
    ],
    whatToSay: [
      "'Phone encounters need to be closed the same day so nothing sits open in the chart.'",
      "'I'll route this to the right provider before we close it out.'",
    ],
    whatToCheck: [
      "That the encounter type is a telephone or patient-call encounter, not a regular visit.",
      "Whether a note, orders, or a message to the provider is needed before closing.",
      "Whether anyone else needs to see it (covering provider, nurse, or care team).",
    ],
    whenToEscalate: "If the encounter won't close, can't be routed to the right provider, or is missing a required field, send it to the ambulatory team lead with the encounter date and what's blocking.",
    walkthrough: [
      "Open the call encounter.",
      "Add note, orders, and route to provider.",
      "Close encounter and confirm it's no longer open.",
    ],
    ifThatFails: [
      "Won't close: check required fields and signatures.",
      "Wrong provider routing: ambulatory team lead.",
      "Encounter type wrong: don't close — convert through the correct path.",
    ],
    keywords: k("telephone encounter", "phone encounter", "patient call", "phone call documentation", "call back", "call patient", "telephone visit", "phone visit", "telephone note", "tel encounter", "open phone encounter"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_ambulatory_results_routing",
    title: "Result message went to the wrong person or pool",
    type: "playbook",
    summary: "A lab or imaging result landed in the wrong inbox — wrong provider, wrong pool, or no one is sure who should act on it.",
    roles: k("provider", "clinic support", "nurse"),
    domains: k("results", "in basket", "ambulatory"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "route",
    nav_trail: "In Basket -> Result message -> Patient header -> Ordering provider / coverage -> Route to correct owner",
    first90: [
      "Open the result and check the ordering provider on the patient's chart.",
      "Check whether that provider is out and someone is covering.",
      "Route to the correct provider or pool — don't mark done.",
    ],
    whatToSay: [
      "'Let me find who ordered this before we send it anywhere.'",
      "'I'll route it to the right person rather than mark it done — that way no one loses the result.'",
    ],
    whatToCheck: [
      "Who ordered the test and whether they're currently covering or being covered.",
      "Whether the result is normal, abnormal, or critical — critical changes the urgency.",
      "Whether the same misrouting is happening to multiple results from the same area.",
    ],
    whenToEscalate: "If a critical result can't be routed to a real person, or the same misrouting keeps happening, send it to the ambulatory team lead with the ordering provider, the result type, and a callback number.",
    walkthrough: [
      "Open result and find ordering provider.",
      "Check coverage for that provider.",
      "Route to correct provider or pool.",
    ],
    ifThatFails: [
      "Critical result, no clear owner: escalate now.",
      "Repeat misroutes: ambulatory team lead.",
      "No coverage set: see the coverage / proxy playbook.",
    ],
    keywords: k("result wrong inbox", "result wrong person", "result wrong pool", "lab to wrong provider", "imaging to wrong provider", "result routing", "wrong inbasket result", "result misrouted", "ambulatory result"),
    related_ids: ["p19", "c13", "v15"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_smartlink_not_pulling_data",
    title: "A SmartLink in the note isn't pulling the data it should",
    type: "playbook",
    summary: "A note shortcut that should fill in patient data — like the problem list, last vitals, or meds — came up blank or wrong.",
    roles: k("provider", "clinical documentation", "clinic support"),
    domains: k("smarttools", "smartlinks", "documentation"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Note editor -> The shortcut location -> Refresh / re-insert -> Source data area",
    first90: [
      "Refresh or re-insert the shortcut to see if it fills in.",
      "Check that the source data exists (vitals taken, meds reconciled, problem list updated).",
      "If it stays blank, fill that section manually so the note isn't held up.",
    ],
    whatToSay: [
      "'Most of the time the shortcut just needs the source data to exist first.'",
      "'If it still won't fill in, type it in for now and we'll route the shortcut to be fixed.'",
    ],
    whatToCheck: [
      "Whether the source data exists in the patient's chart at all.",
      "Whether the shortcut is in the right spot in the note (some only work in certain sections).",
      "Whether only one provider sees the blank, or everyone using that shortcut does.",
    ],
    whenToEscalate: "If the shortcut is broken for everyone, or a required note section can't be completed, send it to the documentation template team with the shortcut name and the note type.",
    walkthrough: [
      "Re-insert or refresh the shortcut.",
      "Confirm the source data exists in the chart.",
      "Document manually if needed, then route the shortcut.",
    ],
    ifThatFails: [
      "Source data missing: complete that section first.",
      "Broken for everyone: documentation template team.",
      "Wrong section: move the shortcut and try again.",
    ],
    keywords: k("smartlink", "smart link", "smartlink blank", "smartlink not working", "shortcut not pulling", "note shortcut blank", "vitals not pulling note", "problem list not pulling", "meds not pulling note", "wildcard not filling"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_smartphrase_parameter_prompt",
    title: "A note shortcut keeps asking the same question over and over",
    type: "playbook",
    summary: "A shortcut has a prompt or pick-list built into it, and it's asking the provider to fill in the same field every time they use it.",
    roles: k("provider", "clinical documentation"),
    domains: k("smarttools", "documentation", "personalization"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 1,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Personalize -> My shortcuts -> Edit the shortcut -> Default values for prompts",
    first90: [
      "Open the user's personal shortcut list from the personalize menu.",
      "Find the shortcut and look at its prompts or pick-lists.",
      "Set a default answer so the prompt stops appearing.",
    ],
    whatToSay: [
      "'If you pick the same answer every time, let's just set it as your default.'",
      "'This only changes your copy of the shortcut — no one else will see the change.'",
    ],
    whatToCheck: [
      "Whether the shortcut is personal or shared — only personal ones can be edited here.",
      "Whether the prompt is supposed to stay (some are required by the template).",
      "Whether setting a default makes sense, or the prompt is there for a clinical reason.",
    ],
    whenToEscalate: "If the shortcut is shared and the prompt is wrong for the whole team, send it to the documentation template team with the shortcut name.",
    walkthrough: [
      "Open personal shortcut list.",
      "Edit the shortcut and set a default answer.",
      "Test it in a new note.",
    ],
    ifThatFails: [
      "Shortcut is shared: documentation template team.",
      "Prompt is required: leave it and document why.",
      "Default doesn't save: confirm correct login.",
    ],
    keywords: k("smartphrase prompt", "smart phrase prompt", "smartlist prompt", "smart list prompt", "shortcut keeps asking", "shortcut prompt", "wildcard prompt", "default value smartphrase", "set default in shortcut", "note shortcut parameter"),
    related_ids: ["p24", "c18", "v20"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_portal_patient_can_not_log_in",
    title: "Patient can't log in to the patient portal",
    type: "playbook",
    summary: "A patient says they can't log in to their patient portal — could be wrong username, locked account, or they never finished signing up.",
    roles: k("front desk", "clinic support", "customer service"),
    domains: k("patient portal", "access", "patient call"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Patient chart -> Patient portal area -> Account status / activation code -> Reset or reissue",
    first90: [
      "Ask the patient what happens when they try to log in (wrong password, locked, no account).",
      "Open the patient's chart and check the portal account status.",
      "Reset the password or issue a new activation code through the approved path.",
    ],
    whatToSay: [
      "'Let me look at your portal account here so we can see exactly what's blocking you.'",
      "'Please don't read your password to me — I can send a reset code instead.'",
    ],
    whatToCheck: [
      "That you have the right patient on the line (date of birth and one more identifier).",
      "Whether the portal account is active, locked, or was never activated.",
      "Whether the email or phone number on file is current.",
    ],
    whenToEscalate: "If the portal account is locked at the system level, the patient's identity can't be confirmed, or activation keeps failing, send it to the patient portal support team with a non-PHI summary and a callback number.",
    walkthrough: [
      "Confirm identity.",
      "Check portal account status.",
      "Send password reset or new activation code.",
    ],
    ifThatFails: [
      "Locked at system level: patient portal support.",
      "Identity uncertain: stop and re-verify.",
      "Wrong email on file: update through registration path.",
    ],
    keywords: k("patient portal login", "mychart login", "patient can't log in", "patient cant log in", "portal locked", "patient portal reset", "activation code", "portal sign up", "patient password reset", "portal access"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_portal_proxy_access_for_family",
    title: "Family member needs access to a patient's portal (proxy)",
    type: "playbook",
    summary: "A parent, spouse, or caregiver wants to see another person's chart through the portal, and the request needs to go through the right consent path.",
    roles: k("front desk", "clinic support"),
    domains: k("patient portal", "proxy", "consent"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Patient chart -> Patient portal area -> Proxy access -> Consent form -> Add proxy",
    first90: [
      "Find out who is requesting access, to whose chart, and what their relationship is.",
      "Check whether a consent form is required (it usually is for adults; minor rules vary).",
      "Use the approved proxy setup path — don't share the patient's own login.",
    ],
    whatToSay: [
      "'Proxy access lets you see their chart from your own login — we never share the patient's password.'",
      "'There's a consent step we need to do first so this is set up properly.'",
    ],
    whatToCheck: [
      "Identities of both people, and their relationship (parent, spouse, caregiver).",
      "Whether the patient is a minor, an adult, or in a special category (the consent rules differ).",
      "Whether the consent form is on file or needs to be signed.",
    ],
    whenToEscalate: "If consent rules are unclear, the patient is in a special category (teen, incapacitated adult), or the proxy can't be added through the normal path, send it to the patient portal support team with a non-PHI summary.",
    walkthrough: [
      "Confirm identities and relationship.",
      "Complete consent form per policy.",
      "Add proxy through the approved path.",
    ],
    ifThatFails: [
      "Consent rules unclear: patient portal support.",
      "Minor age rules: confirm local policy.",
      "Proxy account won't link: stop and route support.",
    ],
    keywords: k("proxy access", "patient portal proxy", "mychart proxy", "parent proxy", "spouse proxy", "caregiver portal access", "minor portal", "teen portal", "portal consent form", "add proxy"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_portal_message_or_result_missing",
    title: "Patient can't see a result or message in their portal",
    type: "playbook",
    summary: "A patient or proxy says a result or message isn't showing in the portal — usually a release rule, timing window, or wrong account, not a lost result.",
    roles: k("front desk", "clinic support", "nurse", "patient support"),
    domains: k("patient portal", "results", "messaging", "proxy"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Patient chart -> Result or message -> Release status -> Release rule and timing -> Portal account / proxy check",
    first90: [
      "Open the result or message in the chart and check the release status — released, pending, or held.",
      "Check the release rule and timing window for this result type — many results hold for a short provider-review window by design.",
      "Confirm the patient is logged into their own portal account, not a proxy account for a child or spouse, and that the proxy has the right access level.",
    ],
    whatToSay: [
      "'Most of the time the result is on a short hold by design, or you're looking at the wrong account — let me check the status here before we call it missing.'",
      "'If you're a caregiver, make sure you've switched into the right person's account inside the portal.'",
    ],
    whatToCheck: [
      "Release status of the result or message (released to patient, released to provider only, held, or pending).",
      "Release rule and timing window for that result type, and whether a clinical hold is in place.",
      "Whether the patient is in their own account vs a proxy account, and whether the proxy access level shows results.",
    ],
    whenToEscalate: "If the result is released, the timing window has passed, the patient is in the right account with the right access level, and it still isn't visible, send it to the patient portal support team with the result type, release timestamp, and account context. Route clinical holds to the ordering provider.",
    walkthrough: [
      "Check release status in the chart.",
      "Check release rule, timing window, and clinical holds.",
      "Confirm account and proxy access level.",
      "Escalate to portal support or ordering provider.",
    ],
    ifThatFails: [
      "Still held: ordering provider to release or explain.",
      "Wrong account or proxy level: walk patient through the correct login and access.",
      "Released and timed out but still missing: patient portal support team.",
    ],
    keywords: k("portal result missing", "portal result not visible", "result not visible in portal", "patient can't see result in portal", "patient cant see result in portal", "patient cannot see result", "mychart result missing", "result not in portal", "message not in portal", "portal message missing", "mychart message missing", "result delay portal", "result release portal", "proxy can't see result", "caregiver can't see result", "result on hold portal", "patient cant see lab", "patient cannot see lab result"),
    related_ids: ["p20", "c14", "v16"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_eye_exam_layout_or_field_missing",
    title: "Eye-care exam screen is missing a field or layout looks wrong",
    type: "playbook",
    summary: "An eye-care provider can't find a documentation field — usually the layout is the wrong one for the visit type, or the section is collapsed.",
    roles: k("provider", "ophthalmic tech", "clinic support"),
    domains: k("eye care", "documentation", "specialty"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    is_deep_flow: true,
    nav_trail: "Eye-care chart -> Exam layout selector -> Visit type / sub-specialty -> Section / field",
    first90: [
      "Confirm the visit type (general, retina, cornea, glaucoma, etc.) is the right one.",
      "Check the layout selector at the top of the exam — switch to the right specialty layout.",
      "Expand any collapsed sections before saying the field is missing.",
    ],
    whatToSay: [
      "'Before we call the field missing, let me make sure we're on the right exam layout for this visit type.'",
      "'Each sub-specialty has its own layout — one click usually fixes it.'",
    ],
    whatToCheck: [
      "The visit type and which sub-specialty layout is selected.",
      "Whether the section is just collapsed or actually not in the layout.",
      "Whether only one provider sees this, or the whole sub-specialty does.",
    ],
    whenToEscalate: "If the right field is missing from the right layout for the right role, send it to the eye-care template team with the layout name, the visit type, and the field name.",
    walkthrough: [
      "Confirm visit type and layout.",
      "Switch layout if needed and expand sections.",
      "Route eye-care template team if still missing.",
    ],
    ifThatFails: [
      "Wrong layout: switch to the correct sub-specialty.",
      "Section collapsed: expand and try again.",
      "Field genuinely missing: eye-care template team.",
    ],
    keywords: k("eye exam layout", "ophthalmology layout", "optometry layout", "kaleidoscope layout", "eye exam field missing", "eye chart layout", "retina exam layout", "glaucoma exam layout", "cornea exam layout", "eye care documentation"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12_eye_imaging_or_device_not_linking",
    title: "Eye-care imaging or device result isn't attaching to the chart",
    type: "playbook",
    summary: "An imaging test or device reading (OCT, visual field, fundus photo) was done but isn't showing up on the patient's chart.",
    roles: k("ophthalmic tech", "provider", "clinic support"),
    domains: k("eye care", "imaging", "media"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Eye-care chart -> Imaging / media area -> Device interface status -> Re-link or re-send",
    first90: [
      "Confirm the test was actually completed on the device.",
      "Check the imaging or media section on the patient's chart for a pending or unlinked study.",
      "If nothing is pending, re-send from the device through the approved path.",
    ],
    whatToSay: [
      "'Let me look for a pending study before we re-do the test.'",
      "'If the link broke, we re-send from the device — we don't recapture the image on the patient again.'",
    ],
    whatToCheck: [
      "That the test was done on the right patient (check name and date of birth on the device).",
      "Whether the image is pending, unlinked, or didn't make it to the chart at all.",
      "Whether the device interface is up across the clinic, or only one device is failing.",
    ],
    whenToEscalate: "If the image can't be linked, the device interface is down, or the patient is still in the room waiting, send it to the eye-care imaging team or device support with the device name and the patient timing.",
    walkthrough: [
      "Confirm the test ran on the correct patient.",
      "Check chart for pending or unlinked study.",
      "Re-send from device or escalate to imaging team.",
    ],
    ifThatFails: [
      "Pending study: link it through the approved path.",
      "Device interface down: device support.",
      "Patient still waiting: escalate with timing now.",
    ],
    keywords: k("oct not showing", "visual field not showing", "fundus photo missing", "eye imaging missing", "eye device not linking", "ophthalmology imaging", "optometry imaging", "kaleidoscope imaging", "eye test not in chart", "imaging device interface"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  // --- Pack 12 round 2: deeper specialty coverage ---
  {
    id: "ll_p12r2_greyed_out_button",
    title: "A button is greyed out and the user can't click it",
    type: "playbook",
    summary: "The button is on screen but dimmed, so the user can't tell if it's their role, the patient context, or a missing step.",
    roles: k("clinic staff", "provider", "front desk", "all roles"),
    domains: k("access", "context", "workflow"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Current screen -> Hover the greyed button -> Check the tooltip -> Check patient context bar",
    first90: [
      "Hover the button — most greyed buttons show a reason in the tooltip.",
      "Check the top bar: right patient, right encounter, right department.",
      "Have a peer in the same role try the same patient and screen.",
    ],
    whatToSay: [
      "'Greyed out almost always means a missing step or wrong context — let's check before we call it a permission issue.'",
      "'If a peer in your role can click it, it's something on this chart, not on your login.'",
    ],
    whatToCheck: [
      "The tooltip text on the button (it usually names the missing step).",
      "Whether the encounter is open, signed, or closed — closed encounters grey out most actions.",
      "Whether the user is in the right department or login context for that workflow.",
    ],
    whenToEscalate: "If a peer in the same role on the same patient also sees it greyed, send it to the access and security team with the screen name, the button label, and the tooltip text.",
    walkthrough: [
      "Hover for the tooltip reason.",
      "Verify patient, encounter, and department context.",
      "Compare with a peer in the same role.",
    ],
    ifThatFails: [
      "Tooltip names a missing step: complete that step first.",
      "Wrong department context: switch login department.",
      "Peer also blocked: access and security team.",
    ],
    keywords: k("greyed out", "grayed out", "button dimmed", "can't click", "cant click", "button disabled", "button not working", "why is this greyed", "greyed button"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_missing_activity_or_tab",
    title: "An activity, report, or tab is missing from the user's view",
    type: "playbook",
    summary: "A user expects a tab, activity, or report to be there and it isn't — usually a personalization or role view issue, not a true access block.",
    roles: k("provider", "clinic staff", "front desk"),
    domains: k("personalization", "access", "navigation"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Activity tab strip -> More / wrench icon -> Add or show activity -> Save view",
    first90: [
      "Open the more / wrench / customize menu on the activity bar.",
      "Look for the missing activity in the hidden list and add it back.",
      "Save the view and have the user log out and back in.",
    ],
    whatToSay: [
      "'Most of the time the activity is hidden, not blocked — let's add it back to your view.'",
      "'If it's not in the hidden list either, then it's a role thing and I'll route it.'",
    ],
    whatToCheck: [
      "Whether the activity shows up in the hidden / available list.",
      "Whether a peer in the same role sees the activity in their view.",
      "Whether the user is in the correct department or login context.",
    ],
    whenToEscalate: "If the activity isn't in the hidden list and a peer in the same role does have it, send it to the access and security team with the user, role, and the missing activity name.",
    walkthrough: [
      "Open customize / wrench on the activity bar.",
      "Add the activity back and save.",
      "Confirm with a peer or escalate to access team.",
    ],
    ifThatFails: [
      "Not in hidden list: access and security team.",
      "Peer has it: role/template mismatch — access team.",
      "Wrong department: switch login department.",
    ],
    keywords: k("missing tab", "missing activity", "missing report", "activity tab", "provider cannot see activity", "provider cant see activity", "provider can not see activity", "cannot see activity tab", "cant see tab", "tab not showing", "activity not showing", "report not showing", "can't find tab", "where is the tab", "hidden activity", "customize view", "activity missing", "tab missing", "report missing"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_one_user_can_other_cannot",
    title: "One user can do it but another user can't",
    type: "playbook",
    summary: "Two users in similar roles get different results on the same workflow — usually a role template, department, or login context difference.",
    roles: k("clinic staff", "provider", "front desk", "all roles"),
    domains: k("access", "roles", "context"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Both users on same patient/screen -> Compare login department -> Compare role -> Capture both screens",
    first90: [
      "Put both users on the exact same patient and screen.",
      "Compare login department, role, and any sub-role they each picked at login.",
      "Have the blocked user log out and back in to refresh.",
    ],
    whatToSay: [
      "'Let's compare the two of you side by side so we know what's actually different.'",
      "'If your roles look the same, this is a templating issue and I'll route it.'",
    ],
    whatToCheck: [
      "Login department for each user (they may look the same but be different sub-departments).",
      "Exact role name shown on each user's profile.",
      "Whether the working user is using a personalized view the other user doesn't have.",
    ],
    whenToEscalate: "If both users are in the same role and department and one is still blocked, send it to the access and security team with both names, the screen, and the action.",
    walkthrough: [
      "Compare both users on the same patient and screen.",
      "Capture role and department for each.",
      "Route to access team if roles match.",
    ],
    ifThatFails: [
      "Different department: switch login department.",
      "Different role: access and security team.",
      "Personalization gap: copy the view from the working user.",
    ],
    keywords: k("one user can other can not", "she can i can not", "he can i can not", "works for one user", "only one user", "different access", "role difference", "permission difference"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_wrong_department_context",
    title: "User is in the wrong department or login context",
    type: "playbook",
    summary: "Workflows behave oddly because the user logged into the wrong department, clinic, or login context for the work they're doing.",
    roles: k("clinic staff", "provider", "front desk"),
    domains: k("context", "login", "department"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 1,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Top context bar -> Department / login context -> Switch -> Re-open the workflow",
    first90: [
      "Look at the top bar and confirm the department or login context is correct.",
      "Switch to the correct department using the change context option.",
      "Re-open the workflow from scratch after switching.",
    ],
    whatToSay: [
      "'Your login context drives what you see — let's get you into the right department before we change anything else.'",
    ],
    whatToCheck: [
      "Department name and code shown in the top bar.",
      "Whether the user picked the right department at login.",
      "Whether their default department is set correctly in their profile.",
    ],
    whenToEscalate: "If the user can't see or pick the correct department in the switch list, send it to the access and security team with the user and the missing department.",
    walkthrough: [
      "Confirm the current department in the top bar.",
      "Switch context to the right department.",
      "Re-run the workflow.",
    ],
    ifThatFails: [
      "Department not in list: access and security team.",
      "Wrong default: fix in personal profile.",
      "Still wrong after switch: log out and back in.",
    ],
    keywords: k("wrong department", "wrong department context", "wrong login department", "logged in wrong department", "wrong context", "wrong clinic", "login context", "change context", "department switch", "logged in wrong place", "wrong location context"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_smartlink_blank_or_wrong",
    title: "SmartLink is blank, wrong, or showing old data",
    type: "playbook",
    summary: "A SmartLink in a note is empty, pulling the wrong information, or showing data from an old visit instead of today.",
    roles: k("provider", "clinic staff"),
    domains: k("smarttools", "documentation", "smartlink"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Open note -> Place cursor on SmartLink -> Refresh note -> Verify patient and encounter",
    first90: [
      "Confirm the note is on today's encounter, not an old one.",
      "Refresh the note so SmartLinks re-pull from the chart.",
      "Check that the data the SmartLink expects has actually been entered.",
    ],
    whatToSay: [
      "'A blank SmartLink usually means the data it's looking for hasn't been entered yet — not that the link is broken.'",
      "'Let me refresh the note and see if it fills in.'",
    ],
    whatToCheck: [
      "Whether the encounter is today's, or an old encounter is open.",
      "Whether the source data (vitals, problem list, meds) exists for this visit.",
      "Whether the SmartLink name matches what was intended.",
    ],
    whenToEscalate: "If the SmartLink stays blank after refresh and the source data is in the chart, send it to the clinical informatics team with the SmartLink name and a sample note.",
    walkthrough: [
      "Check today's encounter is open.",
      "Refresh the note.",
      "Confirm source data exists.",
    ],
    ifThatFails: [
      "Still blank: clinical informatics with the SmartLink name.",
      "Wrong data: confirm correct patient/encounter.",
      "Old data: refresh; if still old, informatics.",
    ],
    keywords: k("smartlink blank", "smartlink empty", "smartlink wrong", "smartlink old data", "smartlink not pulling", "smartlink not working", "dot phrase blank", "dot phrase wrong"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_smartlink_parameter_question",
    title: "SmartLink needs a parameter and the user doesn't know what to enter",
    type: "playbook",
    summary: "A SmartLink is asking for a parameter (like a number of days or a category) and the user is stuck on what value to put in.",
    roles: k("provider", "clinic staff"),
    domains: k("smarttools", "smartlink", "parameters"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 1,
    escalation: 1,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Note -> SmartLink prompt window -> Hover the parameter field -> Pick a value -> Accept",
    first90: [
      "Hover the parameter prompt — most show a short hint of what's expected.",
      "Pick a sensible default (e.g. 30 days for recent labs) if no hint is shown.",
      "Accept and check the note filled in correctly.",
    ],
    whatToSay: [
      "'Most parameters are just a time window or a category — pick something close and we'll adjust if the note looks off.'",
    ],
    whatToCheck: [
      "Whether the prompt shows a hint or example value.",
      "Whether your specialty has a standard value for this SmartLink.",
      "Whether the note filled in as expected after you accepted.",
    ],
    whenToEscalate: "If the parameter is unclear and the note keeps filling in wrong, send it to the clinical informatics team with the SmartLink name and a screenshot of the prompt.",
    walkthrough: [
      "Hover the parameter for a hint.",
      "Enter a sensible value.",
      "Verify the note output.",
    ],
    ifThatFails: [
      "No hint: ask clinical informatics for the standard value.",
      "Note fills wrong: try a different value.",
      "Repeated confusion: informatics to add a default.",
    ],
    keywords: k("smartlink parameter", "smartlink prompt", "what do i enter", "smartlink asking for", "smartlink value", "dot phrase parameter", "smartphrase parameter"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_inbasket_empty_or_wrong_pool",
    title: "In Basket is empty, overloaded, or showing the wrong inbox",
    type: "playbook",
    summary: "The user's inbox looks empty when they expect work, overloaded when they don't, or pointing at the wrong pool or covered provider.",
    roles: k("provider", "clinic staff"),
    domains: k("in basket", "inbox", "coverage"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "In Basket -> Inbox selector at the top -> Pick your own or a covered pool -> Refresh",
    first90: [
      "Check the inbox selector at the top — make sure you're looking at your inbox, not a covered pool.",
      "Refresh the In Basket to re-pull messages.",
      "If empty, check coverage and out-of-office settings.",
    ],
    whatToSay: [
      "'An empty inbox usually means you're looking at the wrong pool, not that the messages are gone.'",
      "'If you're overloaded, let's filter by folder and priority before you start clicking.'",
    ],
    whatToCheck: [
      "Which inbox is selected (your own, shared pool, covered provider).",
      "Whether out-of-office or coverage is rerouting your messages.",
      "Whether folder filters are hiding messages you expect to see.",
    ],
    whenToEscalate: "If messages are truly missing or routed to the wrong pool, send it to the In Basket support team with the user, the pool name, and one example message subject.",
    walkthrough: [
      "Confirm the right inbox is selected.",
      "Refresh and clear filters.",
      "Check coverage / out-of-office settings.",
    ],
    ifThatFails: [
      "Wrong pool: switch inbox.",
      "Routed away: fix coverage settings.",
      "Truly missing: In Basket support.",
    ],
    keywords: k("in basket empty", "inbox empty", "in basket overloaded", "inbox full", "wrong pool", "wrong inbox", "in basket missing messages", "covered provider inbox", "in basket not showing"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_portal_proxy_access",
    title: "Patient portal proxy access for a family member or caregiver",
    type: "playbook",
    summary: "A patient or caregiver needs access to a family member's portal account (parent of a minor, adult caregiver, or shared access).",
    roles: k("front desk", "clinic staff", "patient support"),
    domains: k("patient portal", "proxy", "consent"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "document",
    nav_trail: "Patient chart -> Portal / proxy access -> Add proxy -> Capture consent -> Send activation",
    first90: [
      "Confirm the relationship and the right consent form for that relationship.",
      "Open the proxy access area on the patient chart and add the proxy.",
      "Send the activation invite to the proxy's email.",
    ],
    whatToSay: [
      "'I can set up proxy access once we have the right consent on file for this relationship.'",
      "'They'll get an activation email — they should use that link, not sign up fresh.'",
    ],
    whatToCheck: [
      "The relationship type and the matching consent form.",
      "Whether the proxy already has their own portal account.",
      "Whether the patient is a minor and whether age-based access rules apply.",
    ],
    whenToEscalate: "If consent rules are unclear, the relationship doesn't fit a standard type, or age-based access is in question, send it to the patient portal support team with the relationship and the consent on file.",
    walkthrough: [
      "Verify consent for the relationship.",
      "Add proxy on the patient chart.",
      "Send activation invite.",
    ],
    ifThatFails: [
      "Consent missing: hold until signed.",
      "Age-based rules unclear: portal support team.",
      "Activation email not received: resend; if still failing, portal support.",
    ],
    keywords: k("portal proxy", "proxy access", "proxy cannot see", "proxy cant see portal", "proxy can not see portal", "proxy cannot see portal information", "caregiver cannot see patient portal", "caregiver cant see portal", "family access", "parent access", "caregiver access", "mychart proxy", "patient portal proxy", "share access", "minor portal access", "spouse portal access"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_portal_scheduling_unavailable",
    title: "Patient can't self-schedule from the portal",
    type: "playbook",
    summary: "A patient calls because the portal won't let them book — usually a visit type, provider, or eligibility rule, not a broken portal.",
    roles: k("front desk", "clinic staff", "patient support"),
    domains: k("patient portal", "scheduling"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Patient chart -> Scheduling tab -> Visit type and provider eligibility -> Book on patient's behalf if needed",
    first90: [
      "Confirm the visit type the patient is trying to book is open to self-scheduling.",
      "Confirm the provider or department allows portal booking.",
      "If the patient can't book, schedule it on their behalf and explain why the portal blocked it.",
    ],
    whatToSay: [
      "'Not every visit type is open to portal booking — let me get this on the schedule for you now and explain what was blocked.'",
    ],
    whatToCheck: [
      "Whether the visit type is enabled for self-scheduling.",
      "Whether the provider or department is enabled for portal booking.",
      "Whether the patient has an eligibility flag (overdue forms, balance, new patient) that blocks portal booking.",
    ],
    whenToEscalate: "If many patients hit the same block or the visit type should be open and isn't, send it to the scheduling build team with the visit type, provider, and a few patient examples (no other PHI).",
    walkthrough: [
      "Confirm visit type and provider eligibility.",
      "Book on patient's behalf if needed.",
      "Route persistent blocks to scheduling build.",
    ],
    ifThatFails: [
      "Visit type closed: book by phone; scheduling build for review.",
      "Provider not enabled: scheduling build.",
      "Eligibility block: resolve flag (forms, balance) then retry.",
    ],
    keywords: k("portal scheduling", "online scheduling", "online scheduling visit type", "visit type not showing", "visit type missing portal", "self schedule", "self scheduling", "can't book on portal", "cant book portal", "mychart scheduling", "patient can't schedule", "patient cant schedule", "portal appointment", "scheduling unavailable", "no appointments online"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_portal_message_routing",
    title: "Patient portal messages going to the wrong place or no one",
    type: "playbook",
    summary: "Portal messages aren't reaching the right team, are landing in a general pool, or are sitting in an inbox no one watches.",
    roles: k("provider", "clinic staff", "front desk"),
    domains: k("patient portal", "messages", "in basket"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Sample portal message -> Look at routing pool -> Compare with intended pool -> Adjust routing",
    first90: [
      "Open a sample message and check which pool it landed in.",
      "Compare the actual pool with the intended pool for that message type.",
      "If the wrong pool, move the message and capture the example for the build team.",
    ],
    whatToSay: [
      "'Let's look at where this message landed and where it should have gone — that tells us if it's a routing rule or a user step.'",
    ],
    whatToCheck: [
      "Which pool received the message and who covers that pool.",
      "Whether the message type (refill, results question, scheduling) has a known routing rule.",
      "Whether anyone is monitoring the pool the messages land in.",
    ],
    whenToEscalate: "If portal messages are routing to an unmonitored pool or the wrong team, send it to the patient portal support team with the message type and one example subject (no PHI).",
    walkthrough: [
      "Open a sample message.",
      "Identify actual vs intended pool.",
      "Route to portal support if rule is wrong.",
    ],
    ifThatFails: [
      "Wrong pool: portal support to fix routing rule.",
      "Unmonitored pool: assign coverage now, fix rule next.",
      "User sent to wrong place: educate and update guidance.",
    ],
    keywords: k("portal message routing", "portal message routed wrong team", "portal message wrong team", "portal message wrong place", "mychart message wrong place", "portal message lost", "portal message no answer", "patient message routing", "in basket portal message", "patient message went to wrong team"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_results_not_visible",
    title: "Results aren't visible to the user or the patient",
    type: "playbook",
    summary: "A lab, imaging, or test result isn't showing up where someone expects — in the chart, the In Basket, or on the patient's portal.",
    roles: k("provider", "clinic staff", "patient support"),
    domains: k("results", "in basket", "patient portal"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 3,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Patient chart -> Results / chart review -> Result release status -> In Basket result folder -> Portal release rule",
    first90: [
      "Confirm the result is actually back from the lab or imaging source.",
      "Check the result release status — held, released to provider, or released to patient.",
      "Look in the result folder of the right In Basket pool.",
    ],
    whatToSay: [
      "'Let's see if the result is back yet and where it was released before we say it's missing.'",
      "'Patient-facing results sometimes hold for a review window — that's by design.'",
    ],
    whatToCheck: [
      "Whether the result is back from the source system.",
      "Whether the release rule holds it for provider review before the patient sees it.",
      "Whether it routed to a pool the user isn't watching.",
    ],
    whenToEscalate: "If the result is back, released, and still not visible, send it to the results routing team with the result type, order, and the inbox where it should have landed.",
    walkthrough: [
      "Confirm result is back.",
      "Check release status and routing.",
      "Escalate to results routing if truly missing.",
    ],
    ifThatFails: [
      "Held for review: that's by design; finish review.",
      "Wrong pool: fix routing in build.",
      "Truly missing: results routing team.",
    ],
    keywords: k("results not in chart", "result missing from chart", "labs not in chart", "imaging not in chart", "result not in inbox", "result not in in basket", "result folder empty", "lab result not routed", "imaging not routed"),
    related_ids: ["p1", "c1", "v1"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_eye_exam_section_missing",
    title: "Eye-care exam section or field is missing on a specialty form",
    type: "playbook",
    summary: "An eye-care exam section, field, or template (slit lamp, refraction, IOP) isn't showing on the exam form the user expects.",
    roles: k("ophthalmic tech", "provider", "clinic support"),
    domains: k("eye care", "documentation", "templates"),
    phases: k("cutover day 0", "stabilization week 1"),
    urgency: 2,
    escalation: 2,
    vendor_family: "epic",
    action: "review",
    nav_trail: "Eye-care visit -> Exam form -> Customize / sections menu -> Add missing section -> Save",
    first90: [
      "Open the exam form's customize or sections menu.",
      "Look for the missing section in the available list and add it.",
      "Confirm a peer in the same specialty role sees the same sections.",
    ],
    whatToSay: [
      "'Most of the time the section is hidden in your personal layout — let's add it back before we call it a build issue.'",
    ],
    whatToCheck: [
      "Whether the section is in the available / hidden list.",
      "Whether a peer in the same role sees the section.",
      "Whether the visit type loads the right specialty template.",
    ],
    whenToEscalate: "If the section isn't available to add and peers also can't see it, send it to the eye-care build team with the visit type, the form name, and the missing section.",
    walkthrough: [
      "Open customize on the exam form.",
      "Add missing section and save.",
      "Compare with a peer; escalate to eye-care build if needed.",
    ],
    ifThatFails: [
      "Not in available list: eye-care build team.",
      "Wrong visit type: switch to the correct visit type.",
      "Peer has it: copy their personal layout.",
    ],
    keywords: k("eye exam section missing", "eye exam field missing", "eye exam layout missing", "slit lamp missing", "refraction missing", "iop field missing", "ophthalmology template missing", "optometry template missing", "specialty exam form missing", "ophthalmology section missing", "eye care section missing"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
  {
    id: "ll_p12r2_eye_imaging_wrong_view",
    title: "Eye-care imaging not showing in the expected view",
    type: "playbook",
    summary: "Imaging is attached to the chart but not appearing in the view the user expects — wrong tab, wrong study type, or filtered out.",
    roles: k("ophthalmic tech", "provider", "clinic support"),
    domains: k("eye care", "imaging", "media"),
    phases: k("stabilization week 1", "optimization weeks 2-4"),
    urgency: 2,
    escalation: 3,
    vendor_family: "epic",
    action: "review",
    is_deep_flow: true,
    nav_trail: "Eye-care chart -> Imaging / media tab -> Clear filters -> Check study type and date range",
    first90: [
      "Open the imaging or media tab and clear any filters.",
      "Confirm the study type and date range cover today's image.",
      "If still missing, check the all-media view to see if it landed under a different category.",
    ],
    whatToSay: [
      "'The image is probably there — it's usually a filter or the wrong study type, not a lost image.'",
    ],
    whatToCheck: [
      "Active filters on the imaging view (date, study type, laterality).",
      "Whether the image came in under a different category than expected.",
      "Whether the user's view is personalized to hide certain study types.",
    ],
    whenToEscalate: "If the image is on the chart but won't display in any view, send it to the eye-care imaging team with the patient timing, the device, and the study type.",
    walkthrough: [
      "Clear filters on the imaging view.",
      "Check all-media view for misfiled study.",
      "Escalate to imaging team if it won't display.",
    ],
    ifThatFails: [
      "Filtered out: clear filters.",
      "Wrong category: re-classify with imaging team.",
      "Won't display: eye-care imaging team.",
    ],
    keywords: k("imaging not showing", "imaging wrong view", "eye image not showing in expected view", "image not showing in expected view", "eye care image not showing", "oct not in view", "visual field not in view", "eye image wrong tab", "eye imaging filtered", "eye media missing view", "ophthalmology imaging view", "fundus image missing view"),
    related_ids: ["p25", "c19", "v21"],
    sanitized_approved: true,
    status: "published",
  },
];

// --- Match engine -------------------------------------------------------

export type MatchQuality = "strong" | "related" | "general";

export interface AskAnswer {
  matchQuality: MatchQuality;
  matchLabel: string;
  title: string;
  shortAnswer: string;
  walkthrough: string[];
  ifThatFails: string[];
  visualAids: VisualAid[];
  kbSupport: KbSupport;
  first90: string[];
  whatToSay: string[];
  whatToCheck: string[];
  whenToEscalate: string;
  liveGuide: LiveGuide;
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

const STOP_TOKENS = new Set([
  "the", "and", "for", "with", "what", "when", "where", "which", "who",
  "how", "does", "that", "this", "there", "here", "first", "issue",
  "item", "items", "looks", "look", "need", "needs", "help",
]);

function scoreEntry(entry: LaunchEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = [
    entry.title,
    entry.summary,
    entry.keywords.join(" "),
    entry.domains.join(" "),
    entry.roles.join(" "),
  ].join(" ").toLowerCase();
  const phraseHay = ` ${hay} `;
  let s = 0;
  for (const tk of tokens) {
    if (entry.keywords.some(kw => kw.toLowerCase().includes(tk))) s += 3;
    if (hay.includes(tk)) s += 1;
  }
  for (const kw of entry.keywords) {
    const normalized = kw.toLowerCase().trim();
    if (normalized.length > 3 && phraseHay.includes(` ${normalized} `)) {
      s += tokens.includes(normalized) ? 4 : 0;
    }
  }
  return s;
}

function walkthroughFor(entry: LaunchEntry): string[] {
  return entry.walkthrough ?? [
    ...entry.first90.slice(0, 3),
    "Run the checks below in order before escalating.",
    "If the first path works, stop there and close the loop with the requester.",
  ];
}

function ifThatFailsFor(entry: LaunchEntry): string[] {
  return entry.ifThatFails ?? [
    "If the first attempt fails, confirm scope: one user, one workstation, or the whole unit/team.",
    "If a second reasonable attempt fails, stop troubleshooting and capture what you tried.",
    "If the issue blocks care, throughput, or a time-sensitive workflow, escalate with scope, severity, and callback.",
  ];
}

function visualAidsFor(entry: LaunchEntry, relatedItems: ContentItem[]): VisualAid[] {
  if (entry.visualAids?.length) return entry.visualAids;
  const video = relatedItems.find(item => item.content_type === "video");
  return video
    ? [{
        kind: "video",
        title: video.title,
        note: "Short Mizly training clip for this workflow.",
        href: "/videos",
      }]
    : [];
}

function dedupeVisualAids(aids: VisualAid[]): VisualAid[] {
  const seen = new Set<string>();
  return aids.filter(aid => {
    const key = `${aid.kind}:${aid.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function exactWorkflowBoost(entry: LaunchEntry, queryText: string): number {
  if (
    entry.id === "ll_barcode_med_admin_scan_mismatch" &&
    /\b(barcode\s+(med|medication).*mismatch|medication\s+barcode.*mismatch|bcma\s+mismatch|barcode\s+alert|med\s+won'?t\s+scan)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_charge_not_dropping_after_visit" &&
    /\b(get\s+to\s+charge\s+capture|charge\s+not\s+dropping|charge\s+did\s+not\s+drop|charge\s+queue|visit\s+charges)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_note_sidebar_or_note_type_missing" &&
    /\b(where\s+do\s+i\s+write\s+my\s+note|note\s+area\s+missing|documentation\s+sidebar|sidebar\s+(is\s+)?hidden|collapsed\s+sidebar)\b/.test(queryText)
  ) {
    return 25;
  }
  if (
    entry.id === "ll_document_scanned_to_wrong_encounter" &&
    /\b(scanned?\s+(document\s+)?to\s+wrong\s+encounter|wrong\s+encounter\s+scan|document\s+attached\s+wrong\s+encounter|duplicate\s+scanned\s+document|scan\s+landed\s+wrong)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_dnb_edit_or_stop_bill_owner" &&
    /\b(dnb\s+edit|discharged\s+not\s+billed\s+edit|stop\s+bill|resolve\s+dnb|clear\s+dnb|dnb\s+workqueue)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_hb_account_status_dnb_or_billed" &&
    /\b(har\s+status|hospital\s+account\s+status|account\s+status|dnb|discharged\s+not\s+billed|billed\s+status|closed\s+account|billing\s+status)\b/.test(queryText)
  ) {
    return 25;
  }
  if (
    entry.id === "ll_claim_edit_workqueue_owner" &&
    /\b(claim\s+edit\s+(workqueue|wq)?|claim\s+error|claim\s+errors\s+sidebar|multiple\s+claim\s+workqueues|error\s+code\s+owner)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_clearinghouse_error_refresh_retest" &&
    /\b(clearinghouse\s+error|external\s+status\s+code|external\s+status|claim\s+scrubber|rapid\s+retest|refresh\s+to\s+retest)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_late_charge_or_split_claim" &&
    /\b(late\s+charge|split\s+claim|charge\s+posted\s+after\s+claim|charge\s+after\s+billing|claim\s+already\s+billed\s+charge)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_sbo_guarantor_balance_statement_call" &&
    /\b(guarantor\s+balance|balance\s+inquiry|statement\s+inquiry|sbo\s+statement|why\s+did\s+i\s+get\s+a\s+bill|account\s+balance\s+question)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_sbo_payment_plan_or_self_pay_followup" &&
    /\b(payment\s+plan|self-?pay\s+follow\s*up|missed\s+payment|payment\s+arrangement|financial\s+assistance|bad\s+debt)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_coverage_filing_order_term_delete" &&
    /\b(filing\s+order|term\s+coverage|delete\s+coverage|effective\s+to\s+field|coverage\s+added\s+in\s+error|old\s+insurance\s+coverage)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_account_activity_communication_needed" &&
    /\b(account\s+activit(y|ies)|communication\s+workflow|billing\s+communication|send\s+communication|recipient\s+owner|billing\s+indicator)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_provider_inbasket_folder_filter_overload" &&
    /\b(provider\s+in\s?basket|in\s?basket\s+(overloaded|overflowing|folders?|filter)|message\s+folder\s+filter|pool\s+view|proxy\s+view|delegate\s+view)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_provider_inbasket_result_or_refill_followup" &&
    /\b(in\s?basket\s+(result|refill|follow[- ]?up)|result\s+message|refill\s+message|done\s+button\s+missing|cannot\s+mark\s+done|provider\s+message\s+action)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_smarttools_placeholder_prompt_unresolved" &&
    /\b(smart\s?tools?|smart\s?phrase\s+prompt|smart\s?text\s+prompt|smart\s?list\s+prompt|placeholder\s+not\s+resolving|unresolved\s+placeholder|smart\s?link\s+blank|prompt\s+won'?t\s+resolve)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_smartset_section_or_order_not_selected" &&
    /\b(smart\s?set\s+(section|order|unchecked|hidden|required)|expected\s+order\s+not\s+in\s+smart\s?set|order\s+missing\s+from\s+smart\s?set)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_inpatient_clinical_review_data_hidden" &&
    /\b(clinical\s+review|inpatient\s+clinical\s+review|patient\s+summary\s+missing|chart\s+review\s+missing|provider\s+inpatient\s+list|rounding\s+review)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_provider_note_copy_forward_or_refresh_wrong" &&
    /\b(copy[- ]?forward|copied\s+forward|refresh\s+note|note\s+pulled\s+old\s+data|old\s+(assessment|plan)\s+in\s+note|stale\s+note\s+data|imported\s+data\s+wrong)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_surgical_workflow_case_ready_blocked" &&
    /\b(surgical\s+workflow|surgery\s+workflow|case\s+not\s+ready|case\s+readiness|pre-?op\s+not\s+ready|case\s+status\s+blocked|procedure\s+readiness|periop\s+checklist\s+blocked)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_radiant_protocol_ready_for_exam_blocked" &&
    /\b(radiant\s+protocol|radiology\s+protocol|protocol\s+pending|ready\s+for\s+exam|exam\s+not\s+ready|modality\s+queue|radiology\s+patient\s+prep|radiology\s+transport)\b/.test(queryText)
  ) {
    return 30;
  }
  if (
    entry.id === "ll_prescription_printer_routing_wrong" &&
    /\b(print\s+prescriptions?|prescription\s+printer|rx\s+printer|troy\s+printer|t\s+printer|prescription\s+not\s+printing|print\s+rx|paper\s+prescription\s+printer)\b/.test(queryText)
  ) {
    return 30;
  }
  return 0;
}

function liveGuideFor(entry: LaunchEntry, query: string): LiveGuide {
  const queryText = query.toLowerCase();
  const hay = [
    query,
    entry.id,
    entry.title,
    entry.summary,
    entry.action ?? "",
    entry.nav_trail ?? "",
    entry.domains.join(" "),
    entry.keywords.join(" "),
  ].join(" ").toLowerCase();
  const has = (...terms: string[]) => terms.some(term => hay.includes(term));
  const say = unquote(entry.whatToSay[0] ?? "I am checking the screen path and context before we retry.");
  const checks = entry.whatToCheck.slice(0, 3);
  const fallback: LiveGuide = {
    doThisFirst: "Start from the workspace or chart where the user is doing the work.",
    whereToLook: entry.nav_trail
      ? `Use this trail: ${entry.nav_trail}.`
      : "Look for the active work area, left activity menu, top toolbar, or right-side panel.",
    whatToClick: "Open the most specific button, menu, folder, or field for this task. If labels vary, look for the closest workflow label.",
    whatShouldHappen: "The next panel, queue, editor, or detail view should open so you can complete the missing item.",
    ifYouDontSeeIt: "If the option is missing, confirm patient, encounter, role, department/location, filters, and access before escalating.",
    whatToSay: say,
    checkThis: checks,
    escalateWhen: entry.whenToEscalate,
  };

  const isContextSwitch =
    entry.id === "ll_wrong_location" ||
    /\b(change context|change department|change location|wrong unit|wrong location|wrong floor|workstation context)\b/.test(queryText);

  if (isContextSwitch) {
    return {
      doThisFirst: "Pause the workflow and confirm the user is in the right department, job, location, and patient context.",
      whereToLook: "Look at the top banner or top-left application/menu area. The current department, location, job, or workspace label is usually shown there.",
      whatToClick: "Open the top-left menu or context dropdown. Look for Change Context, department, job, location, or workspace. Pick the correct context, then confirm it.",
      whatShouldHappen: "The top banner or workspace label should change before the user retries the task.",
      ifYouDontSeeIt: "If Change Context or the department/location option is missing, this is likely access or security-template related. Escalate to the floor lead or access team.",
      whatToSay: "I am checking the right context before we retry, so we do not fix the wrong screen.",
      checkThis: ["Top banner/workspace label.", "Department, job, location, and role.", "Whether context resets after switching."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_allergy_or_reaction_blocks_order") {
    return {
      doThisFirst: "Keep the alert visible and do not bypass it.",
      whereToLook: "Look at allergy/reaction context, severity, alert wording, the blocked order or medication, and the owner lane.",
      whatToClick: "Open alert or allergy details. Compare reaction context to the blocked item, then route the clinical decision owner.",
      whatShouldHappen: "You should see the reaction context, blocked item, and who owns the next clinical decision.",
      ifYouDontSeeIt: "If reaction context, owner, or override path is unclear, stop and escalate to pharmacy/provider owner before the medication moves.",
      whatToSay: "This is a medication safety stop, so I am checking context and owner before anyone proceeds.",
      checkThis: ["Allergy/reaction field and severity.", "Blocked medication or order.", "Clinical owner and escalation path."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_attestation_cosign") {
    return {
      doThisFirst: "Confirm what action created the attestation or cosign task.",
      whereToLook: "Look at the source action, owner role, task status, queue or pool, and whether the signer can see it.",
      whatToClick: "Open the signature/cosign task details, confirm owner and route status, then use the approved route or reassign action if available.",
      whatShouldHappen: "The next owner, queue, or blocked routing reason should be visible before anyone retries.",
      ifYouDontSeeIt: "If the owner cannot see the task or active work is blocked, escalate with source action, owner role, status, and callback.",
      whatToSay: "I am confirming who owns the next signature before we chase screens.",
      checkThis: ["Source action.", "Owner role and task status.", "Queue/pool visibility and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_authorization_or_referral_status_missing") {
    return {
      doThisFirst: "Open the appointment, referral, or request context first.",
      whereToLook: "Look at referral/auth status, coverage lane, linked appointment/order, owner queue, and visit timing.",
      whatToClick: "Open referral or authorization details. Confirm status and owner before changing, canceling, or moving the visit.",
      whatShouldHappen: "You should see missing, pending, denied, expired, linked, or owner status before scheduling changes.",
      ifYouDontSeeIt: "If same-day care is blocked or owner is unclear, escalate to referral/authorization owner with callback.",
      whatToSay: "I am checking whether this is missing, pending, or hidden by context before we change the appointment.",
      checkThis: ["Appointment/request context.", "Referral/auth and coverage status.", "Owner queue and same-day urgency."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_consent_missing_before_procedure") {
    return {
      doThisFirst: "Confirm the procedure or case and the correct encounter.",
      whereToLook: "Look in consents/documents for consent type, signed status, scanned image, encounter link, and owner.",
      whatToClick: "Open consent or document details. Separate signed status from scan/link status before routing the owner.",
      whatShouldHappen: "The consent should show signed, unsigned, scanned, linked, or blocked with the owner path clear.",
      ifYouDontSeeIt: "If signed consent is missing, linked wrong, or timing is affected, escalate to periop/clinical owner immediately.",
      whatToSay: "I am separating clinical consent from the scan/link step before the case proceeds.",
      checkThis: ["Procedure/case and encounter.", "Consent type and signed status.", "Scan/link status and owner."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_ambulation_no_option") {
    return {
      doThisFirst: "Start in ADL or Mobility, not off-unit Transport.",
      whereToLook: "Look in the flowsheet mobility/ADL section for collapsed rows, wheelchair options, assist level, device, and comment policy.",
      whatToClick: "Expand Mobility, choose the approved activity/device row if present, document once, then verify timestamp and initials.",
      whatShouldHappen: "The activity should file under Mobility/ADL with assist/device context, or show that the row is truly missing.",
      ifYouDontSeeIt: "If the option is missing for multiple users or policy is unclear, escalate to clinical documentation owner.",
      whatToSay: "I am naming what happened first so we pick the right documentation category.",
      checkThis: ["Actual activity and destination.", "Mobility/ADL row and collapsed options.", "Assist level, device, timestamp, and comment policy."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_hb_account_status_dnb_or_billed") {
    return {
      doThisFirst: "Open the hospital account and read the current billing status.",
      whereToLook: "Look at account status, DNB/billing state, workqueues, owner lane, last action, and any visible blocker reason.",
      whatToClick: "Open account summary or status details first. Then open the related DNB/edit/workqueue item before changing account state.",
      whatShouldHappen: "You should see whether the account is open, DNB, billed, closed, or blocked by an owner lane.",
      ifYouDontSeeIt: "If status or owner is unclear, route the billing owner with account state, queue, blocker, and callback.",
      whatToSay: "Let's name the account status before we troubleshoot the bill.",
      checkThis: ["Account status and blocker reason.", "DNB/billing edit or workqueue.", "Owner lane and last action."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_dnb_edit_or_stop_bill_owner") {
    return {
      doThisFirst: "Open the DNB/edit detail and identify the blocker category.",
      whereToLook: "Look at edit code, edit category, blocker text, account status, owner lane, workqueue, and last update.",
      whatToClick: "Open the edit detail or workqueue item. Resolve only if it belongs to this owner lane; otherwise route it.",
      whatShouldHappen: "The edit should show the owner, blocker, and whether it can be safely resolved or routed.",
      ifYouDontSeeIt: "If owner or blocker meaning is unclear, stop and escalate with edit category, queue, and callback.",
      whatToSay: "DNB edits are owner-based, so let's find who owns this blocker first.",
      checkThis: ["Edit code/category.", "Owner lane and workqueue.", "Last update and blocker reason."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_claim_edit_workqueue_owner") {
    return {
      doThisFirst: "Open the claim edit detail and identify the exact edit code.",
      whereToLook: "Look at claim status, edit code, error message, workqueue, owner lane, and responsible team.",
      whatToClick: "Open the claim error or edit sidebar. Work only the assigned error code, then route or retest as policy requires.",
      whatShouldHappen: "The responsible owner, error code, and next action should be clear before anyone fixes unrelated edits.",
      ifYouDontSeeIt: "If ownership spans multiple queues or teams, escalate to claims owner with edit code, status, and callback.",
      whatToSay: "A claim can sit in multiple queues, so we need the exact edit owner.",
      checkThis: ["Claim status and edit code.", "Workqueue and owner lane.", "Route, refresh, or resubmit path."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_clearinghouse_error_refresh_retest") {
    return {
      doThisFirst: "Open the clearinghouse or external-status error and keep the text visible.",
      whereToLook: "Look at external status text, payer lane, claim edit, correction made, refresh/retest result, and owner.",
      whatToClick: "Open the error detail, correct the owned blocker once, then use the approved refresh or retest action.",
      whatShouldHappen: "The claim should pass retest or show the same external error with a clear owner path.",
      ifYouDontSeeIt: "If the error repeats after one approved correction, stop repeated resubmits and escalate the error text.",
      whatToSay: "Let's retest the claim after the correction instead of resubmitting blindly.",
      checkThis: ["External status/error text.", "Correction owner and claim edit.", "Refresh/retest result."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_late_charge_or_split_claim") {
    return {
      doThisFirst: "Confirm the account, service date, and current claim status.",
      whereToLook: "Look at charges/transactions, service date, late-charge indicator, claim status, split-claim context, and owner lane.",
      whatToClick: "Open charge or transaction detail. Check whether the charge is late, held, or already tied to a claim before routing.",
      whatShouldHappen: "You should see whether this is a charge timing issue, claim status issue, or owner-policy issue.",
      ifYouDontSeeIt: "If split-claim handling or manual billing policy is unclear, route charge/revenue owner before forcing anything.",
      whatToSay: "Let's confirm whether this is a charge timing issue or a claim-status issue.",
      checkThis: ["Account and service date.", "Charge/transaction status.", "Claim status and owner lane."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_sbo_guarantor_balance_statement_call") {
    return {
      doThisFirst: "Confirm this is a guarantor balance or statement question, not a clinical issue.",
      whereToLook: "Look at guarantor/account lane, balance category, statement status, note history, and customer-service owner.",
      whatToClick: "Open the approved account or guarantor summary, then open statement or balance details before giving next steps.",
      whatShouldHappen: "You should see balance source, statement status, owner, and the approved close-loop action.",
      ifYouDontSeeIt: "If balance source or policy answer is unclear, route customer-service/revenue owner with a non-PHI summary.",
      whatToSay: "Let's confirm the statement lane before we answer or route this.",
      checkThis: ["Guarantor/account lane.", "Balance and statement status.", "Owner, note, and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_sbo_payment_plan_or_self_pay_followup") {
    return {
      doThisFirst: "Open the guarantor/account lane and check payment plan status.",
      whereToLook: "Look at payment plan status, self-pay follow-up queue, balance category, note history, due date, and owner.",
      whatToClick: "Open payment plan or self-pay follow-up details. Do not change terms until the policy owner is clear.",
      whatShouldHappen: "You should see plan status, follow-up owner, and whether the request needs approval or routing.",
      ifYouDontSeeIt: "If policy or ownership is unclear, route customer-service/self-pay owner before promising changes.",
      whatToSay: "I am checking the plan status before we tell the caller what will happen.",
      checkThis: ["Payment plan or self-pay status.", "Follow-up queue and owner.", "Policy/approval requirement."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_coverage_filing_order_term_delete") {
    return {
      doThisFirst: "Open the account or encounter coverage lane and check effective dates.",
      whereToLook: "Look at coverage status, effective dates, filing order, account/encounter link, payer lane, and owner.",
      whatToClick: "Open coverage details or filing order. Term old valid coverage; delete only coverage added in error.",
      whatShouldHappen: "The correct coverage order, active dates, and term/delete decision should be clear before billing moves.",
      ifYouDontSeeIt: "If dates, filing order, or term/delete decision is unclear, route registration/coverage owner.",
      whatToSay: "Let's decide whether this coverage was once valid or added by mistake.",
      checkThis: ["Coverage dates and status.", "Filing order and account link.", "Term vs delete decision."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_account_activity_communication_needed") {
    return {
      doThisFirst: "Open the account activity or communication area and confirm the recipient owner.",
      whereToLook: "Look at activity type, recipient group, account context, billing indicator, note, status, and callback.",
      whatToClick: "Open the communication action, choose the correct owner group, add a clean note, then route or close per policy.",
      whatShouldHappen: "The next team should receive the account activity with owner, reason, status, and callback clear.",
      ifYouDontSeeIt: "If owner or required status is unclear, route revenue-cycle lead with activity type and account lane.",
      whatToSay: "This is a handoff item, so I am checking owner and note before closing it.",
      checkThis: ["Activity type and owner.", "Billing indicator/status.", "Clean note and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_provider_inbasket_folder_filter_overload") {
    return {
      doThisFirst: "Identify whether the provider is in personal, pool, or proxy view.",
      whereToLook: "Look at folder, message type, owner/pool/proxy view, priority, due date, status, and date filters.",
      whatToClick: "Open folder/filter controls, sort by priority or due date, then open the highest-risk message detail first.",
      whatShouldHappen: "The urgent or owner-specific work should separate from FYI, stale, or filtered messages.",
      ifYouDontSeeIt: "If urgent work is hidden or a provider group is affected, escalate with folder, pool, count, and callback.",
      whatToSay: "Let's find the work that needs action first, then we can clean up the view.",
      checkThis: ["Folder and message type.", "Personal/pool/proxy owner view.", "Priority, due date, status, and date filters."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_provider_inbasket_result_or_refill_followup") {
    return {
      doThisFirst: "Open the message detail and identify the action type.",
      whereToLook: "Look at message type, result/refill/follow-up status, action buttons, owner, due date, and route/done availability.",
      whatToClick: "Use the message detail action area. Route, complete, or escalate only after owner and required action are clear.",
      whatShouldHappen: "The message should show whether it needs result review, refill action, patient follow-up, routing, or completion.",
      ifYouDontSeeIt: "If a time-sensitive message cannot be acted on or routed, escalate with message type, owner, and callback.",
      whatToSay: "Let's open the message and identify what action it actually needs.",
      checkThis: ["Message type and owner.", "Action buttons and due date.", "Personal/pool/proxy context."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_smarttools_placeholder_prompt_unresolved") {
    return {
      doThisFirst: "Keep the note open and find the unresolved prompt or placeholder.",
      whereToLook: "Look at note type, encounter, SmartTool type, unresolved placeholder, required prompt, refresh behavior, and sign status.",
      whatToClick: "Open or click the unresolved prompt/placeholder, complete required choices, then retry sign only after the text resolves.",
      whatShouldHappen: "The placeholder should resolve into approved text or show a specific tool/content owner problem.",
      ifYouDontSeeIt: "If a shared tool fails or the note cannot sign, escalate to documentation/content owner with tool and note type.",
      whatToSay: "Let's resolve the placeholder before this note gets signed.",
      checkThis: ["Note type and encounter.", "Tool type and unresolved prompt.", "Sign status and shared vs personal tool."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_smartset_section_or_order_not_selected") {
    return {
      doThisFirst: "Confirm encounter, department, and visit context before searching the SmartSet.",
      whereToLook: "Look at SmartSet name, section/accordion state, selected orders, required fields, and sign status.",
      whatToClick: "Expand the expected section, select the intended order, complete required fields, then sign or route the blocker.",
      whatShouldHappen: "The expected order should appear as selected or show why role/location/context hides it.",
      ifYouDontSeeIt: "If the expected section/order is missing in the right context, escalate with SmartSet name and context.",
      whatToSay: "Let's make sure the right section is open before we call the order missing.",
      checkThis: ["Encounter and department.", "SmartSet section/selected orders.", "Required fields and sign status."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_inpatient_clinical_review_data_hidden") {
    return {
      doThisFirst: "Confirm the patient list, selected patient, encounter, and date range.",
      whereToLook: "Look at clinical review filters, section visibility, date range, source result/vital/note status, and owner.",
      whatToClick: "Open filters or section controls, reset date/status if needed, then open the source detail before escalating.",
      whatShouldHappen: "The data should appear, or the source status should show preliminary, not final, unsigned, or outside range.",
      ifYouDontSeeIt: "If final/source data is missing for multiple users or critical review is blocked, escalate with list and filter context.",
      whatToSay: "Clinical review is usually view-driven, so I am checking filters first.",
      checkThis: ["Patient list and encounter.", "Date/status filters and section visibility.", "Source detail and owner."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_provider_note_copy_forward_or_refresh_wrong") {
    return {
      doThisFirst: "Confirm the note belongs to this encounter and identify copied or refreshed content.",
      whereToLook: "Look at current encounter, source note/date, copied sections, refreshed data, unresolved placeholders, and sign status.",
      whatToClick: "Open copied/refreshed section details if available, compare source/current context, then correct before sign or use addendum path.",
      whatShouldHappen: "The provider should know what came forward and whether anything stale must be edited before signing.",
      ifYouDontSeeIt: "If wrong-context content is already signed or refresh behavior is broken broadly, escalate to documentation/content owner.",
      whatToSay: "Let's verify what came forward before this note is signed.",
      checkThis: ["Current encounter and source note.", "Copied/refreshed sections.", "Signed vs unsigned correction path."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_surgical_workflow_case_ready_blocked") {
    return {
      doThisFirst: "Open the case detail and read the current case status.",
      whereToLook: "Look at case status, location/room, procedure, consent, H&P/note status, orders, pre-op tasks, and owner.",
      whatToClick: "Open the blocked requirement detail, separate docs/orders/consent/status, then route the correct periop owner.",
      whatShouldHappen: "The blocker should resolve into a specific missing requirement or owner lane before the case moves.",
      ifYouDontSeeIt: "If case timing, patient movement, consent, orders, or required documentation is blocked, escalate immediately.",
      whatToSay: "Let's separate case status from the missing requirement.",
      checkThis: ["Case status and room/location.", "Required docs, orders, and consent.", "Owner and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_radiant_protocol_ready_for_exam_blocked") {
    return {
      doThisFirst: "Separate imaging order status from exam readiness.",
      whereToLook: "Look at order status, protocol status, modality, exam status, patient prep, transport, location, and owner.",
      whatToClick: "Open imaging order/exam detail, then protocol/status details. Route modality, prep, or transport owner based on blocker.",
      whatShouldHappen: "The exam should show ordered, scheduled, protocolled, ready, delayed, completed, or waiting on prep/transport.",
      ifYouDontSeeIt: "If timing is blocked by protocol, prep, transport, or owner uncertainty, escalate to radiology/modality owner.",
      whatToSay: "Let's find whether this is order, protocol, prep, or transport.",
      checkThis: ["Order and exam status.", "Protocol, prep, and transport.", "Modality owner and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (entry.id === "ll_prescription_printer_routing_wrong") {
    return {
      doThisFirst: "Keep the prescription screen open and confirm the approved prescription printer route.",
      whereToLook: "Look at prescription/order context, print action, selected printer, printer status, output location, and duplicate-print risk.",
      whatToClick: "Open the print action or printer selector, choose the approved printer if available, then send one controlled reprint.",
      whatShouldHappen: "One prescription should print to the approved device, or the screen should show a printer/status blocker.",
      ifYouDontSeeIt: "If the approved printer is missing/offline or duplicates may exist, stop and escalate to device/pharmacy/provider support.",
      whatToSay: "Before we reprint, I am checking the prescription printer route.",
      checkThis: ["Prescription/order context.", "Selected printer and status.", "Duplicate-print risk and output confirmation."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("diagnosis", "indication") && has("order")) {
    return {
      doThisFirst: "Open the patient chart and confirm the right encounter before touching the order.",
      whereToLook: "Go to Orders or the order composer. Open the order details panel and look for required fields, diagnosis, indication, priority, frequency, or start time.",
      whatToClick: "Click the diagnosis or indication field. Attach the approved diagnosis/indication, complete every required field, then click Sign or Submit.",
      whatShouldHappen: "The order should move into the signing area or submit without the missing-diagnosis warning.",
      ifYouDontSeeIt: "If the diagnosis field is missing or Sign stays disabled, look for red required fields, unmatched diagnosis, wrong encounter, or a locked order set.",
      whatToSay: "The order is asking for context before it can move, so I am checking the required fields first.",
      checkThis: ["Order name and encounter.", "Diagnosis/indication link.", "Required fields and sign status."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("order entry", "place order", "orders", "order set", "smartset", "powerplan")) {
    return {
      doThisFirst: "Open the patient chart first and confirm the correct encounter.",
      whereToLook: "Look near the bottom, left activity menu, or chart activity area for Orders, Add Order, New Order, order composer, or a plus sign.",
      whatToClick: "Click the order button, search the order name, select the closest approved order, then fill the details panel that opens.",
      whatShouldHappen: "The order should appear in the composer or signing area with required fields visible.",
      ifYouDontSeeIt: "If Add Order is missing, confirm you are inside an encounter, not just demographics. If the order is missing, try one approved synonym before escalating.",
      whatToSay: "I am checking patient, encounter, and order context before we call the order missing.",
      checkThis: ["Patient and encounter context.", "Order search term and synonym.", "Required fields, diagnosis, priority, frequency, and signer."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("charge capture", "charge not dropping", "charge queue", "visit charges", "billing charge")) {
    return {
      doThisFirst: "Open the patient chart or account workspace and confirm the correct visit or encounter.",
      whereToLook: "Look in This Visit, encounter details, billing, visit charges, charge capture, or the charge review/work queue area.",
      whatToClick: "Open the charge section. Check documentation status, charge trigger, hold reason, and required diagnosis/linking fields before adding anything manually.",
      whatShouldHappen: "You should see available charges, a charge queue item, a hold reason, or the status that explains why it has not dropped.",
      ifYouDontSeeIt: "If the charge section is missing, check visit type, provider/resource, department/location, and whether the encounter is ready for billing.",
      whatToSay: "I am checking whether the charge trigger fired before we add anything manually.",
      checkThis: ["Encounter, service date, and visit status.", "Signed documentation or procedure status.", "Charge queue, hold reason, and owner."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("schedule", "appointment", "slot", "template", "cadence", "booking", "referral")) {
    return {
      doThisFirst: "Open the exact schedule, referral, or booking workspace the user is working from.",
      whereToLook: "Check date, department/location, provider/resource, visit type, appointment status, template/slot rules, and referral or authorization status.",
      whatToClick: "Open filters or details first. Correct the context, refresh once, then use the approved booking, route, or owner action.",
      whatShouldHappen: "The appointment, slot, referral status, or blocking reason should become visible before the user books or escalates.",
      ifYouDontSeeIt: "If the item is still missing, capture view, filters, provider/resource, visit type, status, role, and callback for the scheduling owner.",
      whatToSay: "I am checking schedule context before we call this missing or force a booking.",
      checkThis: ["Date, provider/resource, location, and visit type.", "View filters, appointment/referral status, and template/slot rules.", "Owner approval before override or overbook."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("flowsheet", "flow sheet", "row", "time column", "vitals", "mobility", "ambulation")) {
    return {
      doThisFirst: "Confirm the chart, encounter, flowsheet group, and active time column before documenting.",
      whereToLook: "Look in Flowsheets for the group, section, collapsed rows, row search, time column, and save/file status.",
      whatToClick: "Expand the section or search for the row, select the correct time column, document once, then verify the entry filed.",
      whatShouldHappen: "The row should appear in the right group and the entry should file under the intended time column.",
      ifYouDontSeeIt: "If the row is missing for multiple users or files to the wrong column, stop and escalate to the documentation owner.",
      whatToSay: "I am checking the right row and time column before we enter anything.",
      checkThis: ["Flowsheet group, section, and row search.", "Collapsed rows, role view, and template.", "Active time column and file/save status."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("scan", "scanning", "media manager", "document type", "consent", "wrong encounter")) {
    return {
      doThisFirst: "Confirm document type, encounter, and whether a signed document already exists before scanning or correcting anything.",
      whereToLook: "Look in Media/documents for document details, encounter/date, document type, scan/upload action, page count, and image quality.",
      whatToClick: "Open Add Media or document details, choose the approved document type, attach to the correct encounter, then verify the saved image.",
      whatShouldHappen: "The document should show under the correct encounter with the right type, page count, and readable image.",
      ifYouDontSeeIt: "If wrong-encounter, missing consent, duplicate scan, or privacy risk is possible, stop and route document-management or clinical owner.",
      whatToSay: "I am confirming where this document belongs before we save or rescan it.",
      checkThis: ["Document type and encounter/date.", "Signed status, page count, and image quality.", "Wrong-encounter or duplicate-document risk."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("note", "documentation", "document type", "note type", "dynamic documentation", "required field")) {
    return {
      doThisFirst: "Go into the patient chart and confirm the note belongs to this encounter.",
      whereToLook: "Look on the right side, left activity menu, or documentation area for Notes, Documentation, New Note, note type, or a collapsed sidebar.",
      whatToClick: "Open the notes/sidebar area, choose the correct note type, complete required sections, then click Sign or Submit.",
      whatShouldHappen: "The note editor should open and show the required sections or the exact sign error.",
      ifYouDontSeeIt: "If the note area is missing, check the far edge for a collapsed sidebar or Open Sidebar button. If Sign stays blocked, check required fields, cosign, smart text, and encounter context.",
      whatToSay: "I am checking the right note type and required fields before we retry signing.",
      checkThis: ["Note type and encounter.", "Required fields and error banner.", "Cosigner, attestation, role, and locked context."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("result", "acknowledge", "acknowledgement", "critical", "routing owner")) {
    return {
      doThisFirst: "Open the result detail and identify status, flag, owner, and routing before closing anything.",
      whereToLook: "Look at result detail, flag/critical status, responsible owner, queue, acknowledgement button, route action, and timestamp.",
      whatToClick: "Open the result or route detail, confirm owner/status, then acknowledge or route only if the owner path is clear.",
      whatShouldHappen: "The result should show acknowledged, routed, or clearly blocked with the owner/status visible.",
      ifYouDontSeeIt: "If owner or acknowledgement is unclear for an urgent result, escalate to clinical owner or command center immediately.",
      whatToSay: "I am not interpreting the result; I am finding status, owner, and routing.",
      checkThis: ["Result type, flag, status, and timestamp.", "Responsible owner, queue, and acknowledgement state.", "Urgency and callback path."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("in basket", "inbasket", "message center", "wrong pool", "pool", "proxy", "delegate")) {
    return {
      doThisFirst: "Open the message area and confirm whether the user is viewing personal, pool, or proxy work.",
      whereToLook: "Look at the left folder list, pool selector, owner/status column, date filter, and message header.",
      whatToClick: "Open the correct folder or pool, select the message, then use Route, Forward, Reassign, or the approved owner action if available.",
      whatShouldHappen: "The message should show the correct owner, pool, folder, or routing status before anyone resolves it.",
      ifYouDontSeeIt: "If the pool selector or route action is missing, check proxy/delegate access, folder filters, and whether the message is locked by owner or status.",
      whatToSay: "I am finding who owns the work before we move or resolve the message.",
      checkThis: ["Folder, pool, owner, proxy/delegate view.", "Status, urgency flag, and date range.", "Whether one message or a whole pool is affected."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("workqueue", "work queue", "queue owner", "assigned wrong", "report filter", "report missing")) {
    return {
      doThisFirst: "Open the exact queue or report and confirm the queue name before changing ownership or status.",
      whereToLook: "Look at queue name, item type, owner, status, date filters, assignment rule, route/reassign action, and notes.",
      whatToClick: "Open the item details, confirm owner/status/filter, then use the approved route or reassign action if available.",
      whatShouldHappen: "The item should show the correct owner/status or a clear reason the route action is unavailable.",
      ifYouDontSeeIt: "If the same routing issue affects multiple users/items, escalate to workqueue/report owner with clean examples.",
      whatToSay: "I am checking whether this is filter, ownership, or assignment-rule behavior.",
      checkThis: ["Queue name, owner, status, and filters.", "One item vs whole queue.", "Route/reassign action and required note."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("barcode", "bcma", "medication scan", "med barcode", "mar/med administration")) {
    return {
      doThisFirst: "Pause medication administration and keep the alert on screen.",
      whereToLook: "Stay in the MAR or med-administration screen. Look at the patient scan, medication scan, order line, dose, route, package, and alert banner.",
      whatToClick: "Do not bypass first. Re-scan the patient and medication once if safe, then open the order details or alert details to compare the mismatch.",
      whatShouldHappen: "The screen should either accept the scan or show exactly what does not match.",
      ifYouDontSeeIt: "If the mismatch stays unclear, stop the administration path and escalate to charge nurse/pharmacy support before giving the medication.",
      whatToSay: "This is a safety stop, so I am comparing patient, order, medication, and package before we continue.",
      checkThis: ["Patient scan, medication scan, order, dose, route.", "Package/NDC or formulary mismatch.", "Due time and urgency."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("scanner", "badge reader", "barcode reader", "device scanner")) {
    return {
      doThisFirst: "Keep the user on the same screen and confirm the cursor is in the active scan field.",
      whereToLook: "Look at the active field, scanner light/beep, cable or power, workstation, and whether a second device works.",
      whatToClick: "Click into the scan field, try one safe scan, then test a second scanner or workstation if available.",
      whatShouldHappen: "The scanned value should enter the active field or the device should give a clear failure signal.",
      ifYouDontSeeIt: "If there is no beep/light, or multiple devices fail, escalate to device support with location and workflow.",
      whatToSay: "I am checking that the screen is ready to receive the scan before we call the device broken.",
      checkThis: ["Active field/focus.", "Scanner light/beep, cable, and power.", "One device vs multiple devices."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("downtime", "backload", "back loading", "system restored", "paper workflow recovery")) {
    return {
      doThisFirst: "Sort the paper or downtime packet by patient-safety priority and assign a clear owner.",
      whereToLook: "Use the downtime packet, priority stack, original timestamps, owner assignment, backload entry area, and verification step.",
      whatToClick: "Enter the highest-priority item with the original time, verify it filed correctly, then move to the next owner-assigned stack.",
      whatShouldHappen: "Each paper item should be entered once, verified, and marked complete with owner and timestamp preserved.",
      ifYouDontSeeIt: "If ownership or duplicate-entry risk is unclear, stop and ask command center to assign the backload owner.",
      whatToSay: "We are going to backload by priority and owner, not by whoever grabs the first paper.",
      checkThis: ["Downtime start/end and original timestamps.", "Priority stack and assigned owner.", "Duplicate-entry risk and verification."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("escalation packet", "command center ticket", "ticket details", "scope impact callback", "support ticket")) {
    return {
      doThisFirst: "Write scope, impact, exact blocker, what was tried, owner needed, and callback before escalating.",
      whereToLook: "Use the issue screen, visible error/status, affected role/unit, time started, prior checks, owner needed, and callback path.",
      whatToClick: "Open the ticket or handoff channel, paste the clean packet, and send it to the correct owner or command center lane.",
      whatShouldHappen: "The receiver should know who is blocked, how severe it is, what was tried, and who to call back.",
      ifYouDontSeeIt: "If the owner is unclear or safety/flow is impacted, send to command center triage instead of holding it.",
      whatToSay: "I am going to send this cleanly so command can act without chasing us.",
      checkThis: ["Scope: one user, role, team, or unit.", "Impact, exact blocker, and time started.", "Checks tried, owner needed, and callback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("lab label", "specimen label", "reprint label", "wrong printer label", "label printer")) {
    return {
      doThisFirst: "Confirm the order and specimen before reprinting anything.",
      whereToLook: "Look in the specimen/order area for Label Print, Reprint, printer dropdown, label status, accession, or collection task.",
      whatToClick: "Open the print/reprint action, confirm the printer/location, choose one controlled reprint if policy allows, then verify the new label before use.",
      whatShouldHappen: "A single correct label should print to the expected device and match the order/specimen context.",
      ifYouDontSeeIt: "If the printer is wrong, duplicate labels exist, or identity is uncertain, stop and escalate to lab/device owner before collection.",
      whatToSay: "Before we reprint, I am confirming the specimen, label, and printer so we do not create a duplicate safety risk.",
      checkThis: ["Order, specimen, label type, accession.", "Printer/device context and original print status.", "Duplicate label or wrong-label risk."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("printer", "print", "wrong printer", "label", "wristband")) {
    return {
      doThisFirst: "Keep the user in the screen they printed from and confirm what they expected to print.",
      whereToLook: "Look at the print dialog, printer dropdown, workstation context, and the physical printer closest to the unit.",
      whatToClick: "Open the printer dropdown if available, choose the correct device, then send one reprint only after the printer is ready.",
      whatShouldHappen: "One job should appear at the correct printer or the screen should show an error you can route.",
      ifYouDontSeeIt: "If the printer is offline, missing, jammed, or routing wrong for multiple workstations, escalate to device support.",
      whatToSay: "I am checking the printer path before we stack more print jobs.",
      checkThis: ["Printer dropdown and workstation context.", "Paper, jam, toner, queue, and network status.", "One workstation vs multiple users."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  if (has("patient list", "worklist", "rounding list", "relationship filter")) {
    return {
      doThisFirst: "Open the exact list or worklist the user expects to use.",
      whereToLook: "Look at the list name, filters, location, relationship, provider/team, date, and refresh control.",
      whatToClick: "Open filters, correct the location/relationship/date/team values, then refresh once.",
      whatShouldHappen: "The expected patient or task should appear in the list after filters refresh.",
      ifYouDontSeeIt: "If the patient is still missing, use approved search and escalate if an entire role/team is affected.",
      whatToSay: "Lists are usually filter-driven, so I am checking the view before calling it missing.",
      checkThis: ["List name and view.", "Location, relationship, provider/team, date filters.", "Refresh state and approved search fallback."],
      escalateWhen: entry.whenToEscalate,
    };
  }

  return fallback;
}

function unquote(text: string): string {
  return text.trim().replace(/^['"`]+|['"`]+$/g, "");
}

export function askLaunch(query: string): AskAnswer {
  const tokens = tokenize(query).filter(t => t.length > 2 && !STOP_TOKENS.has(t));
  const queryText = query.toLowerCase();
  const ranked = LAUNCH_LIBRARY
    .map(e => {
      const phraseBoost = e.keywords.reduce((total, kw) => {
        const normalized = kw.toLowerCase().trim();
        if (normalized.length < 4) return total;
        return queryText.includes(normalized) ? total + (normalized.includes(" ") ? 8 : 5) : total;
      }, 0);
      return { e, s: scoreEntry(e, tokens) + phraseBoost + exactWorkflowBoost(e, queryText) };
    })
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
  const kbSupport = retrieveKbSupport(query, entry, relatedItems, matchQuality);
  const visualAids = dedupeVisualAids([
    ...visualAidsFor(entry, relatedItems),
    ...kbSupport.visualAids,
  ]);

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
    walkthrough: walkthroughFor(entry),
    ifThatFails: ifThatFailsFor(entry),
    visualAids,
    kbSupport: {
      ...kbSupport,
      visualAids,
    },
    first90: entry.first90,
    whatToSay: entry.whatToSay,
    whatToCheck: entry.whatToCheck,
    whenToEscalate: entry.whenToEscalate,
    liveGuide: liveGuideFor(entry, query),
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
  "How do I change columns in the schedule line?",
  "A billing item looks wrong. What do I check first?",
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
