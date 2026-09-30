/* ================================================================
 * Sumo Inventory v2 — frontend
 * Vanilla HTML/CSS/JS SPA. Mobile-first. No frameworks, no build step.
 *
 * Talks to:
 *  1. Supabase PostgREST  (CONFIG.SUPABASE_URL + "/rest/v1")
 *  2. Edge function        (CONFIG.SUPABASE_URL + "/functions/v1/api")
 * ================================================================ */

/* ============================ CONFIG ============================ */
/* TODO (owner): fill these in before deploying. Get both values from
 * your Supabase project dashboard -> Settings -> API. */
const CONFIG = {
  SUPABASE_URL: "https://cuovywwfxwpnexbgzsuy.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1b3Z5d3dmeHdwbmV4Ymd6c3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNTA3NDMsImV4cCI6MjEwNTkyNjc0M30.0GfxO0osBfRdvOH7kR98iY88uxznSsAiFguMQXp1_Hw",
};
/* ================================================================ */


/* ============================ UTILS ============================= */
const $app = () => document.getElementById("app");

/** Escape user-controlled text before injecting into HTML. */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Round a count to the nearest 0.25 (kitchen step granularity). */
function r025(n) { return Math.round(Number(n) * 4) / 4; }

/** Format a count for display, trimming trailing zeros. */
function fmtCount(n) {
  if (n == null || isNaN(n)) return "";
  const v = r025(n);
  return String(Number(v.toFixed(2)));
}

/** Naive English pluralization for purchase-unit labels ("case" -> "cases",
 *  "large box" -> "large boxes"). Qty of 1 keeps the singular. */
function pluralUnit(label, qty) {
  if (!label) return "";
  if (Number(qty) === 1) return label;
  if (/(s|x|ch|sh)$/i.test(label)) return label + "es";
  if (/[^aeiou]y$/i.test(label)) return label.replace(/y$/i, "ies");
  return label + "s";
}

function fmtMoney(n) {
  return "$" + (Number(n) || 0).toFixed(2);
}

/** Format a digits-only phone for display: 17025551234 -> +1 (702) 555-1234. */
function fmtPhone(digits) {
  const d = String(digits || "").replace(/\D+/g, "");
  if (!d) return "";
  if (d.length === 11 && d[0] === "1") return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return "+" + d;
}

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString([locale()], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/* ============================ I18N ============================== */
/* UI language toggle (EN/ES) for staff, managers and admins.
 * RULE: vendor-facing output (order cards, share images, copy text,
 * vendor emails) is ALWAYS English — only the app chrome translates.
 * The Super Admin screens also stay in English. */
const LANG_KEY = "sumoV2lang";
const STR = {
en: {
  "common.cancel": "Cancel", "common.confirm": "Confirm", "common.back": "← Back",
  "common.save": "Save", "common.saved": "Saved", "common.delete": "Delete", "common.name": "Name",
  "common.offline": "You're offline. Check your connection and try again.",
  "common.forbidden": "You don't have permission for that. Ask a manager.",
  "common.close": "Close",
  "common.loading": "Loading…",
  "common.notes": "Notes", "common.move": "Move", "common.notAuth": "Not authorized.",
  "common.notFound": "Not found.", "common.conflict": "That conflicts with existing data.",
  "common.serverError": "Something went wrong. Try again.",
  "common.saving": "Saving…", "common.checking": "Checking…",
  "common.item": "Item", "common.continue": "Continue",
  "nav.homeAria": "Home", "nav.logoutAria": "Log out",
  "nav.langAria": "Language", "nav.themeAria": "Toggle light / dark theme",
  "role.manager": "Manager", "role.staff": "Staff", "role.view": "View",
  "move.title": "Move to area", "move.current": "current",
  "login.prompt": "Enter your PIN to sign in", "login.signin": "Sign in",
  "login.clearKey": "Clear", "login.backKey": "Backspace",
  "login.needPin": "Enter your PIN.", "login.wrong": "Wrong PIN. Try again.",
  "login.expired": "Your session expired. Please log in again.",
  "login.rateLimited": "Too many attempts. Wait a minute and try again.",
  "login.forgot": "Forgot PIN?", "login.forgotMsg": "Ask a manager to reset your PIN in the Users screen.",
  "login.langToggle": "Español",
  "setpin.title": "Set your PIN", "setpin.step1": "Enter a new PIN (min 4 digits)",
  "setpin.step2": "Enter it again to confirm", "setpin.min4": "PIN must be at least 4 digits.",
  "setpin.mismatch": "PINs don't match. Start over.", "setpin.fail": "Could not set PIN. Try again.",
  "home.hi": "Hi", "home.parBanner": "Set par levels to generate orders",
  "home.parBanner2": "items have pars.", "home.openPar": "Open bulk par editor →",
  "home.start": "Start New Count", "home.orders": "Order History", "home.manage": "Manage",
  "home.inventory": "Inventory",
  "home.viewOrders": "View Orders", "home.drafts": "Draft counts",
  "home.noDrafts": "No draft counts.", "home.count": "Count",
  "home.review": "Review", "home.resume": "Resume", "home.view": "View",
  "home.discard": "Abandon", "home.abandonTitle": "Abandon count?",
  "home.abandonMsg": "This draft count will be discarded. This cannot be undone.", "home.abandonFail": "Could not abandon count.",
  "home.startFail": "Could not start a new count.", "home.noSession": "Server did not return a session id.",
  "home.replay": "🔁 Replay tour",
  "par.title": "Bulk par editor",
  "par.hint": "Only items with a par above 0 generate order lines. Leave blank = no par.",
  "par.par": "Par", "par.price": "Price", "par.saveAll": "Save all",
  "par.unitPh": "cs / lb / ea",
  "count.dictateAria": "Dictate item name",
  "par.saved1": "Saved 1 change.", "par.savedN": "Saved {n} changes.",
  "par.saveFail": "Save failed.", "par.change": "change", "par.changes": "changes",
  "count.loading": "Loading count…",
  "pill.not": "Not counted", "pill.counted": "Counted", "pill.zero": "Zero confirmed",
  "pill.done": "Done", "pill.review": "Needs review",
  "count.noPar": "no par", "count.dec": "Decrease", "count.inc": "Increase",
  "count.countFor": "Count for", "count.parFor": "Par for",
  "count.full": "Full", "count.markZero": "Mark Zero",
  "count.fullMultiHint": "Full is disabled: this item is counted in multiple locations (par is the total across all of them). Enter each count manually.",
  "count.doneBtn": "✓ Done", "count.moveArea": "Move area",
  "count.byLocation": "By location", "count.byItem": "By item", "count.byVendor": "By vendor",
  "count.noVendor": "No vendor",
  "count.totalLine": "Total {t} / par {p}",
  "count.areasBtn": "Locations", "count.areasTitle": "Locations for {name}",
  "count.areasHint": "Check every location where this item is kept. The first checked is the primary location.",
  "count.noParHint": "No par set — enter count",
  "count.search": "🔍 Search items…", "count.noItems": "No items here",
  "count.sortVendor": "Vendor", "count.sortName": "A–Z", "count.sortLocation": "Location",
  "count.noItemsSearch": " matching your search", "count.toReview": "Review & approve →",
  "count.aiPh": "Type or dictate counts — e.g. '12 tuna, half case salmon'",
  "count.aiParse": "Parse with AI", "count.aiNeedText": "Type or dictate some counts first.",
  "count.aiParsing": "Parsing…", "count.aiUnknown": "Not recognized: ",
  "count.aiNoMatch": "No items recognized. Try being specific, e.g. \"12 tuna\".",
  "count.aiApply": "Apply checked",
  "count.aiApplied1": "Applied 1 count.", "count.aiAppliedN": "Applied {n} counts.",
  "count.aiNoKey": "AI not configured — ask your super admin to add a Gemini API key (free at aistudio.google.com).",
  "count.aiFail": "AI parse failed.",
  "count.noVoice": "Voice input isn't available in this browser — use your phone keyboard's mic 🎤 instead.",
  "count.saveFail": "Could not save {name} — check connection. (Your other entries are safe.)",
  "count.flushFail": "Some entries didn't save — check connection and try again.",
  "count.moveTitle": "Move item?", "count.moveMsg": "Move {name} from {from} to {to}?",
  "count.moveFail": "Could not move item.", "count.parFail": "Could not update par.",
  "review.loading": "Loading review…", "review.title": "Review & approve", "review.allCounted": "Everything has a count. 🎉",
  "review.missingIn": "missing: {areas}", "review.partial": "Some items still need counts in other locations.",
  "review.needsReview": "Needs review", "review.noneFlagged": "Nothing flagged.",
  "review.noEntry": "no entry yet", "review.flagged": "flagged for review",
  "review.open": "Open →", "review.aiCheck": "AI check", "review.runAi": "Run AI check",
  "review.noIssues": "No issues found.", "review.aiFail": "AI check failed.",
  "review.preview": "Vendor order preview",
  "review.nothingToOrder": "Nothing to order — all auto-mode pars are covered (or no pars set).",
  "review.nothingCounted": "Nothing counted yet — enter counts to see what will be ordered.",
  "review.approveEmptyTitle": "No counts entered",
  "review.approveEmptyMsg": "You haven't entered any counts. Approving now will generate NO orders.",
  "review.approveEmptyYes": "Approve anyway", "review.keepCounting": "Keep counting",
  "review.approveNoLinesTitle": "Nothing to order",
  "review.approveNoLinesMsg": "All counted items are at or above par. Approving will generate no orders.",
  "review.approve": "Approve count",
  "review.alreadyApproved": "This count was already approved.",
  "review.viewOrders": "View orders",
  "review.onlyManagers": "Only managers or the super admin can approve. Your counts are saved — a manager will review and approve them.",
  "review.approveTitle": "Approve count?",
  "review.approveMsg": "This finalizes the count and generates orders. Continue?",
  "review.approveYes": "Approve", "review.approveFail": "Approval failed.", "review.approvedToast": "Count approved. Orders are ready.",
  "review.blockTitle": "Cannot approve — these items need review:",
  "review.blockMsg": "Open each item in the count and resolve it, then approve again.",
  "review.fixHint": "Enter the missing counts below (0 if the location is empty), save, then approve.",
  "review.fixInvalid": "Enter a valid count (0 or more) for each location.",
  "review.fixFail": "Couldn't save those counts. Try again.",
  "review.allFixed": "All missing counts saved \u2014 tap Approve count.",
  "review.info": "ℹ️ Info", "review.warn": "⚠️ Warning",
  "orders.loading": "Loading orders…", "orders.title": "Orders",
  "orders.print": "🖨 Print",
  "orders.none": "No orders yet. Approve a count to generate orders.",
  "orders.draft": "draft", "orders.sent": "sent", "orders.received": "received",
  "orders.markSent": "Mark sent", "orders.markReceived": "Mark received",
  "orders.share": "📤 Share image", "orders.copy": "📋 Copy text",
  "orders.copied": "✓ Copied", "orders.imgFail": "Could not create the order image.", "orders.sendFail": "Could not share the order text.",
  "orders.statusFail": "Could not update order status.",
  "orders.edit": "Edit",
  "orders.addItem": "Add item", "orders.qty": "Qty",
  "orders.linesFail": "Could not save order.",
  "orders.needLines": "Add at least one item.", "orders.deleteTitle": "Delete order?",
  "orders.deleteMsg": "This permanently deletes the order for {vendor}. This cannot be undone.",
  "orders.deleteFail": "Could not delete order.",
  "orders.deleted": "Order deleted.",
  "orders.orderDate": "Order date", "admin.items": "Items", "admin.areas": "Areas",
  "admin.vendors": "Vendors", "admin.users": "Users", "users.deleteTitle": "Delete user?",
  "users.deleteMsg": "This permanently removes {name}. This cannot be undone.",
  "users.deleteFail": "Could not delete user.",
  "admin.addItem": "Add item", "admin.area": "Area",
  "admin.unit": "Unit", "admin.exItem": "e.g. Bluefin tuna",
  "admin.boxesPh": "boxes",
  "bulk.jumpTop": "Top", "bulk.jumpBottom": "Bottom",
  "common.removeAria": "Remove",
  "admin.itemNeedName": "Item name can't be empty.",
  "admin.addItemFail": "Could not add item.", "admin.archived": "ARCHIVED",
  "admin.unarchive": "Unarchive", "admin.archive": "Archive",
  "admin.mode": "Mode", "admin.modeAuto": "auto (generates orders)",
  "admin.modeManual": "manual", "admin.countStyle": "Count style",
  "admin.exCase": "e.g. case", "admin.pieces": "Pieces per case",
  "admin.caseLabel": "Case label", "admin.exCaseLabel": "e.g. large box",
  "admin.noVendor": "no vendor", "admin.saveItemFail": "Could not save item.",
  "admin.csvTitle": "Bulk edit (CSV)",
  "admin.bulkTitle": "Bulk edit", "admin.bulkNoMatch": "No items match.",
  "admin.bulkSave": "Save {n} changes", "admin.bulkNoChanges": "No changes", "admin.bulkSaved": "Saved {n}.", "admin.bulkFail": "{n} failed.",
  "admin.bulkActive": "Active", "admin.bulkExpand": "Tap to edit", "admin.areasHint": "First checked = primary location.",
  "admin.noArea": "No location",
  "admin.csvHelp": "Download the catalog as a spreadsheet, edit pars, areas, vendors and prices, then upload it back. Blank id = new item. List several areas separated by commas. Unknown area/vendor names are skipped.",
  "admin.csvDownload": "Download CSV", "admin.csvFile": "CSV file",
  "admin.csvUpload": "Upload & apply", "admin.csvNeedFile": "Choose a CSV file first.",
  "admin.csvBadFile": "Could not read that CSV file.",
  "admin.csvResult": "Updated {u}, added {c}.", "admin.csvErrors": "{n} rows skipped:",
  "admin.csvRow": "Row {r} ({name}): {error}",
  "admin.killTitle": "Kill switch",
  "admin.killHelp": "Shutting off the app blocks everyone except superadmins. Counts, approvals and orders stop working immediately. Nothing is deleted — you can turn it back on at any time.",
  "admin.killLive": "LIVE", "admin.killDead": "SHUT OFF",
  "admin.killOff": "Shut off app", "admin.killOn": "Re-enable app",
  "admin.killOnMsg": "Re-enable the app?",
  "admin.killType": "Type SHUT OFF to confirm.", "admin.killConfirmPh": "SHUT OFF",
  "admin.killMismatch": "Confirmation did not match — nothing was changed.",
  "admin.killFail": "Could not change app status.",
  "dead.title": "This app has been disabled.",
  "dead.msg": "Contact your administrator for access.",
  "dead.adminLogin": "Log back in",
  "admin.archiveFail": "Could not toggle archive.",
  "admin.addArea": "Add area", "admin.areaName": "Area name", "admin.rename": "Rename",
  "admin.areaNeedName": "Area name can't be empty.",
  "admin.addAreaFail": "Could not add area.", "admin.renameFail": "Could not rename area.",
  "admin.delAreaTitle": "Delete area?", "admin.delAreaMsg": "Delete \"{name}\"? Items must be moved out first.",
  "admin.delAreaFail": "Could not delete area — it may still have items.",
  "admin.capacity": "Capacity",
  "admin.capHint": "A storage cap limits the combined on-hand + ordered quantity of a group of items sharing space in one area — e.g. ice cream cases: max 40 boxes mixed across flavors in the walk-in cooler.",
  "admin.capName": "Cap name", "admin.capMax": "Max quantity",
  "admin.capItems": "Items sharing this cap",
  "admin.capAdd": "Add storage cap", "admin.capNeedName": "Give the cap a name.",
  "admin.capNeedMax": "Max quantity must be greater than 0.",
  "admin.capAddFail": "Could not add storage cap.", "admin.capSaveFail": "Could not save storage cap.",
  "admin.capDelTitle": "Delete storage cap?", "admin.capDelMsg": "Delete \"{name}\"? Items keep their normal ordering.",
  "admin.capDelFail": "Could not delete storage cap.",
  "admin.capNoAreas": "Add a storage area first.",
  "review.capNote": "Storage cap: {pools}",
  "review.capAppliedTitle": "Limited by storage space",
  "review.capZeroWarn": "{name}: no room left under its storage cap, so nothing was ordered.",
  "review.maxZeroWarn": "{name}: a whole case would exceed its max on hand, so nothing was ordered.",
  "admin.addVendor": "Add vendor",
  "admin.vendorNeedName": "Vendor name can't be empty.",
  "admin.addVendorFail": "Could not add vendor.",
  "admin.vendorSaveFail": "Could not save vendor.",
  "vendor.orderDays": "Order days", "vendor.orderBy": "Order by",
  "vendor.deliveryDays": "Delivery days",
  "vendor.contactName": "Contact name", "vendor.contactPhone": "Contact phone",
  "vendor.contactNamePh": "e.g. Mike",
  "orders.send": "📲 Send order", "orders.sendTo": "Send to",
  "orders.quickOrder": "⚡ Quick order", "orders.qoPickVendor": "Pick a vendor",
  "orders.qoSearch": "Search all items…", "orders.qoCreate": "Create draft order",
  "orders.qoNeedLines": "Add at least one item.", "orders.qoCreated": "Draft order created.",
  "orders.qoFail": "Could not create the quick order.",
  "admin.altVendors": "Alternate vendors",
  "admin.altVendorsHint": "Other vendors that also carry this item — it will show in their quick orders.", "admin.noItemsMatch": "No items match.",
  "item.dailyUsage": "Daily usage", "item.learned": "auto: {x}/day",
  "item.maxOnHand": "Max on hand",
  "vendor.daysWorth": "days", "vendor.coverageHint": "Select order days first.",
  "review.orderBasis": "Ordering for {day} · ×{m}",
  "review.capWarn": "max on hand is below one full case, so nothing was ordered. Fix the max or the case size.",
  "update.available": "New version available", "update.now": "Update now",
  "update.pushTitle": "App updates",
  "update.pushHelp": "Push the newest version to every device. Staff will see an update prompt — no need to delete and re-add the home screen app.",
  "update.pushBtn": "Push update to all devices",
  "update.pushed": "Update pushed — devices will prompt on next check.",
  "update.pushFail": "Could not push update.",
  "day.mon": "Mon", "day.tue": "Tue", "day.wed": "Wed", "day.thu": "Thu",
  "day.fri": "Fri", "day.sat": "Sat", "day.sun": "Sun",
  "admin.addUser": "Add user", "admin.role": "Role",
  "admin.initPin": "Initial PIN (min 4 digits)",
  "admin.userNeedName": "Name can't be empty.",
  "admin.addUserFail": "Could not add user.", "admin.you": "you",
  "admin.active": "active", "admin.disabled": "disabled",
  "admin.enable": "Enable", "admin.disable": "Disable",
  "admin.saveRole": "Save role", "admin.setNewPin": "Set new PIN (enter twice)", "admin.availFor": "Edit availability",
  "admin.schedprof": "Scheduling profile", "admin.schedprofMin": "Min hours/week", "admin.schedprofMax": "Max hours/week",
  "admin.schedprofRank": "Seniority rank (1 = most senior)", "admin.schedprofRest": "Min rest between shifts (hrs)",
  "admin.schedprofDoubles": "Can work doubles", "admin.schedprofSave": "Save scheduling profile",
  "admin.schedprofFail": "Could not save scheduling profile.",
  "admin.newPin": "New PIN", "admin.confirmPin": "Confirm PIN",
  "admin.setPinBtn": "Set PIN",
  "admin.userStatusFail": "Could not change user status.",
  "admin.roleFail": "Could not update role.", "admin.setPinFail": "Could not set PIN.",
  "admin.email": "Email",
  "admin.moveItemMsg": "Move {item} from {from} to {to}?",
  "admin.pinMismatch": "PINs don't match.",
  "admin.protected": "protected",
  "admin.saLocked": "Super Admin — only Gabe can change this",
  "tour.skip": "Skip", "tour.next": "Next →", "tour.done": "Got it",
  "tour.welcomeT": "Welcome to Sumo Inventory",
  "tour.welcomeB": "Here's the 30-second tour. You can skip anytime.",
  "tour.startT": "Start a count here",
  "tour.startB": "Tap this to start a new count. You'll enter what you see on the shelves.",
  "tour.ordersT": "Orders live here",
  "tour.ordersB": "Finished orders appear here as clean cards you can share with vendors.",
  "tour.invB": "Counts, drafts, and order history live here.",
  "tour.schedT": "Schedule",
  "tour.schedB": "Your shifts, availability, and time-off requests live here.",
  "tour.langT": "English / Español",
  "tour.langB": "Tap the 🌐 button anytime to switch languages. Orders always go out in English.",
  "tour.c1T": "This is what you enter",
  "tour.c1B": "Type the count in the box — or tap − / + to adjust. It saves automatically.",
  "tour.c2B": "Switch areas with these tabs. The numbers show how many items are done.",
  "tour.c3T": "Quick buttons",
  "tour.c3B": "0, fractions, Full, and ✓ Done speed things up. Mark Zero if the shelf is empty.", "sched.my": "My Week", "sched.team": "Team",
  "sched.builder": "Schedule Builder", "sched.timeoff": "Time Off", "sched.avail": "Availability",
  "sched.prevWeek": "Previous week", "sched.nextWeek": "Next week", "sched.thisWeek": "This week",
  "sched.dayView": "Day", "sched.weekView": "Week",
  "sched.prevDay": "Previous day", "sched.nextDay": "Next day", "sched.todayBtn": "Today",
  "sched.pickDate": "Pick a date", "sched.noShiftsToday": "No shifts scheduled today.",
  "sched.addToCalendar": "Add to calendar", "sched.calRange": "Which weeks?", "sched.cal2Weeks": "Next 2 weeks", "sched.cal4Weeks": "Next 4 weeks",
  "sched.calDone": "Calendar file downloaded — open it to add your shifts.",
  "sched.calEmpty": "No shifts in that range.", "sched.loading": "Loading schedule…", "sched.overlapWarn": "Overlapping shifts",
  "sched.loadingNotif": "Loading notifications…",
  "sched.availRecurring": "Your availability repeats every week — set it once.",
  "sched.removePosition": "Remove position", "sched.checkSwaps": "Check the Swap Board for open shifts.",
  "sched.canOpen": "Can open (approved opener)", "sched.canClose": "Can close (approved closer)", "sched.group": "Schedule group", "sched.ungrouped": "Ungrouped",
  "sched.noCloser": "No approved closer scheduled", "sched.affectedShifts": "Shifts in this range",
  "sched.weekStartOn": "Week starts on",
  "sched.weekStartWarn": "Existing schedules will be re-grouped into the new weeks. Shift dates don't change. Applies to the whole team.",
  "sched.weekStartSaved": "Week start updated.",
  "sched.draft": "DRAFT — not visible to staff", "sched.published": "Published",
  "sched.noPeople": "No one has schedule access yet. Turn it on per person in the Users screen, then build the schedule here.",
  "sched.publish": "Publish", "sched.unpublish": "Unpublish",
  "sched.unpublished": "Unpublished",
  "sched.copyWeek": "Copy last week",
  "sched.addShift": "Add shift", "sched.editShift": "Edit shift",
  "sched.start": "Start", "sched.end": "End", "sched.position": "Position",
  "sched.station": "Station", "sched.note": "Note",
  "sched.viewGroups": "Groups", "sched.viewEmployees": "Employees", "sched.viewLabel": "Schedule view",
  "sched.whoCanWork": "Who can work this", "sched.enterTimesFirst": "Enter start and end times first",
  "sched.noCandidates": "No one is available for this shift", "sched.assignedTo": "Assigned to",
  "sched.pickSomeone": "Pick someone from the list below", "sched.addOpenShift": "Add open shift",
  "sched.requestOff": "Request time off", "sched.reason": "Reason",
  "sched.from": "From", "sched.to": "To", "sched.deny": "Deny",
  "sched.pending": "Pending", "sched.approved": "Approved", "sched.denied": "Denied",
  "sched.available": "Available", "sched.unavailable": "Unavailable all day", "sched.limited": "Available only between…",
  "sched.blocked": "Unavailable between…",
  "sched.availExplainer": "“Available only between…” means you CAN work those hours; “Unavailable between…” means you CAN'T.",
  "sched.availApplyAll": "Copy Monday to all days", "sched.availFor": "Availability — {name}",
  "sched.noPublished": "No schedule published for this week.",
  "sched.draftBanner": "DRAFT — not published yet.",
  "sched.noShifts": "No shifts this week.", "sched.noShiftsDay": "No shifts",
  "sched.warnApproved": "Approved time off overlaps this shift",
  "sched.warnPending": "Pending time-off request overlaps this shift",
  "sched.warnUnavailable": "Unavailable on this day",
  "sched.warnLimited": "Shift is outside limited-availability hours",
  "sched.warnBlocked": "Shift overlaps unavailable hours",
  "sched.warningsTitle": "Warnings",
  "sched.shiftDeleted": "Shift deleted.", "sched.shiftsSaved": "Shifts saved.",
  "sched.saveShiftFail": "Could not save shift.",
  "sched.copyTitle": "Copy last week?", "sched.copyMsg": "This copies last week's published shifts into this week's draft.",
  "sched.copyDone": "Last week's schedule copied.", "sched.copyFail": "Could not copy the week.",
  "sched.publishTitle": "Publish schedule?", "sched.publishMsg": "Staff will be able to see this week's schedule.",
  "sched.unpublishTitle": "Unpublish schedule?", "sched.unpublishMsg": "Staff will no longer see this week's schedule.",
  "sched.publishFail": "Could not change publish state.",
  "sched.deleteTitle": "Delete shift?", "sched.deleteMsg": "This shift will be removed. This cannot be undone.",
  "sched.teamAvail": "Team availability",
  "sched.none": "No schedule access", "sched.accessView": "Can view schedule",
  "sched.accessManage": "Can manage schedule", "sched.scheduleAccess": "Schedule access",
  "sched.department": "Department",
  "sched.saveFlags": "Save schedule settings", "sched.flagsFail": "Could not save schedule settings.",
  "sched.myRequests": "My requests", "sched.inbox": "Needs your decision",
  "sched.decideTitle": "Decide request",
  "sched.dirtyTitle": "Discard unsaved changes?", "sched.dirtyMsg": "You have unsaved edits on this tab. Switching tabs will lose them.",
  "sched.discard": "Discard",
  "sched.noRequests": "No time-off requests.", "sched.noRequestsInbox": "No pending requests — you're all caught up.",
  "sched.requestSent": "Request sent.", "sched.requestFail": "Could not send request.",
  "sched.addTimeOffFor": "Add time off for employee", "sched.pickPerson": "Choose a person.",
  "sched.addTimeOffForFail": "Could not add time off.", "sched.reqChip": "REQ",
  "sched.needDates": "Choose a start and end date.", "sched.badDates": "The end date can't be before the start date.",
  "sched.pastDate": "Time-off requests can't start in the past.", "sched.decideFail": "Could not update request.",
  "sched.cancelRequest": "Cancel request", "sched.cancelRequestConfirm": "Delete this time-off request?",
  "sched.cancelRequestFail": "Could not delete the request.",
  "sched.date": "Date", "sched.person": "Person", "sched.needTimes": "Enter a start and end time.",
  "sched.availFail": "Could not save availability.",
  "sched.builderHint": "Tap + to add a shift. Tap a shift to edit it.",
  "sched.swapBoard": "Swap Board",
  "sched.release": "Release shift",
  "sched.releaseTitle": "Release this shift?",
  "sched.releaseMsg": "It goes on the swap board. A teammate can pick it up, but a manager has to approve it first. You're still responsible for it until it's approved.",
  "sched.released": "Shift is on the swap board.",
  "sched.releaseFail": "Could not release shift.",
  "sched.openShifts": "Open shifts",
  "sched.noOpenSwaps": "No shifts on the swap board right now.",
  "sched.pickup": "Pick up",
  "sched.posOnlyShift": "Only {pos} staff can pick up this shift.",
  "sched.positions": "Positions",
  "sched.staffing": "Staffing",
  "sched.staffingRecurring": "Weekly template — repeats every week.",
  "sched.staffingNeeds": "How many per shift",
  "sched.staffingHint": "Set how many of each position you need for each weekday and daypart. The builder shows scheduled vs needed under each day. Empty = no target (clears it).",
  "sched.daypartHint": "Lunch = shifts ending by 5 PM. Dinner = everything later (a midnight close counts as dinner).",
  "sched.lunch": "Lunch",
  "sched.dinner": "Dinner",
  "sched.arrangeGroups": "Group order",
  "sched.arrangeEmployees": "Employee order",
  "sched.arrangeHint": "Use the arrows to set the exact order shown in the schedule builder, then save.",
  "sched.staffingSaved": "Staffing needs saved",
  "sched.orderSaved": "Order saved",
  "sched.positionsTitle": "Manage positions",
  "sched.positionsHint": "Position choices for shifts and staff. Picking from a list keeps pickup rules exact. Removing a position doesn't change existing shifts or staff.",
  "sched.positionName": "New position name",
  "sched.addPosition": "Add",
  "sched.positionsSaved": "Positions saved.",
  "sched.positionsFail": "Could not save positions.",
  "sched.posDup": "That position is already listed.",
  "sched.posEmpty": "Enter a position name first.",
  "sched.noPositions": "No positions yet — add one below.",
  "sched.pickupTitle": "Pick up this shift?",
  "sched.pickupMsg": "A manager has to approve the pickup before it's yours.",
  "sched.claimSent": "Pickup requested — waiting on manager approval.",
  "sched.claimFail": "Could not request pickup.",
  "sched.mySwaps": "My swaps",
  "sched.noMySwaps": "You have no swaps.",
  "sched.cancelSwap": "Take off board",
  "sched.cancelTitle": "Take this shift off the board?",
  "sched.cancelMsg": "Teammates will no longer be able to pick it up.",
  "sched.cancelled": "Shift taken off the board.",
  "sched.relist": "Put back on board",
  "sched.yourListing": "Your listing — waiting for a teammate to pick it up.",
  "sched.statusOpen": "On the board", "sched.statusClaimed": "Waiting on manager",
  "sched.statusApproved": "Approved", "sched.statusDenied": "Denied", "sched.statusCancelled": "Off the board",
  "sched.swapInbox": "Pickups waiting on your decision",
  "sched.noSwapInbox": "No pickup requests waiting.",
  "sched.swapDecideFail": "Could not update the request.",
  "sched.claimer": "Picked up by", "sched.releasedBy": "Released by",
  "sched.swapWarnNote": "Conflicts with their availability or time off:",
  "sched.swapDecideTitle": "Confirm decision", "sched.swapDecideMsg": "This will notify both people. Are you sure?",
  "sched.swapsLoadFail": "Couldn't load the swap board — shift release may be unavailable. Pull to refresh.",
  "sched.notif": "Notifications", "sched.notifEmpty": "No notifications yet.",
  "sched.markAllRead": "Mark all read",
  "sched.pinWeek": "📌 Pin this week's pattern", "sched.pinTitle": "Pin this week's pattern?",
  "sched.pinMsg": "This saves each person's unique shift pattern (weekday, times, position) from this week as their reusable pinned pattern. It replaces any pins they already have.",
  "sched.pinnedDone": "Pinned patterns saved for {n} people.", "sched.pinFail": "Could not save pinned patterns.",
  "sched.unpin": "Unpin", "sched.unpinTitle": "Unpin {name}?",
  "sched.unpinMsg": "Their pinned weekly pattern will be removed.",
  "sched.unpinnedDone": "Unpinned {name}.", "sched.unpinFail": "Could not unpin.",
  "sched.pinnedCount": "{n} pinned patterns", "sched.pinnedSection": "Pinned weekly patterns",
  "sched.applyPins": "Apply pinned", "sched.applyTitle": "Apply pinned patterns?",
  "sched.applyMsg": "This fills the draft week with each person's pinned pattern.",
  "sched.applyFail": "Could not apply pinned patterns.",
  "sched.applyResultTitle": "Pinned patterns applied",
  "sched.applied": "Applied", "sched.skipped": "Skipped", "sched.skipTimeOff": "Approved time off", "sched.skipScheduled": "Already scheduled",
  "sched.generate": "⚡ Generate draft", "sched.genTitle": "Generate draft schedule?",
  "sched.genMsg": "This fills only the open staffing needs for this draft week. It never overwrites existing shifts, never schedules people with approved time off, and never publishes the schedule.",
  "sched.genFail": "Couldn't generate the draft.",
  "sched.genDone": "Draft generated — {n} shifts added",
  "sched.genNoGaps": "All staffing needs are covered.",
  "sched.gapsTitle": "Still unfilled",
  "sched.gap_no_position_match": "No staff with this position", "sched.gap_unavailable": "All qualified staff unavailable",
  "sched.gap_at_max_hours": "All qualified staff at max hours", "sched.gap_time_off": "All qualified staff requested off",
  "sched.gap_overlap_rest": "Blocked by rest rules or overlapping shifts",
  "sched.daypartLunch": "Lunch", "sched.daypartDinner": "Dinner", "sched.genNeeded": "needed",
},
es: {
  "common.cancel": "Cancelar", "common.confirm": "Confirmar", "common.back": "← Atrás",
  "common.save": "Guardar", "common.saved": "Guardado", "common.delete": "Eliminar", "common.name": "Nombre",
  "common.offline": "Sin conexión. Revisa tu conexión e inténtalo de nuevo.",
  "common.forbidden": "No tienes permiso para eso. Pregunta a un encargado.",
  "common.close": "Cerrar",
  "common.loading": "Cargando…",
  "common.notes": "Notas", "common.move": "Mover", "common.notAuth": "No autorizado.",
  "common.notFound": "No encontrado.", "common.conflict": "Eso entra en conflicto con datos existentes.",
  "common.serverError": "Algo salió mal. Inténtalo de nuevo.",
  "common.saving": "Guardando…", "common.checking": "Revisando…",
  "common.item": "Artículo", "common.continue": "Continuar",
  "nav.homeAria": "Inicio", "nav.logoutAria": "Cerrar sesión",
  "nav.langAria": "Idioma", "nav.themeAria": "Cambiar entre tema claro y oscuro",
  "role.manager": "Gerente", "role.staff": "Personal", "role.view": "Lectura",
  "move.title": "Mover a área", "move.current": "actual",
  "login.prompt": "Ingresa tu PIN para entrar", "login.signin": "Entrar",
  "login.clearKey": "Borrar", "login.backKey": "Retroceso",
  "login.needPin": "Ingresa tu PIN.", "login.wrong": "PIN incorrecto. Intenta de nuevo.",
  "login.expired": "Tu sesión expiró. Inicia sesión de nuevo.",
  "login.rateLimited": "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
  "login.forgot": "¿Olvidaste tu PIN?", "login.forgotMsg": "Pide a un gerente que restablezca tu PIN en la pantalla de Usuarios.",
  "login.langToggle": "English",
  "setpin.title": "Crea tu PIN", "setpin.step1": "Ingresa un PIN nuevo (mín. 4 dígitos)",
  "setpin.step2": "Ingrésalo de nuevo para confirmar", "setpin.min4": "El PIN debe tener al menos 4 dígitos.",
  "setpin.mismatch": "Los PIN no coinciden. Empieza de nuevo.", "setpin.fail": "No se pudo guardar el PIN. Intenta de nuevo.",
  "home.hi": "Hola", "home.parBanner": "Pon los niveles de par para generar pedidos",
  "home.parBanner2": "artículos tienen par.", "home.openPar": "Abrir editor de pars →",
  "home.start": "Empezar nuevo conteo", "home.orders": "Historial de pedidos", "home.manage": "Administrar",
  "home.inventory": "Inventario",
  "home.viewOrders": "Ver pedidos", "home.drafts": "Conteos en borrador",
  "home.noDrafts": "No hay conteos en borrador.", "home.count": "Conteo",
  "home.review": "Revisar", "home.resume": "Continuar", "home.view": "Ver",
  "home.discard": "Descartar", "home.abandonTitle": "¿Descartar conteo?",
  "home.abandonMsg": "Este borrador se eliminará. No se puede deshacer.", "home.abandonFail": "No se pudo descartar el conteo.",
  "home.startFail": "No se pudo empezar el conteo.", "home.noSession": "El servidor no devolvió un id de sesión.",
  "home.replay": "🔁 Ver recorrido",
  "par.title": "Editor de pars",
  "par.hint": "Solo los artículos con par mayor a 0 generan pedidos. Vacío = sin par.",
  "par.par": "Par", "par.price": "Precio", "par.saveAll": "Guardar todo",
  "par.unitPh": "cj / lb / pz",
  "count.dictateAria": "Dictar nombre del artículo",
  "par.saved1": "Se guardó 1 cambio.", "par.savedN": "Se guardaron {n} cambios.",
  "par.saveFail": "No se pudo guardar.", "par.change": "cambio", "par.changes": "cambios",
  "count.loading": "Cargando conteo…",
  "pill.not": "Sin contar", "pill.counted": "Contado", "pill.zero": "Cero confirmado",
  "pill.done": "Listo", "pill.review": "Revisar",
  "count.noPar": "sin par", "count.dec": "Disminuir", "count.inc": "Aumentar",
  "count.countFor": "Conteo de", "count.parFor": "Par de",
  "count.full": "Lleno", "count.markZero": "Marcar cero",
  "count.fullMultiHint": "Lleno está desactivado: este artículo se cuenta en varias ubicaciones (el par es el total de todas). Ingresa cada conteo manualmente.",
  "count.doneBtn": "✓ Listo", "count.moveArea": "Mover de área",
  "count.byLocation": "Por ubicación", "count.byItem": "Por artículo", "count.byVendor": "Por proveedor",
  "count.noVendor": "Sin proveedor",
  "count.totalLine": "Total {t} / par {p}",
  "count.areasBtn": "Ubicaciones", "count.areasTitle": "Ubicaciones de {name}",
  "count.areasHint": "Marca cada ubicación donde se guarda este artículo. La primera marcada es la ubicación principal.",
  "count.noParHint": "Sin par — ingresa el conteo",
  "count.search": "🔍 Buscar artículos…", "count.noItems": "No hay artículos aquí",
  "count.sortVendor": "Proveedor", "count.sortName": "A–Z", "count.sortLocation": "Ubicación",
  "count.noItemsSearch": " que coincidan con tu búsqueda", "count.toReview": "Revisar y aprobar →",
  "count.aiPh": "Escribe o dicta conteos — p. ej. '12 atún, medio caso de salmón'",
  "count.aiParse": "Analizar con IA", "count.aiNeedText": "Escribe o dicta algunos conteos primero.",
  "count.aiParsing": "Analizando…", "count.aiUnknown": "No reconocido: ",
  "count.aiNoMatch": "No se reconoció ningún artículo. Sé específico, p. ej. \"12 atún\".",
  "count.aiApply": "Aplicar selección",
  "count.aiApplied1": "Se aplicó 1 conteo.", "count.aiAppliedN": "Se aplicaron {n} conteos.",
  "count.aiNoKey": "IA no configurada — pide al super admin que agregue una clave API de Gemini (gratis en aistudio.google.com).",
  "count.aiFail": "Falló el análisis de IA.",
  "count.noVoice": "La voz no está disponible en este navegador — usa el micrófono 🎤 del teclado de tu teléfono.",
  "count.saveFail": "No se pudo guardar {name} — revisa tu conexión. (Tus otros conteos están a salvo.)",
  "count.flushFail": "Algunos conteos no se guardaron — revisa tu conexión e inténtalo de nuevo.",
  "count.moveTitle": "¿Mover artículo?", "count.moveMsg": "¿Mover {name} de {from} a {to}?",
  "count.moveFail": "No se pudo mover el artículo.", "count.parFail": "No se pudo actualizar el par.",
  "review.loading": "Cargando revisión…", "review.title": "Revisar y aprobar", "review.allCounted": "Todo tiene conteo. 🎉",
  "review.missingIn": "falta: {areas}", "review.partial": "Algunos artículos aún necesitan conteos en otras ubicaciones.",
  "review.needsReview": "Necesitan revisión", "review.noneFlagged": "Nada marcado.",
  "review.noEntry": "sin entrada aún", "review.flagged": "marcado para revisión",
  "review.open": "Abrir →", "review.aiCheck": "Revisión de IA", "review.runAi": "Ejecutar revisión de IA",
  "review.noIssues": "Sin problemas.", "review.aiFail": "Falló la revisión de IA.",
  "review.preview": "Vista previa del pedido",
  "review.nothingToOrder": "Nada que pedir — los pars automáticos están cubiertos (o no hay pars).",
  "review.nothingCounted": "Aún no hay conteos — ingresa conteos para ver lo que se pedirá.",
  "review.approveEmptyTitle": "Sin conteos ingresados",
  "review.approveEmptyMsg": "No has ingresado ningún conteo. Aprobar ahora NO generará pedidos.",
  "review.approveEmptyYes": "Aprobar de todos modos", "review.keepCounting": "Seguir contando",
  "review.approveNoLinesTitle": "Nada que pedir",
  "review.approveNoLinesMsg": "Todos los artículos contados están en o sobre el par. Aprobar no generará pedidos.",
  "review.approve": "Aprobar conteo",
  "review.alreadyApproved": "Este conteo ya fue aprobado.",
  "review.viewOrders": "Ver pedidos",
  "review.onlyManagers": "Solo gerentes o el super admin pueden aprobar. Tus conteos están guardados — un encargado los revisará y aprobará.",
  "review.approveTitle": "¿Aprobar conteo?",
  "review.approveMsg": "Esto finaliza el conteo y genera los pedidos. ¿Continuar?",
  "review.approveYes": "Aprobar", "review.approveFail": "Falló la aprobación.", "review.approvedToast": "Conteo aprobado. Las órdenes están listas.",
  "review.blockTitle": "No se puede aprobar — estos artículos necesitan revisión:",
  "review.blockMsg": "Abre cada artículo en el conteo y resuélvelo, luego aprueba de nuevo.",
  "review.fixHint": "Ingresa los conteos faltantes abajo (0 si la ubicaci\u00f3n est\u00e1 vac\u00eda), guarda y luego aprueba.",
  "review.fixInvalid": "Ingresa un conteo v\u00e1lido (0 o m\u00e1s) para cada ubicaci\u00f3n.",
  "review.fixFail": "No se pudieron guardar esos conteos. Int\u00e9ntalo de nuevo.",
  "review.allFixed": "Conteos guardados \u2014 toca Aprobar conteo.",
  "review.info": "ℹ️ Info", "review.warn": "⚠️ Advertencia",
  "orders.loading": "Cargando pedidos…", "orders.title": "Pedidos",
  "orders.print": "🖨 Imprimir",
  "orders.none": "Aún no hay pedidos. Aprueba un conteo para generar pedidos.",
  "orders.draft": "borrador", "orders.sent": "enviado", "orders.received": "recibido",
  "orders.markSent": "Marcar enviado", "orders.markReceived": "Marcar recibido",
  "orders.share": "📤 Compartir imagen", "orders.copy": "📋 Copiar texto",
  "orders.copied": "✓ Copiado", "orders.imgFail": "No se pudo crear la imagen del pedido.", "orders.sendFail": "No se pudo compartir el texto del pedido.",
  "orders.statusFail": "No se pudo actualizar el estado del pedido.",
  "orders.edit": "Editar",
  "orders.addItem": "Añadir artículo", "orders.qty": "Cant.",
  "orders.linesFail": "No se pudo guardar el pedido.",
  "orders.needLines": "Añade al menos un artículo.", "orders.deleteTitle": "\u00bfEliminar pedido?",
  "orders.deleteMsg": "Esto elimina permanentemente el pedido de {vendor}. No se puede deshacer.",
  "orders.deleteFail": "No se pudo eliminar el pedido.",
  "orders.deleted": "Pedido eliminado.",
  "orders.orderDate": "Fecha del pedido",
  "orders.quickOrder": "⚡ Pedido rápido", "orders.qoPickVendor": "Elige un proveedor",
  "orders.qoSearch": "Buscar todos los artículos…", "orders.qoCreate": "Crear pedido borrador",
  "orders.qoNeedLines": "Agrega al menos un artículo.", "orders.qoCreated": "Borrador creado.",
  "orders.qoFail": "No se pudo crear el pedido rápido.",
  "admin.altVendors": "Proveedores alternos",
  "admin.altVendorsHint": "Otros proveedores que también venden este artículo — aparecerá en sus pedidos rápidos.", "admin.noItemsMatch": "Sin resultados.", "admin.items": "Artículos", "admin.areas": "Áreas",
  "admin.vendors": "Proveedores", "admin.users": "Usuarios", "users.deleteTitle": "¿Eliminar usuario?",
  "users.deleteMsg": "Esto elimina permanentemente a {name}. No se puede deshacer.",
  "users.deleteFail": "No se pudo eliminar el usuario.",
  "admin.addItem": "Agregar artículo", "admin.area": "Área",
  "admin.unit": "Unidad", "admin.exItem": "p. ej. atún bluefin",
  "admin.boxesPh": "cajas",
  "bulk.jumpTop": "Arriba", "bulk.jumpBottom": "Abajo",
  "common.removeAria": "Quitar",
  "admin.itemNeedName": "El nombre no puede estar vacío.",
  "admin.addItemFail": "No se pudo agregar el artículo.", "admin.archived": "ARCHIVADO",
  "admin.unarchive": "Desarchivar", "admin.archive": "Archivar",
  "admin.mode": "Modo", "admin.modeAuto": "auto (genera pedidos)",
  "admin.modeManual": "manual", "admin.countStyle": "Estilo de conteo",
  "admin.exCase": "p. ej. caso", "admin.pieces": "Piezas por caso",
  "admin.caseLabel": "Etiqueta de caja", "admin.exCaseLabel": "p. ej. caja grande",
  "admin.noVendor": "sin proveedor", "admin.saveItemFail": "No se pudo guardar el artículo.",
  "admin.csvTitle": "Edición masiva (CSV)",
  "admin.bulkTitle": "Edición masiva", "admin.bulkNoMatch": "Sin coincidencias.",
  "admin.bulkSave": "Guardar {n} cambios", "admin.bulkNoChanges": "Sin cambios", "admin.bulkSaved": "Guardado {n}.", "admin.bulkFail": "{n} fallidos.",
  "admin.bulkActive": "Activo", "admin.bulkExpand": "Toca para editar", "admin.areasHint": "La primera marcada = ubicación principal.",
  "admin.noArea": "Sin ubicación",
  "admin.csvHelp": "Descargue el catálogo como hoja de cálculo, edite pares, áreas, proveedores y precios, y súbalo de nuevo. id vacío = artículo nuevo. Los nombres de área/proveedor desconocidos se omiten.",
  "admin.csvDownload": "Descargar CSV", "admin.csvFile": "Archivo CSV",
  "admin.csvUpload": "Subir y aplicar", "admin.csvNeedFile": "Elija primero un archivo CSV.",
  "admin.csvBadFile": "No se pudo leer ese archivo CSV.",
  "admin.csvResult": "Actualizados {u}, agregados {c}.", "admin.csvErrors": "{n} filas omitidas:",
  "admin.csvRow": "Fila {r} ({name}): {error}",
  "admin.killTitle": "Interruptor de apagado",
  "admin.killHelp": "Apagar la aplicación bloquea a todos excepto a los superadministradores. Los conteos, aprobaciones y pedidos dejan de funcionar de inmediato. No se elimina nada — puede volver a encenderla en cualquier momento.",
  "admin.killLive": "ACTIVA", "admin.killDead": "APAGADA",
  "admin.killOff": "Apagar aplicación", "admin.killOn": "Reactivar aplicación",
  "admin.killOnMsg": "¿Reactivar la aplicación?",
  "admin.killType": "Escriba SHUT OFF para confirmar.", "admin.killConfirmPh": "SHUT OFF",
  "admin.killMismatch": "La confirmación no coincide — no se cambió nada.",
  "admin.killFail": "No se pudo cambiar el estado.",
  "dead.title": "Esta aplicación ha sido desactivada.",
  "dead.msg": "Contacte a su administrador para obtener acceso.",
  "dead.adminLogin": "Volver a iniciar sesión",
  "admin.archiveFail": "No se pudo archivar.",
  "admin.addArea": "Agregar área", "admin.areaName": "Nombre del área", "admin.rename": "Renombrar",
  "admin.areaNeedName": "El nombre del área no puede estar vacío.",
  "admin.addAreaFail": "No se pudo agregar el área.", "admin.renameFail": "No se pudo renombrar el área.",
  "admin.delAreaTitle": "¿Eliminar área?", "admin.delAreaMsg": "¿Eliminar \"{name}\"? Primero mueve los artículos fuera.",
  "admin.delAreaFail": "No se pudo eliminar el área — puede tener artículos.",
  "admin.capacity": "Capacidad",
  "admin.capHint": "Un límite de almacenamiento limita la cantidad combinada en existencia + pedida de un grupo de productos que comparten espacio en un área — p. ej. helados: máx. 40 cajas mezcladas entre sabores en el walk-in.",
  "admin.capName": "Nombre del límite", "admin.capMax": "Cantidad máxima",
  "admin.capItems": "Productos que comparten este límite",
  "admin.capAdd": "Agregar límite", "admin.capNeedName": "Ponle un nombre al límite.",
  "admin.capNeedMax": "La cantidad máxima debe ser mayor que 0.",
  "admin.capAddFail": "No se pudo agregar el límite.", "admin.capSaveFail": "No se pudo guardar el límite.",
  "admin.capDelTitle": "¿Eliminar límite?", "admin.capDelMsg": "¿Eliminar \"{name}\"? Los productos mantienen su pedido normal.",
  "admin.capDelFail": "No se pudo eliminar el límite.",
  "admin.capNoAreas": "Agrega un área de almacenamiento primero.",
  "review.capNote": "Límite de almacenamiento: {pools}",
  "review.capAppliedTitle": "Limitado por espacio de almacenamiento",
  "review.capZeroWarn": "{name}: sin espacio bajo su límite de almacenamiento, no se pidió nada.",
  "review.maxZeroWarn": "{name}: una caja completa superaría su máximo, no se pidió nada.",
  "admin.addVendor": "Agregar proveedor",
  "admin.vendorNeedName": "El nombre del proveedor no puede estar vacío.",
  "admin.addVendorFail": "No se pudo agregar el proveedor.",
  "admin.vendorSaveFail": "No se pudo guardar el proveedor.",
  "vendor.orderDays": "Días de pedido", "vendor.orderBy": "Pedir antes de",
  "vendor.deliveryDays": "Días de entrega",
  "vendor.contactName": "Nombre de contacto", "vendor.contactPhone": "Teléfono de contacto",
  "vendor.contactNamePh": "p. ej. Mike",
  "orders.send": "📲 Enviar pedido", "orders.sendTo": "Enviar a",
  "item.dailyUsage": "Uso diario", "item.learned": "auto: {x}/día",
  "item.maxOnHand": "Máx. en almacén",
  "vendor.daysWorth": "días", "vendor.coverageHint": "Selecciona los días de pedido primero.",
  "review.orderBasis": "Pedido para el {day} · ×{m}",
  "review.capWarn": "el máximo es menor que una caja completa, no se pidió nada. Corrige el máximo o el tamaño de la caja.",
  "update.available": "Nueva versión disponible", "update.now": "Actualizar",
  "update.pushTitle": "Actualizaciones de la app",
  "update.pushHelp": "Envía la versión más reciente a todos los dispositivos. El personal verá un aviso de actualización — no hace falta borrar y volver a añadir la app.",
  "update.pushBtn": "Enviar actualización a todos",
  "update.pushed": "Actualización enviada — los dispositivos avisarán en la próxima revisión.",
  "update.pushFail": "No se pudo enviar la actualización.",
  "day.mon": "lun", "day.tue": "mar", "day.wed": "mié", "day.thu": "jue",
  "day.fri": "vie", "day.sat": "sáb", "day.sun": "dom",
  "admin.addUser": "Agregar usuario", "admin.role": "Rol",
  "admin.initPin": "PIN inicial (mín. 4 dígitos)",
  "admin.userNeedName": "El nombre no puede estar vacío.",
  "admin.addUserFail": "No se pudo agregar el usuario.", "admin.you": "tú",
  "admin.active": "activo", "admin.disabled": "desactivado",
  "admin.enable": "Activar", "admin.disable": "Desactivar",
  "admin.saveRole": "Guardar rol", "admin.setNewPin": "Poner PIN nuevo (dos veces)", "admin.availFor": "Editar disponibilidad",
  "admin.schedprof": "Perfil de turnos", "admin.schedprofMin": "Horas mín./semana", "admin.schedprofMax": "Horas máx./semana",
  "admin.schedprofRank": "Antigüedad (1 = más senior)", "admin.schedprofRest": "Descanso mín. entre turnos (h)",
  "admin.schedprofDoubles": "Puede doblar turnos", "admin.schedprofSave": "Guardar perfil de turnos",
  "admin.schedprofFail": "No se pudo guardar el perfil de turnos.",
  "admin.newPin": "PIN nuevo", "admin.confirmPin": "Confirmar PIN",
  "admin.setPinBtn": "Poner PIN",
  "admin.userStatusFail": "No se pudo cambiar el estado del usuario.",
  "admin.roleFail": "No se pudo actualizar el rol.", "admin.setPinFail": "No se pudo poner el PIN.",
  "admin.email": "Correo",
  "admin.moveItemMsg": "¿Mover {item} de {from} a {to}?",
  "admin.pinMismatch": "Los PIN no coinciden.",
  "admin.protected": "protegido",
  "admin.saLocked": "Super Admin — solo Gabe puede cambiar esto",
  "tour.skip": "Omitir", "tour.next": "Siguiente →", "tour.done": "Entendido",
  "tour.welcomeT": "Bienvenido a Sumo Inventory",
  "tour.welcomeB": "Un recorrido de 30 segundos. Puedes omitirlo cuando quieras.",
  "tour.startT": "Empieza un conteo aquí",
  "tour.startB": "Toca aquí para empezar un conteo nuevo. Anotarás lo que veas en los estantes.",
  "tour.ordersT": "Los pedidos están aquí",
  "tour.ordersB": "Los pedidos terminados aparecen aquí como tarjetas listas para compartir con los proveedores.",
  "tour.invB": "Los conteos, borradores e historial de pedidos están aquí.",
  "tour.schedT": "Horario",
  "tour.schedB": "Tus turnos, disponibilidad y solicitudes de tiempo libre están aquí.",
  "tour.langT": "English / Español",
  "tour.langB": "Toca el botón 🌐 cuando quieras para cambiar el idioma. Los pedidos siempre salen en inglés.",
  "tour.c1T": "Aquí anotas el conteo",
  "tour.c1B": "Escribe el número en la casilla, o toca − / + para ajustar. Se guarda automáticamente.",
  "tour.c2B": "Cambia de área con estas pestañas. Los números muestran cuántos artículos ya contaste.",
  "tour.c3T": "Botones rápidos",
  "tour.c3B": "0, fracciones, Lleno y ✓ Listo aceleran el conteo. Marca cero si el estante está vacío.", "sched.my": "Mi semana", "sched.team": "Equipo",
  "sched.builder": "Crear horario", "sched.timeoff": "Días libres", "sched.avail": "Disponibilidad",
  "sched.prevWeek": "Semana anterior", "sched.nextWeek": "Semana siguiente", "sched.thisWeek": "Esta semana",
  "sched.dayView": "Día", "sched.weekView": "Semana",
  "sched.prevDay": "Día anterior", "sched.nextDay": "Día siguiente", "sched.todayBtn": "Hoy",
  "sched.pickDate": "Elige una fecha", "sched.noShiftsToday": "Sin turnos programados hoy.",
  "sched.addToCalendar": "Añadir al calendario", "sched.calRange": "¿Qué semanas?", "sched.cal2Weeks": "Próximas 2 semanas", "sched.cal4Weeks": "Próximas 4 semanas",
  "sched.calDone": "Archivo descargado — ábrelo para añadir tus turnos.",
  "sched.calEmpty": "No hay turnos en ese rango.", "sched.loading": "Cargando horario…", "sched.overlapWarn": "Turnos superpuestos",
  "sched.loadingNotif": "Cargando notificaciones…",
  "sched.availRecurring": "Tu disponibilidad se repite cada semana — configúrala una vez.",
  "sched.removePosition": "Eliminar puesto", "sched.checkSwaps": "Revisa el Tablón de cambios para ver turnos disponibles.",
  "sched.canOpen": "Puede abrir (apertura autorizada)", "sched.canClose": "Puede cerrar (cierre autorizado)", "sched.group": "Grupo de horario", "sched.ungrouped": "Sin grupo",
  "sched.noCloser": "Sin cerrador autorizado programado", "sched.affectedShifts": "Turnos en este rango",
  "sched.weekStartOn": "La semana empieza el",
  "sched.weekStartWarn": "Los horarios existentes se reagruparán en las nuevas semanas. Las fechas de los turnos no cambian. Aplica a todo el equipo.",
  "sched.weekStartSaved": "Inicio de semana actualizado.",
  "sched.draft": "BORRADOR — no visible para el personal", "sched.published": "Publicado",
  "sched.noPeople": "Nadie tiene acceso al horario aún. Actívalo por persona en la pantalla de Usuarios y luego arma el horario aquí.",
  "sched.publish": "Publicar", "sched.unpublish": "Despublicar",
  "sched.unpublished": "Despublicado",
  "sched.copyWeek": "Copiar semana anterior",
  "sched.addShift": "Agregar turno", "sched.editShift": "Editar turno",
  "sched.start": "Inicio", "sched.end": "Fin", "sched.position": "Puesto",
  "sched.station": "Estación", "sched.note": "Nota",
  "sched.viewGroups": "Grupos", "sched.viewEmployees": "Empleados", "sched.viewLabel": "Vista del horario",
  "sched.whoCanWork": "Quién puede cubrir este turno", "sched.enterTimesFirst": "Pon hora de inicio y fin primero",
  "sched.noCandidates": "Nadie disponible para este turno", "sched.assignedTo": "Asignado a",
  "sched.pickSomeone": "Elige a alguien de la lista", "sched.addOpenShift": "Añadir turno abierto",
  "sched.requestOff": "Pedir día libre", "sched.reason": "Motivo",
  "sched.from": "Desde", "sched.to": "Hasta", "sched.deny": "Denegar",
  "sched.pending": "Pendiente", "sched.approved": "Aprobada", "sched.denied": "Denegada",
  "sched.available": "Disponible", "sched.unavailable": "No disponible todo el día", "sched.limited": "Disponible solo entre…",
  "sched.blocked": "No disponible entre…",
  "sched.availExplainer": "«Disponible solo entre…» significa que SÍ puedes trabajar esas horas; «No disponible entre…» significa que NO.",
  "sched.availApplyAll": "Copiar el lunes a todos los días", "sched.availFor": "Disponibilidad — {name}",
  "sched.noPublished": "No hay horario publicado para esta semana.",
  "sched.draftBanner": "BORRADOR — aún no publicado.",
  "sched.noShifts": "No tienes turnos esta semana.", "sched.noShiftsDay": "Sin turnos",
  "sched.warnApproved": "Tiene días libres aprobados que coinciden con este turno",
  "sched.warnPending": "Tiene una solicitud de días libres pendiente que coincide con este turno",
  "sched.warnUnavailable": "No disponible ese día",
  "sched.warnLimited": "El turno queda fuera de su horario limitado",
  "sched.warnBlocked": "El turno coincide con horas no disponibles",
  "sched.warningsTitle": "Advertencias",
  "sched.shiftDeleted": "Turno eliminado.", "sched.shiftsSaved": "Turnos guardados.",
  "sched.saveShiftFail": "No se pudo guardar el turno.",
  "sched.copyTitle": "¿Copiar la semana pasada?", "sched.copyMsg": "Esto copia los turnos publicados de la semana pasada al borrador de esta semana.",
  "sched.copyDone": "Horario de la semana pasada copiado.", "sched.copyFail": "No se pudo copiar la semana.",
  "sched.publishTitle": "¿Publicar el horario?", "sched.publishMsg": "El personal podrá ver el horario de esta semana.",
  "sched.unpublishTitle": "¿Despublicar el horario?", "sched.unpublishMsg": "El personal ya no verá el horario de esta semana.",
  "sched.publishFail": "No se pudo cambiar el estado de publicación.",
  "sched.deleteTitle": "¿Eliminar turno?", "sched.deleteMsg": "Este turno se eliminará. No se puede deshacer.",
  "sched.teamAvail": "Disponibilidad del equipo",
  "sched.none": "Sin acceso al horario", "sched.accessView": "Puede ver horario",
  "sched.accessManage": "Puede crear horarios", "sched.scheduleAccess": "Acceso al horario",
  "sched.department": "Departamento",
  "sched.saveFlags": "Guardar ajustes de horario", "sched.flagsFail": "No se pudieron guardar los ajustes de horario.",
  "sched.myRequests": "Mis solicitudes", "sched.inbox": "Esperan tu decisión",
  "sched.decideTitle": "Decidir solicitud",
  "sched.dirtyTitle": "¿Descartar cambios sin guardar?", "sched.dirtyMsg": "Tienes cambios sin guardar en esta pestaña. Cambiar de pestaña los perderá.",
  "sched.discard": "Descartar",
  "sched.noRequests": "Sin solicitudes de días libres.", "sched.noRequestsInbox": "No hay solicitudes pendientes — estás al día.",
  "sched.requestSent": "Solicitud enviada.", "sched.requestFail": "No se pudo enviar la solicitud.",
  "sched.addTimeOffFor": "Agregar días libres para un empleado", "sched.pickPerson": "Elige una persona.",
  "sched.addTimeOffForFail": "No se pudieron agregar los días libres.", "sched.reqChip": "REQ",
  "sched.needDates": "Elige fecha de inicio y fin.", "sched.badDates": "La fecha de fin no puede ser anterior a la de inicio.",
  "sched.pastDate": "Las solicitudes no pueden empezar en el pasado.", "sched.decideFail": "No se pudo actualizar la solicitud.",
  "sched.cancelRequest": "Cancelar solicitud", "sched.cancelRequestConfirm": "¿Eliminar esta solicitud de días libres?",
  "sched.cancelRequestFail": "No se pudo eliminar la solicitud.",
  "sched.date": "Fecha", "sched.person": "Persona", "sched.needTimes": "Ingresa hora de inicio y fin.",
  "sched.availFail": "No se pudo guardar la disponibilidad.",
  "sched.builderHint": "Toca + para agregar un turno. Toca un turno para editarlo.",
  "sched.swapBoard": "Tablón de cambios",
  "sched.release": "Liberar turno",
  "sched.releaseTitle": "¿Liberar este turno?",
  "sched.releaseMsg": "Aparecerá en el tablón de cambios. Un compañero puede tomarlo, pero un gerente debe aprobarlo. Sigues siendo responsable hasta que se apruebe.",
  "sched.released": "El turno está en el tablón.",
  "sched.releaseFail": "No se pudo liberar el turno.",
  "sched.openShifts": "Turnos disponibles",
  "sched.noOpenSwaps": "No hay turnos en el tablón ahora.",
  "sched.pickup": "Tomar turno",
  "sched.posOnlyShift": "Solo el personal de {pos} puede tomar este turno.",
  "sched.positions": "Puestos",
  "sched.staffing": "Personal",
  "sched.staffingRecurring": "Plantilla semanal — se repite cada semana.",
  "sched.staffingNeeds": "Cuántos por turno",
  "sched.staffingHint": "Indica cuántos de cada puesto necesitas por día de la semana y turno. El programador muestra programados vs necesarios bajo cada día. Vacío = sin objetivo (lo borra).",
  "sched.daypartHint": "Almuerzo = turnos que terminan a las 5 PM. Cena = todo lo posterior (un cierre a medianoche cuenta como cena).",
  "sched.lunch": "Almuerzo",
  "sched.dinner": "Cena",
  "sched.arrangeGroups": "Orden de grupos",
  "sched.arrangeEmployees": "Orden de empleados",
  "sched.arrangeHint": "Usa las flechas para fijar el orden exacto del programador, luego guarda.",
  "sched.staffingSaved": "Necesidades guardadas",
  "sched.orderSaved": "Orden guardado",
  "sched.positionsTitle": "Gestionar puestos",
  "sched.positionsHint": "Opciones de puesto para turnos y personal. Elegir de la lista mantiene exactas las reglas de toma de turnos. Quitar un puesto no cambia los turnos ni el personal existentes.",
  "sched.positionName": "Nombre del nuevo puesto",
  "sched.addPosition": "Añadir",
  "sched.positionsSaved": "Puestos guardados.",
  "sched.positionsFail": "No se pudieron guardar los puestos.",
  "sched.posDup": "Ese puesto ya está en la lista.",
  "sched.posEmpty": "Ingresa primero el nombre del puesto.",
  "sched.noPositions": "Aún no hay puestos — añade uno abajo.",
  "sched.pickupTitle": "¿Tomar este turno?",
  "sched.pickupMsg": "Un gerente debe aprobar el cambio antes de que sea tuyo.",
  "sched.claimSent": "Solicitud enviada — esperando aprobación del gerente.",
  "sched.claimFail": "No se pudo solicitar el turno.",
  "sched.mySwaps": "Mis cambios",
  "sched.noMySwaps": "No tienes cambios.",
  "sched.cancelSwap": "Quitar del tablón",
  "sched.cancelTitle": "¿Quitar este turno del tablón?",
  "sched.cancelMsg": "Los compañeros ya no podrán tomarlo.",
  "sched.cancelled": "Turno quitado del tablón.",
  "sched.relist": "Volver a publicar",
  "sched.yourListing": "Tu anuncio — esperando que un compañero lo tome.",
  "sched.statusOpen": "En el tablón", "sched.statusClaimed": "Esperando al gerente",
  "sched.statusApproved": "Aprobado", "sched.statusDenied": "Denegado", "sched.statusCancelled": "Quitado",
  "sched.swapInbox": "Cambios esperando tu decisión",
  "sched.noSwapInbox": "No hay solicitudes esperando.",
  "sched.swapDecideFail": "No se pudo actualizar la solicitud.",
  "sched.claimer": "Lo toma", "sched.releasedBy": "Liberado por",
  "sched.swapWarnNote": "Conflictos con su disponibilidad o días libres:",
  "sched.swapDecideTitle": "Confirmar decisión", "sched.swapDecideMsg": "Esto notificará a ambas personas. ¿Seguro?",
  "sched.swapsLoadFail": "No se pudo cargar el tablero de cambios — es posible que no puedas publicar turnos. Desliza para actualizar.",
  "sched.notif": "Notificaciones", "sched.notifEmpty": "Aún no hay notificaciones.",
  "sched.markAllRead": "Marcar todo como leído",
  "sched.pinWeek": "📌 Fijar el patrón de esta semana", "sched.pinTitle": "¿Fijar el patrón de esta semana?",
  "sched.pinMsg": "Esto guarda el patrón de turnos de cada persona (día de la semana, horarios, puesto) de esta semana como su patrón fijado reutilizable. Reemplaza los patrones que ya tenga.",
  "sched.pinnedDone": "Patrones fijados guardados para {n} personas.", "sched.pinFail": "No se pudieron guardar los patrones fijados.",
  "sched.unpin": "Quitar", "sched.unpinTitle": "¿Quitar los patrones fijados de {name}?",
  "sched.unpinMsg": "Se eliminará su patrón semanal fijado.",
  "sched.unpinnedDone": "Patrones quitados para {name}.", "sched.unpinFail": "No se pudieron quitar los patrones.",
  "sched.pinnedCount": "{n} patrones fijados", "sched.pinnedSection": "Patrones semanales fijados",
  "sched.applyPins": "Aplicar fijados", "sched.applyTitle": "¿Aplicar patrones fijados?",
  "sched.applyMsg": "Esto llena el borrador de la semana con el patrón fijado de cada persona.",
  "sched.applyFail": "No se pudieron aplicar los patrones fijados.",
  "sched.applyResultTitle": "Patrones fijados aplicados",
  "sched.applied": "Aplicados", "sched.skipped": "Omitidos", "sched.skipTimeOff": "Descanso aprobado", "sched.skipScheduled": "Ya tiene turno",
  "sched.generate": "⚡ Generar borrador", "sched.genTitle": "¿Generar borrador de horario?",
  "sched.genMsg": "Esto solo cubre las necesidades de personal abiertas de esta semana en borrador. No sobrescribe turnos existentes, no programa a personas con descanso aprobado y no publica el horario.",
  "sched.genFail": "No se pudo generar el borrador.",
  "sched.genDone": "Borrador generado — {n} turnos agregados",
  "sched.genNoGaps": "Todas las necesidades de personal están cubiertas.",
  "sched.gapsTitle": "Sin cubrir todavía",
  "sched.gap_no_position_match": "Nadie con este puesto", "sched.gap_unavailable": "Todo el personal calificado no disponible",
  "sched.gap_at_max_hours": "Todo el personal calificado al máximo de horas", "sched.gap_time_off": "Todo el personal calificado pidió libre",
  "sched.gap_overlap_rest": "Bloqueado por reglas de descanso o turnos superpuestos",
  "sched.daypartLunch": "Almuerzo", "sched.daypartDinner": "Cena", "sched.genNeeded": "necesarios",
}};

/** Current UI language: "en" | "es". Persisted per device.
 *  The super admin always gets English (no Spanish UI, no toggle) —
 *  the stored device preference is left untouched for staff. */
function lang() {
  if (state.session && state.session.profile && state.session.profile.role === "superadmin") return "en";
  return state.lang === "es" ? "es" : "en";
}
/** Translate a UI key. Falls back to English, then to the key itself. */
function T(key) {
  const d = STR[lang()] || STR.en;
  if (d[key] != null) return d[key];
  return STR.en[key] != null ? STR.en[key] : key;
}
function setLang(l) {
  state.lang = l === "es" ? "es" : "en";
  try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* noop */ }
  try { document.documentElement.lang = state.lang; } catch (e) { /* noop */ }
}
/* ---------- Theme: dark is the default look; light is a CSS-variable
 *  override ([data-theme="light"] on <html>). Persisted per device. */
const THEME_KEY = "sumoV2theme";
/** "light" | "dark". Anything unrecognized falls back to dark. */
function theme() { return state.theme === "light" ? "light" : "dark"; }
function applyTheme() {
  try {
    if (theme() === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  } catch (e) { /* noop */ }
}
function setTheme(t) {
  state.theme = t === "light" ? "light" : "dark";
  try { localStorage.setItem(THEME_KEY, state.theme); } catch (e) { /* noop */ }
  applyTheme();
}
/** Locale tag for date formatting, follows the UI language. */
function locale() { return lang() === "es" ? "es-US" : "en-US"; }

/* ===================== ROLE GATING ============================== */
/** Single source of truth for what each role may do in the UI.
 *  The server enforces this too — the UI just hides what you can't use. */
const can = {
  count:      ["superadmin", "manager", "staff"],  // start/enter counts
  approve:    ["superadmin", "manager"],           // review & approve counts
  manage:     ["superadmin", "manager"],           // items/areas/vendors/users: add/edit/delete/par/move
  superadmin: ["superadmin"],                      // import/export only
};
const has = (perm) => state.session && can[perm].includes(state.session.profile.role);

/** Schedule-role gates (independent of inventory roles). The backend sets
 *  can_view_schedule / can_manage_schedule on state.session.profile. */
const canSchedView = () => state.session && (state.session.profile.role === "superadmin" ||
  !!state.session.profile.can_view_schedule || !!state.session.profile.can_manage_schedule);
const canSchedManage = () => state.session && (state.session.profile.role === "superadmin" ||
  !!state.session.profile.can_manage_schedule);

/** Display label for a role value. Super Admin stays English (Gabe's screens). */
const roleLabel = (r) => {
  if (r === "superadmin") return "Super Admin";
  const k = { manager: "role.manager", staff: "role.staff", view: "role.view" }[r];
  return k ? T(k) : (r ? r.charAt(0).toUpperCase() + r.slice(1) : "");
};

/* ============================ STATE ============================= */
const state = {
  session: null,       // { token, profile: { id, name, role, must_change_pin? } }
  schedWeekCache: {},  // week_start -> { at, data } for schedule.get_week (TTL below)
  areas: [],           // [{id, name}]
  vendors: [],         // [{id, name, email, notes}]
  pools: [],           // capacity pools [{id, area_id, name, max_qty, unit, item_ids}]
  items: [],           // [{id, name, area_id, vendor_id, par, unit, mode, count_style, pieces_per_case, price, notes, active, daily_usage, daily_usage_manual, max_on_hand}]
  sessions: [],        // draft sessions
  orders: [],          // orders list
  count: null,         // { sessionId, session, areaId, entries: {itemId:{count,status,note}}, search, highlight }
  review: null,        // { sessionId, flags: [], aiRan: bool }
  route: null,
  saveTimers: {},      // debounced entry saves per item
  saveInFlight: {},    // in-flight entry save promises per item (awaited by flush)
  settings: null,      // { store_name, show_prices } — loaded via settings.get
  cardData: {},        // order-card payloads keyed by card id (for image share)
  lang: "en",          // UI language: "en" | "es" (per device; orders always English)
  theme: "dark",       // UI theme: "dark" (default) | "light" (per device)
};
// Live filter text for the Manage → Items list (module-level so it survives
// tab re-renders while typing).
let adminItemSearch = "";

/** Load store settings (store name, price toggle). Cached; cheap to refresh. */
async function loadSettings() {
  const fallback = { store_name: "Sumo Sushi", show_prices: false, app_version: "0" };
  try {
    const r = await edge("settings.get");
    state.settings = Object.assign({}, fallback, r.settings || {});
    checkVersionSeen(String(state.settings.app_version ?? "0"));
  } catch (e) { state.settings = state.settings || fallback; }
  return state.settings;
}
/* ---------------- Push updates ---------------- */
// Superadmin bumps settings.app_version ("Push update"); every client compares
// it against the version it launched with. On safe screens (login, home) a
// stale client refreshes itself automatically; anywhere else (e.g. mid-count)
// it shows the green update banner instead so no work is yanked away.
const APP_VER_KEY = "sumo_app_version_seen";
function getSeenVersion() {
  try { return localStorage.getItem(APP_VER_KEY); } catch (e) { return null; }
}
function setSeenVersion(v) {
  try { localStorage.setItem(APP_VER_KEY, v); } catch (e) { /* noop */ }
}
/** Hard reload with a cache-busting URL (defeats the iOS home-screen cache). */
function hardRefreshToLatest() {
  setSeenVersion(String(state.settings && state.settings.app_version != null ? state.settings.app_version : "0"));
  location.href = location.pathname + "?v=" + Date.now() + location.hash;
}
/**
 * Auto-refresh path for safe screens. The seen version is stored BEFORE
 * reloading, so this can never loop. Returns true when the page is reloading
 * (the caller must stop and return immediately).
 */
function autoRefreshIfStale() {
  const server = String(state.settings && state.settings.app_version != null ? state.settings.app_version : "0");
  const seen = getSeenVersion();
  if (!seen) { setSeenVersion(server); return false; }
  if (server !== seen) { hardRefreshToLatest(); return true; }
  return false;
}
function checkVersionSeen(server) {
  if (!state.session) return; // login screen: nothing to update yet
  const seen = getSeenVersion();
  if (!seen) { setSeenVersion(server); return; }
  if (server !== seen && !document.getElementById("update-banner")) showUpdateBanner(server);
}
function showUpdateBanner(server) {
  const bar = document.createElement("div");
  bar.id = "update-banner";
  bar.innerHTML = `<span>${esc(T("update.available"))}</span><button id="update-now">${esc(T("update.now"))}</button>`;
  document.body.prepend(bar);
  document.getElementById("update-now").onclick = () => {
    setSeenVersion(server);
    // Cache-bust the reload itself: a query string forces iOS to refetch
    // index.html instead of serving its home-screen cache.
    location.href = location.pathname + "?v=" + Date.now() + location.hash;
  };
}

/* ---------------- Idle re-login ---------------- */
// Shared restaurant device: if the app sits in the background longer than
// this, coming back to the foreground forces a fresh PIN login. The login
// itself auto-refreshes when a push is pending, so one login always lands on
// the latest version.
const IDLE_RELOGIN_MS = 15 * 60 * 1000; // 15 minutes
const LAST_ACTIVE_KEY = "sumoV2lastActive";
let hiddenAt = 0; // when this page last went to the background (0 = not tracked)
function stampActive() {
  try { localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now())); } catch (e) { /* noop */ }
}
function lastActiveAt() {
  try { return Number(localStorage.getItem(LAST_ACTIVE_KEY)) || 0; } catch (e) { return 0; }
}
/** True when the persisted last-active stamp is older than the idle limit
 *  (covers the case where iOS killed the page while it was backgrounded). */
function idlePastLimit() {
  const la = lastActiveAt();
  return la > 0 && Date.now() - la > IDLE_RELOGIN_MS;
}

/**
 * Session watchers, registered once at boot. Every callback self-guards on
 * state.session, so this works no matter which auth path boot takes (fresh
 * login screen, restored session, forced set-pin, or idle-timeout logout).
 * - Push-update poll: every 5 minutes while the app is open and visible.
 * - Activity heartbeat: every 60 seconds, so the idle timer survives iOS
 *   killing the backgrounded page.
 * - Foreground return: backgrounded past the idle limit -> forced PIN login
 *   (the login itself auto-refreshes when a push is pending). Otherwise just
 *   stamp activity and check for a pushed update (banner if one is mid-work).
 */
function startSessionWatchers() {
  if (state.session) loadSettings();
  setInterval(() => {
    if (state.session && !document.hidden) { stampActive(); loadSettings(); }
  }, 5 * 60 * 1000);
  setInterval(() => { if (state.session && !document.hidden) stampActive(); }, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (state.session) { hiddenAt = Date.now(); stampActive(); }
      return;
    }
    if (state.session && hiddenAt && Date.now() - hiddenAt > IDLE_RELOGIN_MS) {
      hiddenAt = 0;
      logout(); // forced re-login; the login auto-refreshes when a push is pending
      return;
    }
    hiddenAt = 0;
    if (state.session) { stampActive(); loadSettings(); }
  });
}
const storeName = () => (state.settings && state.settings.store_name) || "Sumo Sushi";
const showPrices = () => !!(state.settings && state.settings.show_prices);

/* ========================= API CLIENT =========================== */
/** PostgREST wrapper. Sends the Supabase anon key AND the session
 *  token as the x-app-token global header on every request. */
async function api(method, path, body = null, extraHeaders = {}) {
  const headers = {
    apikey: CONFIG.SUPABASE_ANON_KEY,
    "x-app-token": state.session ? state.session.token : "",
    ...extraHeaders,
  };
  if (body != null) headers["Content-Type"] = "application/json";
  const res = await fetch(CONFIG.SUPABASE_URL + "/rest/v1" + path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw { status: res.status, body: text, code: "postgrest_" + res.status };
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Edge function wrapper. POST {action, token, ...} -> JSON.
 *  Errors arrive as {error:'code', detail?} and are thrown as exceptions.
 *  Network failures (offline) throw {code:'offline'} so callers can show a
 *  translated message instead of raw "Failed to fetch". */
async function edge(action, payload = {}) {
  let res;
  try {
    res = await fetch(CONFIG.SUPABASE_URL + "/functions/v1/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, token: state.session ? state.session.token : null, ...payload }),
    });
  } catch (e) {
    throw { code: "offline", detail: T("common.offline") };
  }
  let data = {};
  try { data = await res.json(); } catch (e) { /* non-JSON */ }
  if (data && data.error) {
    // Kill switch: the server only sends app_disabled to non-superadmins
    // (superadmins are never gated), so this client is done for the session.
    if (data.error === "app_disabled") {
      state.killed = true;
      showKilled();
    }
    // Translate the bare "forbidden" code once here so every
    // `e.detail || T(fallback)` call site shows a real sentence.
    // F-218: also translate the other stable server codes so ES-mode users
    // don't see raw English technical strings; dynamic validation details
    // (badRequest specifics) still pass through verbatim.
    const codeMsg = {
      forbidden: T("common.forbidden"),
      unauthorized: T("common.notAuth"),
      not_found: T("common.notFound"),
      conflict: T("common.conflict"),
      rate_limited: T("login.rateLimited"),
      internal: T("common.serverError"),
    }[data.error];
    const detail = data.detail || codeMsg;
    throw { code: data.error, detail, status: res.status, data };
  }
  if (!res.ok) throw { code: "edge_" + res.status, status: res.status, data };
  // Schedule mutations invalidate the cached week payloads (see schedGetWeek).
  if (typeof action === "string" && action.startsWith("schedule.")
      && action !== "schedule.get_week" && action !== "schedule.ensure_draft"
      && action !== "schedule.get_settings") {
    state.schedWeekCache = {};
  }
  return data;
}

/* Week payload cache: tab switches within the TTL render instantly instead of
 * showing the full loader every time. Mutations clear it via edge(). */
const SCHED_WEEK_TTL = 60 * 1000;
async function schedGetWeek(weekStart) {
  const hit = state.schedWeekCache[weekStart];
  if (hit && Date.now() - hit.at < SCHED_WEEK_TTL) return hit.data;
  const data = await edge("schedule.get_week", { week_start: weekStart });
  state.schedWeekCache[weekStart] = { at: Date.now(), data };
  if (data && data.week_start && data.week_start !== weekStart) {
    state.schedWeekCache[data.week_start] = { at: Date.now(), data };
  }
  return data;
}

/* ======================= SESSION / AUTH ======================= */
const SESSION_KEY = "sumoV2session";

function saveSession(s) {
  // NOTE: PIN is never stored — only the opaque token + profile.
  state.session = s;
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  // A fresh login must never inherit the previous user's cached schedule data.
  state.schedWeekCache = {};
  if (state.sched) state.sched.avail = null;
}

function dropSession() {
  state.session = null;
  localStorage.removeItem(SESSION_KEY);
  // Never leak one user's cached schedule payloads into the next session.
  state.schedWeekCache = {};
  if (state.sched) state.sched.avail = null;
}
/** 401/expired session: remember where the user was, show an explanatory
 *  notice on the PIN screen, and return them after re-login. */
function sessionExpired() {
  const h = String(location.hash || "");
  if (h && h !== "#/login" && h !== "#/set-pin") state.returnTo = h;
  state.loginNotice = T("login.expired");
  dropSession();
  go("#/login");
}

/** Boot: restore session from localStorage, verify it with a cheap
 *  call (areas.list works for any role). On 401 -> drop + login. */
async function boot() {
  try { state.lang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { state.lang = "en"; }
  try { document.documentElement.lang = state.lang === "es" ? "es" : "en"; } catch (e) { /* noop */ }
  try { state.theme = localStorage.getItem(THEME_KEY) || "dark"; } catch (e) { state.theme = "dark"; }
  applyTheme();
  startSessionWatchers(); // self-guarded; registered before any auth path below
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      state.session = JSON.parse(raw);
      // NOTE: when the kill switch is on, areas.list throws app_disabled for
      // non-superadmins (superadmins are never gated server-side), so the
      // server — not the saved login copy — decides who sees the dead screen.
      const r = await edge("areas.list");
      state.areas = r.areas || r || [];
      // The page may have been killed by iOS while backgrounded: past the
      // idle limit, force a fresh login instead of restoring the old session.
      // (No return here — falls through to router(), which shows the login
      // screen once the session is dropped.)
      if (idlePastLimit()) {
        sessionExpired();
      } else if (state.session.profile && state.session.profile.must_change_pin) {
        location.hash = "#/set-pin";
        return;
      }
    } catch (e) {
      if (e && e.code === "app_disabled") { state.killed = true; showKilled(); return; }
      dropSession(); state.loginNotice = T("login.expired"); // bad/expired token -> force login
    }
  }
  router();
  window.addEventListener("hashchange", router);
  // Push-update + idle watchers are registered in startSessionWatchers() at
  // the top of boot() so every auth path gets them.
  // Top-bar Home button, delegated so every view gets it without per-view wiring.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-home"]');
    if (t) go("#/home");
  });
  // Physical keyboard support for the on-screen PIN pads (F-219): typing
  // digits, Backspace, or Enter drives the same pad buttons.
  document.addEventListener("keydown", (e) => {
    const pad = document.getElementById("pin-pad");
    if (!pad) return;
    const tap = (k) => { const b = pad.querySelector(`[data-k="${k}"]`); if (b) b.click(); };
    if (/^[0-9]$/.test(e.key)) { tap(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { tap("back"); e.preventDefault(); }
    else if (e.key === "Enter") {
      const goBtn = document.getElementById("pin-go") || document.getElementById("pin-next");
      if (goBtn) { goBtn.click(); e.preventDefault(); }
    }
  });
  // Pasting a PIN while the pad is on screen types it in digit by digit.
  document.addEventListener("paste", (e) => {
    const pad = document.getElementById("pin-pad");
    if (!pad || !e.clipboardData) return;
    const digits = String(e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 8);
    if (!digits) return;
    e.preventDefault();
    for (const d of digits) {
      const b = pad.querySelector(`[data-k="${d}"]`);
      if (b) b.click();
    }
  });
  // Language toggle (EN/ES) in the top bar — re-render the current view.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-lang"]');
    if (t) { setLang(lang() === "es" ? "en" : "es"); router(); }
  });
  // Theme toggle (dark/light) in the top bar — CSS handles the swap, no
  // re-render needed; the icon flips on the next render.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-theme"]');
    if (t) { setTheme(theme() === "light" ? "dark" : "light"); router(); }
  });
  // Notification bell in the top bar — opens the notifications inbox.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-notif"]');
    if (t) go("#/notif");
  });
  // Order-card actions (share image / copy text / send order), delegated for the same reason.
  document.addEventListener("click", (e) => {
    const snd = e.target.closest("[data-send-card]");
    if (snd) { sendOrderCard(snd.dataset.sendCard, snd); return; }
    const sh = e.target.closest("[data-share-card]");
    if (sh) { shareOrderCard(sh.dataset.shareCard, sh); return; }
    const cp = e.target.closest("[data-copy-card]");
    if (cp) { copyCardText(cp.dataset.copyCard, cp); }
  });
}

/** Logout: tell the server, then wipe local session. */
async function logout() {
  try { await edge("logout"); } catch (e) { /* best effort */ }
  state.returnTo = null; state.loginNotice = null;
  dropSession();
  location.hash = "#/login";
}

/* =========================== ROUTER =========================== */
/** Hash routes:
 *  #/login  #/set-pin  #/home  #/count/:id  #/review/:id
 *  #/orders  #/admin[:/tab]  #/admin/par (bulk par editor)
 *  Admin tabs: items/areas/vendors/users (manager+), io = import/export (superadmin only) */
/** Full-screen shutdown notice shown when the kill switch is on.
 *  Includes an admin escape hatch: a superadmin can always sign back in. */
function showKilled() {
  $app().innerHTML = `<div class="view"><div class="admin-card" style="margin-top:48px;text-align:center;padding:36px 22px">
    <div style="font-size:22px;font-weight:800;margin-bottom:10px">${esc(T("dead.title"))}</div>
    <p class="muted">${esc(T("dead.msg"))}</p>
    <div style="margin-top:20px"><button class="btn btn-small btn-ghost" id="killed-login">${esc(T("dead.adminLogin"))}</button></div>
  </div></div>`;
  document.getElementById("killed-login").onclick = () => {
    state.killed = false;
    dropSession();
    location.hash = "#/login";
    router();
  };
}

function router() {
  if (state.killed) { showKilled(); return; }
  let hash = location.hash || "#/login";
  const routeChanged = state.lastHash === undefined || state.lastHash !== hash;
  // A toast belongs to the route that raised it: hide it when the route really
  // changed (but NOT on same-route re-renders, e.g. save -> showSavedToast ->
  // router() — the toast must survive those). Stale-route toasts never linger.
  const st = document.getElementById("saved-toast");
  if (st && st.dataset.route !== undefined && st.dataset.route !== hash) {
    st.classList.remove("show");
    st.setAttribute("aria-hidden", "true");
    if (typeof savedToastTimer !== "undefined" && savedToastTimer) { clearTimeout(savedToastTimer); savedToastTimer = null; }
  }
  if (routeChanged) state.lastNavAt = Date.now();
  state.lastHash = hash;
  const needAuth = !hash.startsWith("#/login") && !hash.startsWith("#/set-pin");

  if (needAuth && !state.session) { location.hash = "#/login"; return; }
  if (hash === "#/login" && state.session) { location.hash = "#/home"; return; }

  const qIdx = hash.indexOf("?");
  const pathOnly = qIdx >= 0 ? hash.slice(0, qIdx) : hash;
  const query = qIdx >= 0 ? hash.slice(qIdx + 1) : "";
  const parts = pathOnly.replace(/^#\//, "").split("/");
  const view = parts[0], arg = decodeURIComponent(parts[1] || ""), arg2 = decodeURIComponent(parts[2] || "");
  state.route = { view, arg, arg2, query };

  window.scrollTo(0, 0);
  if (view === "login") renderLogin();
  else if (view === "set-pin") renderSetPin();
  else if (view === "home") renderHome();
  else if (view === "inv") renderInventory();
  else if (view === "count") renderCount(arg);
  else if (view === "review") renderReview(arg);
  else if (view === "orders") renderOrders();
  else if (view === "sched") renderSchedule(arg || "my", arg2);
  else if (view === "notif") renderNotif();
  else if (view === "admin" && arg === "par") renderBulkPar();
  else if (view === "admin") renderAdmin(arg || "items", arg2);
  else renderLogin();

  if (state.session) refreshNotifBadge();
  measureStickyTops();
}

/** F-201/F-203: measure the real sticky header heights at runtime and expose
 *  them as CSS vars, so sticky bars sit exactly below the topnav (incl. notch)
 *  instead of hardcoding 57px. */
function measureStickyTops() {
  const nav = document.querySelector(".topnav");
  if (nav) document.documentElement.style.setProperty("--sticky-top", nav.offsetHeight + "px");
  const mode = document.querySelector(".mode-toggle");
  if (mode) document.documentElement.style.setProperty(
    "--sticky-top2", ((nav ? nav.offsetHeight : 57) + mode.offsetHeight) + "px");
}
window.addEventListener("resize", measureStickyTops);
window.addEventListener("orientationchange", () => setTimeout(measureStickyTops, 100));

function go(h) { if (location.hash === h) router(); else location.hash = h; }

/* ========================= TOP NAV ============================ */
function navHtml(title) {
  const p = state.session ? state.session.profile : {};
  const isSuper = p.role === "superadmin";
  return `<div class="topnav no-print">
    <div><button class="brand-btn" data-act="nav-home" aria-label="${esc(T("nav.homeAria"))}"><span class="brand"><span class="logo-badge nav-logo"><img src="logo.png" alt=""></span>Sumo Sushi Warm Springs</span></button></div>
    <div class="user"><span class="user-name">${esc(p.name || "")}</span><span class="user-role"> · ${esc(roleLabel(p.role))}</span></div>
    <div style="display:flex;gap:4px;align-items:center">
      <button class="btn btn-small btn-ghost" data-act="nav-theme" aria-label="${esc(T("nav.themeAria"))}" title="${esc(T("nav.themeAria"))}">${theme() === "light" ? "🌙" : "☀️"}</button>
      ${isSuper ? "" : `<button class="btn btn-small btn-ghost" data-act="nav-lang" aria-label="${esc(T("nav.langAria"))}" title="English / Español">🌐 ${lang() === "es" ? "EN" : "ES"}</button>`}
      ${state.session && canSchedView() ? `<button class="btn btn-small btn-ghost" data-act="nav-notif" aria-label="${esc(T("sched.notif"))}" style="position:relative">🔔<span id="notif-badge" style="display:none;position:absolute;top:-6px;right:-6px;background:#c0392b;color:#fff;font-size:11px;font-weight:700;min-width:18px;height:18px;line-height:18px;border-radius:9px;text-align:center;padding:0 4px"></span></button>` : ""}
      <button class="btn btn-small btn-ghost" data-act="nav-home" aria-label="${esc(T("nav.homeAria"))}">⌂</button>
      <button class="btn btn-small btn-ghost" data-act="nav-logout" aria-label="${esc(T("nav.logoutAria"))}">⎋</button>
    </div>
  </div>`;
}

/** Fire-and-forget unread badge on the 🔔 bell. Safe to call on every route. */
function refreshNotifBadge() {
  if (!state.session || !canSchedView()) return;
  edge("notif.list").then(r => {
    const el = document.getElementById("notif-badge");
    if (!el) return;
    const n = r.unread || 0;
    el.style.display = n ? "" : "none";
    el.textContent = n > 9 ? "9+" : String(n);
  }).catch(() => { /* backend predates notifications: no badge */ });
}

/** Notifications inbox: swap approved/denied messages and other alerts. */
async function renderNotif() {
  const notAuth = () => {
    $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div>
      <button class="btn" onclick="location.hash='#/home'">${esc(T("common.back"))}</button></div>`;
  };
  if (!canSchedView()) { notAuth(); return; }
  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("sched.notif"))}</h1>
    <div style="margin-bottom:12px" class="no-print"><button class="btn btn-small" id="notif-read-all">${esc(T("sched.markAllRead"))}</button></div>
    <div id="notif-body"><div class="loading">${esc(T("sched.loadingNotif"))}</div></div>
    <div style="margin-top:16px" class="no-print"><button class="btn" data-act="back-home">${esc(T("common.back"))}</button></div>
  </div>`;
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  const navLang = $app().querySelector('[data-act="nav-lang"]');
  if (navLang) navLang.onclick = () => { setLang(lang() === "es" ? "en" : "es"); router(); };
  const body = $app().querySelector("#notif-body");
  const fmtWhen = (iso) => {
    const d = new Date(String(iso || ""));
    return isNaN(d) ? "" : d.toLocaleString(locale(), { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
  };
  try {
    const r = await edge("notif.list");
    const ns = r.notifications || [];
    body.innerHTML = ns.length ? ns.map(n => `
      <div class="admin-card" data-notif="${esc(n.id)}" data-ref="${esc(n.ref_type || "")}" style="margin-bottom:10px;cursor:pointer;${n.read_at ? "" : "border-left:3px solid var(--accent);"}" role="button" tabindex="0">
        <div class="card-head"><div><strong>${esc(n.title)}</strong>
          ${n.body ? `<div class="muted" style="font-size:13px;margin-top:2px">${esc(n.body)}</div>` : ""}
          <div class="muted" style="font-size:12px;margin-top:4px">${esc(fmtWhen(n.created_at))}</div></div>
          ${n.read_at ? "" : `<span class="pill pill-zero">●</span>`}
        </div>
      </div>`).join("") : `<p class="muted">${esc(T("sched.notifEmpty"))}</p>`;
    refreshNotifBadge();
    document.getElementById("notif-read-all").onclick = async () => {
      try { await edge("notif.read", {}); } catch (e) { /* best effort */ }
      router();
    };
    body.querySelectorAll("[data-notif]").forEach(c => {
      const open = async () => {
        try { await edge("notif.read", { id: c.dataset.notif }); } catch (e) { /* best effort */ }
        go(c.dataset.ref === "schedule" ? "#/sched/my" : "#/sched/swaps");
      };
      c.onclick = open;
      c.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
    });
  } catch (e) {
    if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; }
    body.innerHTML = `<div class="error">${esc(e.detail || e.code || "Error")}</div>`;
  }
}

/* ======================= MODAL HELPERS ========================= */
function showModal(html) {
  closeModal();
  const back = document.createElement("div");
  back.className = "modal-back no-print";
  back.id = "modal-back";
  back.innerHTML = `<div class="modal">${html}</div>`;
  back.addEventListener("click", (e) => { if (e.target.id === "modal-back") closeModal(); });
  document.body.appendChild(back);
}
function closeModal() {
  const m = document.getElementById("modal-back");
  if (m) m.remove();
}

/** Promise-based confirm dialog with custom text. Stacks ABOVE any open modal
 *  (its own overlay) so cancelling never destroys the underlying editor.
 *  Pass danger=false for non-destructive confirms so the button isn't red. */
function confirmDialog(title, message, confirmLabel = null, cancelLabel = null, danger = true) {
  return new Promise((resolve) => {
    const back = document.createElement("div");
    back.className = "modal-back no-print";
    back.id = "modal-confirm";
    back.innerHTML = `<div class="modal"><h3>${esc(title)}</h3><p>${esc(message)}</p>
      <div class="modal-actions">
        <button class="btn" id="cf-no">${esc(cancelLabel || T("common.cancel"))}</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="cf-yes">${esc(confirmLabel || T("common.confirm"))}</button>
      </div></div>`;
    const done = (v) => { back.remove(); resolve(v); };
    back.addEventListener("click", (e) => { if (e.target === back) done(false); });
    document.body.appendChild(back);
    document.getElementById("cf-no").onclick = () => done(false);
    document.getElementById("cf-yes").onclick = () => done(true);
  });
}

/** Area picker modal -> resolves with area id or null. */
/** Flash an error at the top of the current view. */
function flashError(msg) {
  let el = document.getElementById("flash");
  if (!el) {
    el = document.createElement("div");
    el.id = "flash";
    el.className = "error";
    $app().prepend(el);
  }
  el.textContent = msg;
  el.scrollIntoView();
}

/* ====================== VIEW: LOGIN ============================ */
/* Numeric PIN pad. No placeholder, no hint, no default value —
 * nothing that suggests any particular PIN. */
function renderLogin() {
  const pad = { digits: "" };
  state._pad = pad;
  $app().innerHTML = `
  <div class="view pin-pad-wrap">
    <div style="text-align:center">
      <span class="logo-badge" style="width:84px;height:84px"><img src="logo.png" alt="Sumo Sushi logo" style="width:68px;height:68px"></span>
      <h1 style="margin:12px 0 0">Sumo Sushi Warm Springs</h1>
    </div>
    <p class="muted" style="text-align:center">${esc(T("login.prompt"))}</p>
    <div class="pin-dots" id="pin-dots" aria-live="polite"></div>
    <div id="login-err"></div>
    <div class="pin-pad" id="pin-pad">
      ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" data-k="${n}">${n}</button>`).join("")}
      <button class="pin-key" data-k="clear" aria-label="${esc(T("login.clearKey"))}">⌫</button>
      <button class="pin-key" data-k="0">0</button>
      <button class="pin-key" data-k="back" aria-label="${esc(T("login.backKey"))}">←</button>
    </div>
    <div style="margin-top:16px"><button class="btn btn-primary" id="pin-go" style="width:100%">${esc(T("login.signin"))}</button></div>
    <div style="text-align:center;margin-top:10px"><button class="btn btn-small btn-ghost" id="login-forgot">${esc(T("login.forgot"))}</button></div>
    <div style="text-align:center;margin-top:14px"><button class="btn btn-small btn-ghost" id="login-lang">🌐 ${esc(T("login.langToggle"))}</button></div>
  </div>`;

  const dots = () => document.getElementById("pin-dots").textContent = "•".repeat(pad.digits.length);
  document.getElementById("pin-pad").addEventListener("click", (e) => {
    const k = e.target.closest("[data-k]");
    if (!k) return;
    const key = k.dataset.k;
    if (key === "clear") pad.digits = "";
    else if (key === "back") pad.digits = pad.digits.slice(0, -1);
    else if (pad.digits.length < 8) pad.digits += key;
    dots();
  });
  document.getElementById("pin-go").onclick = () => doLogin(pad.digits);
  document.getElementById("login-forgot").onclick = () => {
    document.getElementById("login-err").innerHTML = `<div class="muted" style="text-align:center;padding:10px">${esc(T("login.forgotMsg"))}</div>`;
  };
  document.getElementById("login-lang").onclick = () => { setLang(lang() === "es" ? "en" : "es"); renderLogin(); };
  pad.digits = ""; dots();
  if (state.loginNotice) {
    document.getElementById("login-err").innerHTML = `<div class="notice">${esc(state.loginNotice)}</div>`;
    state.loginNotice = null;
  }
}

async function doLogin(pin) {
  const errBox = document.getElementById("login-err");
  errBox.innerHTML = "";
  if (!pin || pin.length < 1) {
    errBox.innerHTML = `<div class="error">${esc(T("login.needPin"))}</div>`;
    return;
  }
  try {
    // PIN travels only in this request body; it is never stored.
    const r = await edge("login", { pin });
    saveSession({ token: r.token, profile: r.profile });
    stampActive();
    // First-login accounts must change PIN before any other call is allowed.
    if (r.profile && r.profile.must_change_pin) { go("#/set-pin"); return; }
    const a = await edge("areas.list");
    state.areas = a.areas || a || [];
    const back = state.returnTo; state.returnTo = null;
    go(back || "#/home");
  } catch (e) {
    const msg = e.status === 429 ? T("login.rateLimited") : (e.detail || T("login.wrong"));
    errBox.innerHTML = `<div class="error">${esc(msg)}</div>`;
    if (state._pad) { state._pad.digits = ""; document.getElementById("pin-dots").textContent = ""; }
  }
}

/* ===================== VIEW: SET PIN =========================== */
/* Forced on first login (must_change_pin) or when the super admin resets a PIN.
 * PIN entered twice via the pad, minimum 4 digits, must match. */
function renderSetPin() {
  const st = { first: "", second: "", step: 1 };
  state._setpin = st;
  $app().innerHTML = `
  <div class="view pin-pad-wrap">
    <h1 style="text-align:center">${esc(T("setpin.title"))}</h1>
    <p class="muted" style="text-align:center" id="setpin-label">${esc(T("setpin.step1"))}</p>
    <div class="pin-dots" id="pin-dots" aria-live="polite"></div>
    <div id="setpin-err"></div>
    <div class="pin-pad" id="pin-pad">
      ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" data-k="${n}">${n}</button>`).join("")}
      <button class="pin-key" data-k="clear" aria-label="${esc(T("login.clearKey"))}">⌫</button>
      <button class="pin-key" data-k="0">0</button>
      <button class="pin-key" data-k="back" aria-label="${esc(T("login.backKey"))}">←</button>
    </div>
    <div style="margin-top:16px"><button class="btn btn-primary" id="pin-next" style="width:100%">${esc(T("common.continue"))}</button></div>
  </div>`;

  const cur = () => st.step === 1 ? st.first : st.second;
  const setCur = (v) => st.step === 1 ? st.first = v : st.second = v;
  const dots = () => document.getElementById("pin-dots").textContent = "•".repeat(cur().length);
  const err = (m) => document.getElementById("setpin-err").innerHTML = m ? `<div class="error">${esc(m)}</div>` : "";

  document.getElementById("pin-pad").addEventListener("click", (e) => {
    const k = e.target.closest("[data-k]");
    if (!k) return;
    const key = k.dataset.k;
    if (key === "clear") setCur("");
    else if (key === "back") setCur(cur().slice(0, -1));
    else if (cur().length < 8) setCur(cur() + key);
    dots();
  });

  document.getElementById("pin-next").onclick = async () => {
    err("");
    if (st.step === 1) {
      if (cur().length < 4) { err(T("setpin.min4")); return; }
      st.step = 2;
      document.getElementById("setpin-label").textContent = T("setpin.step2");
      dots();
    } else {
      if (st.first !== st.second) {
        err(T("setpin.mismatch"));
        st.first = ""; st.second = ""; st.step = 1;
        document.getElementById("setpin-label").textContent = T("setpin.step1");
        dots();
        return;
      }
      try {
        await edge("users.set-pin", { pin: st.second });
        if (state.session && state.session.profile) state.session.profile.must_change_pin = false;
        saveSession(state.session);
        go("#/home");
      } catch (e) {
        err(e.detail || T("setpin.fail"));
      }
    }
  };
  dots();
}

/* ====================== VIEW: HOME ============================= */
/* Role-based menu. `view` role sees read-only cards only. */
async function renderHome() {
  const p = state.session.profile;
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">${esc(T("common.loading"))}</div></div>`;
  try {
    const [s, v, it, sg] = await Promise.all([
      edge("sessions.list").catch(() => ({ sessions: [] })),
      edge("vendors.list").catch(() => ({ vendors: [] })),
      edge("items.list").catch(() => ({ items: [] })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.sessions = s.sessions || s || [];
    state.vendors = v.vendors || v || [];
    state.items = it.items || it || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
    // Home is a safe screen (no unsaved state): a pushed update refreshes
    // itself here automatically instead of waiting for a banner tap.
    if (autoRefreshIfStale()) return;
  } catch (e) {
    if (e.code === "unauthorized" || e.status === 401) { sessionExpired(); return; }
  }

  const canManage = has("manage");
  const isSuper = has("superadmin");

  const cards = [];
  cards.push(`<button class="menu-card" data-go="#/inv"><span class="ico">📋</span>${esc(T("home.inventory"))}</button>`);
  if (canSchedView()) cards.push(`<button class="menu-card" data-go="#/sched"><span class="ico">🗓️</span>${esc(T("tour.schedT"))}</button>`);
  if (canManage) cards.push(`<button class="menu-card" data-go="#/admin/items"><span class="ico">🗃️</span>${esc(T("home.manage"))}</button>`);
  if (isSuper) cards.push(`<button class="menu-card" data-go="#/admin/io"><span class="ico">⚙️</span>Super Admin</button>`);

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("home.hi"))}, ${esc(p.name)}</h1>
    <div class="menu-grid no-print">${cards.join("")}</div>
    ${isSuper ? "" : `<div style="text-align:center;margin-top:18px" class="no-print"><button class="btn btn-small btn-ghost" data-act="replay-tour">${esc(T("home.replay"))}</button></div>`}
  </div>`;

  $app().querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  const replay = $app().querySelector('[data-act="replay-tour"]');
  if (replay) replay.onclick = () => startTour(homeTourSteps(), () => {});

  // First-login guided tour (not for the super admin).
  const tourKey = "sumoV2tour_" + p.id;
  let tourSeen = false;
  try { tourSeen = !!localStorage.getItem(tourKey); } catch (e) { /* noop */ }
  if (!isSuper && !tourSeen) {
    setTimeout(() => startTour(homeTourSteps(), () => {
      try { localStorage.setItem(tourKey, "1"); } catch (e) { /* noop */ }
    }), 350);
  }
}

/* ================== VIEW: INVENTORY HOME ======================= */
/* Section home for everything inventory: new counts, draft counts, order
 * history. Reached from the Inventory tile on the home screen. */
async function renderInventory() {
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">${esc(T("common.loading"))}</div></div>`;
  try {
    const [s, v, it, sg] = await Promise.all([
      edge("sessions.list").catch(() => ({ sessions: [] })),
      edge("vendors.list").catch(() => ({ vendors: [] })),
      edge("items.list").catch(() => ({ items: [] })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.sessions = s.sessions || s || [];
    state.vendors = v.vendors || v || [];
    state.items = it.items || it || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
    if (autoRefreshIfStale()) return;
  } catch (e) {
    if (e.code === "unauthorized" || e.status === 401) { sessionExpired(); return; }
  }

  const drafts = state.sessions.filter(x => x.status === "draft");
  const canManage = has("manage");

  /* Par banner: visible to manager+ here. Nudges par setup so orders can generate. */
  let banner = "";
  if (canManage) {
    const active = state.items.filter(i => i.active !== false);
    const withPar = active.filter(i => Number(i.par) > 0).length;
    if (active.length > 0 && withPar < active.length / 2) {
      banner = `<div class="banner">${esc(T("home.parBanner"))} — ${withPar}/${active.length} ${esc(T("home.parBanner2"))}
        <a href="#/admin/par">${esc(T("home.openPar"))}</a></div>`;
    }
  }

  const cards = [];
  if (has("count")) {
    cards.push(`<button class="menu-card" data-go="#/count/new"><span class="ico">📋</span>${esc(T("home.start"))}</button>`);
  }
  cards.push(`<button class="menu-card" data-go="#/orders"><span class="ico">📦</span>${esc(T("home.orders"))}</button>`);
  if (!has("count")) cards.push(`<button class="menu-card" data-go="#/orders"><span class="ico">👁</span>${esc(T("home.viewOrders"))}</button>`);

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("home.inventory"))}</h1>
    ${banner}
    <div class="menu-grid no-print">${cards.join("")}</div>

    <h2>${esc(T("home.drafts"))}</h2>
    <div id="draft-list">
      ${drafts.length === 0 ? `<p class="muted">${esc(T("home.noDrafts"))}</p>` : drafts.map(d => `
        <div class="session-row">
          <div><strong>${esc(T("home.count"))} #${esc(String(d.id).slice(0, 8))}</strong>
            <div class="meta">${fmtDate(d.created_at)}${d.created_by_name ? " · " + esc(d.created_by_name) : ""}</div>
          </div>
          <div style="display:flex;gap:8px">
            ${has("approve") ? `<button class="btn btn-small" data-open-review="${esc(d.id)}">${esc(T("home.review"))}</button>` : ""}
            <button class="btn btn-small" data-open-count="${esc(d.id)}">${esc(has("count") ? T("home.resume") : T("home.view"))}</button>
            ${has("count") ? `<button class="btn btn-small btn-danger" data-abandon="${esc(d.id)}" aria-label="${esc(T("home.discard"))}">✕</button>` : ""}
          </div>
        </div>`).join("")}
    </div>
  </div>`;

  $app().querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
    if (b.dataset.go === "#/count/new") startNewCount();
    else go(b.dataset.go);
  });
  $app().querySelectorAll("[data-open-count]").forEach(b => b.onclick = () => go("#/count/" + b.dataset.openCount));
  $app().querySelectorAll("[data-open-review]").forEach(b => b.onclick = () => go("#/review/" + b.dataset.openReview));
  $app().querySelectorAll("[data-abandon]").forEach(b => b.onclick = async () => {
    if (await confirmDialog(T("home.abandonTitle"), T("home.abandonMsg"), T("home.discard"))) {
      try { await edge("sessions.abandon", { session_id: b.dataset.abandon }); renderInventory(); }
      catch (e) { flashError(e.detail || T("home.abandonFail")); }
    }
  });
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

async function startNewCount() {
  if (startNewCount._busy) return; // double-tap guard: one draft per tap
  startNewCount._busy = true;
  try {
    const r = await edge("sessions.create");
    const id = r.session_id || r.id || (r.session && r.session.id);
    if (!id) throw { detail: T("home.noSession") };
    go("#/count/" + id);
  } catch (e) {
    flashError(e.detail || T("home.startFail"));
  } finally {
    startNewCount._busy = false;
  }
}

/* ================== VIEW: BULK PAR EDITOR ====================== */
/* Simple table: item | par input, one Save. Linked from the Inventory banner. */
function renderBulkPar() {
  if (!has("manage")) { $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div></div>`; return; }
  const active = state.items.filter(i => i.active !== false);
  const rows = active.map(i => `
    <tr>
      <td>${esc(i.name)}<div class="muted" style="font-size:12px">${esc(itemAreas(i).map(a => a.name).filter(Boolean).join(", "))}</div></td>
      <td><input type="number" inputmode="decimal" min="0" step="0.25"
           data-par-for="${esc(i.id)}" value="${Number(i.par) > 0 ? esc(i.par) : ""}" placeholder="—"></td>
      <td><input type="number" inputmode="decimal" min="0" step="0.01"
           data-price-for="${esc(i.id)}" value="${Number(i.price) > 0 ? esc(i.price) : ""}" placeholder="—"></td>
    </tr>`).join("");
  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("par.title"))}</h1>
    <p class="muted">${esc(T("par.hint"))}</p>
    <table class="bulk-par">
      <thead><tr><th>${esc(T("common.item"))}</th><th>${esc(T("par.par"))}</th><th>${esc(T("par.price"))}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="display:flex;gap:10px;margin-top:16px" class="no-print">
      <button class="btn" data-act="back">${esc(T("common.back"))}</button>
      <button class="btn btn-primary" id="par-save" style="flex:1">${esc(T("par.saveAll"))}</button>
    </div>
    <div id="par-msg" style="margin-top:10px"></div>
  </div>`;
  $app().querySelector('[data-act="back"]').onclick = () => go("#/home");
  document.getElementById("par-save").onclick = async () => {
    const msg = document.getElementById("par-msg");
    msg.innerHTML = `<span class="muted">${esc(T("common.saving"))}</span>`;
    let n = 0;
    try {
      for (const inp of $app().querySelectorAll("[data-par-for]")) {
        const id = inp.dataset.parFor;
        const val = inp.value === "" ? 0 : Number(inp.value);
        const item = state.items.find(i => String(i.id) === String(id));
        if (item && Number(item.par || 0) !== val) {
          await edge("items.update", { item_id: id, par: val });
          item.par = val; n++;
        }
      }
      for (const inp of $app().querySelectorAll("[data-price-for]")) {
        const id = inp.dataset.priceFor;
        const val = inp.value === "" ? 0 : Number(inp.value);
        const item = state.items.find(i => String(i.id) === String(id));
        if (item && Number(item.price || 0) !== val) {
          await edge("items.update", { item_id: id, price: val });
          item.price = val; n++;
        }
      }
      msg.innerHTML = `<span style="color:var(--ok)">${esc(n === 1 ? T("par.saved1") : T("par.savedN").replace("{n}", n))}</span>`;
    } catch (e) { msg.innerHTML = `<div class="error">${esc(e.detail || T("par.saveFail"))}</div>`; }
  };
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

/* ---- small lookups ---- */
function areaName(id) { const a = state.areas.find(x => String(x.id) === String(id)); return a ? a.name : ""; }
function vendorOf(id) { return state.vendors.find(x => String(x.id) === String(id)) || {}; }
/** Items a vendor can supply: primary vendor_id or listed as an alternate
 *  vendor (items.alt_vendor_ids). Used by quick orders and the draft editor. */
function vendorItemsFor(vendorId) {
  const vid = String(vendorId || "");
  return (state.items || []).filter(i => i.active !== false &&
    (String(i.vendor_id || "") === vid ||
     (Array.isArray(i.alt_vendor_ids) && i.alt_vendor_ids.some(a => String(a) === vid))));
}
// Vendor-name sort: A→Z, unknown/no-vendor last.
function cmpVendor(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return String(a).localeCompare(String(b));
}
// Vendors that have active items, A→Z; a "__none__" entry (last) covers items with no vendor.
function vendorsUsed() {
  const ids = [...new Set(state.items.filter(i => i.active !== false).map(i => i.vendor_id || "__none__"))];
  return ids
    .map(id => id === "__none__" ? { id: "__none__", name: null } : vendorOf(id))
    .filter(v => v.id === "__none__" || v.name)
    .sort((a, b) => cmpVendor(a.name || null, b.name || null));
}

/* ====================== VIEW: COUNT ============================ */
/* #/count/:sessionId — the counting screen.
 * Status pills: not counted / counted / zero confirmed / done / needs review. */
async function renderCount(sessionId) {
  $app().innerHTML = navHtml() + `<div class="view" style="min-height:40vh"><div class="loading">${esc(T("count.loading"))}</div></div>`;
  try {
    const [it, v, a] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
    ]);
    state.items = it.items || it || [];
    state.vendors = v.vendors || v || [];
    state.areas = a.areas || a || [];
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; } }

  const editable = has("count");
  const highlight = new URLSearchParams(state.route.query || "").get("item");

  // Load existing entries for this session (PostgREST).
  let entries = {};
  try {
    const rows = await api("GET", `/entries?session_id=eq.${encodeURIComponent(sessionId)}&select=*`);
    for (const r of rows || []) entries[entryKey(r.item_id, r.area_id)] = { count: r.count, status: fromDbStatus(r.status), note: r.note };
  } catch (e) { /* session may be new / RLS edge — start empty */ }

  const activeItems = state.items.filter(i => i.active !== false);
  const areasUsed = state.areas.filter(a => activeItems.some(i => areaIdsOf(i).includes(String(a.id))));
  const firstArea = areasUsed[0] && areasUsed[0].id;
  const vendorsUsedList = vendorsUsed();
  const firstVendor = vendorsUsedList[0] && vendorsUsedList[0].id;

  const prevAreaId = state.count && state.count.areaId;
  const prevVendorId = state.count && state.count.vendorId;
  state.count = {
    sessionId, entries, search: "",
    mode: highlight ? "item" : (state.count && state.count.mode) || "location",
    sortBy: (state.count && state.count.sortBy) || "vendor",
    areaId: firstArea,
    vendorId: firstVendor,
    highlight: highlight || null,
  };
  // Keep the previously selected tab if it still has items.
  if (state.count.mode === "location" && prevAreaId &&
      areasUsed.some(a => String(a.id) === String(prevAreaId))) {
    state.count.areaId = prevAreaId;
  }
  if (state.count.mode === "vendor" && prevVendorId &&
      vendorsUsedList.some(v => String(v.id) === String(prevVendorId))) {
    state.count.vendorId = prevVendorId;
  }

  drawCount();
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

/** Items visible on the count screen for the current mode + search, sorted per the sort toggle. */
function sortCountItems(list, sortBy) {
  const arr = list.slice();
  const byVendor = (a, b) => cmpVendor(vendorOf(a.vendor_id).name || null, vendorOf(b.vendor_id).name || null)
    || a.name.localeCompare(b.name);
  if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "location") arr.sort((a, b) =>
    (primaryAreaOf(a)?.name || "").localeCompare(primaryAreaOf(b)?.name || "") || a.name.localeCompare(b.name));
  else arr.sort(byVendor); // "vendor" (default)
  return arr;
}

function visibleItems() {
  const c = state.count;
  const q = c.search.trim().toLowerCase();
  let items = state.items.filter(i => i.active !== false);
  if (c.mode === "location") items = items.filter(i => areaIdsOf(i).includes(String(c.areaId)));
  else if (c.mode === "vendor") items = items.filter(i => String(i.vendor_id || "__none__") === String(c.vendorId));
  items = sortCountItems(items, effectiveSort());
  if (q) items = items.filter(i => i.name.toLowerCase().includes(q));
  return items;
}

/** Resolve the sort toggle value to a real sort for the current mode. */
function effectiveSort() {
  const c = state.count;
  if (c.mode === "vendor") return c.sortBy === "location" ? "location" : "name";
  if (c.mode === "location" && c.sortBy === "location") return "vendor";
  return c.sortBy || "vendor";
}

function drawCount() {
  const c = state.count;
  const editable = has("count");
  const q = c.search.trim().toLowerCase();
  const items = visibleItems();

  const tabs = c.mode === "location" ? state.areas
    .filter(a => state.items.some(i => i.active !== false && areaIdsOf(i).includes(String(a.id))))
    .map(a => {
      const list = state.items.filter(i => i.active !== false && areaIdsOf(i).includes(String(a.id)));
      const done = list.filter(i => isDone(i.id, a.id)).length;
      return `<button class="area-tab ${String(a.id) === String(c.areaId) ? "active" : ""}" data-area="${esc(a.id)}">
        ${esc(a.name)}<span class="pill-mini">${done}/${list.length}</span></button>`;
    }).join("")
    : c.mode === "vendor" ? vendorsUsed().map(v => {
      const list = state.items.filter(i => i.active !== false && String(i.vendor_id || "__none__") === String(v.id));
      const done = list.filter(i => itemAreas(i).every(a => isDone(i.id, a.id))).length;
      return `<button class="area-tab ${String(v.id) === String(c.vendorId) ? "active" : ""}" data-vendor="${esc(v.id)}">
        ${esc(v.name || T("count.noVendor"))}<span class="pill-mini">${done}/${list.length}</span></button>`;
    }).join("") : "";

  // Sort options depend on the mode (sorting by vendor inside vendor mode is meaningless).
  const sortDefs = c.mode === "vendor"
    ? [["location", T("count.sortLocation")], ["name", T("count.sortName")]]
    : c.mode === "item"
      ? [["vendor", T("count.sortVendor")], ["location", T("count.sortLocation")], ["name", T("count.sortName")]]
      : [["vendor", T("count.sortVendor")], ["name", T("count.sortName")]];
  const effSort = effectiveSort();

  $app().innerHTML = navHtml() + `
  <div class="view" style="padding-top:0">
    <div class="mode-toggle no-print" role="tablist">
      <button class="mode-btn ${c.mode === "location" ? "active" : ""}" data-mode="location">${esc(T("count.byLocation"))}</button>
      <button class="mode-btn ${c.mode === "vendor" ? "active" : ""}" data-mode="vendor">${esc(T("count.byVendor"))}</button>
      <button class="mode-btn ${c.mode === "item" ? "active" : ""}" data-mode="item">${esc(T("count.byItem"))}</button>
    </div>
    ${c.mode === "location" || c.mode === "vendor" ? `<div class="area-tabs no-print">${tabs}</div>` : ""}

    <div class="ai-bar no-print">
      <div class="ai-row">
        <input class="ai-input" id="ai-text" placeholder="${esc(T("count.aiPh"))}" aria-label="AI count input">
        <button class="btn btn-small" id="ai-mic" aria-label="${esc(T("count.dictateAria"))}">🎤</button>
      </div>
      <div class="ai-row" style="margin-top:8px">
        <button class="btn btn-primary" id="ai-parse" style="flex:1">${esc(T("count.aiParse"))}</button>
      </div>
      <div id="ai-out"></div>
    </div>

    <input class="searchbar no-print" id="item-search" placeholder="${esc(T("count.search"))}" value="${esc(c.search)}" aria-label="${esc(T("count.search"))}">

    <div class="sort-toggle no-print" role="tablist">
      ${sortDefs.map(([k, label]) => `<button class="mode-btn ${effSort === k ? "active" : ""}" data-sort="${k}">${esc(label)}</button>`).join("")}
    </div>

    <div id="cards">
      ${items.length === 0 ? `<p class="muted">${esc(T("count.noItems"))}${q ? esc(T("count.noItemsSearch")) : ""}.</p>` : items.map(i => c.mode === "location" ? itemCardHtml(i, c.areaId, editable) : itemGroupHtml(i, editable)).join("")}
    </div>

    <div style="display:flex;gap:10px;margin:18px 0" class="no-print">
      <button class="btn" data-act="back-home">${esc(T("common.back"))}</button>
      ${has("approve") ? `<button class="btn btn-primary" data-act="to-review" style="flex:1">${esc(T("count.toReview"))}</button>` : ""}
    </div>
  </div>`;

  // --- mode toggle ---
  $app().querySelectorAll("[data-mode]").forEach(b => b.onclick = () => {
    if (c.mode !== b.dataset.mode) {
      c.mode = b.dataset.mode; c.highlight = null;
      if (c.mode === "location" && c.sortBy === "location") c.sortBy = "vendor";
      if (c.mode === "vendor") {
        const vu = vendorsUsed();
        if (!vu.some(v => String(v.id) === String(c.vendorId))) c.vendorId = vu[0] && vu[0].id;
      }
      drawCount();
    }
  });

  // --- sort toggle ---
  $app().querySelectorAll("[data-sort]").forEach(b => b.onclick = () => {
    if (c.sortBy !== b.dataset.sort) { c.sortBy = b.dataset.sort; drawCount(); }
  });

  // --- area tabs ---
  $app().querySelectorAll("[data-area]").forEach(t => t.onclick = () => {
    c.areaId = t.dataset.area; c.highlight = null; drawCount();
  });

  // --- vendor tabs ---
  $app().querySelectorAll("[data-vendor]").forEach(t => t.onclick = () => {
    c.vendorId = t.dataset.vendor; c.highlight = null; drawCount();
  });

  // --- search ---
  const search = document.getElementById("item-search");
  search.addEventListener("input", () => { c.search = search.value; drawCountKeepFocus(); });

  // --- AI parse ---
  document.getElementById("ai-parse").onclick = () => aiParse();
  document.getElementById("ai-mic").onclick = () => aiDictate();

  // --- card controls (event delegation) ---
  const cards = document.getElementById("cards");
  cards.addEventListener("click", onCardClick);
  cards.addEventListener("change", onCardChange);

  // --- nav buttons ---
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/inv");
  const toRev = $app().querySelector('[data-act="to-review"]');
  if (toRev) toRev.onclick = async () => {
    if (!(await flushEntrySaves())) { flashError(T("count.flushFail")); return; }
    go("#/review/" + c.sessionId);
  };
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;

  // --- highlight a jumped-to item (from Review) ---
  if (c.highlight) {
    const el = cards.querySelector(`[data-card="${CSS.escape(c.highlight)}"]`);
    if (el) { el.classList.add("flash"); el.scrollIntoView({ block: "center" }); }
  }

  // --- first-open guided tour ("this is what you put in") ---
  maybeCountTour(items);
}

/** Re-render after search typing without losing input focus. */
function drawCountKeepFocus() {
  const v = document.getElementById("item-search");
  const pos = v.selectionStart;
  drawCount();
  const n = document.getElementById("item-search");
  n.focus(); n.setSelectionRange(pos, pos);
}

/* ---- entry helpers ---- */
// An item's locations, primary first. Falls back to the legacy area_id.
function itemAreas(item) {
  if (item.areas && item.areas.length) return item.areas;
  if (item.area_id) return [{ id: item.area_id, name: item.area_name || areaName(item.area_id) }];
  return [];
}
function areaIdsOf(item) { return itemAreas(item).map(a => String(a.id)); }
function primaryAreaOf(item) { const a = itemAreas(item); return a[0] || null; }

function entryKey(itemId, areaId) { return `${itemId}::${areaId ?? ""}`; }
function entryOf(itemId, areaId) { return state.count.entries[entryKey(itemId, areaId)] || null; }

function statusOf(itemId, areaId) {
  const e = entryOf(itemId, areaId);
  if (!e) return "not";
  return e.status || "counted";
}
function isDone(itemId, areaId) { const s = statusOf(itemId, areaId); return s === "done" || s === "counted" || s === "zero" || s === "review"; }

/** Aggregate status of an item across all its locations. */
function itemStatus(item) {
  const sts = itemAreas(item).map(a => statusOf(item.id, a.id));
  if (!sts.length || sts.every(s => s === "not")) return "not";
  if (sts.some(s => s === "review")) return "review";
  if (sts.every(s => s === "done")) return "done";
  if (sts.every(s => s === "zero")) return "zero";
  return "counted";
}
/** Total on hand across all locations. */
function itemTotal(item) {
  return r025(itemAreas(item).reduce((t, a) => {
    const e = entryOf(item.id, a.id);
    return t + (e ? Number(e.count) || 0 : 0);
  }, 0));
}
/** Location ids of this item that have no entry yet. */
function missingAreaIds(item) {
  return areaIdsOf(item).filter(id => !entryOf(item.id, id));
}

function pillHtml(item, areaId) {
  const s = areaId === undefined ? itemStatus(item) : statusOf(item.id, areaId);
  const map = {
    not:     ["pill-not", T("pill.not")],
    counted: ["pill-counted", T("pill.counted")],
    zero:    ["pill-zero", T("pill.zero")],
    done:    ["pill-done", T("pill.done")],
    review:  ["pill-review", T("pill.review")],
  };
  const [cls, label] = map[s] || map.not;
  return `<span class="pill ${cls}">${esc(label)}</span>`;
}

/** Total-vs-par line shown when an item lives in more than one location. */
function totalLineHtml(item) {
  const areas = itemAreas(item);
  if (areas.length < 2 || Number(item.par) <= 0) return "";
  return `<div class="total-line">${esc(T("count.totalLine").replace("{t}", fmtCount(itemTotal(item))).replace("{p}", fmtCount(item.par)))}</div>`;
}

/** The count controls (steppers, quick keys, zero/done) for one item+location. */
function countControlsHtml(item, areaId) {
  const e = entryOf(item.id, areaId);
  return `<div class="count-row">
      <button class="stepper" data-cact="dec" aria-label="${esc(T("count.dec"))}">−</button>
      <input class="count-input" data-cact="manual" inputmode="decimal" placeholder="—"
             value="${e ? esc(fmtCount(e.count)) : ""}" aria-label="${esc(T("count.countFor"))} ${esc(item.name)}">
      <button class="stepper" data-cact="inc" aria-label="${esc(T("count.inc"))}">+</button>
    </div>
    <div class="hint" data-hint></div>
    <div class="quick-row">
      <button class="btn" data-cact="set0">0</button>
      <button class="btn" data-cact="add025">+0.25</button>
      <button class="btn" data-cact="add05">+0.5</button>
      <button class="btn" data-cact="add075">+0.75</button>
      <button class="btn" data-cact="full">${esc(T("count.full"))}</button>
      <button class="btn" data-cact="clear">${esc(T("login.clearKey"))}</button>
    </div>
    <div class="row2">
      <button class="btn" data-cact="markzero">${esc(T("count.markZero"))}</button>
      <button class="btn ${statusOf(item.id, areaId) === "done" ? "done-on" : ""}" data-cact="done">${esc(T("count.doneBtn"))}</button>
    </div>`;
}

/** Location mode: one card per item for the current area tab. */
function itemCardHtml(item, areaId, editable) {
  const e = entryOf(item.id, areaId);
  const v = vendorOf(item.vendor_id);
  const sub = [v.name, item.par > 0 ? `par ${fmtCount(item.par)}` : T("count.noPar"), item.unit].filter(Boolean).join(" · ");
  const canManage = has("manage");

  if (!editable) {
    return `<div class="item-card" data-card="${esc(item.id)}" data-area="${esc(areaId ?? "")}">
      <div class="card-head"><div><div class="item-name">${esc(item.name)}</div>
      <div class="item-sub">${esc(sub)}</div></div>${pillHtml(item, areaId)}</div>
      <div class="readonly-count">${e ? fmtCount(e.count) + (item.unit ? " " + esc(item.unit) : "") : "—"}</div>
    </div>`;
  }

  return `<div class="item-card" data-card="${esc(item.id)}" data-area="${esc(areaId ?? "")}">
    <div class="card-head"><div><div class="item-name">${esc(item.name)}</div>
      <div class="item-sub">${esc(sub)}</div></div>${pillHtml(item, areaId)}</div>
    ${totalLineHtml(item)}
    ${countControlsHtml(item, areaId)}
    ${canManage ? `<div class="admin-extras">
        <span class="par-edit">${esc(T("par.par"))} <input inputmode="decimal" data-cact="par" value="${Number(item.par) > 0 ? esc(item.par) : ""}" placeholder="—" aria-label="${esc(T("count.parFor"))} ${esc(item.name)}"></span>
        <button class="btn btn-small" data-cact="areas">${esc(T("count.areasBtn"))}</button>
      </div>` : ""}
  </div>`;
}

/** Item mode: one card per item with a section for each of its locations. */
function itemGroupHtml(item, editable) {
  const v = vendorOf(item.vendor_id);
  const sub = [v.name, item.par > 0 ? `par ${fmtCount(item.par)}` : T("count.noPar"), item.unit].filter(Boolean).join(" · ");
  const canManage = has("manage");
  const areas = itemAreas(item);

  const rowsHtml = areas.map((a, ix) => {
    const e = entryOf(item.id, a.id);
    const inner = editable ? countControlsHtml(item, a.id)
      : `<div class="readonly-count">${e ? fmtCount(e.count) + (item.unit ? " " + esc(item.unit) : "") : "—"}</div>`;
    return `<div class="area-row" data-card="${esc(item.id)}" data-area="${esc(a.id)}">
      <div class="area-row-head"><span>${esc(a.name)}${ix === 0 && areas.length > 1 ? " ★" : ""}</span>${pillHtml(item, a.id)}</div>
      ${inner}
    </div>`;
  }).join("");

  return `<div class="item-card item-group" data-card="${esc(item.id)}">
    <div class="card-head"><div><div class="item-name">${esc(item.name)}</div>
      <div class="item-sub">${esc(sub)}</div></div>${pillHtml(item)}</div>
    ${totalLineHtml(item)}
    ${rowsHtml}
    ${canManage ? `<div class="admin-extras">
        <span class="par-edit">${esc(T("par.par"))} <input inputmode="decimal" data-cact="par" value="${Number(item.par) > 0 ? esc(item.par) : ""}" placeholder="—" aria-label="${esc(T("count.parFor"))} ${esc(item.name)}"></span>
        <button class="btn btn-small" data-cact="areas">${esc(T("count.areasBtn"))}</button>
      </div>` : ""}
  </div>`;
}

function itemById(id) { return state.items.find(i => String(i.id) === String(id)); }

/* ---- counting actions ---- */
function onCardClick(ev) {
  const btn = ev.target.closest("[data-cact]");
  if (!btn) return;
  const card = ev.target.closest("[data-card]");
  const item = itemById(card.dataset.card);
  const areaId = card.dataset.area || state.count.areaId || null;
  const act = btn.dataset.cact;
  const cur = entryOf(item.id, areaId);
  const curCount = cur ? Number(cur.count) : null;

  if (act === "inc") setCount(item, areaId, r025((curCount == null ? 0 : curCount) + 0.5), "counted");
  else if (act === "dec") setCount(item, areaId, r025((curCount == null ? 0 : curCount) - 0.5), "counted");
  else if (act === "set0") setCount(item, areaId, 0, "counted");
  else if (act === "add025") setCount(item, areaId, r025((curCount == null ? 0 : curCount) + 0.25), "counted");
  else if (act === "add05") setCount(item, areaId, r025((curCount == null ? 0 : curCount) + 0.5), "counted");
  else if (act === "add075") setCount(item, areaId, r025((curCount == null ? 0 : curCount) + 0.75), "counted");
  else if (act === "full") fullCount(item, areaId, card);
  else if (act === "clear") clearEntry(item, areaId);
  else if (act === "markzero") setCount(item, areaId, 0, "zero");
  else if (act === "done") toggleDone(item, areaId);
  else if (act === "areas") editItemAreas(item);
}

function onCardChange(ev) {
  const el = ev.target.closest("[data-cact]");
  if (!el) return;
  const card = ev.target.closest("[data-card]");
  const item = itemById(card.dataset.card);
  const areaId = card.dataset.area || state.count.areaId || null;
  if (el.dataset.cact === "manual") {
    const v = el.value.trim();
    if (v === "") return;
    const n = Number(v);
    const cur = entryOf(item.id, areaId);
    if (isNaN(n) || n < 0) { el.value = cur ? fmtCount(cur.count) : ""; return; }
    setCount(item, areaId, r025(n), "counted");
  } else if (el.dataset.cact === "par") {
    const n = el.value.trim() === "" ? 0 : Number(el.value);
    if (isNaN(n) || n < 0) return;
    edge("items.update", { item_id: item.id, par: n })
      .then(() => { item.par = n; drawCount(); })
      .catch(e => flashError(e.detail || T("count.parFail")));
  }
}

/** "Full" semantics: if par>0 set count=par; otherwise open the manual
 *  entry with a hint — NEVER silently set 0 (that was the v1 bug). */
function fullCount(item, areaId, card) {
  // Par is the TOTAL across all locations: filling every location to par
  // would record multiples of par. Disable Full for multi-location items.
  if (areaIdsOf(item).length > 1) {
    const hint = card.querySelector("[data-hint]");
    if (hint) hint.textContent = T("count.fullMultiHint");
    return;
  }
  const par = Number(item.par) || 0;
  if (par > 0) {
    setCount(item, areaId, r025(par), "counted");
  } else {
    const hint = card.querySelector("[data-hint]");
    if (hint) hint.textContent = T("count.noParHint");
    const inp = card.querySelector('[data-cact="manual"]');
    if (inp) { inp.focus(); inp.select(); }
  }
}

function setCount(item, areaId, n, status) {
  if (n < 0) n = 0;
  const key = entryKey(item.id, areaId);
  state.count.entries[key] = { count: r025(n), status: status || "counted", note: (entryOf(item.id, areaId) || {}).note || null };
  persistEntry(item, areaId);
  drawCount();
}

/* Entry statuses: the UI uses short names (zero/review/done/counted) while the
 * database uses zero_confirmed/needs_review. Map at the save/load boundary. */
const toDbStatus = (s) => s === "review" ? "needs_review" : s === "zero" ? "zero_confirmed" : s === "done" ? "done" : (s || "counted");
const fromDbStatus = (s) => s === "needs_review" ? "review" : s === "zero_confirmed" ? "zero" : (s || "counted");

function clearEntry(item, areaId) {
  delete state.count.entries[entryKey(item.id, areaId)];
  // Remove from the server too (fire-and-forget; server also gates by role/session state).
  let q = `/entries?session_id=eq.${encodeURIComponent(state.count.sessionId)}&item_id=eq.${encodeURIComponent(item.id)}`;
  q += areaId ? `&area_id=eq.${encodeURIComponent(areaId)}` : `&area_id=is.null`;
  api("DELETE", q).catch(() => {});
  drawCount();
}

function toggleDone(item, areaId) {
  const key = entryKey(item.id, areaId);
  const cur = entryOf(item.id, areaId);
  if (statusOf(item.id, areaId) === "done") {
    state.count.entries[key] = { count: cur.count, status: "counted", note: cur.note };
  } else {
    state.count.entries[key] = { count: cur ? cur.count : 0, status: "done", note: cur ? cur.note : null };
  }
  persistEntry(item, areaId);
  drawCount();
}

/** Upsert entry to PostgREST: POST with Prefer: resolution=merge-duplicates
 *  and on_conflict=session_id,item_id,area_id. Debounced per item+area. */
function persistEntry(item, areaId) {
  const key = entryKey(item.id, areaId);
  clearTimeout(state.saveTimers[key]);
  state.saveTimers[key] = setTimeout(() => {
    delete state.saveTimers[key]; // fired — no longer "pending"
    saveEntryNow(item, areaId);
  }, 400);
}
/** Immediate save of one entry (the debounced body, extracted). The promise
 *  is tracked in state.saveInFlight so flushEntrySaves can await saves whose
 *  timers already fired. Resolves true on success, false on failure. */
async function saveEntryNow(item, areaId) {
  const key = entryKey(item.id, areaId);
  const e = entryOf(item.id, areaId);
  if (!e) return true;
  const p = (async () => {
    try {
      await api("POST", "/entries?on_conflict=session_id,item_id,area_id",
        {
          session_id: state.count.sessionId,
          item_id: item.id,
          area_id: areaId || null,
          count: e.count,
          status: toDbStatus(e.status),
          note: e.note || null,
          updated_by: state.session.profile.id,
        },
        { "Prefer": "resolution=merge-duplicates" });
      return { ok: true };
    } catch (err) {
      return { ok: false, err };
    }
  })();
  state.saveInFlight[key] = p; // registered synchronously — flush sees it
  const res = await p;
  if (state.saveInFlight[key] === p) delete state.saveInFlight[key];
  if (!res.ok) flashError(T("count.saveFail").replace("{name}", item.name));
  return res.ok;
}
/** Flush every pending or in-flight entry save right now. Call before Review
 *  and before Approve so the last typed number can never be lost. Resolves
 *  true only if every save succeeded — callers must NOT proceed on false. */
async function flushEntrySaves() {
  // Fire pending debounced saves immediately instead of waiting.
  const keys = Object.keys(state.saveTimers);
  for (const k of keys) {
    clearTimeout(state.saveTimers[k]);
    delete state.saveTimers[k];
    const sep = k.indexOf("::");
    const item = (state.items || []).find(i => String(i.id) === k.slice(0, sep));
    if (item) saveEntryNow(item, k.slice(sep + 2) || null);
  }
  // Await everything in flight, including saves whose timers already fired.
  const results = await Promise.all(Object.values(state.saveInFlight));
  return results.every(r => r && r.ok);
}

/** Manager+: edit which locations an item lives in (first checked = primary). */
async function editItemAreas(item) {
  const sel = areaIdsOf(item);
  showModal(`<h3>${esc(T("count.areasTitle").replace("{name}", item.name))}</h3>
    <p class="muted">${esc(T("count.areasHint"))}</p>
    <div class="check-list">${state.areas.map(a => `
      <label class="check"><input type="checkbox" data-ea value="${esc(a.id)}" ${sel.includes(String(a.id)) ? "checked" : ""}> ${esc(a.name)}</label>`).join("")}
    </div>
    <div id="ea-err"></div>
    <div class="modal-actions">
      <button class="btn" id="ea-cancel">${esc(T("common.cancel"))}</button>
      <button class="btn btn-primary" id="ea-save">${esc(T("common.save"))}</button>
    </div>`);
  document.getElementById("ea-cancel").onclick = () => closeModal();
  document.getElementById("ea-save").onclick = async () => {
    const ids = [...document.querySelectorAll("[data-ea]:checked")].map(b => b.value);
    const err = document.getElementById("ea-err");
    try {
      await edge("items.update", { item_id: item.id, area_ids: ids });
      item.areas = ids.map(id => { const a = state.areas.find(x => String(x.id) === String(id)); return { id, name: a ? a.name : "" }; }).filter(a => a.name);
      item.area_ids = ids.map(String);
      item.area_id = ids[0] || null;
      item.area_name = item.areas[0] ? item.areas[0].name : "";
      closeModal();
      drawCount();
    } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.saveItemFail"))}</div>`; }
  };
}

/* ---- AI: parse + dictate ---- */
async function aiParse() {
  const out = document.getElementById("ai-out");
  const text = document.getElementById("ai-text").value.trim();
  if (!text) { out.innerHTML = `<div class="error">${esc(T("count.aiNeedText"))}</div>`; return; }
  out.innerHTML = `<p class="muted">${esc(T("count.aiParsing"))}</p>`;
  try {
    const r = await edge("ai-parse", { session_id: state.count.sessionId, text });
    // Edge returns {matches:[{item_id, quantity, unit_note, confidence}], unknown:[...]}.
    const drafts = (r.matches || r.drafts || []).map(d => ({
      item_id: d.item_id, name: d.name,
      qty: d.quantity ?? d.qty, unit_note: d.unit_note, confidence: d.confidence,
    }));
    const unknown = r.unknown || [];
    const unknownHtml = unknown.length
      ? `<p class="muted">${esc(T("count.aiUnknown"))}${esc(unknown.join(", "))}</p>` : "";
    if (!drafts.length) { out.innerHTML = `<p class="muted">${esc(T("count.aiNoMatch"))}</p>${unknownHtml}`; return; }
    out.innerHTML = `<div class="ai-drafts">
      ${drafts.map((d, i) => {
        const it = itemById(d.item_id) || {};
        return `<label class="ai-draft">
          <input type="checkbox" data-draft="${i}" checked>
          <span><strong>${esc(d.name || it.name || "Unknown")}</strong>
          — ${esc(fmtCount(d.qty))}${d.unit_note ? " " + esc(d.unit_note) : ""}
          <span class="conf">${d.confidence != null ? Math.round(d.confidence * 100) + "%" : ""}</span></span>
        </label>`;
      }).join("")}
      <button class="btn btn-primary" id="ai-apply" style="width:100%">${esc(T("count.aiApply"))}</button>
      ${unknownHtml}
    </div>`;
    out._drafts = drafts;
    document.getElementById("ai-apply").onclick = () => {
      const boxes = out.querySelectorAll("[data-draft]");
      let n = 0;
      boxes.forEach(b => {
        if (!b.checked) return;
        const d = out._drafts[Number(b.dataset.draft)];
        const item = itemById(d.item_id);
        if (!item) return;
        // Low-confidence parses go to review rather than being silently trusted.
        const status = (d.confidence != null && d.confidence < 0.5) ? "review" : "counted";
        const areaId = (primaryAreaOf(item) || {}).id || null;
        const key = entryKey(item.id, areaId);
        state.count.entries[key] = { count: r025(d.qty), status, note: "AI-parsed" };
        persistEntry(item, areaId);
        n++;
      });
      document.getElementById("ai-text").value = "";
      out.innerHTML = `<p class="muted">${esc(n === 1 ? T("count.aiApplied1") : T("count.aiAppliedN").replace("{n}", n))}</p>`;
      drawCount();
    };
  } catch (e) {
    if (e.code === "ai_not_configured") {
      out.innerHTML = `<div class="notice">${esc(T("count.aiNoKey"))}</div>`;
    } else {
      out.innerHTML = `<div class="error">${esc(e.detail || T("count.aiFail"))}</div>`;
    }
  }
}

/** Voice dictation via webkitSpeechRecognition; graceful fallback hint. */
function aiDictate() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    const out = document.getElementById("ai-out");
    out.innerHTML = `<div class="notice">${esc(T("count.noVoice"))}</div>`;
    return;
  }
  try {
    const rec = new SR();
    rec.lang = locale();
    const btn = document.getElementById("ai-mic");
    btn.textContent = "⏺";
    rec.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      const inp = document.getElementById("ai-text");
      inp.value = (inp.value ? inp.value + " " : "") + t;
      btn.textContent = "🎤";
    };
    rec.onerror = rec.onend = () => { btn.textContent = "🎤"; };
    rec.start();
  } catch (e) {
    document.getElementById("ai-out").innerHTML = `<div class="notice">${esc(T("count.noVoice"))}</div>`;
  }
}

/* ===================== GUIDED TOUR ============================= */
/* First-login walkthrough so staff don't need a verbal briefing:
 *  - home tour: first Home visit (staff/manager/view; not superadmin)
 *  - count tour: first count-screen open ("this is what you put in")
 * Per device + profile, skippable, replayable from Home. */
function startTour(steps, onEnd) {
  if (!steps.length) { if (onEnd) onEnd(); return; }
  if (document.getElementById("tour-ov")) return; // one tour at a time
  let i = 0, ended = false;
  const ov = document.createElement("div");
  ov.id = "tour-ov";
  ov.className = "no-print";
  ov.innerHTML = `<div class="tour-dim"></div>
    <div class="tour-ring" id="tour-ring" hidden></div>
    <div class="tour-card">
      <div class="tour-step" id="tour-step"></div>
      <h3 id="tour-title"></h3>
      <p id="tour-body"></p>
      <div class="tour-actions">
        <button class="btn btn-small" id="tour-skip"></button>
        <button class="btn btn-primary btn-small" id="tour-next"></button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const dim = ov.querySelector(".tour-dim");
  const ring = ov.querySelector("#tour-ring");
  function end() {
    if (ended) return; ended = true;
    ov.remove();
    if (onEnd) onEnd();
  }
  function show() {
    const s = steps[i];
    const el = s.sel ? document.querySelector(s.sel) : null;
    if (el) {
      // Instant scroll, then measure — reliable on mobile (smooth scroll
      // would leave the ring mispositioned mid-animation).
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      ring.hidden = false;
      ring.style.left = Math.max(4, r.left - 6) + "px";
      ring.style.top = Math.max(4, r.top - 6) + "px";
      ring.style.width = (r.width + 12) + "px";
      ring.style.height = (r.height + 12) + "px";
      dim.style.display = "none"; // the ring's shadow is the dim now
    } else {
      ring.hidden = true;
      dim.style.display = "";
    }
    document.getElementById("tour-step").textContent = (i + 1) + " / " + steps.length;
    document.getElementById("tour-title").textContent = s.title;
    document.getElementById("tour-body").textContent = s.body;
    document.getElementById("tour-skip").textContent = T("tour.skip");
    document.getElementById("tour-next").textContent = i === steps.length - 1 ? T("tour.done") : T("tour.next");
  }
  document.getElementById("tour-skip").onclick = end;
  document.getElementById("tour-next").onclick = () => { i++; if (i >= steps.length) end(); else show(); };
  show();
}

function homeTourSteps() {
  const steps = [{ sel: null, title: T("tour.welcomeT"), body: T("tour.welcomeB") }];
  steps.push({ sel: '[data-go="#/inv"]', title: T("home.inventory"), body: T("tour.invB") });
  if (canSchedView()) steps.push({ sel: '[data-go="#/sched"]', title: T("tour.schedT"), body: T("tour.schedB") });
  steps.push({ sel: '[data-act="nav-lang"]', title: T("tour.langT"), body: T("tour.langB") });
  return steps;
}

function countTourSteps() {
  return [
    { sel: ".item-card .count-input", title: T("tour.c1T"), body: T("tour.c1B") },
    { sel: ".area-tabs", title: T("admin.areas"), body: T("tour.c2B") },
    { sel: ".item-card .quick-row", title: T("tour.c3T"), body: T("tour.c3B") },
  ];
}

/** First-open tour for the count screen. Flag is set before showing so
 *  re-renders (every keystroke) can never retrigger it. */
function maybeCountTour(items) {
  if (!state.session || has("superadmin")) return;
  if (!items || !items.length) return;
  if (state._countTourShown) return;
  let seen = false;
  try { seen = !!localStorage.getItem("sumoV2tour_count_" + state.session.profile.id); } catch (e) { /* noop */ }
  if (seen) return;
  state._countTourShown = true;
  try { localStorage.setItem("sumoV2tour_count_" + state.session.profile.id, "1"); } catch (e) { /* noop */ }
  setTimeout(() => startTour(countTourSteps(), () => {}), 500);
}

/* ===================== VIEW: REVIEW ============================ */
/* #/review/:sessionId — approve draft counts.
 * Sections: "Not counted" + "Needs review" (v1 omitted the latter). */
async function renderReview(sessionId) {
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">${esc(T("review.loading"))}</div></div>`;
  try {
    const [it, v, a, p, sg] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
      edge("pools.list").catch(() => ({ pools: state.pools })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.items = it.items || it || [];
    state.vendors = v.vendors || v || [];
    state.areas = a.areas || a || [];
    state.pools = p.pools || p || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; } }

  let rows = [];
  try {
    rows = await api("GET", `/entries?session_id=eq.${encodeURIComponent(sessionId)}&select=*`) || [];
    rows = rows.map(r => ({ ...r, status: fromDbStatus(r.status) }));
  } catch (e) { /* keep empty */ }

  // Session status decides whether "Approve count" may be offered at all.
  // (Tapping approve on an already-approved session just 409s.)
  let sessionStatus = "draft";
  try {
    const srows = await api("GET", `/sessions?id=eq.${encodeURIComponent(sessionId)}&select=status`) || [];
    if (srows[0] && srows[0].status) sessionStatus = srows[0].status;
  } catch (e) { /* keep draft */ }

  // Entries are per (item, location): aggregate to one total per item.
  // Ordering compares the TOTAL on hand against the single item par.
  const byItem = {};
  for (const r of rows) {
    const b = byItem[r.item_id] || (byItem[r.item_id] = { total: 0, rows: [] });
    b.total = r025(b.total + (Number(r.count) || 0));
    b.rows.push(r);
  }
  const activeItems = state.items.filter(i => i.active !== false);
  const notCounted = activeItems.filter(i => !byItem[i.id]);
  const needsReview = activeItems.filter(i => byItem[i.id] && byItem[i.id].rows.some(r => r.status === "review"));
  const partialItems = activeItems.filter(i => {
    const b = byItem[i.id];
    return b && areaIdsOf(i).some(id => !b.rows.some(r => String(r.area_id) === String(id)));
  });

  state.review = { sessionId, flags: [], aiRan: false, blocking: null, blockCode: null, blockDetail: null, sessionStatus, _byItem: byItem };

  const canApprove = has("approve");
  drawReview(notCounted, needsReview, partialItems, canApprove);
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

function drawReview(notCounted, needsReview, partialItems, canApprove) {
  const c = state.review;
  const byItem = c._byItem || {};

  // Per-item detail: per-location counts, total vs par, and any missing locations.
  const detailFor = (i, fallbackLabel) => {
    const b = byItem[i.id];
    if (!b) {
      const where = itemAreas(i).map(a => a.name).filter(Boolean).join(", ");
      return [where, fallbackLabel].filter(Boolean).join(" · ");
    }
    const parts = b.rows.map(r => `${areaName(r.area_id)}: ${fmtCount(r.count)}`);
    const missing = areaIdsOf(i).filter(id => !b.rows.some(r => String(r.area_id) === String(id)));
    let s = parts.join(" · ") + " → " +
      T("count.totalLine").replace("{t}", fmtCount(b.total)).replace("{p}", fmtCount(i.par));
    if (missing.length) s += ` (${T("review.missingIn").replace("{areas}", missing.map(areaName).join(", "))})`;
    return s;
  };

  const rowHtml = (i, label) => `
    <div class="review-row">
      <div><strong>${esc(i.name)}</strong><div class="muted" style="font-size:13px">${esc(detailFor(i, label))}</div></div>
      <button class="btn btn-small" data-jump="${esc(i.id)}">${esc(T("review.open"))}</button>
    </div>`;

  // Vendor order preview: auto-mode items with par>0, grouped by vendor.
  // Rendered as the clean vendor-facing order card (no internal counts/pars).
  // IMPORTANT: only items WITH an entry generate order lines — this matches
  // the server (sessions.approve ignores uncounted items). Uncounted items
  // must never appear as phantom orders.
  const entryCount = Object.keys(byItem).length;
  const previewGroups = {};
  const capWarnings = [];
  const capNotes = [];   // lines reduced by a storage-capacity pool: {item, order, note}
  const capZero = [];    // lines zeroed out by a storage-capacity pool
  let orderLineCount = 0;
  const orderWeekday = new Date().getDay(); // JS 0=Sun..6=Sat, matches vendor coverage keys
  const cands = [];
  for (const i of state.items.filter(x => x.active !== false && x.mode === "auto" && Number(x.par) > 0)) {
    const b = byItem[i.id];
    if (!b) continue; // not counted -> no order line, listed under "Not counted" instead
    const have = b.total;
    // Smart order: usage x days-worth, par as floor, max on hand as cap, whole cases only.
    const dw = coverageDays(i.vendor_id, orderWeekday);
    const raw = rawOrderUnits(i, have, dw);
    if (raw <= 0) {
      if (capConflict(i, have, dw)) capWarnings.push(i);
      continue;
    }
    cands.push({ item: i, raw, dw, have });
  }
  // Storage-capacity pools cap the combined on-hand + ordered quantity of item
  // groups sharing space in one area (mirrors sessions.approve).
  const cappedQty = applyPoolCaps(cands, byItem);
  const maxZero = [];    // lines zeroed because a whole case won't fit under max_on_hand
  for (const c of cands) {
    const a = cappedQty.get(String(c.item.id));
    const qty = maxCappedQty(c.item, a.qty, c.have);
    if (qty <= 0) {
      if (a.capped) capZero.push(c.item);
      else if (a.qty > 0) maxZero.push(c.item);
      continue;
    }
    orderLineCount++;
    if (a.capped) capNotes.push({ item: c.item, order: qty, note: poolNote(a.pools) });
    const vid = c.item.vendor_id || "__none__";
    (previewGroups[vid] = previewGroups[vid] || []).push({ item: c.item, order: qty, line: qty * (Number(c.item.price) || 0) });
  }
  c._orderLineCount = orderLineCount;
  c._entryCount = entryCount;

  const emptyPreviewMsg = entryCount === 0 ? T("review.nothingCounted") : T("review.nothingToOrder");
  const previewHtml = Object.keys(previewGroups).length === 0
    ? `<p class="muted">${esc(emptyPreviewMsg)}</p>`
    : Object.entries(previewGroups)
        .sort(([va], [vb]) => cmpVendor(
          va === "__none__" ? null : vendorOf(va).name,
          vb === "__none__" ? null : vendorOf(vb).name))
        .map(([vid, lines]) => {
        const v = vendorOf(vid);
        const dw = coverageDays(vid === "__none__" ? null : vid, orderWeekday);
        const basis = `<p class="muted" style="font-size:13px;margin:10px 0 6px">${esc(
          T("review.orderBasis").replace("{day}", T("day." + weekdayToDay[orderWeekday])).replace("{m}", fmtCount(dw))
        )}</p>`;
        const d = orderCardData(v, lines.map(l => ({
          name: l.item.name, qty: l.order, unit: l.item.unit, line: l.line,
          pieces_per_case: l.item.pieces_per_case, case_label: l.item.case_label,
        })), fmtLongDateEn());
        return basis + orderCardHtml(d, { actions: false });
      }).join("");

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("review.title"))}</h1>
    <div class="sticky-action no-print">
      <button class="btn" data-act="back-home-top" style="min-height:44px">← ${esc(T("common.back"))}</button>
      ${c.sessionStatus === "draft" && canApprove
        ? `<button class="btn btn-primary" id="approve-btn-top" style="flex:1;min-height:44px">${esc(T("review.approve"))}</button>` : ""}
    </div>
    <div id="approve-err"></div>

    <h2>${esc(T("pill.not"))} (${notCounted.length})</h2>
    ${notCounted.length === 0
      ? (partialItems.length === 0
        ? `<p class="muted">${esc(T("review.allCounted"))}</p>`
        : `<p class="muted">${esc(T("review.partial"))}</p>` + partialItems.map(i => rowHtml(i, "")).join(""))
      : notCounted.map(i => rowHtml(i, T("review.noEntry"))).join("")}

    <h2>${esc(T("review.needsReview"))} (${needsReview.length})</h2>
    ${needsReview.length === 0 ? `<p class="muted">${esc(T("review.noneFlagged"))}</p>` : needsReview.map(i => rowHtml(i, T("review.flagged"))).join("")}

    <h2>${esc(T("review.aiCheck"))}</h2>
    <div class="no-print"><button class="btn" id="ai-check">${esc(T("review.runAi"))}</button></div>
    <div id="ai-flags" style="margin-top:10px">${c.aiRan && c.flags.length === 0 ? `<p class="muted">${esc(T("review.noIssues"))}</p>` : ""}</div>

    <h2>${esc(T("review.preview"))}</h2>
    ${capWarnings.length ? `<div class="warn-box">${capWarnings.map(i =>
      `<div>⚠️ <strong>${esc(i.name)}</strong> — ${esc(T("review.capWarn"))}</div>`).join("")}</div>` : ""}
    ${capNotes.length ? `<div class="warn-box"><div><strong>${esc(T("review.capAppliedTitle"))}</strong></div>${capNotes.map(n =>
      `<div>⚠️ <strong>${esc(n.item.name)}</strong> — ${fmtCount(n.order)} ${esc(n.item.unit)} — ${esc(T("review.capNote").replace("{pools}", n.note))}</div>`).join("")}</div>` : ""}
    ${capZero.length ? `<div class="warn-box">${capZero.map(i =>
      `<div>⚠️ ${esc(T("review.capZeroWarn").replace("{name}", i.name))}</div>`).join("")}</div>` : ""}
    ${maxZero.length ? `<div class="warn-box">${maxZero.map(i =>
      `<div>⚠️ ${esc(T("review.maxZeroWarn").replace("{name}", i.name))}</div>`).join("")}</div>` : ""}
    ${previewHtml}

    <div style="display:flex;gap:10px;margin:18px 0" class="no-print">
      <button class="btn" data-act="back-home">${esc(T("common.back"))}</button>
      ${c.sessionStatus !== "draft"
        ? `<div><p class="muted" style="margin:0 0 8px">${esc(T("review.alreadyApproved"))}</p><button class="btn btn-primary" data-act="go-orders">${esc(T("review.viewOrders"))}</button></div>`
        : canApprove ? `<button class="btn btn-primary" id="approve-btn" style="flex:1">${esc(T("review.approve"))}</button>` : `<p class="muted">${esc(T("review.onlyManagers"))}</p>`}
    </div>
  </div>`;

  $app().querySelectorAll("[data-jump]").forEach(b => b.onclick = () => {
    const item = itemById(b.dataset.jump);
    location.hash = `#/count/${c.sessionId}?item=${encodeURIComponent(b.dataset.jump)}`;
  });
  document.getElementById("ai-check").onclick = () => aiReview();
  const ap = document.getElementById("approve-btn");
  if (ap) ap.onclick = () => approveSession();
  const apTop = document.getElementById("approve-btn-top");
  if (apTop) apTop.onclick = () => approveSession();
  const backTop = $app().querySelector('[data-act="back-home-top"]');
  if (backTop) backTop.onclick = () => go("#/inv");
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/inv");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  const goOrders = $app().querySelector('[data-act="go-orders"]');
  if (goOrders) goOrders.onclick = () => go("#/orders");

  if (c.flags.length) renderFlags();
  if (c.blocking) renderBlocking();
}

function renderFlags() {
  const c = state.review;
  document.getElementById("ai-flags").innerHTML = c.flags.map(f => `
    <div class="flag-${f.level === "info" ? "info" : "warn"}">
      <strong>${esc(f.level === "info" ? T("review.info") : T("review.warn"))}:</strong> ${esc(f.text)}
    </div>`).join("");
}

function renderBlocking() {
  const c = state.review;
  const box = document.getElementById("approve-err");
  const items = Array.isArray(c.blocking) ? c.blocking : [];
  const fixable = c.blockCode === "incomplete_locations" && items.length > 0;
  // Group missing locations by item so each item drops down into its own fix form.
  const groups = [];
  if (fixable) {
    const byId = new Map();
    for (const b of items) {
      const k = String(b.item_id || b.item_name);
      if (!byId.has(k)) byId.set(k, { item_id: b.item_id, item_name: b.item_name || b.name || "?", areas: [] });
      if (b.area_id) byId.get(k).areas.push({ area_id: b.area_id, area_name: b.area_name || "?" });
    }
    for (const g of byId.values()) if (g.areas.length) groups.push(g);
  }
  const listHtml = groups.length
    ? `<ul class="block-fix-list">${groups.map((g, gi) => `
      <li>
        <button class="btn btn-small block-toggle" data-bg="${gi}">${esc(g.item_name)} — ${esc(g.areas.map(a => a.area_name).join(", "))} &#9662;</button>
        <div class="block-form" data-bf="${gi}" hidden>
          ${g.areas.map(a => `
            <label class="block-row">
              <span>${esc(a.area_name)}</span>
              <input type="number" inputmode="decimal" min="0" step="any" value="0" data-bitem="${esc(String(g.item_id))}" data-barea="${esc(String(a.area_id))}">
            </label>`).join("")}
          <div><button class="btn btn-small btn-primary" data-bsave="${esc(String(g.item_id))}">${esc(T("common.save"))}</button></div>
        </div>
      </li>`).join("")}</ul>`
    : `<ul>${items.map(b => `<li>${esc(b.item_name || b.name || b)}${b.area_name ? ` — ${esc(b.area_name)}` : ""}</li>`).join("")}</ul>`;
  box.innerHTML = `<div class="error"><strong>${esc(T("review.blockTitle"))}</strong>
    ${c.blockDetail ? `<p style="margin:8px 0">${esc(c.blockDetail)}</p>` : ""}
    ${listHtml}
    <p class="muted" style="margin:8px 0 0">${esc(groups.length ? T("review.fixHint") : T("review.blockMsg"))}</p></div>`;
  box.scrollIntoView();
  box.querySelectorAll(".block-toggle").forEach(t => {
    t.onclick = () => {
      const f = box.querySelector(`[data-bf="${t.dataset.bg}"]`);
      if (!f) return;
      f.hidden = !f.hidden;
      t.innerHTML = t.innerHTML.replace(/▾|▴/, f.hidden ? "▾" : "▴");
    };
  });
  box.querySelectorAll("[data-bsave]").forEach(b => {
    b.onclick = () => saveBlockingCounts(b.dataset.bsave, b);
  });
}

/** Save missing location counts inline from the approve-blocking box, so the
 *  user never has to go back to the count screen. */
async function saveBlockingCounts(itemId, btn) {
  const c = state.review;
  const box = document.getElementById("approve-err");
  const inputs = [...box.querySelectorAll(`input[data-bitem="${CSS.escape(String(itemId))}"]`)];
  const rows = [];
  for (const inp of inputs) {
    const v = inp.value.trim();
    if (v === "" || isNaN(Number(v)) || Number(v) < 0) {
      inp.focus();
      flashError(T("review.fixInvalid"));
      return;
    }
    rows.push({ area_id: inp.dataset.barea, count: Number(v) });
  }
  if (!rows.length) return;
  btn.disabled = true;
  try {
    for (const r of rows) {
      await api("POST", "/entries?on_conflict=session_id,item_id,area_id",
        {
          session_id: c.sessionId,
          item_id: itemId,
          area_id: r.area_id,
          count: r.count,
          status: r.count === 0 ? "zero_confirmed" : "counted",
          note: null,
          updated_by: state.session.profile.id,
        },
        { "Prefer": "resolution=merge-duplicates" });
    }
    showSavedToast();
    const rest = (c.blocking || []).filter(b => String(b.item_id) !== String(itemId));
    c.blocking = rest;
    if (!rest.length) {
      box.innerHTML = `<div class="notice">${esc(T("review.allFixed"))}</div>`;
      box.scrollIntoView();
    } else {
      renderBlocking();
    }
  } catch (e) {
    btn.disabled = false;
    flashError(e.detail || T("review.fixFail"));
  }
}

/** AI check -> ai-review -> plain-English warning/info rows. */
async function aiReview() {
  const c = state.review;
  const box = document.getElementById("ai-flags");
  box.innerHTML = `<p class="muted">${esc(T("common.checking"))}</p>`;
  try {
    const r = await edge("ai-review", { session_id: c.sessionId });
    // Edge returns {flags:[{item_id, message, severity}]}.
    c.flags = (Array.isArray(r.flags) ? r.flags : []).map(f => ({
      level: f.severity || f.level || "warn",
      text: f.message || f.text || "",
    }));
    c.aiRan = true;
    if (!c.flags.length) box.innerHTML = `<p class="muted">${esc(T("review.noIssues"))}</p>`;
    else renderFlags();
  } catch (e) {
    if (e.code === "ai_not_configured") {
      box.innerHTML = `<div class="notice">${esc(T("count.aiNoKey"))}</div>`;
    } else {
      box.innerHTML = `<div class="error">${esc(e.detail || T("review.aiFail"))}</div>`;
    }
  }
}

/** Approve: manager/superadmin only (button not even rendered otherwise;
 *  server also gates). On 409 needs_review show blocking items. */
async function approveSession() {
  const c = state.review;
  const box = document.getElementById("approve-err");
  const btns = [document.getElementById("approve-btn"), document.getElementById("approve-btn-top")].filter(Boolean);
  if (btns.some(b => b.disabled)) return; // double-tap guard: one approve at a time
  box.innerHTML = "";
  const entryCount = c._entryCount || 0;
  const lineCount = c._orderLineCount || 0;
  let ok;
  if (entryCount === 0) {
    // Nothing was counted — approving would silently generate zero orders.
    ok = await confirmDialog(T("review.approveEmptyTitle"), T("review.approveEmptyMsg"), T("review.approveEmptyYes"), T("review.keepCounting"), false);
  } else if (lineCount === 0) {
    // Counts exist but everything is at/above par — no orders will result.
    ok = await confirmDialog(T("review.approveNoLinesTitle"), T("review.approveNoLinesMsg"), T("review.approveEmptyYes"), T("common.cancel"), false);
  } else {
    ok = await confirmDialog(T("review.approveTitle"), T("review.approveMsg"), T("review.approveYes"), null, false);
  }
  if (!ok) return;
  btns.forEach(b => b.disabled = true);
  try {
    if (!(await flushEntrySaves())) { flashError(T("count.flushFail")); btns.forEach(b => b.disabled = false); return; }
    await edge("sessions.approve", { session_id: c.sessionId });
    showSavedToast(T("review.approvedToast"));
    go("#/orders");
  } catch (e) {
    btns.forEach(b => b.disabled = false);
    if (e.code === "not_draft") {
      // Already approved (e.g. double-tap) — say so plainly, don't cry "needs review".
      c.sessionStatus = "approved";
      box.innerHTML = `<div class="notice">${esc(T("review.alreadyApproved"))} <a href="#/orders">${esc(T("review.viewOrders"))}</a></div>`;
      box.scrollIntoView();
    } else if (e.status === 409 || e.code === "needs_review") {
      c.blocking = (e.data && (e.data.blocking || e.data.items)) || e.detail || [];
      if (!Array.isArray(c.blocking)) c.blocking = [c.blocking];
      c.blockCode = e.code || null;
      c.blockDetail = (e.data && e.data.detail) || e.detail || null;
      renderBlocking();
    } else {
      box.innerHTML = `<div class="error">${esc(e.detail || T("review.approveFail"))}</div>`;
    }
  }
}

/* ============ ORDER CARD TEMPLATE (vendor-facing) ============ */
/* Clean, screenshot-ready card styled like the approved mockup:
 * red store header, vendor name + date, item rows (name left,
 * quantity right in red), "N items" footer. Used in the review
 * preview and order history, and exported as a shareable PNG via
 * canvas (works for long orders — no screenshot needed). */
let cardSeq = 0;

/** Long date label, e.g. "Friday, September 25, 2026". */
function fmtLongDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleDateString([locale()], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch (e) { return d.toLocaleDateString(); }
}

/** Card dates are ALWAYS English — vendor orders never translate. */
function fmtLongDateEn(iso) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleDateString(["en-US"], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch (e) { return d.toLocaleDateString(); }
}

/** Build the card payload.
 *  vendor: {name, order_days, order_cutoff, delivery_days}
 *  lines: [{name, qty, unit, line}] */
function orderCardData(vendor, lines, dateLabel) {
  const v = vendor || {};
  const total = lines.reduce((s, l) => s + (Number(l.line) || 0), 0);
  const showTotal = showPrices() && total > 0;
  const meta = [];
  if (v.order_days) meta.push("Order days: " + v.order_days);
  if (v.order_cutoff) meta.push("Order by: " + v.order_cutoff);
  if (v.delivery_days) meta.push("Delivery days: " + v.delivery_days);
  const cleanLines = lines.map(l => {
    // Purchase-unit display: an item with a case label (e.g. "large box") is
    // shown to the vendor in whole purchase units, not internal count units.
    const ppc = Number(l.pieces_per_case);
    const ppcQty = Number(l.qty) / ppc;
    const qty = (ppc > 1 && l.case_label)
      ? fmtCount(ppcQty) + " " + pluralUnit(l.case_label, ppcQty)
      : fmtCount(l.qty) + (l.unit ? " " + l.unit : "");
    return { name: String(l.name || "").toUpperCase(), qty };
  });
  const text =
    `Hi ${v.name || "there"},\n\n` +
    `Please send the following for ${dateLabel}:\n\n` +
    cleanLines.map(l => `- ${l.qty} ${l.name}`).join("\n") +
    (showTotal ? `\n\nEstimated total: ${fmtMoney(total)}` : "") +
    `\n\nThanks,\n${storeName()}`;
  return {
    id: "card-" + (++cardSeq) + "-" + Date.now().toString(36),
    store: storeName(),
    vendorName: v.name || "Vendor",
    contactName: v.contact_name || v.contactName || null,
    contactPhone: v.contact_phone || v.contactPhone || null,
    dateLabel,
    meta,
    lines: cleanLines,
    total: showTotal ? fmtMoney(total) : null,
    count: cleanLines.length,
    text,
  };
}

/** HTML for the card. opts.actions=false hides the buttons (review preview). */
function orderCardHtml(d, opts = {}) {
  state.cardData[d.id] = d;
  return `<div class="order-card">
    <div class="order-card-head"><span class="logo-badge"><img src="logo.png" alt="Sumo Sushi logo"></span><span>${esc(d.store)}</span></div>
    <div class="order-card-body">
      <div class="order-card-vendor">${esc(d.vendorName)}</div>
      <div class="order-card-date">${esc(d.dateLabel)}</div>
      ${d.meta.map(m => `<div class="order-card-meta">${esc(m)}</div>`).join("")}
      <div class="order-card-lines">
        ${d.lines.map(l => `<div class="order-card-line">
          <span class="order-card-item">${esc(l.name)}</span>
          <span class="order-card-qty">${esc(l.qty)}</span>
        </div>`).join("")}
      </div>
      ${d.total ? `<div class="order-card-foot">Estimated total: ${esc(d.total)}</div>` : ""}
    </div>
    ${opts.actions === false ? "" : `<div class="order-card-actions no-print">
      ${(d.contactName || d.contactPhone) ? `<div class="order-card-contact">${esc(T("orders.sendTo"))}: ${esc(d.contactName || "")}${d.contactName && d.contactPhone ? " · " : ""}${esc(fmtPhone(d.contactPhone))}</div>` : ""}
      <button class="btn btn-small btn-primary" data-send-card="${esc(d.id)}">${esc(T("orders.send"))}</button>
      <button class="btn btn-small" data-share-card="${esc(d.id)}">${esc(T("orders.share"))}</button>
      <button class="btn btn-small" data-copy-card="${esc(d.id)}">${esc(T("orders.copy"))}</button>
    </div>`}
  </div>`;
}

/** Render the card to a PNG blob — the full order at any length. */
let logoImgPromise = null;
/** Load the Sumo logo for the card header (resolves null if unavailable — header falls back to text). */
function loadLogo() {
  if (!logoImgPromise) {
    logoImgPromise = new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = "logo.png";
      } catch (e) { resolve(null); }
    });
  }
  return logoImgPromise;
}
async function renderOrderCardImage(d) {
  const W = 1080, PAD = 64;
  const RED = "#c62828", INK = "#1b1b1b", GRAY = "#6b6b6b", SEAM = "#e9e9e9";
  const F = (w, s) => `${w} ${s}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
  const c = document.createElement("canvas");
  const x = c.getContext("2d");

  function wrap(text, maxW, font) {
    x.font = font;
    const words = String(text).split(/\s+/).filter(Boolean);
    const out = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (cur && x.measureText(t).width > maxW) { out.push(cur); cur = w; }
      else cur = t;
    }
    if (cur) out.push(cur);
    return out.length ? out : [""];
  }

  const nameFont = F(400, 44), qtyFont = F(700, 44);
  x.font = qtyFont;
  let qtyW = 0;
  for (const l of d.lines) qtyW = Math.max(qtyW, x.measureText(l.qty).width);
  const nameMaxW = Math.max(240, W - PAD * 2 - qtyW - 48);

  const namePitch = 56, rowPadT = 30, rowPadB = 30;
  const nameLines = d.lines.map(l => wrap(l.name, nameMaxW, nameFont));
  const rowH = nameLines.map(nl => Math.max(104, rowPadT + nl.length * namePitch + rowPadB));

  const metaFont = F(400, 36);
  const metaLines = d.meta.map(m => wrap(m, W - PAD * 2, metaFont));
  const vNameLines = wrap(d.vendorName, W - PAD * 2, F(700, 54));

  let H = 150;                       // red header
  H += 52;                           // top pad
  H += vNameLines.length * 62;       // vendor name
  H += 14 + 46;                      // date
  for (const ml of metaLines) H += ml.length * 48 + 12;
  H += 30;                           // gap before rows
  for (const rh of rowH) H += rh;
  if (d.total) { H += 34; H += 56; }   // footer separator + total line
  H += 52;                           // bottom pad

  c.width = W;
  c.height = Math.ceil(H);

  // Rounded card with transparent corners — sits cleanly in the iOS share
  // bubble instead of a square white slab the OS has to mask (which left a
  // faint sliver along the edges).
  const R = 48;
  x.save();
  x.beginPath();
  x.moveTo(R, 0);
  x.arcTo(W, 0, W, H, R);
  x.arcTo(W, H, 0, H, R);
  x.arcTo(0, H, 0, 0, R);
  x.arcTo(0, 0, W, 0, R);
  x.closePath();
  x.clip();
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, W, H);

  // Header band
  x.fillStyle = RED;
  x.fillRect(0, 0, W, 150);

  const logo = await loadLogo();
  x.fillStyle = "#ffffff";
  x.textBaseline = "middle";
  let sSize = 56;
  if (logo) {
    // White badge with the sumo mark, store name beside it.
    const bcx = PAD + 58, bcy = 75, br = 58;
    x.beginPath();
    x.arc(bcx, bcy, br, 0, Math.PI * 2);
    x.fill();
    const sc = 92 / Math.max(logo.width, logo.height);
    const lw = logo.width * sc, lh = logo.height * sc;
    x.drawImage(logo, bcx - lw / 2, bcy - lh / 2, lw, lh);
    x.textAlign = "left";
    const tx = PAD + 132, maxW = W - tx - 48;
    x.font = F(700, sSize);
    while (x.measureText(d.store).width > maxW && sSize > 30) { sSize -= 4; x.font = F(700, sSize); }
    x.fillText(d.store, tx, 78);
  } else {
    x.textAlign = "center";
    x.font = F(700, sSize);
    while (x.measureText(d.store).width > W - 120 && sSize > 30) { sSize -= 4; x.font = F(700, sSize); }
    x.fillText(d.store, W / 2, 78);
  }
  x.textAlign = "left";
  x.textBaseline = "alphabetic";

  let y = 150 + 52;
  // Vendor name
  x.fillStyle = INK;
  x.font = F(700, 54);
  for (const vl of vNameLines) { y += 62; x.fillText(vl, PAD, y - 8); }
  // Date
  y += 14;
  x.fillStyle = GRAY;
  x.font = F(400, 38);
  y += 46; x.fillText(d.dateLabel, PAD, y - 8);
  // Meta lines
  x.font = metaFont;
  for (const ml of metaLines) {
    for (const t of ml) { y += 48; x.fillText(t, PAD, y - 8); }
    y += 12;
  }
  y += 30;
  // Item rows
  d.lines.forEach((l, i) => {
    const nl = nameLines[i], rh = rowH[i];
    x.fillStyle = SEAM;
    x.fillRect(PAD, y, W - PAD * 2, 2);
    x.font = nameFont;
    x.fillStyle = INK;
    let ty = y + rowPadT;
    for (const t of nl) { ty += namePitch; x.fillText(t, PAD, ty - 12); }
    x.font = qtyFont;
    x.fillStyle = RED;
    x.textAlign = "right";
    x.fillText(l.qty, W - PAD, y + rh / 2 + 16);
    x.textAlign = "left";
    y += rh;
  });
  // Footer
  if (d.total) {
    y += 34;
    x.fillStyle = SEAM;
    x.fillRect(PAD, y, W - PAD * 2, 2);
    y += 56;
    x.font = F(400, 40);
    x.fillStyle = GRAY;
    x.fillText(`Estimated total: ${d.total}`, PAD, y - 8);
  }
  y += 52;

  x.restore(); // release the rounded-corner clip
  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}

/** Share the card as an image (share sheet) or download it as fallback. */
async function shareOrderCard(cardId, btn) {
  const d = state.cardData[cardId];
  if (!d) return;
  const label = btn ? btn.textContent : "";
  if (btn) btn.textContent = "…";
  try {
    const blob = await renderOrderCardImage(d);
    if (!blob) throw new Error("render failed");
    const safe = d.vendorName.replace(/[^\w]+/g, "-").slice(0, 40) || "order";
    const file = new File([blob], `order-${safe}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Order — ${d.vendorName}` });
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    }
  } catch (e) {
    if (!e || e.name !== "AbortError") flashError(T("orders.imgFail"));
  } finally {
    if (btn) btn.textContent = label;
  }
}

/** Send the order: share sheet with the order text only (no image).
 *  Gabe picks the vendor's WhatsApp/text thread and taps send himself —
 *  the app never sends anything on its own. The separate "Share image"
 *  button sends the card picture when he wants it. */
async function sendOrderCard(cardId, btn) {
  const d = state.cardData[cardId];
  if (!d) return;
  const label = btn ? btn.textContent : "";
  if (btn) btn.textContent = "…";
  try {
    if (navigator.share) {
      await navigator.share({ text: d.text, title: `Order — ${d.vendorName}` });
    } else {
      // Fallback (no share sheet): copy the text so it can be pasted.
      await copyCardText(cardId, null);
      showSavedToast(T("orders.copied"));
    }
  } catch (e) {
    if (!e || e.name !== "AbortError") flashError(T("orders.sendFail"));
  } finally {
    if (btn) btn.textContent = label;
  }
}

/** Copy the card's plain-text version. */
async function copyCardText(cardId, btn) {
  const d = state.cardData[cardId];
  if (!d) return;
  const label = btn ? btn.innerHTML : "";
  try { await navigator.clipboard.writeText(d.text); }
  catch (e) {
    const ta = document.createElement("textarea");
    ta.value = d.text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e2) { /* noop */ }
    ta.remove();
  }
  if (btn) { btn.textContent = T("orders.copied"); setTimeout(() => { btn.innerHTML = label; }, 2000); }
}

/* ===================== VIEW: ORDERS ============================ */
/* #/orders — order history: per-vendor cards with lines, costs,
 * email text, copy button, status transitions. */
async function renderOrders() {
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">${esc(T("orders.loading"))}</div></div>`;
  try {
    const [o, v, sg, it] = await Promise.all([
      edge("orders.list").catch(() => ({ orders: [] })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
      edge("items.list").catch(() => ({ items: state.items || [] })),
    ]);
    state.orders = o.orders || o || [];
    state.vendors = v.vendors || v || [];
    state.items = it.items || it || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; } }

  const canManage = has("approve"); // manager+: mark sent/received
  const isSuper = has("superadmin"); // superadmin: delete test orders
  const statusLabel = (s) => s === "sent" ? T("orders.sent") : s === "received" ? T("orders.received") : T("orders.draft");
  const pill = (s) => {
    const cls = s === "sent" ? "pill-sent" : s === "received" ? "pill-received" : "pill-draft";
    return `<span class="pill ${cls}">${esc(statusLabel(s))}</span>`;
  };

  // Orders sorted by vendor name (A→Z); orders without a vendor go last.
  const sortedOrders = [...state.orders].sort((a, b) => cmpVendor(
    vendorOf(a.vendor_id).name || a.vendor_name,
    vendorOf(b.vendor_id).name || b.vendor_name));

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("orders.title"))}</h1>
    <div class="no-print" style="margin-bottom:10px;display:flex;gap:8px">
      <button class="btn btn-small" onclick="window.print()">${esc(T("orders.print"))}</button>
      ${canManage ? `<button class="btn btn-small btn-primary" data-qo-start>${esc(T("orders.quickOrder"))}</button>` : ""}
    </div>
    <div id="qo-wrap" class="no-print"></div>
    ${state.orders.length === 0 ? `<p class="muted">${esc(T("orders.none"))}</p>` : ""}
    ${sortedOrders.map(ord => {
      const v = vendorOf(ord.vendor_id) || {};
      const vendor = {
        name: v.name || ord.vendor_name || "Vendor",
        order_days: v.order_days || ord.vendor_order_days,
        order_cutoff: v.order_cutoff || ord.vendor_order_cutoff,
        delivery_days: v.delivery_days || ord.vendor_delivery_days,
        contact_name: v.contact_name || null,
        contact_phone: v.contact_phone || null,
      };
      const lines = (ord.lines || []).map(l => ({
        name: l.item_name, qty: l.order_qty, unit: l.unit, line: Number(l.line_cost) || 0,
        pieces_per_case: l.pieces_per_case, case_label: l.case_label,
      }));
      const d = orderCardData(vendor, lines, fmtLongDateEn(ord.order_date || ord.created_at));
      return `<div class="order-wrap">
        <div class="order-status-row no-print">
          ${pill(ord.status)}
          <span style="display:flex;gap:8px">
            ${canManage && ord.status === "draft"
              ? `<button class="btn btn-small" data-edit="${esc(ord.id)}">${esc(T("orders.edit"))}</button>` : ""}
            ${canManage && ord.status !== "sent" && ord.status !== "received"
              ? `<button class="btn btn-small" data-sent="${esc(ord.id)}">${esc(T("orders.markSent"))}</button>` : ""}
            ${canManage && ord.status === "sent"
              ? `<button class="btn btn-small" data-received="${esc(ord.id)}">${esc(T("orders.markReceived"))}</button>` : ""}
            ${isSuper
              ? `<button class="btn btn-small" data-delorder="${esc(ord.id)}" data-vendor="${esc(vendor.name)}">${esc(T("common.delete"))}</button>` : ""}
          </span>
        </div>
        <div class="order-edit no-print" data-editwrap="${esc(ord.id)}" hidden></div>
        ${orderCardHtml(d)}
      </div>`;
    }).join("")}
    <div style="margin-top:16px" class="no-print"><button class="btn" data-act="back-home">${esc(T("common.back"))}</button></div>
  </div>`;

  // Card actions (share image / copy text) are wired via delegation in boot().
  $app().querySelectorAll("[data-sent]").forEach(b => b.onclick = () => setOrderStatus(b.dataset.sent, "sent"));
  $app().querySelectorAll("[data-received]").forEach(b => b.onclick = () => setOrderStatus(b.dataset.received, "received"));
  $app().querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openOrderEditor(b.dataset.edit));
  $app().querySelectorAll("[data-delorder]").forEach(b => b.onclick = () => deleteOrder(b.dataset.delorder, b.dataset.vendor));
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  const qoStart = $app().querySelector("[data-qo-start]");
  if (qoStart) qoStart.onclick = () => openQuickOrder();
}

async function setOrderStatus(orderId, status) {
  try {
    await edge("orders.update-status", { order_id: orderId, status });
    renderOrders();
  } catch (e) { flashError(e.detail || T("orders.statusFail")); }
}

/** Superadmin-only: permanently delete an order (for clearing test orders). */
async function deleteOrder(orderId, vendorName) {
  if (!await confirmDialog(T("orders.deleteTitle"),
    T("orders.deleteMsg").replace("{vendor}", vendorName || "?"), T("common.delete"))) return;
  try {
    await edge("orders.delete", { order_id: orderId });
    showSavedToast(T("orders.deleted"));
    renderOrders();
  } catch (e) { flashError(e.detail || T("orders.deleteFail")); }
}

/* Manual override: edit a draft order's lines (per vendor) before the card
 * is generated — e.g. bump quantities for a big party. Quantities, add/remove
 * lines; the card and vendor text rebuild from the saved lines. */
/** YYYY-MM-DD for the order-date picker, matching the day the order card shows.
 *  Noon-UTC stored order days slice exactly; legacy timestamps use the local day. */
function orderDateVal(ord) {
  const iso = (ord && (ord.order_date || ord.created_at)) || "";
  if (!iso) return "";
  const d = new Date(iso);
  if (d.getUTCHours() === 12 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0)
    return iso.slice(0, 10);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ================= QUICK ORDER ================= */
/* Ad-hoc vendor order without a count session: pick a vendor, enter
 * quantities (whole cases for case items, units otherwise), get a draft
 * order dated today. The vendor's list includes items where it is the
 * primary vendor OR an alternate vendor (items.alt_vendor_ids). */
function openQuickOrder() {
  const wrap = document.getElementById("qo-wrap");
  if (!wrap) return;
  const vendors = [...(state.vendors || [])]
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  let qo = null; // { vendorId, date, rows: [{item, qty, isCase}] }

  const laToday = () => {
    try { return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  };
  const mkRow = (item) => ({
    item, qty: 0,
    isCase: Number(item.pieces_per_case) > 1 && !!item.case_label,
  });

  function renderVendorPick() {
    wrap.innerHTML = `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("orders.quickOrder"))}</h3>
      <p class="muted">${esc(T("orders.qoPickVendor"))}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        ${vendors.map(v => `<button class="btn btn-small" data-qo-vendor="${esc(v.id)}">${esc(v.name)}</button>`).join("")}
      </div>
      <button class="btn btn-small" data-qo-cancel>${esc(T("common.cancel"))}</button>
    </div>`;
    wrap.querySelectorAll("[data-qo-vendor]").forEach(b => b.onclick = () => startSheet(b.dataset.qoVendor));
    wrap.querySelector("[data-qo-cancel]").onclick = () => { wrap.innerHTML = ""; };
    try { wrap.scrollIntoView({ block: "nearest" }); } catch (e) { /* noop */ }
  }

  function startSheet(vendorId) {
    qo = {
      vendorId,
      date: laToday(),
      rows: vendorItemsFor(vendorId)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .map(mkRow),
    };
    renderSheet();
  }

  const qoPpc = (r) => Number(r.item.pieces_per_case) || 0;
  const qoHasCase = (r) => qoPpc(r) > 1 && !!r.item.case_label;
  const rowSub = (r) => {
    const unitLine = r.isCase ? r.item.case_label : (r.item.unit || "");
    let hint = "";
    if (r.qty > 0) {
      hint = r.isCase
        ? ` = ${fmtCount(r.qty * qoPpc(r))} ${r.item.unit || ""}`
        : (qoHasCase(r) ? ` = ${fmtCount(r.qty / qoPpc(r))} ${pluralUnit(r.item.case_label, r.qty / qoPpc(r))}` : "");
    }
    return `<div class="muted" style="font-size:12px">${esc(unitLine)}${esc(hint)}</div>`;
  };
  const rowsHtml = () => qo.rows.map((r, i) => `
    <div class="oedit-row">
      <span class="oedit-name">${esc(r.item.name)}${rowSub(r)}</span>
      <span class="oedit-step">
        <button class="btn btn-small" data-qo-step="${i}|-1">-</button>
        <input data-qo-qty="${i}" inputmode="decimal" value="${r.qty}">
        <button class="btn btn-small" data-qo-step="${i}|1">+</button>
        ${qoHasCase(r) ? `<button class="btn btn-small" data-qo-unit="${i}">${esc(r.isCase ? r.item.case_label : (r.item.unit || "unit"))}</button>` : ""}
      </span>
    </div>`).join("");

  function renderRows() {
    const box = wrap.querySelector("[data-qo-rows]");
    if (!box) return;
    box.innerHTML = rowsHtml() || `<p class="muted">—</p>`;
    box.querySelectorAll("[data-qo-step]").forEach(b => b.onclick = () => {
      const [i, d] = b.dataset.qoStep.split("|").map(Number);
      const r = qo.rows[i];
      r.qty = Math.max(0, Math.round((r.qty + d) * 100) / 100);
      const inp = box.querySelector(`[data-qo-qty="${i}"]`);
      if (inp) inp.value = r.qty;
      renderRows();
    });
    box.querySelectorAll("[data-qo-qty]").forEach(inp => inp.onchange = () => {
      const i = Number(inp.dataset.qoQty);
      const r = qo.rows[i];
      // Whole cases only — vendors don't sell half a case.
      let v = Number(inp.value);
      v = r.isCase ? Math.max(0, Math.round(v)) : Math.max(0, Math.round(v * 100) / 100);
      r.qty = v || 0;
      renderRows();
    });
    box.querySelectorAll("[data-qo-unit]").forEach(b => b.onclick = () => {
      const i = Number(b.dataset.qoUnit);
      const r = qo.rows[i];
      const ppc = qoPpc(r);
      if (r.isCase) { r.qty = Math.round(r.qty * ppc * 100) / 100; r.isCase = false; }
      else { r.qty = Math.max(0, Math.round(r.qty / ppc)); r.isCase = true; }
      renderRows();
    });
  }

  function renderAddList(q) {
    const box = wrap.querySelector("[data-qo-addlist]");
    if (!box) return;
    q = String(q || "").trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = ""; return; }
    const inRows = new Set(qo.rows.map(r => String(r.item.id)));
    const hits = (state.items || [])
      .filter(i => i.active !== false && !inRows.has(String(i.id)) &&
        String(i.name || "").toLowerCase().includes(q))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .slice(0, 8);
    box.innerHTML = hits.map(i =>
      `<button class="btn btn-small" data-qo-add="${esc(i.id)}" style="margin:0 8px 8px 0">+ ${esc(i.name)}</button>`).join("");
    box.querySelectorAll("[data-qo-add]").forEach(b => b.onclick = () => {
      const it = (state.items || []).find(x => String(x.id) === String(b.dataset.qoAdd));
      if (it) {
        qo.rows.push(mkRow(it));
        const s = wrap.querySelector("[data-qo-search]");
        if (s) s.value = "";
        box.innerHTML = "";
        renderRows();
      }
    });
  }

  function renderSheet() {
    const v = vendorOf(qo.vendorId);
    wrap.innerHTML = `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("orders.quickOrder"))} — ${esc(v.name || "")}</h3>
      <div class="oedit-row">
        <span class="oedit-name">${esc(T("orders.orderDate"))}</span>
        <input type="date" data-qo-date value="${esc(qo.date)}" style="min-height:44px;border-radius:8px">
      </div>
      <div data-qo-rows style="margin-top:8px"></div>
      <div class="field" style="margin-top:8px">
        <input data-qo-search placeholder="${esc(T("orders.qoSearch"))}" autocomplete="off">
      </div>
      <div data-qo-addlist></div>
      <div data-qo-err></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" data-qo-create style="flex:1">${esc(T("orders.qoCreate"))}</button>
        <button class="btn" data-qo-back style="flex:1">${esc(T("orders.qoPickVendor"))}</button>
      </div>
    </div>`;
    renderRows();
    wrap.querySelector("[data-qo-search]").oninput = (e) => renderAddList(e.target.value);
    wrap.querySelector("[data-qo-back]").onclick = () => renderVendorPick();
    wrap.querySelector("[data-qo-create]").onclick = createOrder;
    try { wrap.scrollIntoView({ block: "nearest" }); } catch (e) { /* noop */ }
  }

  async function createOrder() {
    const errBox = wrap.querySelector("[data-qo-err]");
    errBox.innerHTML = "";
    const lines = qo.rows.filter(r => r.qty > 0).map(r => ({
      item_id: r.item.id,
      item_name: r.item.name,
      unit: r.item.unit || "",
      order_qty: r.isCase
        ? Math.round(r.qty * Number(r.item.pieces_per_case) * 100) / 100
        : r.qty,
    }));
    if (!lines.length) {
      errBox.innerHTML = `<div class="error">${esc(T("orders.qoNeedLines"))}</div>`;
      return;
    }
    const dateInput = wrap.querySelector("[data-qo-date]");
    try {
      await edge("orders.quick_create", {
        vendor_id: qo.vendorId,
        lines,
        order_date: dateInput && dateInput.value ? dateInput.value : undefined,
      });
      showSavedToast(T("orders.qoCreated"));
      renderOrders();
    } catch (e) { errBox.innerHTML = `<div class="error">${esc(e.detail || T("orders.qoFail"))}</div>`; }
  }

  renderVendorPick();
}

function openOrderEditor(orderId) {
  const ord = (state.orders || []).find(o => String(o.id) === String(orderId));
  if (!ord || ord.status !== "draft") return;
  const wrap = $app().querySelector(`[data-editwrap="${CSS.escape(String(orderId))}"]`);
  if (!wrap) return;
  let draft = (ord.lines || []).map(l => ({
    item_id: l.item_id || null,
    item_name: l.item_name, unit: l.unit || "",
    order_qty: Number(l.order_qty) || 0,
    pieces_per_case: l.pieces_per_case ?? null,
    case_label: l.case_label ?? null,
    useCase: Number(l.pieces_per_case) > 1 && !!l.case_label,
  }));
  const vendorItems = () => vendorItemsFor(ord.vendor_id)
    .filter(i => !draft.some(d => d.item_id && String(d.item_id) === String(i.id)));
  const dPpc = (l) => Number(l.pieces_per_case) || 0;
  const dHasCase = (l) => dPpc(l) > 1 && !!l.case_label;
  // Displayed qty: whole purchase units (cases) when the case toggle is on, else base count units.
  const dDispQty = (l) => dHasCase(l) && l.useCase
    ? Math.round((l.order_qty / dPpc(l)) * 100) / 100
    : Math.round(l.order_qty * 100) / 100;
  const purchaseText = (l) => {
    if (!dHasCase(l) || l.order_qty <= 0) return "";
    if (l.useCase) return `= ${fmtCount(l.order_qty)} ${l.unit || ""}`;
    const pq = l.order_qty / dPpc(l);
    return `= ${fmtCount(pq)} ${pluralUnit(l.case_label, pq)}`;
  };
  const rowsHtml = () => draft.map((l, i) => `
      <div class="oedit-row">
        <span class="oedit-name">${esc(l.item_name)}${l.unit ? ` <span class="muted">${esc(l.unit)}</span>` : ""}
          <div class="muted" style="font-size:12px" data-dhint="${i}">${esc(purchaseText(l))}</div></span>
        <span class="oedit-step">
          <button class="btn btn-small" data-dstep="${i}|-1">-</button>
          <input data-dqty="${i}" inputmode="decimal" value="${dDispQty(l)}">
          <button class="btn btn-small" data-dstep="${i}|1">+</button>
          ${dHasCase(l) ? `<button class="btn btn-small" data-dunit="${i}">${esc(l.useCase ? l.case_label : (l.unit || "unit"))}</button>` : ""}
        </span>
        <button class="btn btn-small" data-drm="${i}" aria-label="${esc(T("common.removeAria"))}">&times;</button>
      </div>`).join("");
  const addHtml = () => {
    const opts = vendorItems();
    if (!opts.length) return "";
    return `<div class="oedit-row">
        <select data-dadd class="oedit-name">${opts.map(i =>
          `<option value="${esc(i.id)}">${esc(i.name)}${i.unit ? " (" + esc(i.unit) + ")" : ""}</option>`).join("")}</select>
        <input data-daddqty inputmode="numeric" value="1">
        <button class="btn btn-small btn-primary" data-daddbtn>${esc(T("orders.addItem"))}</button>
      </div>`;
  };
  function render() {
    wrap.innerHTML = `
      <div class="oedit-row">
        <span class="oedit-name">${esc(T("orders.orderDate"))}</span>
        <input type="date" data-ddate value="${esc(orderDateVal(ord))}" style="min-height:44px;border-radius:8px">
      </div>
      <div data-drows>${rowsHtml()}</div>
      ${addHtml()}
      <div data-derr></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" data-dsave style="flex:1">${esc(T("common.save"))}</button>
        <button class="btn" data-dcancel style="flex:1">${esc(T("common.cancel"))}</button>
      </div>`;
    wire();
  }
  function wire() {
    wrap.querySelectorAll("[data-dstep]").forEach(b => b.onclick = () => {
      const [i, d] = b.dataset.dstep.split("|").map(Number);
      const l = draft[i];
      const step = (dHasCase(l) && l.useCase) ? dPpc(l) : 1; // whole cases in case mode
      l.order_qty = Math.max(0, Math.round((l.order_qty + d * step) * 100) / 100);
      const inp = wrap.querySelector(`[data-dqty="${i}"]`);
      if (inp) inp.value = dDispQty(l);
      const hint = wrap.querySelector(`[data-dhint="${i}"]`);
      if (hint) hint.textContent = purchaseText(l);
    });
    wrap.querySelectorAll("[data-dqty]").forEach(inp => inp.onchange = () => {
      const i = Number(inp.dataset.dqty);
      const l = draft[i];
      const v = Number(inp.value);
      // Whole cases only — vendors don't sell half a case.
      l.order_qty = (dHasCase(l) && l.useCase)
        ? Math.max(0, Math.round(v)) * dPpc(l)
        : Math.max(0, Math.round(v * 100) / 100);
      inp.value = dDispQty(l);
      const hint = wrap.querySelector(`[data-dhint="${i}"]`);
      if (hint) hint.textContent = purchaseText(l);
    });
    wrap.querySelectorAll("[data-dunit]").forEach(b => b.onclick = () => {
      const i = Number(b.dataset.dunit);
      draft[i].useCase = !draft[i].useCase;
      render();
    });
    wrap.querySelectorAll("[data-drm]").forEach(b => b.onclick = () => {
      draft.splice(Number(b.dataset.drm), 1);
      render();
    });
    const addBtn = wrap.querySelector("[data-daddbtn]");
    if (addBtn) addBtn.onclick = () => {
      const sel = wrap.querySelector("[data-dadd]");
      const q = wrap.querySelector("[data-daddqty]");
      const it = (state.items || []).find(x => String(x.id) === String(sel.value));
      const qty = Math.round(Number(q.value) * 100) / 100;
      if (it && qty > 0) {
        // The add-qty box is in purchase units (cases) for case items, matching
        // the "(case)" label in the dropdown; lines always store base units.
        const ppc = Number(it.pieces_per_case) || 0;
        const asCase = ppc > 1 && !!it.case_label;
        draft.push({ item_id: it.id, item_name: it.name, unit: it.unit || "",
          order_qty: asCase ? Math.round(qty * ppc * 100) / 100 : qty,
          pieces_per_case: it.pieces_per_case ?? null, case_label: it.case_label ?? null,
          useCase: asCase });
        render();
      }
    };
    wrap.querySelector("[data-dsave]").onclick = async () => {
      const err = wrap.querySelector("[data-derr]");
      err.innerHTML = "";
      const payload = draft.filter(l => l.order_qty > 0)
        .map(l => ({ item_id: l.item_id, item_name: l.item_name, unit: l.unit, order_qty: l.order_qty }));
      if (!payload.length) {
        err.innerHTML = `<div class="error">${esc(T("orders.needLines"))}</div>`;
        return;
      }
      try {
        const dateInput = wrap.querySelector("[data-ddate]");
        const r = await edge("orders.update-lines", {
          order_id: ord.id,
          lines: payload,
          order_date: dateInput && dateInput.value ? dateInput.value : undefined,
        });
        const idx = (state.orders || []).findIndex(o => String(o.id) === String(ord.id));
        if (idx >= 0 && r && r.order) state.orders[idx] = r.order;
        renderOrders();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("orders.linesFail"))}</div>`; }
    };
    wrap.querySelector("[data-dcancel]").onclick = () => { wrap.hidden = true; wrap.innerHTML = ""; };
  }
  wrap.hidden = false;
  render();
  try { wrap.scrollIntoView({ block: "nearest" }); } catch (e) { /* noop */ }
}

/* ====================== VIEW: ADMIN ============================ */
/* Manager+: Items, Areas, Vendors, Users tabs (full catalog + user mgmt,
 * except the superadmin account itself, which is untouchable by managers).
 * Superadmin only: Import/Export tab. Everyone else: "not authorized." */
async function renderAdmin(tab, arg2) {
  const canManage = has("manage");
  const isSuper = has("superadmin");
  if (!canManage && !isSuper) {
    $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div>
      <button class="btn" onclick="location.hash='#/home'">${esc(T("common.back"))}</button></div>`;
    $app().querySelector('[data-act="nav-logout"]').onclick = logout;
    return;
  }
  $app().innerHTML = navHtml() + `<div class="view" style="min-height:40vh"><div class="loading">Loading admin…</div></div>`;
  try {
    const [it, a, v, u, pl, sg, sched] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("users.list").catch(() => ({ users: [] })),
      edge("pools.list").catch(() => ({ pools: state.pools })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
      edge("schedule.get_settings").catch(() => ({})),
    ]);
    state.items = it.items || it || [];
    state.areas = a.areas || a || [];
    state.vendors = v.vendors || v || [];
    state.users = u.users || u || [];
    state.pools = pl.pools || pl || [];
    if (Array.isArray(sched.positions)) schedPositions = sched.positions.filter(x => typeof x === "string");
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; } }

  const allTabs = [["items", T("admin.items")], ["bulk", T("admin.bulkTitle")], ["areas", T("admin.areas")], ["vendors", T("admin.vendors")], ["capacity", T("admin.capacity")], ["users", T("admin.users")], ["io", "Import/Export"]];
  // Managers get Items/Areas/Vendors/Users; Import/Export is superadmin-only.
  const tabs = allTabs.filter(([id]) => id === "io" ? isSuper : canManage);
  if (!tabs.some(([id]) => id === tab)) tab = tabs[0][0];
  let body = "";
  if (tab === "items") body = adminItemsHtml();
  else if (tab === "bulk") body = adminBulkHtml(arg2 === "areas" ? "areas" : "items");
  else if (tab === "areas") body = adminAreasHtml();
  else if (tab === "vendors") body = adminVendorsHtml();
  else if (tab === "capacity") body = adminCapacityHtml();
  else if (tab === "users") body = adminUsersHtml();
  else body = adminIOHtml();

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${tab === "io" ? "Super Admin" : esc(T("home.manage"))}</h1>
    <div class="admin-tabs no-print">
      ${tabs.map(([id, label]) => `<button class="admin-tab ${tab === id ? "active" : ""}" data-atab="${id}">${label}</button>`).join("")}
    </div>
    <div id="admin-body">${body}</div>
    <div style="margin-top:16px" class="no-print"><button class="btn" data-act="back-home">${esc(T("common.back"))}</button></div>
  </div>`;

  $app().querySelectorAll("[data-atab]").forEach(b => b.onclick = () => go("#/admin/" + b.dataset.atab));
  // The tab bar overflows on phones — keep the active tab visible.
  const activeAtab = $app().querySelector('[data-atab].active');
  if (activeAtab && activeAtab.scrollIntoView) activeAtab.scrollIntoView({ inline: "center", block: "nearest" });
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  wireAdmin(tab, arg2);
}

/* ---------------- Items tab ---------------- */
/* Option/checkbox builders for Manage → Items. Module scope (not nested in
 * adminItemsHtml) so the extracted adminItemCardsHtml() can use them too. */
function areaChecks(selIds) {
  return state.areas.map(a =>
    `<label class="check"><input type="checkbox" data-area-check value="${esc(a.id)}" ${selIds.includes(String(a.id)) ? "checked" : ""}> ${esc(a.name)}</label>`).join("");
}
// Checkbox list for an item's alternate vendors; the primary vendor is
// excluded here (the server strips it anyway if the primary changes).
function altVendorChecks(item) {
  return state.vendors
    .filter(v => String(v.id) !== String(item.vendor_id || ""))
    .map(v => `<label class="check"><input type="checkbox" data-alt-vendor-check value="${esc(v.id)}" ${(Array.isArray(item.alt_vendor_ids) && item.alt_vendor_ids.some(a => String(a) === String(v.id))) ? "checked" : ""}> ${esc(v.name)}</label>`).join("");
}
function vendorOpts(sel) {
  return `<option value="">—</option>` + state.vendors.map(v =>
    `<option value="${esc(v.id)}" ${String(v.id) === String(sel) ? "selected" : ""}>${esc(v.name)}</option>`).join("");
}

function adminItemsHtml() {
  return `<div class="admin-card">
      <div class="field" style="margin-bottom:0"><input id="ai-search" placeholder="${esc(T("count.search"))}" value="${esc(adminItemSearch)}" autocomplete="off"></div>
    </div>
    <button class="btn btn-primary" id="ai-add-toggle" style="width:100%;margin-bottom:12px">＋ ${esc(T("admin.addItem"))}</button>
    <div class="admin-card" id="ai-add-form" hidden>
      <h3 style="margin-top:0">${esc(T("admin.addItem"))}</h3>
      <div class="field"><label>${esc(T("common.name"))}</label><input id="ni-name" placeholder="${esc(T("admin.exItem"))}"></div>
      <div class="form-row">
        <div class="field"><label>${esc(T("count.areasBtn"))}</label><div class="check-list" id="ni-areas">${areaChecks([])}</div>
          <div class="muted" style="font-size:12px">${esc(T("admin.areasHint"))}</div></div>
        <div class="field"><label>${esc(T("count.sortVendor"))}</label><select id="ni-vendor">${vendorOpts()}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("par.par"))}</label><input id="ni-par" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
        <div class="field"><label>${esc(T("admin.unit"))}</label><input id="ni-unit" placeholder="${esc(T("par.unitPh"))}"></div>
        <div class="field"><label>${esc(T("par.price"))}</label><input id="ni-price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div>
      </div>
      <div id="ni-err"></div>
      <button class="btn btn-primary" id="ni-add" style="width:100%">${esc(T("admin.addItem"))}</button>
    </div>
    <div id="admin-item-list">${adminItemCardsHtml()}</div>`;
}

/* Item cards for Manage → Items, filtered by the live search box. Kept as a
 * separate function so typing in the search re-renders only the list (the
 * Add-item form and its inputs are left untouched). */
function adminItemCardsHtml() {
  const q = adminItemSearch.trim().toLowerCase();
  const list = q
    ? state.items.filter(i => String(i.name || "").toLowerCase().includes(q))
    : state.items;
  if (!list.length) return `<p class="muted">${esc(T("admin.noItemsMatch"))}</p>`;
  return `${list.map(i => {
    const facts = [];
    if (Number(i.par) > 0) facts.push(`Par ${esc(fmtCount(i.par))}${i.unit ? " " + esc(i.unit) : ""}`);
    if (Number(i.price) > 0) facts.push("$" + esc(Number(i.price).toFixed(2)));
    return `
    <div class="admin-card" data-item="${esc(i.id)}">
      <div class="card-head" data-ai-head style="cursor:pointer">
        <div><strong>${esc(i.name)}</strong>
          <div class="muted" style="font-size:13px">${esc(itemAreas(i).map(a => a.name).filter(Boolean).join(", ") || T("admin.noArea"))} · ${esc(vendorOf(i.vendor_id).name || T("admin.noVendor"))}${i.active === false ? " · " + esc(T("admin.archived")) : ""}</div>
          ${facts.length ? `<div class="muted" style="font-size:13px">${facts.join(" · ")}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex:none">
          <button class="btn btn-small" data-ai-toggle>${esc(i.active === false ? T("admin.unarchive") : T("admin.archive"))}</button>
          <span data-ai-chev class="muted" style="font-size:18px;line-height:1">▾</span>
        </div>
      </div>
      <div data-ai-body hidden>
      <div class="form-row" style="margin-top:8px">
        <div class="field"><label>${esc(T("common.name"))}</label><input data-f="name" value="${esc(i.name)}"></div>
        <div class="field"><label>${esc(T("admin.unit"))}</label><input data-f="unit" value="${esc(i.unit || "")}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("par.par"))}</label><input data-f="par" type="number" inputmode="decimal" min="0" step="0.25" value="${Number(i.par) > 0 ? esc(i.par) : ""}" placeholder="—"></div>
        <div class="field"><label>${esc(T("par.price"))}</label><input data-f="price" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(i.price) > 0 ? esc(i.price) : ""}" placeholder="—"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("admin.mode"))}</label><select data-f="mode">
          <option value="auto" ${i.mode === "auto" ? "selected" : ""}>${esc(T("admin.modeAuto"))}</option>
          <option value="manual" ${i.mode !== "auto" ? "selected" : ""}>${esc(T("admin.modeManual"))}</option></select></div>
        <div class="field"><label>${esc(T("admin.countStyle"))}</label><input data-f="count_style" value="${esc(i.count_style || "")}" placeholder="${esc(T("admin.exCase"))}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("admin.pieces"))}</label><input data-f="pieces_per_case" type="number" inputmode="numeric" min="0" value="${esc(i.pieces_per_case || "")}" placeholder="—"></div>
        <div class="field"><label>${esc(T("admin.caseLabel"))}</label><input data-f="case_label" value="${esc(i.case_label || "")}" placeholder="${esc(T("admin.exCaseLabel"))}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("item.dailyUsage"))}</label><input data-f="daily_usage_manual" type="number" inputmode="decimal" min="0" step="0.1" value="${esc(i.daily_usage_manual ?? "")}" placeholder="${i.daily_usage != null && i.daily_usage !== "" ? esc(T("item.learned").replace("{x}", fmtCount(i.daily_usage))) : "—"}"></div>
        <div class="field"><label>${esc(T("item.maxOnHand"))}</label><input data-f="max_on_hand" type="number" inputmode="decimal" min="0" step="0.25" value="${esc(i.max_on_hand ?? "")}" placeholder="—"></div>
      </div>
      <div class="field"><label>${esc(T("count.areasBtn"))}</label><div class="check-list">${areaChecks(areaIdsOf(i))}</div>
        <div class="muted" style="font-size:12px">${esc(T("admin.areasHint"))}</div></div>
      <div class="field"><label>${esc(T("count.sortVendor"))}</label><select data-f="vendor_id">${vendorOpts(i.vendor_id)}</select></div>
      <div class="field"><label>${esc(T("admin.altVendors"))}</label><div class="check-list">${altVendorChecks(i)}</div>
        <div class="muted" style="font-size:12px">${esc(T("admin.altVendorsHint"))}</div></div>
      <div class="field"><label>${esc(T("common.notes"))}</label><input data-f="notes" value="${esc(i.notes || "")}"></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary btn-small" data-ai-save style="flex:1">${esc(T("common.save"))}</button>
      </div>
      </div>
    </div>`; }).join("")}`;
}

/* Wire the per-item save/archive buttons inside a Manage → Items card
 * container. Called once for the full tab and again after every search
 * re-render (re-rendered cards lose their handlers). */
function wireItemCards(root, rerender) {
  root.querySelectorAll("[data-item]").forEach(card => {
    const id = card.dataset.item;
    // Collapsed card: tap the head to expand/collapse the full edit form.
    const head = card.querySelector("[data-ai-head]");
    const cbody = card.querySelector("[data-ai-body]");
    const chev = card.querySelector("[data-ai-chev]");
    if (head && cbody) head.onclick = (e) => {
      if (e.target.closest("[data-ai-toggle]")) return; // archive button handles its own tap
      const opening = cbody.hidden;
      cbody.hidden = !opening;
      if (chev) chev.textContent = opening ? "▴" : "▾";
    };
    card.querySelector("[data-ai-save]").onclick = async () => {
      const data = {};
      card.querySelectorAll("[data-f]").forEach(inp => data[inp.dataset.f] = inp.value);
      data.par = data.par === "" ? 0 : Number(data.par);
      data.price = data.price === "" ? 0 : Number(data.price);
      data.pieces_per_case = data.pieces_per_case === "" ? null : Number(data.pieces_per_case);
      for (const f of ["daily_usage_manual", "max_on_hand"]) data[f] = data[f] === "" ? null : Number(data[f]);
      if (!data.vendor_id) data.vendor_id = null;
      data.area_ids = [...card.querySelectorAll("[data-area-check]:checked")].map(b => b.value);
      data.alt_vendor_ids = [...card.querySelectorAll("[data-alt-vendor-check]:checked")].map(b => b.value);
      try { await edge("items.update", { item_id: id, ...data }); flashSaved(card); }
      catch (e) { flashError(e.detail || T("admin.saveItemFail")); }
    };
    card.querySelector("[data-ai-toggle]").onclick = async () => {
      const item = itemById(id);
      try { await edge("items.update", { item_id: id, active: item.active === false }); rerender(); }
      catch (e) { flashError(e.detail || T("admin.archiveFail")); }
    };
  });
}

/* ---------------- Areas tab ---------------- */
function adminAreasHtml() {
  return `<button class="btn btn-primary" id="aa-add-toggle" style="width:100%;margin-bottom:12px">＋ ${esc(T("admin.addArea"))}</button>
    <div class="admin-card" id="aa-add-form" hidden>
      <h3 style="margin-top:0">${esc(T("admin.addArea"))}</h3>
      <div class="field"><label>${esc(T("common.name"))}</label><input id="na-name" placeholder="e.g. Walk-in"></div>
      <div id="na-err"></div>
      <button class="btn btn-primary" id="na-add" style="width:100%">${esc(T("admin.addArea"))}</button>
    </div>
    ${state.areas.map(a => `
    <div class="admin-card" data-area-row="${esc(a.id)}">
      <div class="card-head" data-aa-head style="cursor:pointer">
        <div><strong>${esc(a.name)}</strong></div>
        <span data-aa-chev class="muted" style="font-size:18px;line-height:1">▾</span>
      </div>
      <div data-aa-body hidden>
        <div class="field" style="margin-top:8px"><label>${esc(T("admin.areaName"))}</label><input data-aname value="${esc(a.name)}"></div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-small btn-primary" data-arename style="flex:1">${esc(T("admin.rename"))}</button>
          <button class="btn btn-small btn-danger" data-adelete>${esc(T("common.delete"))}</button>
        </div>
      </div>
    </div>`).join("")}`;
}

/* ---------------- Capacity tab: storage caps per area ----------------
 * A storage cap limits the combined on-hand + ordered quantity of a group of
 * items sharing space in one area (e.g. ice cream: max 40 boxes mixed across
 * flavors in the walk-in cooler). Order suggestions are capped so a pool
 * never exceeds its max. */
function adminCapacityHtml() {
  const poolsByArea = {};
  for (const p of state.pools || []) (poolsByArea[String(p.area_id)] = poolsByArea[String(p.area_id)] || []).push(p);
  if (!state.areas.length) return `<p class="muted">${esc(T("admin.capNoAreas"))}</p>`;
  return `<p class="muted" style="font-size:13px">${esc(T("admin.capHint"))}</p>` + state.areas.map(a => {
    const pools = poolsByArea[String(a.id)] || [];
    return `<div class="admin-card" data-cap-area="${esc(a.id)}">
      <h3 style="margin-top:0">${esc(a.name)}</h3>
      ${pools.map(poolCardHtml).join("")}
      <button class="btn btn-small" data-np-toggle style="width:100%">＋ ${esc(T("admin.capAdd"))}</button>
      <div data-np-form hidden>
        <div class="field" style="margin-top:8px"><label>${esc(T("admin.capName"))}</label><input data-np-name placeholder="e.g. Ice cream"></div>
        <div class="form-row">
          <div class="field"><label>${esc(T("admin.capMax"))}</label><input data-np-max type="number" inputmode="decimal" min="0" step="1" placeholder="40"></div>
          <div class="field"><label>${esc(T("admin.unit"))}</label><input data-np-unit placeholder="${esc(T("admin.boxesPh"))}"></div>
        </div>
        <div data-np-err></div>
        <button class="btn btn-small btn-primary" data-np-add style="width:100%">${esc(T("admin.capAdd"))}</button>
      </div>
    </div>`;
  }).join("");
}
function poolCardHtml(p) {
  const sel = new Set((p.item_ids || []).map(String));
  const areaItems = state.items.filter(i => i.active !== false && areaIdsOf(i).includes(String(p.area_id)));
  return `<div class="cap-pool" data-pool="${esc(p.id)}" style="border:1px solid var(--border);border-radius:10px;padding:10px;margin:10px 0">
    <div class="card-head" data-ap-head style="cursor:pointer">
      <div><strong>${esc(p.name)}</strong>
        <div class="muted" style="font-size:13px">${esc(T("admin.capMax"))}: ${esc(p.max_qty)}${p.unit ? " " + esc(p.unit) : ""} · ${sel.size} ${esc(T("admin.capItems")).toLowerCase()}</div>
      </div>
      <span data-ap-chev class="muted" style="font-size:18px;line-height:1">▾</span>
    </div>
    <div data-ap-body hidden>
    <div class="form-row" style="margin-top:8px">
      <div class="field"><label>${esc(T("admin.capName"))}</label><input data-pf="name" value="${esc(p.name)}"></div>
      <div class="field"><label>${esc(T("admin.capMax"))}</label><input data-pf="max_qty" type="number" inputmode="decimal" min="0" step="1" value="${esc(p.max_qty)}"></div>
    </div>
    <div class="field"><label>${esc(T("admin.unit"))}</label><input data-pf="unit" value="${esc(p.unit || "")}" placeholder="${esc(T("admin.boxesPh"))}"></div>
    <div class="field"><label>${esc(T("admin.capItems"))}</label>
      <div class="check-list">${areaItems.map(i =>
        `<label class="check"><input type="checkbox" data-pitem value="${esc(i.id)}" ${sel.has(String(i.id)) ? "checked" : ""}> ${esc(i.name)}</label>`).join("") || `<span class="muted">—</span>`}</div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-small btn-primary" data-p-save style="flex:1">${esc(T("common.save"))}</button>
      <button class="btn btn-small btn-danger" data-p-del>${esc(T("common.delete"))}</button>
    </div>
    <div class="muted" data-p-msg style="font-size:13px;margin-top:6px"></div>
    </div>
  </div>`;
}

/* ---------------- Vendors tab ---------------- */
/* ---------------- Vendors tab: day chips + time dropdown ---------------- */
/** Canonical short day keys, Monday-first. Stored as "Tue, Thu". */
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_EN = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const DAY_FULL = {
  mon: ["monday", "lunes", "lun"], tue: ["tuesday", "martes", "mar"],
  wed: ["wednesday", "miercoles", "miércoles", "mie", "mié"], thu: ["thursday", "jueves", "jue"],
  fri: ["friday", "viernes", "vie"], sat: ["saturday", "sabado", "sábado", "sab", "sáb"],
  sun: ["sunday", "domingo", "dom"],
};
/** Parse a free-text day list ("Tue, Thu", "tuesday thursday", "mar/jue") into day keys. */
function parseDays(str) {
  const found = [];
  String(str || "").toLowerCase().split(/[,\s;\/|]+/).forEach(t => {
    if (!t) return;
    const d = DAYS.find(k => t === k || t === DAY_EN[k].toLowerCase() || DAY_FULL[k].includes(t));
    if (d && !found.includes(d)) found.push(d);
  });
  return found;
}
/** Toggle chips for a multi-day field; canonical value lives in the hidden input. */
function dayChips(field, current) {
  const sel = parseDays(current);
  return `<div class="day-chips" data-daychips="${field}">` + DAYS.map(d =>
    `<button type="button" class="day-chip${sel.includes(d) ? " active" : ""}" data-day="${d}">${esc(T("day." + d))}</button>`
  ).join("") + `</div><input type="hidden" data-f="${field}" value="${esc(sel.map(d => DAY_EN[d]).join(", "))}">`;
}
/** 12-hour label for the order-by dropdown. */
function fmtTime(h, m) {
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return hh + ":" + (m === 0 ? "00" : "30") + " " + ap;
}
/* ---------------- Smart ordering ---------------- */
/** Day key -> JS weekday (0=Sunday..6=Saturday). */
const dayToWeekday = d => ({ sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }[d]);
const weekdayToDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
/** Effective daily usage: manual override wins, else learned, else null. */
function effUsage(item) {
  const m = Number(item.daily_usage_manual);
  if (item.daily_usage_manual != null && item.daily_usage_manual !== "" && m > 0) return m;
  const l = Number(item.daily_usage);
  if (item.daily_usage != null && item.daily_usage !== "" && l > 0) return l;
  return null;
}
/** "Days worth" of stock this vendor's order must cover for the given weekday. */
function coverageDays(vendorId, weekday) {
  const v = vendorOf(vendorId);
  const c = v && v.coverage ? Number(v.coverage[weekday]) : NaN;
  return c > 0 ? c : 1;
}
/**
 * Suggested order qty in count units. Mirrors the server.
 * target = max(par, usage * daysWorth) capped by max_on_hand;
 * rounded UP to whole cases via pieces_per_case.
 */
function suggestOrderQty(item, onHand, daysWorth) {
  return roundCases(rawOrderUnits(item, onHand, daysWorth), Number(item.pieces_per_case), true);
}
/** Raw (pre-case-rounding) order units. Shared by the plain and pool-capped paths. */
function rawOrderUnits(item, onHand, daysWorth) {
  if (capConflict(item, onHand, daysWorth)) return 0;
  return Math.max(0, orderTarget(item, daysWorth) - onHand);
}
/** Round units to whole cases. Rounds UP for normal orders ("can't order half
 *  a case"), DOWN when a storage-capacity pool bound the quantity (rounding up
 *  would overflow the space). */
function roundCases(units, ppc, roundUp) {
  if (ppc > 0) {
    const cases = roundUp ? Math.ceil(units / ppc - 1e-9) : Math.floor(units / ppc + 1e-9);
    return Math.max(0, cases) * ppc;
  }
  return Math.max(0, roundUp ? Math.ceil(units - 1e-9) : Math.floor(units + 1e-9));
}
/** Whole-case order qty that never exceeds max_on_hand: take the normal
 *  rounded-up qty, but if on-hand + that would pass the max, use the largest
 *  whole case that fits instead (possibly zero). Mirrors the server. */
function maxCappedQty(item, qty, onHand) {
  const maxOn = maxOnNum(item);
  if (maxOn == null) return qty;
  if (onHand + qty <= maxOn + 1e-9) return qty;
  return roundCases(Math.max(0, maxOn - onHand), Number(item.pieces_per_case), false);
}
/* ---- Storage capacity pools (mirrors the server) ----
 * A pool caps the combined on-hand + ordered quantity of items sharing space
 * in one area. buildPoolState() computes each pool's remaining room from the
 * session's per-area counts; allocatePoolSpace() consumes an item's raw units
 * from its pools, roomiest first. Allocation runs in name-sorted order so the
 * review preview matches what sessions.approve will create. */
function buildPoolState(byItem) {
  const pools = state.pools || [];
  if (!pools.length) return null;
  const itemsOfPool = new Map();
  for (const p of pools) itemsOfPool.set(String(p.id), new Set((p.item_ids || []).map(String)));
  const poolsOfItem = new Map();
  const remaining = new Map();
  for (const p of pools) {
    const pid = String(p.id);
    let load = 0;
    for (const iid of itemsOfPool.get(pid)) {
      const b = byItem[iid];
      if (b) for (const r of b.rows) {
        if (String(r.area_id) === String(p.area_id)) load += Number(r.count) || 0;
      }
    }
    remaining.set(pid, Math.max(0, Number(p.max_qty) - load));
    const named = { ...p, area_name: areaName(String(p.area_id)) };
    for (const iid of itemsOfPool.get(pid)) {
      if (!poolsOfItem.has(iid)) poolsOfItem.set(iid, []);
      poolsOfItem.get(iid).push(named);
    }
  }
  return { poolsOfItem, remaining };
}
function allocatePoolSpace(st, itemId, rawUnits, ppc) {
  const pools = [...(st.poolsOfItem.get(String(itemId)) || [])]
    .sort((a, b) => (st.remaining.get(String(b.id)) || 0) - (st.remaining.get(String(a.id)) || 0));
  const upQty = roundCases(rawUnits, ppc, true);
  if (!pools.length) return { qty: upQty, capped: false, pools: [] };
  let space = 0;
  for (const p of pools) space += st.remaining.get(String(p.id)) || 0;
  // Whole cases only: take the normal rounded-up qty when it fits, otherwise
  // the largest whole-case qty that fits (rounding up would overflow the space).
  let qty, capped;
  if (upQty <= space) { qty = upQty; capped = false; }
  else { qty = roundCases(space, ppc, false); capped = true; }
  let need = qty;
  for (const p of pools) {
    if (need <= 0) break;
    const pid = String(p.id);
    const take = Math.min(need, st.remaining.get(pid) || 0);
    if (take > 0) { st.remaining.set(pid, (st.remaining.get(pid) || 0) - take); need -= take; }
  }
  return { qty, capped, pools };
}
function poolNote(pools) {
  return pools.map(p => `${p.area_name ? p.area_name + " · " : ""}${p.name} (max ${Number(p.max_qty)}${p.unit ? " " + p.unit : ""})`).join(", ");
}
/** Apply pool caps to candidate lines (each {item, raw, dw}); returns a map
 *  itemId -> {qty, capped, pools}. Canonical name-sorted allocation order. */
function applyPoolCaps(cands, byItem) {
  const st = buildPoolState(byItem);
  const allocOrder = [...cands].sort((a, b) => String(a.item.name).localeCompare(String(b.item.name)));
  const out = new Map();
  for (const c of allocOrder) {
    const ppc = Number(c.item.pieces_per_case);
    const r = st ? allocatePoolSpace(st, c.item.id, c.raw, ppc)
                 : { qty: roundCases(c.raw, ppc, true), capped: false, pools: [] };
    out.set(String(c.item.id), r);
  }
  return out;
}
function maxOnNum(item) {
  const m = Number(item.max_on_hand);
  return (item.max_on_hand != null && item.max_on_hand !== "" && m > 0) ? m : null;
}
function orderTarget(item, daysWorth) {
  const par = Number(item.par ?? 0);
  const usage = effUsage(item);
  let target = usage != null ? Math.max(par, usage * daysWorth) : par;
  const maxOn = maxOnNum(item);
  if (maxOn != null) target = Math.min(target, maxOn);
  return target;
}
/** True when the item needs stock but a single case won't fit in max_on_hand
 *  (contradictory data — nothing is ordered; fix the max or the case size). */
function capConflict(item, onHand, daysWorth) {
  const ppc = Number(item.pieces_per_case);
  const maxOn = maxOnNum(item);
  return ppc > 0 && maxOn != null && ppc > maxOn && orderTarget(item, daysWorth) > onHand;
}
/** Per-order-day "days worth" inputs for a vendor card. */
function coverageEditor(v) {
  const sel = parseDays(v.order_days);
  if (!sel.length) return `<div class="muted" style="font-size:13px">${esc(T("vendor.coverageHint"))}</div>`;
  const cov = v.coverage || {};
  return sel.map(d => {
    const wd = dayToWeekday(d);
    return `<div class="cov-row"><span class="cov-day">${esc(T("day." + d))}</span>
      <input type="number" inputmode="decimal" min="0" step="0.5" data-cov="${wd}"
        value="${esc(cov[wd] ?? cov[String(wd)] ?? "")}" placeholder="1">
      <span class="muted">${esc(T("vendor.daysWorth"))}</span>
    </div>`;
  }).join("");
}
/** Order-cutoff dropdown: 6:00 AM – 10:00 PM in 30-min steps. Unmatched saved values are preserved. */
function timeOpts(current) {
  const cur = String(current || "");
  const opts = [`<option value="">—</option>`];
  let matched = !cur;
  for (let h = 6; h <= 22; h++) for (const m of [0, 30]) {
    if (h === 22 && m === 30) break;
    const label = fmtTime(h, m);
    if (label === cur) matched = true;
    opts.push(`<option value="${label}"${label === cur ? " selected" : ""}>${label}</option>`);
  }
  if (!matched) opts.splice(1, 0, `<option value="${esc(cur)}" selected>${esc(cur)}</option>`);
  return opts.join("");
}
function adminVendorsHtml() {
  return `<button class="btn btn-primary" id="av-add-toggle" style="width:100%;margin-bottom:12px">＋ ${esc(T("admin.addVendor"))}</button>
    <div class="admin-card" id="av-add-form" hidden>
      <h3 style="margin-top:0">${esc(T("admin.addVendor"))}</h3>
      <div class="form-row">
        <div class="field"><label>${esc(T("common.name"))}</label><input id="nv-name" placeholder="e.g. True World Foods"></div>
        <div class="field"><label>${esc(T("admin.email"))}</label><input id="nv-email" type="email" placeholder="orders@…"></div>
      </div>
      <div id="nv-err"></div>
      <button class="btn btn-primary" id="nv-add" style="width:100%">${esc(T("admin.addVendor"))}</button>
    </div>
    ${state.vendors.map(v => `
    <div class="admin-card" data-vendor="${esc(v.id)}">
      <div class="card-head" data-av-head style="cursor:pointer">
        <div><strong>${esc(v.name)}</strong>
          <div class="muted" style="font-size:13px">${[v.email, v.order_days].filter(Boolean).map(esc).join(" · ") || "—"}</div>
        </div>
        <span data-av-chev class="muted" style="font-size:18px;line-height:1">▾</span>
      </div>
      <div data-av-body hidden>
      <div class="form-row" style="margin-top:8px">
        <div class="field"><label>${esc(T("common.name"))}</label><input data-f="name" value="${esc(v.name)}"></div>
        <div class="field"><label>${esc(T("admin.email"))}</label><input data-f="email" type="email" value="${esc(v.email || "")}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("vendor.contactName"))}</label><input data-f="contact_name" value="${esc(v.contact_name || "")}" placeholder="${esc(T("vendor.contactNamePh"))}"></div>
        <div class="field"><label>${esc(T("vendor.contactPhone"))}</label><input data-f="contact_phone" inputmode="tel" value="${esc(v.contact_phone || "")}" placeholder="e.g. (702) 555-1234"></div>
      </div>
      <div class="field"><label>${esc(T("common.notes"))}</label><input data-f="notes" value="${esc(v.notes || "")}"></div>
      <div class="form-row">
        <div class="field"><label>${esc(T("vendor.orderDays"))}</label>${dayChips("order_days", v.order_days)}</div>
        <div class="field"><label>${esc(T("vendor.orderBy"))}</label><select data-f="order_cutoff">${timeOpts(v.order_cutoff)}</select></div>
      </div>
      <div class="field"><label>${esc(T("vendor.deliveryDays"))}</label>${dayChips("delivery_days", v.delivery_days)}</div>
      <div class="field"><label>${esc(T("vendor.orderDays"))} · ${esc(T("vendor.daysWorth"))}</label><div data-coverage-wrap>${coverageEditor(v)}</div></div>
      <button class="btn btn-primary btn-small" data-vsave style="width:100%">${esc(T("common.save"))}</button>
      </div>
    </div>`).join("")}`;
}

/* ---------------- Users tab ---------------- */
function adminUsersHtml() {
  const me = state.session.profile.id;
  const viewerIsSuper = state.session.profile.role === "superadmin";
  // Managers never see the superadmin option; only the superadmin can
  // grant it (the server enforces this too).
  const roleOpts = (sel) => ["superadmin", "manager", "staff", "view"]
    .filter(r => viewerIsSuper || r !== "superadmin")
    .map(r => `<option value="${r}" ${r === sel ? "selected" : ""}>${roleLabel(r)}</option>`).join("");
  // Managers see only managers and staff — superadmin rows are hidden from them.
  const visibleUsers = state.users.filter(u => viewerIsSuper || u.role !== "superadmin");
  return `<button class="btn btn-primary" id="au-add-toggle" style="width:100%;margin-bottom:12px">＋ ${esc(T("admin.addUser"))}</button>
    <div class="admin-card" id="au-add-form" hidden>
      <h3 style="margin-top:0">${esc(T("admin.addUser"))}</h3>
      <div class="form-row">
        <div class="field"><label>${esc(T("common.name"))}</label><input id="nu-name" placeholder="e.g. Kenji"></div>
        <div class="field"><label>${esc(T("admin.role"))}</label><select id="nu-role">${roleOpts("staff")}</select></div>
      </div>
      <div class="field"><label>${esc(T("admin.initPin"))}</label><input id="nu-pin" inputmode="numeric" placeholder="••••"></div>
      <div id="nu-err"></div>
      <button class="btn btn-primary" id="nu-add" style="width:100%">${esc(T("admin.addUser"))}</button>
    </div>
    ${visibleUsers.map(u => {
    const isSA = u.role === "superadmin";
    const isMe = String(u.id) === String(me);
    return `
    <div class="admin-card" data-user="${esc(u.id)}">
      <div class="card-head" data-au-head style="cursor:pointer">
        <div><strong>${esc(u.name)}</strong>${isMe ? ` <span class="pill pill-counted">${esc(T("admin.you"))}</span>` : ""}
          ${isSA ? ' <span class="pill pill-counted">Super Admin</span>' : ""}
          <div class="muted" style="font-size:13px">${esc(roleLabel(u.role))} · ${esc(u.active === false ? T("admin.disabled") : T("admin.active"))}</div></div>
        <div style="display:flex;align-items:center;gap:8px;flex:none">
        ${isSA
          ? (viewerIsSuper
              ? `<span class="muted" style="font-size:13px">${esc(T("admin.protected"))}</span>`
              : `<span class="muted" style="font-size:13px">${esc(T("admin.saLocked"))}</span>`)
          : `<button class="btn btn-small" data-u-toggle data-enable="${u.active === false ? "1" : ""}">${esc(u.active === false ? T("admin.enable") : T("admin.disable"))}</button>
              ${isMe ? "" : `<button class="btn btn-small btn-danger" data-u-delete>${esc(T("common.delete"))}</button>`}`}
        <span data-au-chev class="muted" style="font-size:18px;line-height:1">▾</span>
        </div>
      </div>
      <div data-au-body hidden>
      ${isSA
        ? `<div class="field" style="margin-top:8px"><label>${esc(T("admin.role"))}</label><div><strong>Super Admin</strong></div></div>`
        : `<div class="form-row" style="margin-top:8px">
        <div class="field"><label>${esc(T("admin.role"))}</label><select data-uf="role">${roleOpts(u.role)}</select></div>
        <div class="field"><label>&nbsp;</label><button class="btn btn-small" data-u-role style="width:100%">${esc(T("admin.saveRole"))}</button></div>
      </div>`}
      ${isSA && !viewerIsSuper ? "" : `
      <div class="field"><label>${esc(T("admin.setNewPin"))}</label>
        <div class="form-row">
          <input data-upin1 inputmode="numeric" placeholder="${esc(T("admin.newPin"))}">
          <input data-upin2 inputmode="numeric" placeholder="${esc(T("admin.confirmPin"))}">
        </div></div>
      <button class="btn btn-small" data-u-pin style="width:100%">${esc(T("admin.setPinBtn"))}</button>`}
      ${schedFlagsHtml(u, viewerIsSuper)}
      ${canSchedManage() && !isSA ? `<button class="btn btn-small" data-u-avail data-avail-name="${esc(u.name)}" style="width:100%;min-height:44px;margin-top:10px">📅 ${esc(T("admin.availFor"))}</button>` : ""}
      ${canSchedManage() && !isSA ? `<button class="btn btn-small" data-u-sprof style="width:100%;min-height:44px;margin-top:10px">⏱ ${esc(T("admin.schedprof"))}</button>
      <div data-u-sprof-form hidden style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
        <div class="form-row">
          <div class="field"><label>${esc(T("admin.schedprofMin"))}</label><input data-sp="min_hours" inputmode="numeric" placeholder="—"></div>
          <div class="field"><label>${esc(T("admin.schedprofMax"))}</label><input data-sp="max_hours" inputmode="numeric" placeholder="40"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc(T("admin.schedprofRank"))}</label><input data-sp="seniority_rank" inputmode="numeric" placeholder="—"></div>
          <div class="field"><label>${esc(T("admin.schedprofRest"))}</label><input data-sp="min_rest_hours" inputmode="numeric" placeholder="10"></div>
        </div>
        <label class="check-row" style="margin-top:8px"><input type="checkbox" data-sp="doubles_ok" checked>
          <span>${esc(T("admin.schedprofDoubles"))}</span></label>
        <button class="btn btn-small btn-primary" data-u-sprof-save style="width:100%;min-height:44px;margin-top:8px">${esc(T("admin.schedprofSave"))}</button>
      </div>` : ""}
      </div>
    </div>`;
    }).join("")}`;
}

/* ---------------- Import / Export tab ---------------- */
function adminIOHtml() {
  const killed = !!(state.settings && state.settings.app_disabled);
  // Most-used first; the kill switch sits last so a scroll can't land on it by accident.
  const killCard = `<div class="admin-card" style="border:2px solid #c62828">
      <h3 style="margin-top:0">${esc(T("admin.killTitle"))}</h3>
      <p class="muted">${esc(T("admin.killHelp"))}</p>
      <div style="margin:10px 0;font-size:16px">${killed ? "🔴" : "🟢"} <strong>${esc(killed ? T("admin.killDead") : T("admin.killLive"))}</strong></div>
      ${killed ? "" : `<div class="field"><label>${esc(T("admin.killType"))}</label>
        <input id="kill-confirm" placeholder="${esc(T("admin.killConfirmPh"))}" autocomplete="off"></div>`}
      <div id="kill-err"></div>
      <button class="btn ${killed ? "" : "btn-danger"}" id="kill-toggle" style="width:100%">
        ${esc(killed ? T("admin.killOn") : T("admin.killOff"))}</button>
    </div>`;
  return `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("update.pushTitle"))}</h3>
      <p class="muted">${esc(T("update.pushHelp"))}</p>
      <div id="push-msg"></div>
      <button class="btn btn-primary" id="push-update" style="width:100%">${esc(T("update.pushBtn"))}</button>
    </div>
    <div class="admin-card">
      <h3 style="margin-top:0">Store settings</h3>
      <div class="field"><label>Store name <span class="muted">(order card header)</span></label>
        <input id="set-store-name" value="${esc(storeName())}" maxlength="80"></div>
      <label class="check-row"><input type="checkbox" id="set-show-prices" ${showPrices() ? "checked" : ""}>
        <span><strong>Show prices in orders</strong><br>
        <span class="muted">When off, costs and totals are hidden from order previews and order cards.</span></span></label>
      <div id="set-msg" style="margin:8px 0"></div>
      <button class="btn btn-primary" id="set-save" style="width:100%">Save settings</button>
    </div>
    <div class="admin-card">
      <h3 style="margin-top:0">Export</h3>
      <p class="muted">Download a full JSON dump of the catalog and history.</p>
      <button class="btn" id="io-export" style="width:100%">Export JSON</button>
    </div>
    <div class="admin-card">
      <h3 style="margin-top:0">Import</h3>
      <p class="muted">Restore from a previously exported JSON file.</p>
      <div class="field"><label>JSON file</label><input type="file" id="io-file" accept="application/json"></div>
      <div class="confirm-box">
        <label><input type="checkbox" id="io-confirm">
          <span><strong>I understand this replaces the catalog and history.</strong>
          Existing items, areas, vendors and history will be overwritten.</span></label>
      </div>
      <div id="io-err"></div>
      <button class="btn btn-danger" id="io-import" style="width:100%">Import JSON</button>
      <div id="io-result" style="margin-top:10px"></div>
    </div>
    ${killCard}`;
}

/* ---------------- Admin wiring ---------------- */
/* ---------------- CSV bulk edit ---------------- */
function csvEsc(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function itemsToCsv(items) {
  const lines = ["id,name,area,vendor,par,unit,price,active"];
  for (const i of items) {
    // Multiple locations are joined with ", " (quoted automatically); the
    // importer splits on commas/semicolons back into separate locations.
    const areaCell = itemAreas(i).map(a => a.name).filter(Boolean).join(", ");
    lines.push([
      i.id, i.name, areaCell, i.vendor_name || "",
      Number(i.par) > 0 ? i.par : "", i.unit || "",
      Number(i.price) > 0 ? i.price : "", i.active === false ? "FALSE" : "TRUE",
    ].map(csvEsc).join(","));
  }
  return lines.join("\r\n");
}
/** Parse CSV text into rows of strings. Handles quoted fields, embedded commas/newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", q = false;
  for (let k = 0; k < text.length; k++) {
    const ch = text[k];
    if (q) {
      if (ch === '"') {
        if (text[k + 1] === '"') { cur += '"'; k++; }
        else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.length > 1 || String(r[0] ?? "").trim() !== "");
}

/* ---------------- Bulk edit tab ----------------
   Edit many items (or rename many locations) on one screen, then press
   Save once. Only changed rows are sent. A side slider scrolls the list. */
function adminBulkHtml(sub) {
  const subtab = (id, label) => `<button class="admin-tab ${sub === id ? "active" : ""}" data-bsub="${id}">${esc(label)}</button>`;
  const head = `<div class="admin-tabs" style="margin-bottom:12px">${subtab("items", T("admin.items"))}${subtab("areas", T("count.areasBtn"))}</div>`;
  return head + (sub === "areas" ? bulkAreasHtml() : bulkItemsHtml());
}

function bulkSliderHtml() {
  return `<div class="bulk-slider">
    <button class="bulk-jump" data-jump="top" tabindex="-1" title="${esc(T("bulk.jumpTop"))}">▲</button>
    <div class="bulk-track"><div class="bulk-thumb"></div></div>
    <button class="bulk-jump" data-jump="bottom" tabindex="-1" title="${esc(T("bulk.jumpBottom"))}">▼</button>
  </div>`;
}

function bulkSavebarHtml() {
  return `<div class="bulk-savebar"><button class="btn btn-primary" id="bulk-save" disabled>${esc(T("admin.bulkNoChanges"))}</button><span id="bulk-msg" class="muted"></span></div>`;
}

function bulkItemsHtml() {
  const vendorOpts = (sel) => `<option value="">—</option>` + state.vendors.map(v =>
    `<option value="${esc(v.id)}" ${String(v.id) === String(sel) ? "selected" : ""}>${esc(v.name)}</option>`).join("");
  const areaChecks = (selIds) => state.areas.map(a =>
    `<label class="check"><input type="checkbox" data-area-check value="${esc(a.id)}" ${selIds.includes(String(a.id)) ? "checked" : ""}> ${esc(a.name)}</label>`).join("");
  const rows = state.items.map(i => {
    const selIds = itemAreas(i).map(a => String(a.id));
    return `<div class="bulk-row" data-bulk-item="${esc(i.id)}">
      <button class="bulk-head" data-btoggle>
        <span class="bulk-chev">▸</span>
        <span class="bulk-name"><span data-bname>${esc(i.name)}</span>${i.active === false ? ` <em class="muted">(${esc(T("admin.archived"))})</em>` : ""}</span>
        <span class="bulk-dirty" hidden>●</span>
        <span class="bulk-sum muted"></span>
      </button>
      <div class="bulk-fields" hidden>
        <div class="form-row">
          <div class="field"><label>${esc(T("common.name"))}</label><input data-f="name" value="${esc(i.name)}"></div>
          <div class="field"><label>${esc(T("count.sortVendor"))}</label><select data-f="vendor_id">${vendorOpts(i.vendor_id)}</select></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc(T("par.par"))}</label><input data-f="par" type="number" inputmode="decimal" min="0" step="0.25" value="${Number(i.par) > 0 ? esc(i.par) : ""}" placeholder="—"></div>
          <div class="field"><label>${esc(T("par.price"))}</label><input data-f="price" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(i.price) > 0 ? esc(i.price) : ""}" placeholder="—"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc(T("admin.unit"))}</label><input data-f="unit" value="${esc(i.unit || "")}"></div>
          <div class="field"><label>${esc(T("admin.pieces"))}</label><input data-f="pieces_per_case" type="number" inputmode="numeric" min="0" value="${esc(i.pieces_per_case ?? "")}" placeholder="—"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc(T("admin.caseLabel"))}</label><input data-f="case_label" value="${esc(i.case_label || "")}" placeholder="—"></div>
          <div class="field"><label>${esc(T("item.dailyUsage"))}</label><input data-f="daily_usage_manual" type="number" inputmode="decimal" min="0" step="0.1" value="${esc(i.daily_usage_manual ?? "")}" placeholder="—"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc(T("item.maxOnHand"))}</label><input data-f="max_on_hand" type="number" inputmode="decimal" min="0" step="0.25" value="${esc(i.max_on_hand ?? "")}" placeholder="—"></div>
          <div class="field"><label>${esc(T("admin.bulkActive"))}</label><input data-f="active" type="checkbox" ${i.active !== false ? "checked" : ""} style="width:22px;height:22px"></div>
        </div>
        <div class="field"><label>${esc(T("count.areasBtn"))}</label><div class="check-list">${areaChecks(selIds)}</div></div>
      </div>
    </div>`;
  }).join("");
  return `<div class="admin-card" style="margin-bottom:12px">
      <h3 style="margin-top:0">${esc(T("admin.csvTitle"))}</h3>
      <p class="muted">${esc(T("admin.csvHelp"))}</p>
      <button class="btn" id="csv-download" style="width:100%">${esc(T("admin.csvDownload"))}</button>
      <div class="field" style="margin-top:10px"><label>${esc(T("admin.csvFile"))}</label>
        <input type="file" id="csv-file" accept=".csv,text/csv"></div>
      <div id="csv-err"></div>
      <button class="btn btn-primary" id="csv-upload" style="width:100%">${esc(T("admin.csvUpload"))}</button>
      <div id="csv-result" style="margin-top:10px"></div>
    </div>
    <div class="admin-card" id="bulk-items">
      <div class="field" style="margin-top:0"><input id="bulk-search" placeholder="${esc(T("count.search"))}"></div>
      <div class="bulk-wrap">
        <div class="bulk-scroll">${rows || `<div class="muted">${esc(T("count.noItems"))}</div>`}</div>
        ${bulkSliderHtml()}
      </div>
      <div class="bulk-nomatch muted" hidden>${esc(T("admin.bulkNoMatch"))}</div>
      ${bulkSavebarHtml()}
    </div>`;
}

function bulkAreasHtml() {
  const rows = state.areas.map(a => `
    <div class="bulk-row bulk-area-row" data-bulk-area="${esc(a.id)}">
      <input data-f="name" value="${esc(a.name)}" aria-label="${esc(T("admin.areaName"))}">
      <span class="bulk-dirty" hidden>●</span>
    </div>`).join("");
  return `<div class="admin-card" id="bulk-areas">
      <div class="bulk-wrap">
        <div class="bulk-scroll">${rows || `<div class="muted">${esc(T("count.noItems"))}</div>`}</div>
        ${bulkSliderHtml()}
      </div>
      ${bulkSavebarHtml()}
    </div>`;
}

// Read a bulk item row's current field values, normalized the same way the
// API expects them — used both for the original snapshot and the diff.
function readBulkItemRow(row) {
  const q = (f) => row.querySelector(`[data-f="${f}"]`);
  const v = (f) => q(f) ? q(f).value : "";
  const numOrNull = (s) => s === "" ? null : Number(s);
  return {
    name: v("name").trim(),
    vendor_id: v("vendor_id") || null,
    par: v("par") === "" ? 0 : Number(v("par")),
    price: v("price") === "" ? 0 : Number(v("price")),
    unit: v("unit").trim(),
    pieces_per_case: numOrNull(v("pieces_per_case")),
    case_label: v("case_label").trim(),
    daily_usage_manual: numOrNull(v("daily_usage_manual")),
    max_on_hand: numOrNull(v("max_on_hand")),
    active: q("active") ? q("active").checked : true,
    area_ids: [...row.querySelectorAll("[data-area-check]:checked")].map(b => b.value),
  };
}

function bulkSummary(p) {
  return `Par ${fmtCount(p.par)} · ${p.price > 0 ? "$" + Number(p.price).toFixed(2) : "—"}`;
}

function wireBulkSlider(wrap) {
  const scroller = wrap.querySelector(".bulk-scroll");
  const slider = wrap.querySelector(".bulk-slider");
  if (!scroller || !slider) return;
  const track = slider.querySelector(".bulk-track");
  const thumb = slider.querySelector(".bulk-thumb");
  const update = () => {
    const max = scroller.scrollHeight - scroller.clientHeight;
    const ratio = max > 0 ? scroller.scrollTop / max : 0;
    const range = Math.max(track.clientHeight - thumb.offsetHeight, 0);
    thumb.style.top = (ratio * range) + "px";
    slider.style.display = max > 0 ? "" : "none";
  };
  scroller.addEventListener("scroll", update, { passive: true });
  slider.querySelector('[data-jump="top"]').onclick = () => scroller.scrollTo({ top: 0, behavior: "smooth" });
  slider.querySelector('[data-jump="bottom"]').onclick = () => scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  let dragging = false, startY = 0, startScroll = 0;
  thumb.addEventListener("pointerdown", (e) => {
    dragging = true; startY = e.clientY; startScroll = scroller.scrollTop;
    try { thumb.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
  });
  thumb.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const max = scroller.scrollHeight - scroller.clientHeight;
    const range = Math.max(track.clientHeight - thumb.offsetHeight, 1);
    scroller.scrollTop = Math.min(Math.max(startScroll + ((e.clientY - startY) / range) * max, 0), max);
  });
  const stop = () => { dragging = false; };
  thumb.addEventListener("pointerup", stop);
  thumb.addEventListener("pointercancel", stop);
  wrap._sliderUpdate = update;
  requestAnimationFrame(update);
  update();
}

function wireBulkItems() {
  const wrap = document.getElementById("bulk-items");
  if (!wrap) return;
  const saveBtn = wrap.querySelector("#bulk-save");
  const msg = wrap.querySelector("#bulk-msg");
  const search = wrap.querySelector("#bulk-search");
  const nomatch = wrap.querySelector(".bulk-nomatch");
  const rows = [...wrap.querySelectorAll("[data-bulk-item]")];
  const orig = new Map(rows.map(r => [r.dataset.bulkItem, JSON.stringify(readBulkItemRow(r))]));
  const isDirty = (r) => JSON.stringify(readBulkItemRow(r)) !== orig.get(r.dataset.bulkItem);

  const refresh = () => {
    const d = rows.filter(isDirty);
    rows.forEach(r => {
      const p = readBulkItemRow(r);
      const dirty = JSON.stringify(p) !== orig.get(r.dataset.bulkItem);
      r.classList.toggle("dirty", dirty);
      r.querySelector(".bulk-dirty").hidden = !dirty;
      r.querySelector("[data-bname]").textContent = p.name || "—";
      r.querySelector(".bulk-sum").textContent = bulkSummary(p);
    });
    saveBtn.disabled = !d.length;
    saveBtn.textContent = d.length ? T("admin.bulkSave").replace("{n}", d.length) : T("admin.bulkNoChanges");
    if (d.length) { msg.textContent = ""; msg.className = "muted"; }
  };

  wrap.addEventListener("input", refresh);
  wrap.addEventListener("change", refresh);
  wrap.querySelectorAll("[data-btoggle]").forEach(b => b.onclick = () => {
    const row = b.closest("[data-bulk-item]");
    const fields = row.querySelector(".bulk-fields");
    fields.hidden = !fields.hidden;
    b.querySelector(".bulk-chev").textContent = fields.hidden ? "▸" : "▾";
  });
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach(r => {
      const show = !q || r.querySelector("[data-bname]").textContent.toLowerCase().includes(q);
      r.style.display = show ? "" : "none";
      if (show) shown++;
    });
    nomatch.hidden = shown > 0;
    if (wrap._sliderUpdate) wrap._sliderUpdate();
  });

  saveBtn.onclick = async () => {
    const d = rows.filter(isDirty);
    if (d.some(r => !readBulkItemRow(r).name)) {
      msg.textContent = T("admin.itemNeedName"); msg.className = "error"; return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = T("common.saving");
    msg.textContent = ""; msg.className = "muted";
    let ok = 0, failed = 0;
    const results = await Promise.all(d.map(r =>
      edge("items.update", { item_id: r.dataset.bulkItem, ...readBulkItemRow(r) })
        .then(res => ({ ok: true, row: r, item: res.item }))
        .catch(() => ({ ok: false, row: r }))
    ));
    const failNames = [];
    results.forEach(res => {
      if (res.ok && res.item) {
        ok++;
        const idx = state.items.findIndex(x => String(x.id) === String(res.row.dataset.bulkItem));
        if (idx >= 0) state.items[idx] = res.item;
        orig.set(res.row.dataset.bulkItem, JSON.stringify(readBulkItemRow(res.row)));
      } else { failed++; failNames.push(readBulkItemRow(res.row).name || "—"); }
    });
    if (!failed) { msg.textContent = T("admin.bulkSaved").replace("{n}", ok); msg.className = "ok"; showSavedToast(); }
    else { msg.textContent = T("admin.bulkFail").replace("{n}", failed) + " " + failNames.join(", "); msg.className = "error"; }
    refresh();
  };

  wireBulkSlider(wrap);
  refresh();
}

function wireBulkAreas() {
  const wrap = document.getElementById("bulk-areas");
  if (!wrap) return;
  const saveBtn = wrap.querySelector("#bulk-save");
  const msg = wrap.querySelector("#bulk-msg");
  const rows = [...wrap.querySelectorAll("[data-bulk-area]")];
  const val = (r) => r.querySelector('[data-f="name"]').value.trim();
  const orig = new Map(rows.map(r => [r.dataset.bulkArea, val(r)]));
  const isDirty = (r) => val(r) !== orig.get(r.dataset.bulkArea);

  const refresh = () => {
    const d = rows.filter(isDirty);
    rows.forEach(r => {
      const dirty = isDirty(r);
      r.classList.toggle("dirty", dirty);
      r.querySelector(".bulk-dirty").hidden = !dirty;
    });
    saveBtn.disabled = !d.length;
    saveBtn.textContent = d.length ? T("admin.bulkSave").replace("{n}", d.length) : T("admin.bulkNoChanges");
    if (d.length) { msg.textContent = ""; msg.className = "muted"; }
  };
  wrap.addEventListener("input", refresh);

  saveBtn.onclick = async () => {
    const d = rows.filter(isDirty);
    if (d.some(r => !val(r))) {
      msg.textContent = T("admin.areaNeedName"); msg.className = "error"; return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = T("common.saving");
    msg.textContent = ""; msg.className = "muted";
    let ok = 0, failed = 0;
    const results = await Promise.all(d.map(r =>
      edge("areas.rename", { area_id: r.dataset.bulkArea, name: val(r) })
        .then(res => ({ ok: true, row: r, area: res.area }))
        .catch(() => ({ ok: false, row: r }))
    ));
    const failNames = [];
    results.forEach(res => {
      if (res.ok && res.area) {
        ok++;
        const a = state.areas.find(x => String(x.id) === String(res.row.dataset.bulkArea));
        if (a) a.name = res.area.name;
        orig.set(res.row.dataset.bulkArea, val(res.row));
      } else { failed++; failNames.push(val(res.row) || "—"); }
    });
    if (!failed) { msg.textContent = T("admin.bulkSaved").replace("{n}", ok); msg.className = "ok"; showSavedToast(); }
    else { msg.textContent = T("admin.bulkFail").replace("{n}", failed) + " " + failNames.join(", "); msg.className = "error"; }
    refresh();
  };

  wireBulkSlider(wrap);
  refresh();
}

function wireAdmin(tab, arg2) {
  const body = document.getElementById("admin-body");
  const rerender = () => renderAdmin(tab, arg2);

  if (tab === "items") {
    const addToggle = document.getElementById("ai-add-toggle");
    const addForm = document.getElementById("ai-add-form");
    if (addToggle && addForm) addToggle.onclick = () => { addForm.hidden = !addForm.hidden; };
    document.getElementById("ni-add").onclick = async () => {
      const name = document.getElementById("ni-name").value.trim();
      const err = document.getElementById("ni-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.itemNeedName"))}</div>`; return; }
      err.innerHTML = "";
      try {
        await edge("items.create", {
          name,
          area_ids: [...document.querySelectorAll("#ni-areas [data-area-check]:checked")].map(b => b.value),
          vendor_id: document.getElementById("ni-vendor").value || null,
          par: Number(document.getElementById("ni-par").value) || 0,
          unit: document.getElementById("ni-unit").value.trim(),
          price: Number(document.getElementById("ni-price").value) || 0,
        });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addItemFail"))}</div>`; }
    };
    const searchInput = document.getElementById("ai-search");
    if (searchInput) searchInput.oninput = (e) => {
      adminItemSearch = e.target.value;
      const list = document.getElementById("admin-item-list");
      if (list) { list.innerHTML = adminItemCardsHtml(); wireItemCards(list, rerender); }
    };
    wireItemCards(body, rerender);
  }

  if (tab === "bulk") {
    document.querySelectorAll("[data-bsub]").forEach(b => b.onclick = () => go("#/admin/bulk/" + b.dataset.bsub));
    if (arg2 === "areas") wireBulkAreas();
    else wireBulkItems();
    // CSV export/import lives on the Bulk tab (items sub-tab).
    const csvDl = document.getElementById("csv-download");
    if (csvDl) csvDl.onclick = () => {
      const blob = new Blob([itemsToCsv(state.items)], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sumo-items-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
    const csvUp = document.getElementById("csv-upload");
    if (csvUp) csvUp.onclick = async () => {
      const err = document.getElementById("csv-err");
      const res = document.getElementById("csv-result");
      err.innerHTML = ""; res.innerHTML = "";
      const f = document.getElementById("csv-file").files[0];
      if (!f) { err.innerHTML = `<div class="error">${esc(T("admin.csvNeedFile"))}</div>`; return; }
      let text;
      try { text = await f.text(); }
      catch (e) { err.innerHTML = `<div class="error">${esc(T("admin.csvBadFile"))}</div>`; return; }
      const parsed = parseCsv(text);
      if (!parsed.length) { err.innerHTML = `<div class="error">${esc(T("admin.csvBadFile"))}</div>`; return; }
      let start = 0;
      if (String(parsed[0][0] ?? "").trim().toLowerCase() === "id") start = 1;
      const cols = ["id", "name", "area", "vendor", "par", "unit", "price", "active"];
      const rows = [];
      for (let k = start; k < parsed.length; k++) {
        const o = {};
        cols.forEach((c, ci) => { o[c] = parsed[k][ci] ?? ""; });
        if (!String(o.id).trim() && !String(o.name).trim()) continue;
        rows.push(o);
      }
      if (!rows.length) { err.innerHTML = `<div class="error">${esc(T("admin.csvBadFile"))}</div>`; return; }
      try {
        const r = await edge("items.bulk", { rows });
        let html = `<div class="ok">${esc(T("admin.csvResult").replace("{u}", r.updated).replace("{c}", r.created))}</div>`;
        if (r.errors && r.errors.length) {
          html += `<div class="error" style="margin-top:8px">${esc(T("admin.csvErrors").replace("{n}", r.errors.length))}</div><ul class="muted">` +
            r.errors.map(e => `<li>${esc(T("admin.csvRow").replace("{r}", e.row).replace("{name}", e.name || "—").replace("{error}", e.error))}</li>`).join("") +
            `</ul>`;
        }
        res.innerHTML = html;
        rerender();
        // rerender() rebuilds the tab — restore the result message.
        const res2 = document.getElementById("csv-result");
        if (res2) res2.innerHTML = html;
      } catch (e) {
        err.innerHTML = `<div class="error">${esc(e.detail || T("admin.csvBadFile"))}</div>`;
      }
    };
  }

  if (tab === "areas") {
    const aaToggle = document.getElementById("aa-add-toggle");
    const aaForm = document.getElementById("aa-add-form");
    if (aaToggle && aaForm) aaToggle.onclick = () => { aaForm.hidden = !aaForm.hidden; };
    document.getElementById("na-add").onclick = async () => {
      const name = document.getElementById("na-name").value.trim();
      const err = document.getElementById("na-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.areaNeedName"))}</div>`; return; }
      try { await edge("areas.create", { name }); rerender(); showSavedToast(); }
      catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addAreaFail"))}</div>`; }
    };
    body.querySelectorAll("[data-area-row]").forEach(card => {
      const id = card.dataset.areaRow;
      const head = card.querySelector("[data-aa-head]");
      const abody = card.querySelector("[data-aa-body]");
      const chev = card.querySelector("[data-aa-chev]");
      if (head && abody) head.onclick = () => {
        const opening = abody.hidden;
        abody.hidden = !opening;
        if (chev) chev.textContent = opening ? "▴" : "▾";
      };
      card.querySelector("[data-arename]").onclick = async () => {
        const name = card.querySelector("[data-aname]").value.trim();
        if (!name) { flashError(T("admin.areaNeedName")); return; }
        try { await edge("areas.rename", { area_id: id, name }); rerender(); showSavedToast(); }
        catch (e) { flashError(e.detail || T("admin.renameFail")); }
      };
      card.querySelector("[data-adelete]").onclick = async () => {
        const a = state.areas.find(x => String(x.id) === String(id));
        if (await confirmDialog(T("admin.delAreaTitle"), T("admin.delAreaMsg").replace("{name}", a ? a.name : id), T("common.delete"))) {
          try { await edge("areas.delete", { area_id: id }); rerender(); }
          catch (e) { flashError(e.detail || T("admin.delAreaFail")); }
        }
      };
    });
  }

  if (tab === "vendors") {
    const avToggle = document.getElementById("av-add-toggle");
    const avForm = document.getElementById("av-add-form");
    if (avToggle && avForm) avToggle.onclick = () => { avForm.hidden = !avForm.hidden; };
    document.getElementById("nv-add").onclick = async () => {
      const name = document.getElementById("nv-name").value.trim();
      const err = document.getElementById("nv-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.vendorNeedName"))}</div>`; return; }
      try {
        await edge("vendors.create", { name, email: document.getElementById("nv-email").value.trim() });
        rerender(); showSavedToast();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addVendorFail"))}</div>`; }
    };
    body.querySelectorAll("[data-vendor]").forEach(card => {
      const id = card.dataset.vendor;
      const head = card.querySelector("[data-av-head]");
      const vbody = card.querySelector("[data-av-body]");
      const chev = card.querySelector("[data-av-chev]");
      if (head && vbody) head.onclick = () => {
        const opening = vbody.hidden;
        vbody.hidden = !opening;
        if (chev) chev.textContent = opening ? "▴" : "▾";
      };
      // Day chips: toggle + keep the hidden data-f input canonical ("Tue, Thu").
      // Toggling order days re-renders the per-day coverage editor (unsaved edits kept).
      card.querySelectorAll("[data-daychips]").forEach(wrap => {
        const field = wrap.dataset.daychips;
        const hidden = card.querySelector(`input[data-f="${field}"]`);
        const rerenderCoverage = () => {
          if (field !== "order_days") return;
          const cwrap = card.querySelector("[data-coverage-wrap]");
          if (!cwrap) return;
          const stash = {};
          cwrap.querySelectorAll("[data-cov]").forEach(inp => { if (inp.value !== "") stash[inp.dataset.cov] = inp.value; });
          const v = vendorOf(id);
          cwrap.innerHTML = coverageEditor({ order_days: hidden.value, coverage: { ...(v.coverage || {}), ...stash } });
        };
        wrap.querySelectorAll("[data-day]").forEach(chip => {
          chip.onclick = () => {
            chip.classList.toggle("active");
            hidden.value = [...wrap.querySelectorAll("[data-day].active")]
              .map(c => DAY_EN[c.dataset.day]).join(", ");
            rerenderCoverage();
          };
        });
      });
      card.querySelector("[data-vsave]").onclick = async () => {
        const data = {};
        card.querySelectorAll("[data-f]").forEach(inp => data[inp.dataset.f] = inp.value);
        try {
          await edge("vendors.update", { vendor_id: id, ...data });
          const coverage = {};
          card.querySelectorAll("[data-cov]").forEach(inp => {
            const dw = Number(inp.value);
            if (inp.value !== "" && dw > 0) coverage[inp.dataset.cov] = dw;
          });
          await edge("vendors.setCoverage", { vendor_id: id, coverage });
          const v = vendorOf(id);
          if (v) v.coverage = coverage;
          flashSaved(card);
        }
        catch (e) { flashError(e.detail || T("admin.vendorSaveFail")); }
      };
    });
  }

  if (tab === "capacity") {
    body.querySelectorAll("[data-cap-area]").forEach(card => {
      const areaId = card.dataset.capArea;
      const npToggle = card.querySelector("[data-np-toggle]");
      const npForm = card.querySelector("[data-np-form]");
      if (npToggle && npForm) npToggle.onclick = () => { npForm.hidden = !npForm.hidden; };
      const addBtn = card.querySelector("[data-np-add]");
      addBtn.onclick = async () => {
        if (addBtn.disabled) return; // double-tap guard: one create at a time
        const name = card.querySelector("[data-np-name]").value.trim();
        const max = Number(card.querySelector("[data-np-max]").value);
        const unit = card.querySelector("[data-np-unit]").value.trim();
        const err = card.querySelector("[data-np-err]");
        err.innerHTML = "";
        if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.capNeedName"))}</div>`; return; }
        if (!(max > 0)) { err.innerHTML = `<div class="error">${esc(T("admin.capNeedMax"))}</div>`; return; }
        addBtn.disabled = true;
        try {
          const r = await edge("pools.create", { area_id: areaId, name, max_qty: max, unit: unit || null });
          const pool = { ...(r.pool || {}), item_ids: [] };
          state.pools = [...(state.pools || []), pool];
          rerender();
          showSavedToast();
        } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.capAddFail"))}</div>`; }
        finally { addBtn.disabled = false; }
      };
    });
    body.querySelectorAll("[data-pool]").forEach(card => {
      const id = card.dataset.pool;
      const head = card.querySelector("[data-ap-head]");
      const pbody = card.querySelector("[data-ap-body]");
      const chev = card.querySelector("[data-ap-chev]");
      if (head && pbody) head.onclick = (e) => {
        if (e.target.closest("[data-p-save],[data-p-del]")) return; // action buttons handle their own tap
        const opening = pbody.hidden;
        pbody.hidden = !opening;
        if (chev) chev.textContent = opening ? "▴" : "▾";
      };
      const msg = m => { card.querySelector("[data-p-msg]").textContent = m || ""; };
      card.querySelector("[data-p-save]").onclick = async (ev) => {
        const btn = ev.currentTarget;
        if (btn.disabled) return; // double-tap guard: one save at a time
        const v = f => card.querySelector(`[data-pf="${f}"]`).value.trim();
        const name = v("name"), max = Number(v("max_qty")), unit = v("unit");
        msg("");
        if (!name) { msg(T("admin.capNeedName")); return; }
        if (!(max > 0)) { msg(T("admin.capNeedMax")); return; }
        const itemIds = [...card.querySelectorAll("[data-pitem]:checked")].map(x => x.value);
        btn.disabled = true;
        try {
          const r = await edge("pools.update", { id, name, max_qty: max, unit: unit || null });
          const rs = await edge("pools.set_items", { id, item_ids: itemIds });
          state.pools = (state.pools || []).map(p => String(p.id) === String(id)
            ? { ...(r.pool || p), item_ids: rs.item_ids || itemIds } : p);
          flashSaved(card);
        } catch (e) { msg(e.detail || T("admin.capSaveFail")); }
        finally { btn.disabled = false; }
      };
      card.querySelector("[data-p-del]").onclick = async () => {
        const p = (state.pools || []).find(x => String(x.id) === String(id));
        if (!await confirmDialog(T("admin.capDelTitle"), T("admin.capDelMsg").replace("{name}", p ? p.name : id), T("common.delete"))) return;
        try {
          await edge("pools.delete", { id });
          state.pools = (state.pools || []).filter(x => String(x.id) !== String(id));
          rerender();
        } catch (e) { flashError(e.detail || T("admin.capDelFail")); }
      };
    });
  }

  if (tab === "users") {
    const auToggle = document.getElementById("au-add-toggle");
    const auForm = document.getElementById("au-add-form");
    if (auToggle && auForm) auToggle.onclick = () => { auForm.hidden = !auForm.hidden; };
    document.getElementById("nu-add").onclick = async () => {
      const name = document.getElementById("nu-name").value.trim();
      const pin = document.getElementById("nu-pin").value.trim();
      const err = document.getElementById("nu-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.userNeedName"))}</div>`; return; }
      if (pin.length < 4) { err.innerHTML = `<div class="error">${esc(T("setpin.min4"))}</div>`; return; }
      try {
        await edge("users.create", { name, role: document.getElementById("nu-role").value, pin });
        rerender(); showSavedToast();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addUserFail"))}</div>`; }
    };
    body.querySelectorAll("[data-user]").forEach(card => {
      const id = card.dataset.user;
      const head = card.querySelector("[data-au-head]");
      const ubody = card.querySelector("[data-au-body]");
      const chev = card.querySelector("[data-au-chev]");
      if (head && ubody) head.onclick = (e) => {
        if (e.target.closest("[data-u-toggle],[data-u-delete]")) return; // enable/disable + delete handle their own tap
        const opening = ubody.hidden;
        ubody.hidden = !opening;
        if (chev) chev.textContent = opening ? "▴" : "▾";
      };
      // The superadmin row omits some controls (read-only for managers);
      // guard each wiring so one missing button can't break the rest.
      const tgl = card.querySelector("[data-u-toggle]");
      if (tgl) tgl.onclick = async () => {
        try {
          // Enable flips active back on; disable uses the dedicated endpoint
          // (it also kills the user's sessions). users.disable can NOT re-enable.
          if (tgl.dataset.enable) await edge("users.update", { user_id: id, active: true });
          else await edge("users.disable", { user_id: id });
          rerender();
        } catch (e) { flashError(e.detail || T("admin.userStatusFail")); }
      };
      const del = card.querySelector("[data-u-delete]");
      if (del) del.onclick = async () => {
        const nm = (card.querySelector(".card-head strong") || {}).textContent || "this user";
        if (!await confirmDialog(T("users.deleteTitle"), T("users.deleteMsg").replace("{name}", nm.trim()), T("common.delete"))) return;
        try { await edge("users.delete", { user_id: id }); rerender(); }
        catch (e) { flashError(e.detail || T("users.deleteFail")); }
      };
      // Manager-only availability editor entry: opens the shared availability
      // editor bound to this employee's profile_id (backend enforces the
      // manager-only rule on availability.get/set too).
      const avBtn = card.querySelector("[data-u-avail]");
      if (avBtn) avBtn.onclick = () => {
        state.availForName = avBtn.dataset.availName || "";
        go("#/sched/avail?for=" + encodeURIComponent(id));
      };
      // Manager-only scheduling-profile editor: first tap lazy-loads the
      // employee's current values from schedprofile.get, then toggles the
      // inline form; Save writes via schedprofile.set (backend enforces the
      // manager-only rule on both actions too).
      const spBtn = card.querySelector("[data-u-sprof]");
      const spForm = card.querySelector("[data-u-sprof-form]");
      const spSave = card.querySelector("[data-u-sprof-save]");
      if (spBtn && spForm && spSave) {
        let spLoaded = false;
        spBtn.onclick = async () => {
          if (spForm.hidden && !spLoaded) {
            try {
              const r = await edge("schedprofile.get", { profile_id: id });
              const pr = (r && r.profile) || {};
              const setVal = (k, v) => { const el = spForm.querySelector(`[data-sp="${k}"]`); if (el) el.value = v == null ? "" : v; };
              setVal("min_hours", pr.min_hours);
              setVal("max_hours", pr.max_hours);
              setVal("seniority_rank", pr.seniority_rank);
              setVal("min_rest_hours", pr.min_rest_hours);
              const dbl = spForm.querySelector('[data-sp="doubles_ok"]');
              if (dbl) dbl.checked = pr.doubles_ok !== false;
              spLoaded = true;
            } catch (e) { flashError(e.detail || T("admin.schedprofFail")); return; }
          }
          spForm.hidden = !spForm.hidden;
        };
        spSave.onclick = async () => {
          spSave.disabled = true; // double-submit guard
          try {
            const num = (k) => { const v = spForm.querySelector(`[data-sp="${k}"]`).value.trim(); return v === "" ? null : Number(v); };
            await edge("schedprofile.set", {
              profile_id: id,
              min_hours: num("min_hours"),
              max_hours: num("max_hours"),
              seniority_rank: num("seniority_rank"),
              min_rest_hours: num("min_rest_hours"),
              doubles_ok: spForm.querySelector('[data-sp="doubles_ok"]').checked,
            });
            flashSaved(card);
          } catch (e) { flashError(e.detail || T("admin.schedprofFail")); }
          finally { spSave.disabled = false; }
        };
      }
      const roleBtn = card.querySelector("[data-u-role]");
      if (roleBtn) roleBtn.onclick = async () => {
        const role = card.querySelector('[data-uf="role"]').value;
        try { await edge("users.update", { user_id: id, role }); flashSaved(card); }
        catch (e) { flashError(e.detail || T("admin.roleFail")); }
      };
      const pinBtn = card.querySelector("[data-u-pin]");
      if (pinBtn) pinBtn.onclick = async () => {
        const p1 = card.querySelector("[data-upin1]").value.trim();
        const p2 = card.querySelector("[data-upin2]").value.trim();
        if (p1.length < 4) { flashError(T("setpin.min4")); return; }
        if (p1 !== p2) { flashError(T("admin.pinMismatch")); return; }
        try { await edge("users.set-pin", { user_id: id, pin: p1 }); flashSaved(card); }
        catch (e) { flashError(e.detail || T("admin.setPinFail")); }
      };
      // Schedule-access controls (view / department / position for managers;
      // "can manage" only rendered for superadmin editors).
      const schedBtn = card.querySelector("[data-u-sched]");
      if (schedBtn) schedBtn.onclick = async () => {
        schedBtn.disabled = true; // double-submit guard
        try {
          const payload = { profile_id: id };
          const vs = card.querySelector('[data-sf="can_view_schedule"]');
          if (vs) payload.can_view_schedule = vs.value === "1";
          const ds = card.querySelector('[data-sf="department"]');
          if (ds) payload.department = ds.value || null;
          const ps = card.querySelector('[data-sf="position"]');
          if (ps) payload.position = ps.value.trim() || null;
          const ms = card.querySelector('[data-sf="can_manage_schedule"]');
          if (ms && !ms.disabled) payload.can_manage_schedule = ms.checked;
          const co = card.querySelector('[data-sf="can_open"]');
          if (co) payload.can_open = co.checked;
          const cc = card.querySelector('[data-sf="can_close"]');
          if (cc) payload.can_close = cc.checked;
          const sg = card.querySelector('[data-sf="sched_group"]');
          if (sg) payload.sched_group = sg.value.trim() || null;
          await edge("users.set_schedule_flags", payload).then(r => {
            const rec = (state.users || []).find(x => String(x.id) === String(id));
            if (rec && r && r.user) Object.assign(rec, r.user);
          });
          flashSaved(card);
        } catch (e) { flashError(e.detail || T("sched.flagsFail")); }
        finally { schedBtn.disabled = false; }
      };
    });
  }

  if (tab === "io") {
    const killBtn = document.getElementById("kill-toggle");
    if (killBtn) killBtn.onclick = async () => {
      const killed = !!(state.settings && state.settings.app_disabled);
      const err = document.getElementById("kill-err");
      err.innerHTML = "";
      if (!killed) {
        const inp = document.getElementById("kill-confirm");
        if (!inp || inp.value.trim() !== "SHUT OFF") {
          err.innerHTML = `<div class="error">${esc(T("admin.killMismatch"))}</div>`;
          return;
        }
      } else {
        if (!await confirmDialog(T("admin.killTitle"), T("admin.killOnMsg"), T("admin.killOn"))) return;
      }
      try {
        const r = await edge("admin.kill", { disabled: !killed });
        state.settings = Object.assign({}, state.settings, { app_disabled: !!r.app_disabled });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.killFail"))}</div>`; }
    };
    const pushBtn = document.getElementById("push-update");
    if (pushBtn) pushBtn.onclick = async () => {
      const msg = document.getElementById("push-msg");
      msg.innerHTML = "";
      try {
        const v = String(Date.now());
        await edge("settings.set", { key: "app_version", value: v });
        state.settings = Object.assign({}, state.settings, { app_version: v });
        msg.innerHTML = `<div class="ok">${esc(T("update.pushed"))}</div>`;
        // The push only bumps the server signal — this browser still runs the
        // cached bundle until it does a real page load (index.html cache-busts
        // app.js on every load). Hard-refresh so this device picks up the
        // deployed code too; the seen-version is stored before reloading, so
        // the fresh load won't banner or loop.
        setTimeout(hardRefreshToLatest, 800);
      } catch (e) { msg.innerHTML = `<div class="error">${esc(e.detail || T("update.pushFail"))}</div>`; }
    };
    document.getElementById("set-save").onclick = async () => {
      const msg = document.getElementById("set-msg");
      const name = document.getElementById("set-store-name").value.trim();
      const show = document.getElementById("set-show-prices").checked;
      if (!name) { msg.innerHTML = `<div class="error">Store name can't be empty.</div>`; return; }
      msg.innerHTML = `<span class="muted">Saving…</span>`;
      try {
        await edge("settings.set", { key: "store_name", value: name });
        await edge("settings.set", { key: "show_prices", value: show });
        state.settings = { store_name: name, show_prices: show };
        msg.innerHTML = `<span style="color:var(--ok)">Saved.</span>`; showSavedToast();
      } catch (e) { msg.innerHTML = `<div class="error">${esc(e.detail || "Could not save settings.")}</div>`; }
    };
    document.getElementById("io-export").onclick = async () => {
      try {
        const data = await edge("export");
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sumo-inventory-export-" + new Date().toISOString().slice(0, 10) + ".json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      } catch (e) { flashError(e.detail || "Export failed."); }
    };
    document.getElementById("io-import").onclick = async () => {
      const err = document.getElementById("io-err");
      const resBox = document.getElementById("io-result");
      err.innerHTML = ""; resBox.innerHTML = "";
      if (!document.getElementById("io-confirm").checked) {
        err.innerHTML = `<div class="error">Check the red confirmation box first.</div>`;
        return;
      }
      const file = document.getElementById("io-file").files[0];
      if (!file) { err.innerHTML = `<div class="error">Choose a JSON file first.</div>`; return; }
      let data;
      try { data = JSON.parse(await file.text()); }
      catch (e) { err.innerHTML = `<div class="error">That file isn't valid JSON.</div>`; return; }
      if (!await confirmDialog("Import?", "This replaces the catalog and history. This cannot be undone.", "Import")) return;
      try {
        const r = await edge("import", { confirm: true, data });
        const counts = r.counts || r || {};
        resBox.innerHTML = `<div class="notice">Import complete: ` +
          Object.entries(counts).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(", ") + `</div>`;
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || "Import failed.")}</div>`; }
    };
  }
}

/** Brief "saved" feedback on a card. */
function flashSaved(card) {
  const b = card.querySelector("[data-ai-save],[data-vsave],[data-u-role],[data-p-save]");
  if (b) { const t = b.textContent; b.textContent = "✓ " + T("common.saved"); setTimeout(() => b.textContent = t, 1500); }
  showSavedToast();
}
/** Global green "Saved" toast at the top of the screen; auto-dismisses. */
let savedToastTimer = null;
function showSavedToast(msg) {
  let el = document.getElementById("saved-toast");
  if (!el) { el = document.createElement("div"); el.id = "saved-toast"; document.body.appendChild(el); }
  // Race guard: if the user navigated within the last 1.5s (e.g. tapped Save
  // then switched tabs before the save resolved), the toast belongs to the old
  // screen — drop it instead of flashing "Saved" somewhere unexpected.
  if (Date.now() - (state.lastNavAt || 0) < 1500) return;
  el.textContent = msg || T("common.saved");
  el.dataset.route = location.hash;
  el.removeAttribute("aria-hidden");
  // Restart the slide-down animation + dismissal timer on repeat saves.
  el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  clearTimeout(savedToastTimer);
  savedToastTimer = setTimeout(() => { el.classList.remove("show"); el.setAttribute("aria-hidden", "true"); }, 2500);
}

/* ======================= SCHEDULE (Phase 1) ======================== */
/* HotSchedules-style scheduling for a single store. Phase 1: My Week and
 * Team views, a manager schedule builder (draft -> publish), time-off
 * requests with an approval inbox, weekly availability, and a shift swap
 * board (release -> teammate pickup -> manager approve/deny, with in-app
 * notifications carrying the decision). Weeks are Mon–Sun, handled as
 * local-date YYYY-MM-DD strings. */

/* ---------- date helpers ---------- */
/** Format a Date as local YYYY-MM-DD. */
function schedIso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
/** Start (local) of the week containing d, honoring the configured start day. */
let schedWeekStartDayNum = 1; // 0=Sun..6=Sat; loaded from the server per schedule render
let schedBuilderView = "groups"; // builder roster view: "groups" | "employees"
let schedPositions = []; // managed position list; loaded from the server
let schedGroupOrder = []; // manager-arranged group display order; loaded from the server
let schedEmployeeOrder = []; // manager-arranged employee display order (profile ids)
/** Store-level schedule settings: week-start day + managed position list. */
async function schedLoadScheduleSettings() {
  try {
    const r = await edge("schedule.get_settings");
    const n = Number(r.week_start_day);
    if (Number.isInteger(n) && n >= 0 && n <= 6) schedWeekStartDayNum = n;
    if (Array.isArray(r.positions)) schedPositions = r.positions.filter(x => typeof x === "string");
    if (Array.isArray(r.group_order)) schedGroupOrder = r.group_order.filter(x => typeof x === "string");
    if (Array.isArray(r.employee_order)) schedEmployeeOrder = r.employee_order.filter(x => typeof x === "string");
  } catch (e) { /* keep defaults */ }
  return schedWeekStartDayNum;
}
function schedWeekStart(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() - schedWeekStartDayNum + 7) % 7));
  return x;
}
/** Strict YYYY-MM-DD check (no rollover: "2026-13-40" fails). */
function schedValidIso(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}
function schedAddIso(iso, n) {
  const p = String(iso).split("-").map(Number);
  if (p.length !== 3 || p.some(x => !Number.isInteger(x))) return null;
  return schedIso(new Date(p[0], p[1] - 1, p[2] + n));
}
/** Week start from the ?w=YYYY-MM-DD query param, else this week's start day. */
function schedWeekStartFromRoute() {
  const q = (state.route && state.route.query) || "";
  const m = q.match(/(?:^|&)w=(\d{4}-\d{2}-\d{2})(?:&|$)/);
  if (m && schedValidIso(m[1])) return m[1];
  return schedIso(schedWeekStart(new Date()));
}
/** Team tab mode: the week grid only when ?w= is present; otherwise the
 *  single-day view (?d= or today). Default is the day view. */
function schedTeamMode() {
  const q = (state.route && state.route.query) || "";
  return /(?:^|&)w=\d{4}-\d{2}-\d{2}(?:&|$)/.test(q) ? "week" : "day";
}
/** Day for the team day view: ?d=YYYY-MM-DD, else today (invalid -> today). */
function schedTeamDay() {
  const q = (state.route && state.route.query) || "";
  const m = q.match(/(?:^|&)d=(\d{4}-\d{2}-\d{2})(?:&|$)/);
  if (m && schedValidIso(m[1])) return m[1];
  return schedIso(new Date());
}
/** Availability tab target: ?for=<profile_id> lets a manager edit someone else's
 *  availability with the same editor (saved via availability.set profile_id).
 *  Null = the viewer's own availability. */
function schedAvailForId() {
  const q = (state.route && state.route.query) || "";
  const m = q.match(/(?:^|&)for=([^&]+)(?:&|$)/);
  return m ? decodeURIComponent(m[1]) : null;
}
/** availability.set request body: a manager-targeted edit carries the target
 *  profile_id (backend permits it for superadmin / schedule managers only);
 *  the self-service editor sends rows alone. */
function schedAvailSetBody(forId, rows) {
  return forId ? { profile_id: forId, rows } : { rows };
}
/** Week start containing a day ISO, honoring the store's week-start day. */
function schedWeekStartOfDay(dayIso) {
  const p = String(dayIso).split("-").map(Number);
  if (p.length !== 3 || p.some(x => !Number.isInteger(x))) return schedIso(schedWeekStart(new Date()));
  return schedIso(schedWeekStart(new Date(p[0], p[1] - 1, p[2])));
}
/** "Mon 9/28" (locale-aware). */
function schedDayLabel(iso) {
  const p = iso.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(locale(), { weekday: "short", month: "numeric", day: "numeric" });
}
/** "09/29/2026" — zero-padded mm/dd/yyyy for an ISO date. */
function schedFmtMDY(iso) {
  const p = String(iso || "").split("-").map(Number);
  if (p.length !== 3 || p.some(n => !Number.isInteger(n))) return String(iso || "");
  return String(p[1]).padStart(2, "0") + "/" + String(p[2]).padStart(2, "0") + "/" + p[0];
}
/** Full weekday name. */
function schedDayName(iso) {
  const p = iso.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(locale(), { weekday: "long" });
}
function schedWeekRangeLabel(weekStart) {
  return schedDayLabel(weekStart) + " – " + schedDayLabel(schedAddIso(weekStart, 6));
}
/** "14:00" / "14:00:00" -> locale time ("2:00 PM"). */
function schedFmtTime(t) {
  if (!t) return "";
  const p = String(t).split(":").map(Number);
  if (p.some(isNaN)) return String(t);
  return new Date(2000, 0, 1, p[0], p[1] || 0).toLocaleTimeString(locale(), { hour: "numeric", minute: "2-digit" });
}
/** Compact chip time range: "5:00 PM–11:59 PM" -> "5:00–11:59 PM" (meridiem shown once when shared).
 *  Locale-aware: also compacts es-US forms like "5:00 p.m.–11:59 p.m." and leaves 24h forms alone. */
function schedFmtTimeRange(a, b) {
  const s = schedFmtTime(a), e = schedFmtTime(b);
  const mer = (x) => { const m = /(\s*[AP]M|\s*[ap]\.\s*m\.)$/i.exec(x); return m ? m[0] : ""; };
  const ms = mer(s), me = mer(e);
  if (ms && me && ms.toLowerCase() === me.toLowerCase()) return s.slice(0, s.length - ms.length) + "–" + e;
  return s + "–" + e;
}
/** Minutes in one shift (overnight-safe). */
function schedShiftMinutes(start, end) {
  const t = (x) => { const p = String(x || "").slice(0, 5).split(":").map(Number); return (p[0] || 0) * 60 + (p[1] || 0); };
  let d = t(end) - t(start);
  if (d < 0) d += 1440;
  return d;
}
/** Total scheduled hours for one person in the current builder week. */
function schedPersonHours(pid) {
  let m = 0;
  for (const s of ((state.sched && state.sched.shifts) || []))
    if (String(s.profile_id) === String(pid)) m += schedShiftMinutes(s.start_time, s.end_time);
  return m / 60;
}
/** "37.5h" / "40h" */
function schedHoursLabel(h) { return (Math.round(h * 10) / 10) + "h"; }
/** Display-order weekday name for the availability editor (display index 0=Mon..6=Sun;
 *  stored availability.weekday is 0=Sunday, mapped via (i+1)%7 at the call sites). */
function schedWeekdayName(i) {
  return new Date(2026, 8, 28 + i).toLocaleDateString(locale(), { weekday: "long" }); // 2026-09-28 is a Monday
}
/** Is the schedule published (staff-visible)? */
function schedIsPublished(schedule) {
  return !!(schedule && (schedule.status === "published" || schedule.published));
}

/** Warning code -> localized message key. timeoff_approved is the hard one. */
const SCHED_WARN_KEYS = {
  timeoff_approved: "sched.warnApproved",
  timeoff_pending: "sched.warnPending",
  unavailable: "sched.warnUnavailable",
  limited_hours: "sched.warnLimited",
  blocked_hours: "sched.warnBlocked",
};
const schedWarnMsg = (code) => SCHED_WARN_KEYS[code] ? T(SCHED_WARN_KEYS[code]) : code;

/* ---------- main view ---------- */
async function renderSchedule(sub, arg2) {
  const notAuth = () => {
    $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div>
      <button class="btn" onclick="location.hash='#/home'">${esc(T("common.back"))}</button></div>`;
    $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  };
  if (!canSchedView()) { notAuth(); return; }

  const tabs = [["my", T("sched.my")], ["team", T("sched.team")], ["swaps", T("sched.swapBoard")]];
  if (canSchedManage()) tabs.push(["builder", T("sched.builder")], ["staffing", T("sched.staffing")]);
  tabs.push(["timeoff", T("sched.timeoff")], ["avail", T("sched.avail")]);
  if (!tabs.some(([id]) => id === sub)) sub = "my";
  await schedLoadScheduleSettings(); // store-level week-start day + position list
  // All schedule tabs honor ?w= so managers and staff can page weeks. Availability
  // is recurring (Mon–Sun repeats), so it shows an explanatory label instead.
  const weekStart = schedWeekStartFromRoute();
  // The Team tab defaults to the single-day view (?d= or today); ?w= keeps
  // the week grid. teamDay is null unless the day view is active.
  const teamDay = sub === "team" && schedTeamMode() === "day" ? schedTeamDay() : null;

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("tour.schedT"))}</h1>
    <div class="admin-tabs no-print" style="margin-bottom:12px">
      ${tabs.map(([id, label]) => `<button class="admin-tab ${sub === id ? "active" : ""}" data-stab="${id}">${esc(label)}</button>`).join("")}
    </div>
    ${sub === "avail"
      ? `<p class="muted" style="margin:0 0 12px">${esc(T("sched.availRecurring"))}</p>`
      : sub === "staffing"
        ? `<p class="muted" style="margin:0 0 12px">${esc(T("sched.staffingRecurring"))}</p>`
        : teamDay ? schedDayNavHtml(teamDay) : schedWeekNav(sub, weekStart)}
    ${sub === "my" ? `<div class="no-print" style="display:flex;margin-bottom:12px">
      <button class="btn btn-small" data-cal-export style="margin-left:auto">📅 ${esc(T("sched.addToCalendar"))}</button>
    </div>` : ""}
    <div id="sched-body" style="min-height:40vh"><div class="loading">${esc(T("sched.loading"))}</div></div>
  </div>`;

  $app().querySelectorAll("[data-stab]").forEach(b => b.onclick = async () => {
    if (b.dataset.stab === sub) return;
    // Unsaved form edits OR an open editor modal would be lost on switch.
    const modalOpen = !!document.getElementById("modal-back");
    if (state.schedDirty || modalOpen) {
      const ok = await confirmDialog(T("sched.dirtyTitle"), T("sched.dirtyMsg"), T("sched.discard"), null, false);
      if (!ok) return;
      state.schedDirty = false;
      closeModal();
    }
    go("#/sched/" + b.dataset.stab);
  });
  // The tab bar overflows on phones — keep the active tab visible.
  const activeStab = $app().querySelector('[data-stab].active');
  if (activeStab && activeStab.scrollIntoView) activeStab.scrollIntoView({ inline: "center", block: "nearest" });
  $app().querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  const navLang = $app().querySelector('[data-act="nav-lang"]');
  if (navLang) navLang.onclick = () => { setLang(lang() === "es" ? "en" : "es"); router(); };
  const calBtn = $app().querySelector("[data-cal-export]");
  if (calBtn) calBtn.onclick = schedCalRangeDialog;
  // Team day view: the native date picker jumps straight to that day.
  const dayPick = $app().querySelector("[data-sched-day]");
  if (dayPick) dayPick.onchange = () => { if (schedValidIso(dayPick.value)) go("#/sched/team?d=" + dayPick.value); };

  const body = $app().querySelector("#sched-body");
  try {
    if (sub === "my") body.innerHTML = await schedMyHtml(weekStart);
    else if (sub === "team") body.innerHTML = await schedTeamHtml(weekStart, teamDay);
    else if (sub === "swaps") body.innerHTML = await schedSwapsHtml();
    else if (sub === "builder") body.innerHTML = await schedBuilderHtml(weekStart);
    else if (sub === "staffing") body.innerHTML = await schedStaffingHtml();
    else if (sub === "timeoff") body.innerHTML = await schedTimeoffHtml();
    else body.innerHTML = await schedAvailHtml();
    $app().querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
    wireSchedBody(sub, weekStart, body);
  } catch (e) {
    if (e.status === 401 || e.code === "unauthorized") { sessionExpired(); return; }
    body.innerHTML = `<div class="error">${esc(e.detail || e.code || "Error")}</div>`;
  }
}

/** Week nav: ← Previous week · This week · Next week →, plus the week range. */
function schedWeekNav(sub, weekStart) {
  const prev = schedAddIso(weekStart, -7), next = schedAddIso(weekStart, 7);
  const cur = schedIso(schedWeekStart(new Date()));
  return `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px" class="no-print">
    <button class="btn btn-small" data-go="#/sched/${sub}?w=${prev}">← ${esc(T("sched.prevWeek"))}</button>
    <button class="btn btn-small" data-go="#/sched/${sub}?w=${cur}">${esc(T("sched.thisWeek"))}</button>
    <button class="btn btn-small" data-go="#/sched/${sub}?w=${next}">${esc(T("sched.nextWeek"))} →</button>
    ${sub === "team" ? schedDayWeekToggle("week", weekStart) : ""}
    <strong style="margin-left:auto">${esc(schedWeekRangeLabel(weekStart))}</strong>
  </div>`;
}
/** Day ⇄ Week segmented toggle for the Team tab. In week mode `ref` is the
 *  week start (Day jumps to its first day); in day mode `ref` is the day
 *  (Week jumps to the week containing it). */
function schedDayWeekToggle(mode, ref) {
  const dayHref = `#/sched/team?d=${mode === "week" ? ref : schedTeamDay()}`;
  const weekHref = `#/sched/team?w=${schedWeekStartOfDay(ref)}`;
  const btn = (m, href, labelKey) => m === mode
    ? `<button class="btn btn-small btn-primary" disabled>${esc(T(labelKey))}</button>`
    : `<button class="btn btn-small" data-go="${href}">${esc(T(labelKey))}</button>`;
  return `<div style="display:flex;gap:4px" role="group" aria-label="${esc(T("sched.viewLabel"))}">${btn("day", dayHref, "sched.dayView")}${btn("week", weekHref, "sched.weekView")}</div>`;
}
/** Day nav: ← Previous day · Today · Next day → + a native date picker. */
function schedDayNavHtml(day) {
  const prev = schedAddIso(day, -1), next = schedAddIso(day, 1);
  const today = schedIso(new Date());
  return `${schedDayWeekToggle("day", day)}
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0" class="no-print">
    <button class="btn btn-small" data-go="#/sched/team?d=${prev}">← ${esc(T("sched.prevDay"))}</button>
    <button class="btn btn-small" data-go="#/sched/team?d=${today}">${esc(T("sched.todayBtn"))}</button>
    <button class="btn btn-small" data-go="#/sched/team?d=${next}">${esc(T("sched.nextDay"))} →</button>
    <input type="date" data-sched-day value="${esc(day)}" aria-label="${esc(T("sched.pickDate"))}" title="${esc(T("sched.pickDate"))}"
      style="min-height:44px;font-size:16px;padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);color:var(--text)">
    <strong style="margin-left:auto">${esc(schedDayName(day))} · ${esc(schedDayLabel(day))}</strong>
  </div>`;
}

/* ---------- Calendar export (.ics) ---------- */
// One .ics file the phone opens in its own calendar app (iOS Calendar,
// Google Calendar on Android). Times are America/Los_Angeles via VTIMEZONE,
// so DST is handled no matter where the file is opened.
function schedIcsEscape(s) {
  return String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
function schedIcsStamp(dateIso, timeHm) {
  const t = String(timeHm || "00:00").slice(0, 5).split(":");
  return `${dateIso.replace(/-/g, "")}T${t[0]}${t[1]}00`;
}
function schedBuildIcs(shifts) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const evts = shifts.map(s => {
    const d = String(s.date || "").slice(0, 10);
    const st = String(s.start_time || "00:00").slice(0, 5), et = String(s.end_time || "00:00").slice(0, 5);
    const endDate = et <= st ? schedAddIso(d, 1) : d; // overnight guard
    const pos = s.position || "";
    const bits = [s.station ? `Station: ${s.station}` : "", s.notes || ""].filter(Boolean);
    return ["BEGIN:VEVENT",
      `UID:shift-${s.id}@sumo-inventory`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/Los_Angeles:${schedIcsStamp(d, st)}`,
      `DTEND;TZID=America/Los_Angeles:${schedIcsStamp(endDate, et)}`,
      `SUMMARY:${schedIcsEscape(pos ? `Sumo Sushi — ${pos}` : "Sumo Sushi")}`,
      bits.length ? `DESCRIPTION:${schedIcsEscape(bits.join("\n"))}` : null,
      "LOCATION:Sumo Sushi Warm Springs",
      "END:VEVENT"].filter(Boolean).join("\r\n");
  }).join("\r\n");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sumo Inventory//Schedule//EN",
    "BEGIN:VTIMEZONE", "TZID:America/Los_Angeles",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0800", "TZOFFSETTO:-0700", "TZNAME:PDT",
    "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:-0700", "TZOFFSETTO:-0800", "TZNAME:PST",
    "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
    "END:VTIMEZONE", evts, "END:VCALENDAR"].filter(Boolean).join("\r\n") + "\r\n";
}
function schedDownloadIcs(filename, text) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
/** Fetch my shifts for the next `weeks` published weeks and download an .ics. */
async function schedExportCalendar(weeks) {
  const me = String(state.session.profile.id);
  const monday = schedIso(schedWeekStart(new Date()));
  const shifts = [];
  for (let w = 0; w < weeks; w++) {
    try {
      const r = await schedGetWeek(schedAddIso(monday, w * 7));
      if (!schedIsPublished(r.schedule)) continue;
      for (const s of (r.shifts || [])) if (String(s.profile_id) === me) shifts.push(s);
    } catch (e) { /* skip weeks that fail to load */ }
  }
  if (!shifts.length) { flashError(T("sched.calEmpty")); return; }
  shifts.sort((a, b) => String(a.date).localeCompare(String(b.date))
    || String(a.start_time).localeCompare(String(b.start_time)));
  schedDownloadIcs(`sumo-schedule-${monday}.ics`, schedBuildIcs(shifts));
  showSavedToast(T("sched.calDone"));
}
function schedCalRangeDialog() {
  showModal(`<h3>📅 ${esc(T("sched.addToCalendar"))}</h3>
    <p class="muted">${esc(T("sched.calRange"))}</p>
    <div class="modal-actions" style="flex-direction:column;align-items:stretch">
      <button class="btn" data-cal-weeks="1">${esc(T("sched.thisWeek"))}</button>
      <button class="btn" data-cal-weeks="2">${esc(T("sched.cal2Weeks"))}</button>
      <button class="btn" data-cal-weeks="4">${esc(T("sched.cal4Weeks"))}</button>
    </div>`);
  document.querySelectorAll("[data-cal-weeks]").forEach(b => b.onclick = async () => {
    closeModal();
    b.disabled = true;
    try { await schedExportCalendar(Number(b.dataset.calWeeks)); }
    catch (e) { flashError(e.detail || e.message || "Error"); }
  });
}

/* ---------- My Week ---------- */
/** Unpublished-week dead end: explain + point at the swap board instead. */
function schedNoPublishedHtml() {
  return `<p class="muted">${esc(T("sched.noPublished"))}</p>
    <p><a href="#/sched/swaps">${esc(T("sched.checkSwaps"))}</a></p>`;
}
/** Amber banner for managers viewing a draft (unpublished) week. */
function schedDraftBannerHtml() {
  return `<div class="banner" style="margin-bottom:10px">⚠️ <strong>${esc(T("sched.draftBanner"))}</strong></div>`;
}
/** Draft-week policy: managers see the draft shifts with a banner; everyone
 *  else keeps the unpublished dead end. The backend only returns draft shifts
 *  to managers, so r.schedule is null for staff here (defense in depth). */
function schedDraftView(r) {
  return !!(r.schedule && !schedIsPublished(r.schedule) && canSchedManage());
}
async function schedMyHtml(weekStart) {  const me = String(state.session.profile.id);
  const r = await schedGetWeek(weekStart);
  if (!schedIsPublished(r.schedule) && !schedDraftView(r)) return schedNoPublishedHtml();
  const draft = schedDraftView(r);
  const days = [];
  for (let i = 0; i < 7; i++) days.push(schedAddIso(weekStart, i));
  const mine = (r.shifts || []).filter(s => String(s.profile_id) === me);
  if (!mine.length) return `<p class="muted">${esc(T("sched.noShifts"))}</p>`;
  const byStart = (a, b) => String(a.start_time || "").localeCompare(String(b.start_time || ""));
  // Active swap listings keyed by shift id, so My Week shows the release
  // button or the current listing status per shift.
  const swapByShift = {};
  let swapsFailed = false;
  try {
    const sw = await edge("swaps.list");
    for (const x of (sw.swaps || [])) {
      if (x && x.shift && !["approved", "denied", "cancelled"].includes(x.status)) swapByShift[String(x.shift.id)] = x;
    }
  } catch (e) { swapsFailed = true; /* board unavailable: say so, don't silently drop Release buttons */ }
  const nowLocal = new Date();
  const nowIso = schedIso(nowLocal);
  const nowHM = String(nowLocal.getHours()).padStart(2, "0") + ":" + String(nowLocal.getMinutes()).padStart(2, "0");
  // Release only for future shifts: a later date, or today with a start time still ahead.
  const canReleaseShift = (s) => {
    const d = String(s.date || "").slice(0, 10);
    if (d !== nowIso) return d > nowIso;
    return String(s.start_time || "").slice(0, 5) > nowHM;
  };
  const body = days.map(d => {
    const ds = mine.filter(s => String(s.date || "").slice(0, 10) === d).sort(byStart);
    return `<div class="admin-card" style="margin-bottom:10px">
      <div class="card-head"><strong>${esc(schedDayName(d))}</strong><span class="muted">${esc(schedDayLabel(d))}</span></div>
      ${ds.length ? ds.map(s => {
        const swp = swapByShift[String(s.id)];
        const relBtn = !swp && canReleaseShift(s)
          ? `<button class="btn btn-small btn-ghost" data-release-shift="${esc(s.id)}" data-shift-label="${esc(schedDayLabel(s.date) + " " + schedFmtTime(s.start_time) + "–" + schedFmtTime(s.end_time))}" style="margin-top:6px">🔄 ${esc(T("sched.release"))}</button>`
          : swp ? `<div style="margin-top:6px">${schedSwapStatusPill(swp.status)}</div>` : "";
        return `
        <div style="padding:8px 0;border-top:1px solid var(--border)">
          <strong>${esc(schedFmtTime(s.start_time))} – ${esc(schedFmtTime(s.end_time))}</strong>
          ${s.position ? `<div class="muted" style="font-size:13px">${esc(s.position)}${s.station ? " · " + esc(s.station) : ""}</div>` : ""}
          ${s.notes ? `<div class="muted" style="font-size:13px">${esc(s.notes)}</div>` : ""}
          ${relBtn}
        </div>`; }).join("") : `<p class="muted" style="margin:8px 0 0">${esc(T("sched.noShiftsDay"))}</p>`}
    </div>`;
  }).join("");
  const warn = swapsFailed ? `<div class="banner" style="margin-bottom:10px">⚠️ ${esc(T("sched.swapsLoadFail"))}</div>` : "";
  return (draft ? schedDraftBannerHtml() : "") + warn + body;
}

/* ---------- shared week grid ---------- */
/** Week grid: rows of people, 7 day columns. Sticky header row, horizontal
 *  scroll on small screens. cellHtml(row, iso) -> cell contents HTML. */
/* Group roster rows under labeled headers, mirroring the paper schedule's
   blocks. Items carry a `group` string; "" = ungrouped, rendered last under an
   "Ungrouped" header only when other groups exist. Otherwise the list stays flat. */
function schedGroupRows(items) {
  const order = [], seen = new Map();
  for (const it of items) {
    const g = (it.group || "").trim();
    if (!seen.has(g)) { seen.set(g, []); order.push(g); }
    seen.get(g).push(it);
  }
  // Manager-arranged group order first, then any new groups alphabetically;
  // ungrouped always last.
  const rank = new Map(schedGroupOrder.map((g, i) => [String(g).toLowerCase(), i]));
  order.sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const ra = rank.has(a.toLowerCase()) ? rank.get(a.toLowerCase()) : Infinity;
    const rb = rank.has(b.toLowerCase()) ? rank.get(b.toLowerCase()) : Infinity;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
  if (order.length === 1 && order[0] === "") return items;
  const out = [];
  for (const g of order) {
    out.push({ header: g || T("sched.ungrouped") });
    out.push(...seen.get(g));
  }
  return out;
}
function schedGridHtml(days, rows, cellHtml, dayHeadExtra) {
  const headCell = "position:sticky;top:var(--sticky-top, 57px);background:var(--card);z-index:2;padding:8px;border-bottom:1px solid var(--border)";
  const rowLabelBase = "padding:8px;font-weight:600;border-top:1px solid var(--border);position:sticky;left:0;z-index:3";
  const rowLabel = rowLabelBase + ";background:var(--card)";
  const rowLabelZebra = rowLabelBase + ";background:var(--zebra-label)";
  const groupHead = "grid-column:1/-1;padding:10px 8px 6px;font-weight:800;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--accent);border-top:1px solid var(--border);position:sticky;left:0;background:var(--card);z-index:3";
  // Zebra striping: alternate person rows get a subtle tint (label column +
  // day cells) so a row is easy to track across the columns. Group headers
  // stay untinted.
  let alt = false;
  const personRow = (row) => {
    alt = !alt;
    const cellBg = alt ? "background:var(--zebra-cell);" : "";
    return `
        <div style="${alt ? rowLabelZebra : rowLabel}">${esc(row.label)}${row.sub ? `<div class="muted" style="font-size:12px;font-weight:400">${esc(row.sub)}</div>` : ""}</div>
        ${days.map(d => `<div style="padding:4px;border-top:1px solid var(--border);min-height:66px;${cellBg}">${cellHtml(row, d)}</div>`).join("")}
      `;
  };
  return `<div class="sched-grid-fade"><div style="overflow-x:auto"><div style="min-width:780px">
    <div style="display:grid;grid-template-columns:150px repeat(7,minmax(116px,1fr))">
      <div style="${headCell};left:0;z-index:4"></div>
      ${days.map(d => `<div style="${headCell};font-weight:700;text-align:center">${esc(schedDayLabel(d))}${dayHeadExtra ? `<div>${dayHeadExtra(d)}</div>` : ""}</div>`).join("")}
      ${rows.map(row => row.header ? `<div style="${groupHead}">${esc(row.header)}</div>` : personRow(row)).join("")}
    </div>
  </div></div>`;
}
function schedWeekDays(weekStart) {
  const days = [];
  for (let i = 0; i < 7; i++) days.push(schedAddIso(weekStart, i));
  return days;
}
function schedByStart(a, b) { return String(a.start_time || "").localeCompare(String(b.start_time || "")); }

/** Team-view roster rows, grouped by schedule group for managers (flat for staff). */
async function schedTeamRows(names, hoursBy) {
  let groupOf = {};
  if (canSchedManage()) {
    try {
      const u = await edge("users.list", {}).catch(() => null);
      for (const x of ((u && (u.users || u)) || [])) groupOf[String(x.id)] = (x.sched_group || "").trim();
    } catch (e) { /* fall through to flat list */ }
  }
  return [...names.entries()].map(([id, name]) => ({
    id, label: name, group: groupOf[String(id)] || "",
    sub: hoursBy ? schedHoursLabel(hoursBy[String(id)] || 0) : "",
  })).sort((a, b) => String(a.label).localeCompare(String(b.label)));
}

/* ---------- Team (read-only; draft visible to managers with a banner) ---------- */
/** One read-only shift chip, shared by the Team week grid and the day view. */
function schedShiftChipHtml(s) {
  return `
      <div style="padding:6px;border:1px solid var(--border);border-radius:8px;margin:2px 0">
        <strong>${esc(schedFmtTimeRange(s.start_time, s.end_time))}</strong>
        ${s.position ? `<div class="muted" style="font-size:12px">${esc(s.position)}${s.station ? " · " + esc(s.station) : ""}</div>` : ""}
      </div>`;
}
/** Team tab dispatcher: the day view by default (?d= or today), the week
 *  grid when ?w= is present. */
async function schedTeamHtml(weekStart, teamDay) {
  if (teamDay) return schedTeamDayHtml(teamDay);
  return schedTeamWeekHtml(weekStart);
}
/** Week grid (behavior unchanged). */
async function schedTeamWeekHtml(weekStart) {
  const r = await schedGetWeek(weekStart);
  if (!schedIsPublished(r.schedule) && !schedDraftView(r)) return schedNoPublishedHtml();
  const draft = schedDraftView(r);
  const days = schedWeekDays(weekStart);
  const names = new Map();
  const byCell = {};
  for (const s of (r.shifts || [])) {
    const pid = String(s.profile_id);
    if (!names.has(pid)) names.set(pid, s.profile_name || pid);
    const k = pid + "|" + String(s.date || "").slice(0, 10);
    (byCell[k] = byCell[k] || []).push(s);
  }
  const hoursBy = {};
  for (const s of (r.shifts || [])) {
    const pid = String(s.profile_id);
    hoursBy[pid] = (hoursBy[pid] || 0) + schedShiftMinutes(s.start_time, s.end_time) / 60;
  }
  const rows = schedGroupRows(await schedTeamRows(names, hoursBy));
  if (!rows.length) return `<p class="muted">${esc(T("sched.noShifts"))}</p>`;
  const grid = schedGridHtml(days, rows, (row, d) =>
    ((byCell[row.id + "|" + d] || []).sort(schedByStart).map(schedShiftChipHtml).join("")));
  return (draft ? schedDraftBannerHtml() : "") + grid;
}
/** Single-day view: everyone working that day, grouped exactly like the week
 *  grid, each person with their shift chips. Same published-only rule as the
 *  week view (draft week -> banner for managers, dead end for staff), keyed
 *  off the week containing the day. */
async function schedTeamDayHtml(day) {
  const r = await schedGetWeek(schedWeekStartOfDay(day));
  if (!schedIsPublished(r.schedule) && !schedDraftView(r)) return schedNoPublishedHtml();
  const draft = schedDraftView(r);
  const ds = (r.shifts || []).filter(s => String(s.date || "").slice(0, 10) === day).sort(schedByStart);
  const names = new Map();
  for (const s of ds) {
    const pid = String(s.profile_id);
    if (!names.has(pid)) names.set(pid, s.profile_name || pid);
  }
  const hoursBy = {};
  for (const s of ds) {
    const pid = String(s.profile_id);
    hoursBy[pid] = (hoursBy[pid] || 0) + schedShiftMinutes(s.start_time, s.end_time) / 60;
  }
  const rows = schedGroupRows(await schedTeamRows(names, hoursBy));
  if (!rows.length) return (draft ? schedDraftBannerHtml() : "") + `<p class="muted">${esc(T("sched.noShiftsToday"))}</p>`;
  let alt = false;
  const body = rows.map(row => {
    if (row.header) return `<div class="sched-day-group">${esc(row.header)}</div>`;
    alt = !alt;
    const mine = ds.filter(s => String(s.profile_id) === String(row.id));
    return `<div class="admin-card${alt ? " sched-zebra" : ""}" style="margin:8px 0">
      <div class="card-head"><strong>${esc(row.label)}</strong>${row.sub ? `<span class="muted">${esc(row.sub)}</span>` : ""}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${mine.map(schedShiftChipHtml).join("")}</div>
    </div>`;
  }).join("");
  return (draft ? schedDraftBannerHtml() : "") + body;
}

/* ---------- Builder (manage only) ---------- */
/** Long weekday names starting Sunday, locale-aware. */
function schedWeekdayNames() {
  const names = [];
  for (let i = 0; i < 7; i++) names.push(new Date(2026, 8, 27 + i).toLocaleDateString(locale(), { weekday: "long" }));
  return names;
}
/** Position <select> from the managed list; falls back to a text input when
 *  the list hasn't loaded (keeps the editor usable offline / on error). */
function schedPositionInputHtml(attr, selected) {
  const sel = String(selected || "").toLowerCase();
  if (!schedPositions.length) return `<input ${attr} value="${esc(selected || "")}">`;
  const opts = [`<option value="">—</option>`].concat(schedPositions.map(p =>
    `<option value="${esc(p)}"${p.toLowerCase() === sel ? " selected" : ""}>${esc(p)}</option>`)).join("");
  return `<select ${attr}>${opts}</select>`;
}
/** Week-start day <select> for the schedule builder (managers only). */
function schedWeekStartSelectHtml() {
  const names = schedWeekdayNames();
  const opts = names.map((n, i) =>
    `<option value="${i}"${i === schedWeekStartDayNum ? " selected" : ""}>${esc(n)}</option>`).join("");
  return `<label style="margin-left:auto;display:flex;gap:6px;align-items:center;font-size:13px" class="no-print">
    ${esc(T("sched.weekStartOn"))} <select id="sched-weekstart">${opts}</select></label>`;
}
/** Positions manager modal (builder, managers only). Add/remove the managed
 *  position list used by the shift editor and staff position dropdowns. */
function schedPositionsModal() {
  let list = schedPositions.slice();
  const drawList = () => {
    const box = document.getElementById("pos-list");
    if (!box) return;
    box.innerHTML = list.length ? list.map((p, i) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="flex:1">${esc(p)}</span>
        <button class="btn btn-small btn-ghost" data-pos-del="${i}" aria-label="${esc(T("sched.removePosition"))}: ${esc(p)}">✕</button>
      </div>`).join("") : `<p class="muted">${esc(T("sched.noPositions"))}</p>`;
    box.querySelectorAll("[data-pos-del]").forEach(b => b.onclick = () => {
      list.splice(Number(b.dataset.posDel), 1);
      drawList();
    });
  };
  showModal(`<h3 style="margin-top:0">${esc(T("sched.positionsTitle"))}</h3>
    <p class="muted" style="font-size:13px">${esc(T("sched.positionsHint"))}</p>
    <div id="pos-list"></div>
    <div class="form-row" style="margin-top:8px;align-items:end">
      <div class="field" style="flex:1"><label>${esc(T("sched.positionName"))}</label><input id="pos-new"></div>
      <div class="field" style="flex:0"><button class="btn btn-small" id="pos-add">${esc(T("sched.addPosition"))}</button></div>
    </div>
    <div id="pos-err"></div>
    <div class="modal-actions">
      <button class="btn" id="pos-cancel">${esc(T("common.cancel"))}</button>
      <button class="btn btn-primary" id="pos-save">${esc(T("common.save"))}</button>
    </div>`);
  drawList();
  const errBox = () => document.getElementById("pos-err");
  const addPos = () => {
    const inp = document.getElementById("pos-new");
    const v = inp.value.trim();
    errBox().innerHTML = "";
    if (!v) { errBox().innerHTML = `<div class="error">${esc(T("sched.posEmpty"))}</div>`; return; }
    if (list.some(p => p.toLowerCase() === v.toLowerCase())) {
      errBox().innerHTML = `<div class="error">${esc(T("sched.posDup"))}</div>`; return;
    }
    list.push(v);
    inp.value = "";
    drawList();
  };
  document.getElementById("pos-add").onclick = addPos;
  document.getElementById("pos-new").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addPos(); } };
  document.getElementById("pos-cancel").onclick = closeModal;
  document.getElementById("pos-save").onclick = async () => {
    const btn = document.getElementById("pos-save");
    btn.disabled = true; // double-submit guard
    try {
      const r = await edge("schedule.set_positions", { positions: list });
      schedPositions = r.positions || list;
      closeModal();
      showSavedToast(T("sched.positionsSaved"));
      router();
    } catch (e) { errBox().innerHTML = `<div class="error">${esc(e.detail || T("sched.positionsFail"))}</div>`; btn.disabled = false; }
  };
}
async function schedBuilderHtml(weekStart) {
  const r = await schedGetWeek(weekStart);
  let schedule = r.schedule;
  if (!schedule) schedule = (await edge("schedule.ensure_draft", { week_start: weekStart })).schedule;
  const u = await edge("users.list").catch(() => ({ users: [] }));
  const empRank = new Map(schedEmployeeOrder.map((id, i) => [String(id), i]));
  const people = (u.users || u || [])
    .filter(x => x.active !== false && (!!x.can_view_schedule || !!x.can_manage_schedule))
    .sort((a, b) => {
      const ra = empRank.has(String(a.id)) ? empRank.get(String(a.id)) : Infinity;
      const rb = empRank.has(String(b.id)) ? empRank.get(String(b.id)) : Infinity;
      if (ra !== rb) return ra - rb;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  state.sched = { weekStart, schedule, shifts: (r.shifts || []).slice(), people, warns: {} };
  try {
    const tr = await edge("staffing.get_targets");
    state.sched.targets = tr.targets || [];
  } catch (e) { state.sched.targets = []; /* coverage degrades to hidden */ }
  // Approved time-off requests for the builder's REQ chips (manager list has
  // every request with profile_name; cached in state.sched like avail).
  try {
    const tq = await edge("timeoff.list", {});
    state.sched.reqs = tq.requests || [];
  } catch (e) { state.sched.reqs = []; /* REQ chips degrade to hidden */ }
  // Pinned weekly patterns (Job 4): one schedule.get_pinned fetch per builder
  // render, cached in state.sched like targets/reqs. Degrades to hidden if the
  // backend op isn't deployed yet.
  try {
    const pr = await edge("schedule.get_pinned");
    state.sched.pins = pr.pins || [];
  } catch (e) { state.sched.pins = []; }
  const pinnedIds = new Set((state.sched.pins || []).map(p => String(p.profile_id)));
  const published = schedIsPublished(schedule);
  const days = schedWeekDays(weekStart);
  // Closer coverage (Phase 1): a day with shifts needs >=1 approved closer on
  // a shift running to close (end 23:59 or 00:00 — Sumo closes at midnight).
  // Only evaluated when the backend serves the flags; otherwise the feature
  // degrades to no warning.
  const flagsLive = people.some(p => "can_close" in p);
  const pById = new Map(people.map(p => [String(p.id), p]));
  const noCloserDays = flagsLive ? days.filter(d => {
    const ds = (r.shifts || []).filter(s => s.date === d);
    if (!ds.length) return false;
    return !ds.some(s => {
      const p = pById.get(String(s.profile_id));
      const et = String(s.end_time).slice(0, 5);
      return p && p.can_close && (et === "23:59" || et === "00:00");
    });
  }) : [];
  const items = people.map(p => ({
    id: String(p.id), group: p.sched_group,
    label: p.name + (p.can_close ? " 🌙" : "") + (pinnedIds.has(String(p.id)) ? " 📌" : ""),
    sub: schedHoursLabel(schedPersonHours(String(p.id))),
  }));
  const rows = schedBuilderView === "groups" ? schedGroupRows(items) : items;
  return `
    ${published
      ? `<div class="notice" style="margin-bottom:12px"><strong>✓ ${esc(T("sched.published"))}</strong></div>`
      : `<div class="banner" style="margin-bottom:12px"><strong>${esc(T("sched.draft"))}</strong></div>`}
    ${noCloserDays.length ? `<div class="warn-box" style="margin-bottom:12px">⚠️ <strong>${esc(T("sched.noCloser"))}:</strong> ${noCloserDays.map(d => esc(schedDayLabel(d))).join(", ")}</div>` : ""}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;align-items:center" class="no-print">
      <button class="btn btn-small" id="sched-copy">${esc(T("sched.copyWeek"))}</button>
      ${published
        ? `<button class="btn btn-small" id="sched-unpublish">${esc(T("sched.unpublish"))}</button>`
        : `<button class="btn btn-small btn-primary" id="sched-publish">${esc(T("sched.publish"))}</button>`}
      ${!published && canSchedManage()
        ? `<button class="btn btn-small" id="sched-pin-week">${esc(T("sched.pinWeek"))}</button>
           <button class="btn btn-small" id="sched-apply-pins">${esc(T("sched.applyPins"))}</button>
           <button class="btn btn-small" id="sched-generate">${esc(T("sched.generate"))}</button>` : ""}
      ${schedWeekStartSelectHtml()}
      <button class="btn btn-small" id="sched-positions">${esc(T("sched.positions"))}</button>
      <button class="btn btn-small" id="sched-users">${esc(T("admin.users"))}</button>
      <div style="display:flex;gap:4px" role="group" aria-label="${esc(T("sched.viewLabel"))}">
        <button class="btn btn-small${schedBuilderView !== "employees" ? " btn-primary" : ""}" id="sched-view-groups">${esc(T("sched.viewGroups"))}</button>
        <button class="btn btn-small${schedBuilderView === "employees" ? " btn-primary" : ""}" id="sched-view-employees">${esc(T("sched.viewEmployees"))}</button>
      </div>
      ${(state.sched.pins || []).length
        ? `<span class="muted" style="font-size:13px;align-self:center" id="sched-pinned-count">📌 ${esc(T("sched.pinnedCount").replace("{n}", String(state.sched.pins.length)))}</span>` : ""}
    </div>
    ${rows.length ? schedGridHtml(days, rows, (row, d) => schedBuilderCell(row.id, d), (d) =>
      `${schedCoverageHtml(d)}<button class="btn btn-small btn-ghost sched-add" data-add-open-shift="${esc(d)}" aria-label="${esc(T("sched.addOpenShift") + " — " + schedDayLabel(d))}" title="${esc(T("sched.addOpenShift"))}" style="margin-top:4px;min-width:44px;min-height:44px">+</button>`) : ""}
    ${schedPinsSectionHtml(state.sched.pins)}
    ${rows.length
      ? `<p class="muted" style="font-size:13px;margin-top:8px">${esc(T("sched.builderHint"))}</p>`
      : `<p class="muted" style="margin-top:8px">${esc(T("sched.noPeople"))}</p>`}`;
}

/** Shifts for one builder cell, sorted by start time. */
function schedCellShifts(pid, iso) {
  return (state.sched.shifts || [])
    .filter(s => String(s.profile_id) === String(pid) && String(s.date || "").slice(0, 10) === iso)
    .sort(schedByStart);
}
/** Shift daypart for staffing coverage: lunch = ends by 5 PM, dinner = later
 *  (a midnight 00:00 close counts as 24:00, i.e. dinner). */
function schedShiftDaypart(s) {
  let e = String(s.end_time || "").slice(0, 5);
  if (e === "00:00") e = "24:00";
  return e && e <= "17:00" ? "lunch" : "dinner";
}
/** Shortage line for one builder day column, e.g. "⚠ Ser L2/4 D5/6 · Bus D3/4".
 *  Shortages-only (a single short line instead of a line per position) keeps
 *  the sticky day headers compact so they can't grow over the shift chips. */
function schedCoverageHtml(iso) {
  const targets = (state.sched && state.sched.targets) || [];
  const wd = new Date(iso + "T12:00:00").getDay();
  const need = targets.filter(t => t.weekday === wd && t.required > 0);
  if (!need.length) return "";
  const have = {};
  for (const s of (state.sched.shifts || [])) {
    if (String(s.date || "").slice(0, 10) !== iso) continue;
    const pos = String(s.position || "").trim().toLowerCase();
    if (!pos) continue;
    const k = schedShiftDaypart(s) + "|" + pos;
    have[k] = (have[k] || 0) + 1;
  }
  const seen = new Set(), byPos = new Map();
  for (const t of need) {
    const pk = String(t.position).trim().toLowerCase();
    const key = t.daypart + "|" + pk;
    if (seen.has(key)) continue;
    seen.add(key);
    const got = have[key] || 0;
    if (got >= t.required) continue;
    if (!byPos.has(pk)) byPos.set(pk, { label: String(t.position).trim().slice(0, 3), segs: [] });
    byPos.get(pk).segs.push(`${t.daypart === "lunch" ? "L" : "D"}${got}/${t.required}`);
  }
  const bits = [...byPos.values()].map(d =>
    `${d.label} ${d.segs.sort((a, b) => (a[0] === "L" ? 0 : 1) - (b[0] === "L" ? 0 : 1)).join(" ")}`);
  if (!bits.length) return "";
  return `<div class="sched-cov">⚠ ${esc(bits.join(" · "))}</div>`;
}

/* ---------- Pinned weekly patterns (Job 4) ---------- */
/** Group this draft week's shifts into unique pinned rows per profile.
 *  Returns a Map: profile_id -> [{weekday, start_time, end_time, position}].
 *  Pure (reads only state.sched.shifts) so it's unit-testable. Open shifts
 *  (no profile_id) are skipped — pins belong to a person. */
function schedPinnedRowsFromWeek() {
  const per = new Map();
  for (const s of ((state.sched && state.sched.shifts) || [])) {
    if (!s.profile_id) continue;
    const pid = String(s.profile_id);
    const date = String(s.date || "").slice(0, 10);
    if (!date) continue;
    const weekday = new Date(date + "T12:00:00").getDay();
    const start = String(s.start_time || "").slice(0, 5);
    const end = String(s.end_time || "").slice(0, 5);
    const pos = String(s.position || "").trim();
    const key = [weekday, start, end, pos].join("|");
    if (!per.has(pid)) per.set(pid, new Map());
    const rows = per.get(pid);
    if (!rows.has(key)) rows.set(key, { weekday, start_time: start, end_time: end, position: pos || null });
  }
  return new Map([...per.entries()].map(([pid, rows]) => [pid, [...rows.values()]]));
}
/** Pins section under the builder grid: each pinned employee with an Unpin
 *  control (manager-only, like the rest of the builder). */
function schedPinsSectionHtml(pins) {
  if (!pins || !pins.length) return "";
  const byProfile = new Map();
  for (const p of pins) {
    const pid = String(p.profile_id);
    if (!byProfile.has(pid)) byProfile.set(pid, { name: p.profile_name || pid, count: 0 });
    byProfile.get(pid).count++;
  }
  const rows = [...byProfile.entries()].map(([pid, v]) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px solid var(--border)">
      <div style="flex:1">📌 <strong>${esc(v.name)}</strong>
        <span class="muted" style="font-size:13px">${esc(T("sched.pinnedCount").replace("{n}", String(v.count)))}</span></div>
      <button class="btn btn-small btn-ghost" data-unpin-pid="${esc(pid)}" aria-label="${esc(T("sched.unpin") + " — " + v.name)}">✕ ${esc(T("sched.unpin"))}</button>
    </div>`).join("");
  return `<div class="no-print" style="margin-top:16px"><h3 style="margin:0 0 4px">${esc(T("sched.pinnedSection"))}</h3>${rows}</div>`;
}
/** In-app result summary for schedule.apply_pinned: applied N, skipped M with
 *  reasons. Closing the modal refreshes the week grid. */
function schedApplyResultHtml(r) {
  const applied = Number(r.applied || 0);
  const skipped = r.skipped || [];
  const nameOf = (pid) => {
    const p = ((state.sched && state.sched.people) || []).find(x => String(x.id) === String(pid));
    return p ? p.name : String(pid);
  };
  const skipReason = (r) => r === "time_off" ? T("sched.skipTimeOff") : r === "already_scheduled" ? T("sched.skipScheduled") : String(r || "");
  const skipRows = skipped.map(s =>
    `<li>${esc(nameOf(s.profile_id))} — ${esc(String(s.date || ""))}: ${esc(skipReason(s.reason))}</li>`).join("");
  showModal(`<h3>${esc(T("sched.applyResultTitle"))}</h3>
    <p>${esc(T("sched.applied"))}: <strong>${applied}</strong> · ${esc(T("sched.skipped"))}: <strong>${skipped.length}</strong></p>
    ${skipped.length ? `<ul>${skipRows}</ul>` : ""}
    <div class="modal-actions"><button class="btn btn-primary" id="pins-apply-ok" style="min-height:44px">${esc(T("common.confirm"))}</button></div>`);
  document.getElementById("pins-apply-ok").onclick = () => { closeModal(); router(); };
}

/** Result modal for "Generate draft" (Job 5): shifts added + unfilled needs. */
function schedGenerateResultHtml(r) {
  const added = Number(r.added || 0);
  const gaps = r.gaps || [];
  const reasonText = (code) => {
    const key = "sched.gap_" + code;
    return STR.en && STR.en[key] != null ? T(key) : String(code || "");
  };
  const gapRows = gaps.map(g =>
    `<li>${esc(schedDayLabel(String(g.date || "")))} · ${esc(T(g.daypart === "lunch" ? "sched.daypartLunch" : "sched.daypartDinner"))} · ${esc(String(g.position || ""))} (${esc(T("sched.genNeeded"))}: ${Number(g.needed || 0)}) — ${esc(reasonText(g.reason))}</li>`).join("");
  showModal(`<h3>${esc(T("sched.genDone").replace("{n}", String(added)))}</h3>
    ${gaps.length ? `<p><strong>${esc(T("sched.gapsTitle"))}</strong></p><ul>${gapRows}</ul>` : `<p>${esc(T("sched.genNoGaps"))}</p>`}
    <div class="modal-actions"><button class="btn btn-primary" id="gen-result-ok" style="min-height:44px">${esc(T("common.confirm"))}</button></div>`);
  document.getElementById("gen-result-ok").onclick = () => { closeModal(); router(); };
}

/* ---------- Staffing template + arrange order (manage only) ---------- */
/** Short weekday name for a 0=Sunday..6=Saturday weekday number. */
function schedShortWd(wd) {
  return new Date(2026, 8, 27 + wd).toLocaleDateString(locale(), { weekday: "short" });
}

async function schedStaffingHtml() {
  const [tg, u] = await Promise.all([
    edge("staffing.get_targets").catch(() => ({ targets: [] })),
    edge("users.list").catch(() => ({ users: [] })),
  ]);
  const people = (u.users || u || [])
    .filter(x => x.active !== false && (!!x.can_view_schedule || !!x.can_manage_schedule));
  const tmap = new Map();
  for (const t of (tg.targets || [])) tmap.set(t.weekday + "|" + t.daypart + "|" + String(t.position).toLowerCase(), t.required);
  // Groups in current display order (manager arrangement, then new groups A-Z, ungrouped last).
  const members = new Map();
  for (const p of people) {
    const g = (p.sched_group || "").trim();
    if (!members.has(g)) members.set(g, []);
    members.get(g).push(p);
  }
  const grank = new Map(schedGroupOrder.map((g, i) => [String(g).toLowerCase(), i]));
  const groups = [...members.keys()].sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const ra = grank.has(a.toLowerCase()) ? grank.get(a.toLowerCase()) : Infinity;
    const rb = grank.has(b.toLowerCase()) ? grank.get(b.toLowerCase()) : Infinity;
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });
  const erank = new Map(schedEmployeeOrder.map((id, i) => [String(id), i]));
  const memOrder = new Map(); // group -> [profile ids in display order]
  for (const g of groups) {
    memOrder.set(g, members.get(g).slice().sort((a, b) => {
      const ra = erank.has(String(a.id)) ? erank.get(String(a.id)) : Infinity;
      const rb = erank.has(String(b.id)) ? erank.get(String(b.id)) : Infinity;
      return ra !== rb ? ra - rb : String(a.name || "").localeCompare(String(b.name || ""));
    }).map(p => String(p.id)));
  }
  state.staffing = { tmap, groups, memOrder, byId: new Map(people.map(p => [String(p.id), p])) };
  const wdays = [0, 1, 2, 3, 4, 5, 6].map(i => (schedWeekStartDayNum + i) % 7);
  const positions = schedPositions.length ? schedPositions : ["Server", "Bartender", "Busser", "Runner", "Host", "Barback", "Expo"];
  const daypartBlock = (dp) => `
    <h3 style="margin:16px 0 8px">${esc(T(dp === "lunch" ? "sched.lunch" : "sched.dinner"))}</h3>
    <div style="overflow-x:auto"><table class="bulk-par">
      <tr><th></th>${wdays.map(w => `<th>${esc(schedShortWd(w))}</th>`).join("")}</tr>
      ${positions.map((pos, pi) => `<tr><td style="font-weight:600;white-space:nowrap">${esc(pos)}</td>${
        wdays.map(w => {
          const v = tmap.get(w + "|" + dp + "|" + String(pos).toLowerCase());
          return `<td><input type="number" min="0" max="99" inputmode="numeric" placeholder="—" data-tg="${w}|${dp}|${pi}" value="${v == null ? "" : v}" style="width:56px" aria-label="${esc(pos + " " + schedShortWd(w) + " " + dp)}"></td>`;
        }).join("")
      }</tr>`).join("")}
    </table></div>`;
  return `
    <h2 style="margin:4px 0 8px">${esc(T("sched.staffingNeeds"))}</h2>
    <p class="muted" style="font-size:13px;margin:0 0 4px">${esc(T("sched.staffingHint"))}</p>
    <p class="muted" style="font-size:13px;margin:0 0 8px">${esc(T("sched.daypartHint"))}</p>
    ${daypartBlock("lunch")}
    ${daypartBlock("dinner")}
    <div style="margin:12px 0"><button class="btn btn-primary" id="staffing-save-targets">${esc(T("common.save"))}</button></div>
    <div id="staffing-arrange"></div>`;
}

/** Arrange-order section of the staffing tab: group order + employee order. */
function drawStaffingArrange() {
  const box = document.getElementById("staffing-arrange");
  if (!box || !state.staffing) return;
  const st = state.staffing;
  const arrow = (kind, a, b, label) => `
    <button class="btn btn-small btn-ghost" data-amove="${kind}|${a}|${b}|-1" aria-label="${esc(label)} ↑" style="min-width:44px;min-height:44px">↑</button>
    <button class="btn btn-small btn-ghost" data-amove="${kind}|${a}|${b}|1" aria-label="${esc(label)} ↓" style="min-width:44px;min-height:44px">↓</button>`;
  box.innerHTML = `
    <h2 style="margin:20px 0 8px">${esc(T("sched.arrangeGroups"))}</h2>
    <p class="muted" style="font-size:13px;margin:0 0 8px">${esc(T("sched.arrangeHint"))}</p>
    <div>${st.groups.map((g, i) => `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="flex:1;font-weight:700">${esc(g || T("sched.ungrouped"))}</span>
        ${arrow("g", i, "", g || T("sched.ungrouped"))}
      </div>`).join("")}</div>
    <div style="margin:12px 0"><button class="btn btn-small" id="staffing-save-groups">${esc(T("common.save"))}</button></div>
    <h2 style="margin:20px 0 8px">${esc(T("sched.arrangeEmployees"))}</h2>
    ${st.groups.map((g, gi) => `
      <h3 style="margin:14px 0 4px;font-size:14px">${esc(g || T("sched.ungrouped"))}</h3>
      <div>${(st.memOrder.get(g) || []).map((id, i) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1">${esc((st.byId.get(id) || {}).name || id)}</span>
          ${arrow("e", gi, i, (st.byId.get(id) || {}).name || "")}
        </div>`).join("")}</div>`).join("")}
    <div style="margin:12px 0"><button class="btn btn-small" id="staffing-save-emps">${esc(T("common.save"))}</button></div>`;
  box.querySelectorAll("[data-amove]").forEach(b => b.onclick = () => {
    const [kind, a, bi, dir] = b.dataset.amove.split("|");
    if (kind === "g") {
      const i = Number(a), j = i + Number(dir);
      if (j < 0 || j >= st.groups.length) return;
      [st.groups[i], st.groups[j]] = [st.groups[j], st.groups[i]];
    } else {
      const g = st.groups[Number(a)];
      const arr = st.memOrder.get(g) || [];
      const i = Number(bi), j = i + Number(dir);
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    drawStaffingArrange();
  });
  const saveGroups = document.getElementById("staffing-save-groups");
  if (saveGroups) saveGroups.onclick = async () => {
    saveGroups.disabled = true; // double-submit guard
    try {
      const r = await edge("schedule.set_group_order", { groups: st.groups.filter(g => g) });
      schedGroupOrder = r.groups || st.groups.filter(g => g);
      showSavedToast(T("sched.orderSaved"));
    } catch (e) { flashError(e.detail || e.message || "Error"); }
    saveGroups.disabled = false;
  };
  const saveEmps = document.getElementById("staffing-save-emps");
  if (saveEmps) saveEmps.onclick = async () => {
    saveEmps.disabled = true; // double-submit guard
    try {
      const order = [];
      for (const g of st.groups) order.push(...(st.memOrder.get(g) || []));
      const r = await edge("users.set_sched_order", { order });
      schedEmployeeOrder = r.order || order;
      showSavedToast(T("sched.orderSaved"));
    } catch (e) { flashError(e.detail || e.message || "Error"); }
    saveEmps.disabled = false;
  };
}

/** TRUE when an APPROVED time-off request covers pid on iso (YYYY-MM-DD).
 *  Builder REQ-chip coverage check; pure so it can be unit-tested verbatim. */
function schedReqOnDate(requests, pid, iso) {
  const id = String(pid);
  return (requests || []).some(q => q && q.status === "approved" && String(q.profile_id) === id
    && String(q.start_date) <= iso && iso <= String(q.end_date));
}

/** Builder cell: shift chips + warning badge + add button. */
function schedBuilderCell(pid, iso) {
  const shifts = schedCellShifts(pid, iso);
  const reqOn = schedReqOnDate(state.sched && state.sched.reqs, pid, iso);
  const warns = shifts.flatMap(s => state.sched.warns[String(s.id)] || []);
  // Client-side overlap detection: two shifts conflict when their time ranges
  // intersect. Shown immediately on the grid — no need to wait for save.
  const key = (s) => s.id != null ? "id:" + s.id : "c:" + (s.client_id || "");
  const st = (s) => String(s.start_time || "").slice(0, 5);
  const en = (s) => String(s.end_time || "").slice(0, 5);
  const conflict = new Set();
  for (let i = 0; i < shifts.length; i++) for (let j = i + 1; j < shifts.length; j++) {
    if (st(shifts[i]) < en(shifts[j]) && st(shifts[j]) < en(shifts[i])) { conflict.add(key(shifts[i])); conflict.add(key(shifts[j])); }
  }
  const person = (state.sched.people || []).find(p => String(p.id) === String(pid));
  const addLabel = `${T("sched.addShift")} — ${person ? person.name : ""}, ${schedDayLabel(iso)}`;
  return `${reqOn ? `<div style="margin:2px 0"><span class="req-chip" title="${esc(schedDayLabel(iso))}">${esc(T("sched.reqChip"))}</span></div>` : ""}
    ${shifts.map(s => `
      <button class="btn btn-small${conflict.has(key(s)) ? " shift-conflict" : ""}" data-edit-shift="${esc(s.id)}" style="display:block;width:100%;margin:2px 0;text-align:left;white-space:normal"${conflict.has(key(s)) ? ` title="${esc(T("sched.overlapWarn"))}"` : ""}>
        <strong style="white-space:nowrap;font-size:14px">${esc(schedFmtTimeRange(s.start_time, s.end_time))}</strong>${s.position ? `<br><span class="muted" style="font-size:12px">${esc(s.position)}</span>` : ""}
      </button>`).join("")}
    ${warns.length ? `<button class="btn btn-small" data-show-warns="${esc(pid)}|${esc(iso)}" aria-label="${esc(T("sched.warningsTitle"))}">⚠️</button>` : ""}
    <button class="btn btn-small btn-ghost sched-add" data-add-shift="${esc(pid)}|${esc(iso)}" aria-label="${esc(addLabel)}" title="${esc(addLabel)}" style="width:100%;margin-top:2px;min-height:44px">+</button>`;
}

/** Map save_shifts warnings back onto the returned shifts (by id or client_id). */
function applyShiftWarnings(shifts, warnings) {
  const byId = {}, byClient = {};
  for (const s of (shifts || [])) {
    if (s.id != null) byId[String(s.id)] = s;
    if (s.client_id) byClient[String(s.client_id)] = s;
  }
  const map = {};
  for (const w of (warnings || [])) {
    const t = (w.shift_id != null && byId[String(w.shift_id)]) || (w.client_id && byClient[String(w.client_id)]);
    if (!t || t.id == null) continue;
    (map[String(t.id)] = map[String(t.id)] || []).push(w.code);
  }
  state.sched.warns = map;
}

/** Only the fields save_shifts accepts — never echo server extras back. */
function schedShiftPayload(s) {
  const o = {
    profile_id: s.profile_id,
    date: String(s.date).slice(0, 10),
    start_time: s.start_time, end_time: s.end_time,
    position: s.position || null, station: s.station || null, notes: s.notes || null,
  };
  if (s.id != null) o.id = s.id;
  if (s.client_id) o.client_id = s.client_id;
  return o;
}

/** Shift editor modal. Person and date are fixed by the cell that was tapped. */
/* Eligible-staff picker for open shifts: right position, no approved time off,
   fits their availability (unavailable/limited/blocked), no overlapping shift. */
function schedFindCandidates(iso, start, end, position) {
  const wd = new Date(iso + "T12:00:00").getDay(); // availability weekday: 0=Sunday
  const av = (state.sched && state.sched.avail) || { rows: [], reqs: [] };
  const avBy = {};
  for (const r of (av.rows || [])) avBy[String(r.profile_id) + "|" + Number(r.weekday)] = r;
  const off = new Set();
  for (const q of (av.reqs || [])) {
    if (q.status === "approved" && String(q.start_date) <= iso && iso <= String(q.end_date)) off.add(String(q.profile_id));
  }
  const ov = (aS, aE, bS, bE) => aS < bE && bS < aE;
  const out = [];
  for (const p of (state.sched.people || [])) {
    const id = String(p.id);
    if (position && (p.position || "") !== position) continue; // same rule as shift pickup
    if (off.has(id)) continue;
    const a = avBy[id + "|" + wd];
    let sub = T("sched.available");
    if (a) {
      const st = a.status;
      const bs = String(a.start_time || "").slice(0, 5), be = String(a.end_time || "").slice(0, 5);
      if (st === "unavailable") continue;
      if (st === "blocked" && bs && be && ov(start, end, bs, be)) continue;
      if (st === "limited") {
        if (!bs || !be || start < bs || end > be) continue;
        sub = `${T("sched.available")} ${bs}–${be}`;
      }
    }
    const clash = (state.sched.shifts || []).some(s =>
      String(s.profile_id) === id && String(s.date || "").slice(0, 10) === iso &&
      ov(start, end, String(s.start_time).slice(0, 5), String(s.end_time).slice(0, 5)));
    if (clash) continue;
    const role = p.position || (p.sched_group || "").trim();
    out.push({ id, name: p.name || "?", sub: [role, sub].filter(Boolean).join(" · ") });
  }
  out.sort((x, y) => String(x.name).localeCompare(String(y.name)));
  return out;
}

function schedShiftEditor(pid, iso, shift) {
  const person = (state.sched.people || []).find(p => String(p.id) === String(pid));
  const isNew = !shift;
  const isOpen = isNew && !pid; // open-shift flow: manager picks the person from candidates
  let chosenPid = pid ? String(pid) : null;
  showModal(`<h3>${esc(isNew ? T("sched.addShift") : T("sched.editShift"))}</h3>
    <p class="muted">${isOpen ? esc(schedDayLabel(iso)) : `${esc(person ? person.name : "")} · ${esc(schedDayLabel(iso))}`}</p>
    ${isOpen ? `<p style="margin:0 0 8px"><strong>${esc(T("sched.assignedTo"))}:</strong> <span id="se-person">—</span></p>` : ""}
    <div class="form-row">
      <div class="field"><label>${esc(T("sched.start"))}</label><input id="se-start" type="time" value="${esc((shift && shift.start_time || "").slice(0, 5))}"></div>
      <div class="field"><label>${esc(T("sched.end"))}</label><input id="se-end" type="time" value="${esc((shift && shift.end_time || "").slice(0, 5))}"></div>
    </div>
    <div class="form-row">
      <div class="field"><label>${esc(T("sched.position"))}</label>${schedPositionInputHtml('id="se-pos"', shift && shift.position)}</div>
      <div class="field"><label>${esc(T("sched.station"))}</label><input id="se-station" value="${esc(shift && shift.station || "")}"></div>
    </div>
    <div class="field"><label>${esc(T("sched.note"))}</label><input id="se-notes" value="${esc(shift && shift.notes || "")}"></div>
    ${isOpen ? `<button class="btn btn-small" id="se-find" style="margin:4px 0 8px">${esc(T("sched.whoCanWork"))}</button><div id="se-candidates"></div>` : ""}
    <div id="se-err"></div>
    <div class="modal-actions">
      ${isNew ? "" : `<button class="btn btn-danger" id="se-delete">${esc(T("common.delete"))}</button>`}
      <button class="btn" id="se-cancel">${esc(T("common.cancel"))}</button>
      <button class="btn btn-primary" id="se-save">${esc(T("common.save"))}</button>
    </div>`);
  document.getElementById("se-cancel").onclick = closeModal;
  const saveBtn = document.getElementById("se-save");
  saveBtn.onclick = async () => {
    const start = document.getElementById("se-start").value;
    const end = document.getElementById("se-end").value;
    const err = document.getElementById("se-err");
    if (!start || !end) { err.innerHTML = `<div class="error">${esc(T("sched.needTimes"))}</div>`; return; }
    if (isOpen && !chosenPid) { err.innerHTML = `<div class="error">${esc(T("sched.pickSomeone"))}</div>`; return; }
    saveBtn.disabled = true; // double-submit guard
    try {
      const shifts = (state.sched.shifts || []).slice();
      const rec = schedShiftPayload({
        profile_id: chosenPid, date: iso, start_time: start, end_time: end,
        position: document.getElementById("se-pos").value.trim(),
        station: document.getElementById("se-station").value.trim(),
        notes: document.getElementById("se-notes").value.trim(),
      });
      if (shift && shift.id != null) {
        rec.id = shift.id;
        const ix = shifts.findIndex(s => String(s.id) === String(shift.id));
        if (ix >= 0) shifts[ix] = Object.assign({}, shifts[ix], rec);
      } else {
        rec.client_id = "c" + Date.now();
        shifts.push(rec);
      }
      const res = await edge("schedule.save_shifts", {
        schedule_id: state.sched.schedule.id,
        shifts: shifts.map(schedShiftPayload),
      });
      state.sched.shifts = res.shifts || shifts;
      applyShiftWarnings(state.sched.shifts, res.warnings || []);
      closeModal();
      showSavedToast(T("sched.shiftsSaved"));
      router();
    } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("sched.saveShiftFail"))}</div>`; }
    finally { saveBtn.disabled = false; }
  };
  if (isOpen) {
    const findBtn = document.getElementById("se-find");
    findBtn.onclick = async () => {
      const box = document.getElementById("se-candidates");
      const err = document.getElementById("se-err");
      const start = document.getElementById("se-start").value;
      const end = document.getElementById("se-end").value;
      const pos = document.getElementById("se-pos").value.trim();
      if (!start || !end) { err.innerHTML = `<div class="error">${esc(T("sched.enterTimesFirst"))}</div>`; return; }
      err.innerHTML = "";
      findBtn.disabled = true;
      box.innerHTML = `<p class="muted">…</p>`;
      try {
        if (!state.sched.avail) {
          const [a, t] = await Promise.all([edge("availability.get", {}), edge("timeoff.list", {})]);
          state.sched.avail = { rows: (a.rows || []), reqs: (t.requests || []) };
        }
        const cands = schedFindCandidates(iso, start, end, pos);
        if (!cands.length) { box.innerHTML = `<p class="muted">${esc(T("sched.noCandidates"))}</p>`; return; }
        box.innerHTML = cands.map(c => `
          <button class="btn btn-ghost" data-cand="${esc(c.id)}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:10px;min-height:44px">
            <strong>${esc(c.name)}</strong>
            <div class="muted" style="font-size:12px">${esc(c.sub)}</div>
          </button>`).join("");
        const mark = (btn) => box.querySelectorAll("[data-cand]").forEach(x => {
          x.style.borderColor = x === btn ? "var(--accent)" : "";
          x.style.borderWidth = x === btn ? "2px" : "";
        });
        box.querySelectorAll("[data-cand]").forEach(b => b.onclick = () => {
          chosenPid = b.dataset.cand;
          const c = cands.find(x => String(x.id) === String(chosenPid));
          document.getElementById("se-person").textContent = c ? c.name : "—";
          mark(b);
        });
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("sched.saveShiftFail"))}</div>`; }
      finally { findBtn.disabled = false; }
    };
  }
  if (!isNew) document.getElementById("se-delete").onclick = async () => {
    if (!await confirmDialog(T("sched.deleteTitle"), T("sched.deleteMsg"), T("common.delete"))) return;
    try {
      await edge("schedule.delete_shift", { id: shift.id });
      state.sched.shifts = (state.sched.shifts || []).filter(s => String(s.id) !== String(shift.id));
      closeModal();
      showSavedToast(T("sched.shiftDeleted"));
      router();
    } catch (e) { flashError(e.detail || T("sched.saveShiftFail")); }
  };
}

/* ---------- Time Off ---------- */
function schedReqStatusPill(s) {
  return s === "approved" ? `<span class="pill pill-counted">${esc(T("sched.approved"))}</span>`
    : s === "denied" ? `<span class="pill pill-review">${esc(T("sched.denied"))}</span>`
    : `<span class="pill pill-zero">${esc(T("sched.pending"))}</span>`;
}
async function schedTimeoffHtml() {
  const me = String(state.session.profile.id);
  const r = await edge("timeoff.list");
  const reqs = r.requests || [];
  const todayLocal = schedIso(new Date());
  const byStart = (a, b) => String(a.start_date).localeCompare(String(b.start_date));
  const mine = reqs.filter(x => String(x.profile_id) === me).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const pending = reqs.filter(x => x.status === "pending").sort(byStart);
  const reqCard = (x, inbox) => `
    <div class="admin-card" data-req="${esc(x.id)}" data-req-name="${esc(x.profile_name || "")}" data-req-profile="${esc(x.profile_id)}" data-req-start="${esc(x.start_date)}" data-req-end="${esc(x.end_date)}" data-req-reason="${esc(x.reason || "")}">
      <div class="card-head">
        <div><strong>${esc(x.profile_name || "")}</strong>
          <div class="muted" style="font-size:13px">${esc(schedDayLabel(x.start_date))}${x.end_date !== x.start_date ? " → " + esc(schedDayLabel(x.end_date)) : ""}${x.reason ? " · " + esc(x.reason) : ""}</div></div>
        ${schedReqStatusPill(x.status)}
      </div>
      ${inbox && x.status === "pending" ? `<div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-small btn-primary" data-decide="approved" style="flex:1">${esc(T("review.approveYes"))}</button>
        <button class="btn btn-small btn-danger" data-decide="denied" style="flex:1">${esc(T("sched.deny"))}</button>
      </div>` : ""}
      ${!inbox && x.status === "pending" ? `<button class="btn btn-small btn-ghost" data-req-cancel style="margin-top:8px">🗑️ ${esc(T("sched.cancelRequest"))}</button>` : ""}
    </div>`;
  // Manager-only roster for the "add time off for employee" form: prefer the
  // builder's cached roster (active + schedule access), fall back to
  // users.list (manager role). No past-date floor — paper REQs get backfilled.
  let forRoster = (state.sched && state.sched.people) || [];
  if (canSchedManage() && !forRoster.length) {
    try {
      const u = await edge("users.list");
      forRoster = (u.users || []).filter(x => x.active !== false);
    } catch (e) { forRoster = []; }
  }
  const forOpts = `<option value="">— ${esc(T("sched.pickPerson"))}</option>` + forRoster
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
    .map(x => `<option value="${esc(x.id)}">${esc(x.name || "?")}</option>`).join("");
  return `
    ${canSchedManage() ? `<h2>${esc(T("sched.inbox"))}</h2>
      ${pending.length ? pending.map(x => reqCard(x, true)).join("") : `<p class="muted">${esc(T("sched.noRequestsInbox"))}</p>`}` : ""}
    ${canSchedManage() ? `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("sched.addTimeOffFor"))}</h3>
      <div class="field"><label>${esc(T("sched.person"))}</label><select id="to-for-person" style="min-height:44px">${forOpts}</select></div>
      <div class="form-row">
        <div class="field"><label>${esc(T("sched.from"))}</label><input id="to-for-start" type="date"></div>
        <div class="field"><label>${esc(T("sched.to"))}</label><input id="to-for-end" type="date"></div>
      </div>
      <div class="field"><label>${esc(T("sched.reason"))}</label><input id="to-for-reason" placeholder="…"></div>
      <div id="to-for-err"></div>
      <button class="btn btn-primary" id="to-for-send" style="width:100%;min-height:44px">${esc(T("sched.addTimeOffFor"))}</button>
    </div>` : ""}
    <div class="admin-card">
      <h3 style="margin-top:0">${esc(T("sched.requestOff"))}</h3>
      <div class="form-row">
        <div class="field"><label>${esc(T("sched.from"))}</label><input id="to-start" type="date" min="${todayLocal}"></div>
        <div class="field"><label>${esc(T("sched.to"))}</label><input id="to-end" type="date" min="${todayLocal}"></div>
      </div>
      <div class="field"><label>${esc(T("sched.reason"))}</label><input id="to-reason" placeholder="…"></div>
      <div id="to-err"></div>
      <button class="btn btn-primary" id="to-send" style="width:100%">${esc(T("sched.requestOff"))}</button>
    </div>
    <h2>${esc(T("sched.myRequests"))}</h2>
    ${mine.length ? mine.map(x => reqCard(x, false)).join("") : `<p class="muted">${esc(T("sched.noRequests"))}</p>`}`;
}

/* ---------- Swap Board ---------- */
/** Release -> teammate picks up -> manager approves/denies -> both sides get
 *  an in-app notification with the decision. */
function schedSwapStatusPill(s) {
  const key = "sched.status" + String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
  const cls = s === "open" ? "pill-counted" : s === "claimed" ? "pill-zero"
    : s === "approved" ? "pill-counted" : "pill-review";
  return `<span class="pill ${cls}">${esc(T(key))}</span>`;
}
function schedSwapShiftLine(sh) {
  return `<div><strong>${esc(schedDayName(sh.date))}</strong> <span class="muted">${esc(schedDayLabel(sh.date))}</span></div>
    <div style="font-size:16px;margin-top:2px"><strong>${esc(schedFmtTime(sh.start_time))} – ${esc(schedFmtTime(sh.end_time))}</strong></div>
    ${sh.position ? `<div class="muted" style="font-size:13px">${esc(sh.position)}${sh.station ? " · " + esc(sh.station) : ""}</div>` : ""}`;
}
async function schedSwapsHtml() {
  const me = String(state.session.profile.id);
  const isMgr = canSchedManage();
  const r = await edge("swaps.list");
  const swaps = (r.swaps || []).filter(s => s && s.shift);
  const open = swaps.filter(s => s.status === "open");
  const inbox = isMgr ? swaps.filter(s => s.status === "claimed") : [];
  const mine = swaps.filter(s => String(s.released_by) === me || String(s.claimed_by) === me);

  const openCard = (s) => {
    const isMine = String(s.released_by) === me;
    const myPos = (state.session.profile.position || "").trim().toLowerCase();
    const shiftPos = (s.shift.position || "").trim();
    const posOk = isMgr || !shiftPos || (!!myPos && myPos === shiftPos.toLowerCase());
    return `<div class="admin-card" data-swap="${esc(s.id)}" style="margin-bottom:10px">
      <div class="card-head"><div>${schedSwapShiftLine(s.shift)}
        <div class="muted" style="font-size:13px;margin-top:2px">${esc(T("sched.releasedBy"))}: ${esc(s.released_name || "")}</div></div>
        ${schedSwapStatusPill(s.status)}</div>
      ${isMine
        ? `<div class="muted" style="font-size:13px;margin-top:8px">${esc(T("sched.yourListing"))}</div>
           <button class="btn btn-small btn-ghost" data-swap-cancel style="margin-top:8px">${esc(T("sched.cancelSwap"))}</button>`
        : posOk
          ? `<button class="btn btn-small btn-primary" data-claim data-shift-label="${esc(schedDayLabel(s.shift.date) + " " + schedFmtTime(s.shift.start_time) + "–" + schedFmtTime(s.shift.end_time))}" style="width:100%;margin-top:8px">${esc(T("sched.pickup"))}</button>`
          : `<div class="muted" style="font-size:13px;margin-top:8px">🔒 ${esc(T("sched.posOnlyShift").replace("{pos}", shiftPos))}</div>`}
    </div>`;
  };
  const inboxCard = (s) => {
    const warns = (s.warnings || []).map(w => w.message || w.code).filter(Boolean);
    return `<div class="admin-card" data-swap="${esc(s.id)}" style="margin-bottom:10px">
      <div class="card-head"><div>${schedSwapShiftLine(s.shift)}
        <div class="muted" style="font-size:13px;margin-top:2px">${esc(T("sched.releasedBy"))}: ${esc(s.released_name || "")} → ${esc(T("sched.claimer"))}: ${esc(s.claimed_name || "")}</div></div>
        ${schedSwapStatusPill(s.status)}</div>
      ${warns.length ? `<div class="banner" style="margin-top:8px;font-size:13px">⚠️ ${esc(T("sched.swapWarnNote"))}<ul style="margin:4px 0 0;padding-left:18px">${warns.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-small btn-primary" data-swap-decide="approved" style="flex:1">${esc(T("review.approveYes"))}</button>
        <button class="btn btn-small btn-danger" data-swap-decide="denied" style="flex:1">${esc(T("sched.deny"))}</button>
      </div>
    </div>`;
  };
  const myCard = (s) => {
    const isReleaser = String(s.released_by) === me;
    const canCancel = isReleaser && (s.status === "open" || (isMgr && s.status === "claimed"));
    const canRelist = isReleaser && (s.status === "denied" || s.status === "cancelled");
    const other = isReleaser
      ? (s.claimed_name ? `${esc(T("sched.claimer"))}: ${esc(s.claimed_name)}` : "")
      : `${esc(T("sched.releasedBy"))}: ${esc(s.released_name || "")}`;
    return `<div class="admin-card" data-swap="${esc(s.id)}" style="margin-bottom:10px">
      <div class="card-head"><div>${schedSwapShiftLine(s.shift)}
        ${other ? `<div class="muted" style="font-size:13px;margin-top:2px">${other}</div>` : ""}</div>
        ${schedSwapStatusPill(s.status)}</div>
      ${canCancel ? `<button class="btn btn-small btn-ghost" data-swap-cancel style="margin-top:8px">${esc(T("sched.cancelSwap"))}</button>` : ""}
      ${canRelist ? `<button class="btn btn-small" data-swap-relist="${esc(s.shift.id)}" style="margin-top:8px">${esc(T("sched.relist"))}</button>` : ""}
    </div>`;
  };

  return `
    ${isMgr ? `<h2>${esc(T("sched.swapInbox"))}</h2>
      ${inbox.length ? inbox.map(inboxCard).join("") : `<p class="muted">${esc(T("sched.noSwapInbox"))}</p>`}` : ""}
    <h2>${esc(T("sched.openShifts"))}</h2>
    ${open.length ? open.map(openCard).join("") : `<p class="muted">${esc(T("sched.noOpenSwaps"))}</p>`}
    <h2>${esc(T("sched.mySwaps"))}</h2>
    ${mine.length ? mine.map(myCard).join("") : `<p class="muted">${esc(T("sched.noMySwaps"))}</p>`}`;
}

/* ---------- Availability ---------- */
const hasTimes = (st) => st === "limited" || st === "blocked";
function schedAvailStatusLabel(st) {
  return st === "unavailable" ? T("sched.unavailable") : st === "limited" ? T("sched.limited") : st === "blocked" ? T("sched.blocked") : T("sched.available");
}
async function schedAvailHtml() {
  const own = String(state.session.profile.id);
  const target = schedAvailForId();
  // A non-manager typing a ?for= URL gets a dead end here; the backend
  // enforces the same rule on availability.get/set (profile_id target).
  if (target && target !== own && !canSchedManage()) {
    return `<div class="admin-card"><div class="error">${esc(T("common.notAuth"))}</div></div>`;
  }
  const me = target || own;
  // Managers editing someone else's: the name is stashed when tapping the
  // entry on #/admin/users; fall back to the users roster, then a generic label.
  const targetName = target && target !== own
    ? (state.availForName || ((state.users || []).find(u => String(u.id) === target) || {}).name || T("role.staff"))
    : null;
  const r = await edge("availability.get", target ? { profile_id: target } : {});
  const rows = r.rows || [];
  const byDay = {};
  rows.filter(x => String(x.profile_id) === me).forEach(x => byDay[Number(x.weekday)] = x);
  const stOpts = (sel) => [["available", T("sched.available")], ["unavailable", T("sched.unavailable")], ["limited", T("sched.limited")], ["blocked", T("sched.blocked")]]
    .map(([v, l]) => `<option value="${v}" ${sel === v ? "selected" : ""}>${esc(l)}</option>`).join("");
  let html = `<div class="admin-card"><h3 style="margin-top:0">${esc(targetName ? T("sched.availFor").replace("{name}", targetName) : T("sched.avail"))}</h3>
    ${targetName ? `<div style="margin-bottom:10px"><button class="btn btn-small btn-ghost" data-go="#/admin/users">← ${esc(T("common.back"))}</button></div>` : ""}
    <p class="muted" style="font-size:13px;margin:0 0 10px">${esc(T("sched.availExplainer"))}</p>
    <div style="margin-bottom:10px"><button class="btn btn-small btn-ghost" id="av-apply-all">${esc(T("sched.availApplyAll"))}</button></div>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const wd = (i + 1) % 7; // display Mon..Sun -> stored weekday 0=Sunday
      const cur = byDay[wd] || { status: "available" };
      const lim = hasTimes(cur.status);
      return `<div class="form-row" data-avail-day="${wd}" style="align-items:end">
        <div class="field" style="flex:1.5"><label>${esc(schedWeekdayName(i))}</label>
          <select data-av-status>${stOpts(cur.status)}</select></div>
        <div class="field" data-av-times style="flex:1;${lim ? "" : "display:none"}">
          <label>${esc(T("sched.start"))}</label><input type="time" data-av-start value="${esc((cur.start_time || "").slice(0, 5))}"></div>
        <div class="field" data-av-times style="flex:1;${lim ? "" : "display:none"}">
          <label>${esc(T("sched.end"))}</label><input type="time" data-av-end value="${esc((cur.end_time || "").slice(0, 5))}"></div>
        <div class="field" style="flex:1.6"><label>${esc(T("sched.note"))}</label><input data-av-note value="${esc(cur.note || "")}"></div>
      </div>`;
    }).join("")}
    <div id="av-err"></div>
    <button class="btn btn-primary" id="av-save" style="width:100%">${esc(T("common.save"))}</button>
  </div>`;
  if (canSchedManage() && Array.isArray(r.profiles) && r.profiles.length) {
    const dot = (st) => st === "available" ? "🟢" : st === "unavailable" ? "🔴" : st === "blocked" ? "🟠" : "🟡";
    const rowOf = {};
    rows.forEach(x => { rowOf[String(x.profile_id) + "|" + Number(x.weekday)] = x; });
    const cellTitle = (r) => {
      if (!r) return esc(T("sched.available"));
      let t = schedAvailStatusLabel(r.status);
      if ((r.status === "limited" || r.status === "blocked") && r.start_time && r.end_time)
        t += ` ${String(r.start_time).slice(0, 5)}–${String(r.end_time).slice(0, 5)}`;
      return esc(t);
    };
    html += `<div class="admin-card"><h3 style="margin-top:0">${esc(T("sched.teamAvail"))}</h3>
      <div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;font-size:14px">
      <tr><th></th>${[0, 1, 2, 3, 4, 5, 6].map(i => `<th style="padding:6px;border-bottom:1px solid var(--border)">${esc(schedWeekdayName(i).slice(0, 3))}</th>`).join("")}</tr>
      ${r.profiles.map(p => `<tr>
        <td style="padding:6px;border-bottom:1px solid var(--border)"><strong>${esc(p.name)}</strong>
          ${p.department ? `<div class="muted" style="font-size:12px">${esc(p.department)}${p.position ? " · " + esc(p.position) : ""}</div>` : ""}</td>
        ${[0, 1, 2, 3, 4, 5, 6].map(i => {
          const r = rowOf[String(p.id) + "|" + ((i + 1) % 7)]; // display Mon..Sun -> stored 0=Sunday
          const st = r ? r.status : "available";
          const times = (r && (r.status === "limited" || r.status === "blocked") && r.start_time && r.end_time)
            ? `${String(r.start_time).slice(0, 5)}–${String(r.end_time).slice(0, 5)}` : "";
          return `<td style="text-align:center;padding:2px;border-bottom:1px solid var(--border)">`
            + `<button class="avail-cell" data-avail-name="${esc(p.name)}" data-avail-day="${esc(schedWeekdayName(i))}"`
            + ` data-avail-status="${esc(schedAvailStatusLabel(st))}" data-avail-times="${esc(times)}" data-avail-note="${esc((r && r.note) || "")}"`
            + ` aria-label="${esc(p.name + " · " + schedWeekdayName(i) + " · " + cellTitle(r))}">${dot(st)}</button></td>`;
        }).join("")}</tr>`).join("")}
      </table></div></div>`;
  }
  return html;
}

/* ---------- schedule view wiring (after body HTML is set) ---------- */
function wireSchedBody(sub, weekStart, body) {
  state.schedDirty = false; // fresh form; set true on any edit below
  if (sub === "builder" && state.sched) {
    const wsSel = document.getElementById("sched-weekstart");
    if (wsSel) wsSel.onchange = async () => {
      const day = Number(wsSel.value);
      if (!await confirmDialog(T("sched.weekStartOn"), T("sched.weekStartWarn"), T("common.confirm"), null, false)) {
        wsSel.value = String(schedWeekStartDayNum);
        return;
      }
      wsSel.disabled = true; // double-submit guard
      try {
        await edge("schedule.set_week_start_day", { week_start_day: day });
        schedWeekStartDayNum = day;
        showSavedToast(T("sched.weekStartSaved"));
        router();
      } catch (e) { flashError(e.detail || e.message || "Error"); wsSel.disabled = false; }
    };
    const posBtn = document.getElementById("sched-positions");
    if (posBtn) posBtn.onclick = () => schedPositionsModal();
    const usersBtn = document.getElementById("sched-users");
    if (usersBtn) usersBtn.onclick = () => go("#/admin/users");
    const vgBtn = document.getElementById("sched-view-groups");
    if (vgBtn) vgBtn.onclick = () => { schedBuilderView = "groups"; router(); };
    const veBtn = document.getElementById("sched-view-employees");
    if (veBtn) veBtn.onclick = () => { schedBuilderView = "employees"; router(); };
    const copyBtn = document.getElementById("sched-copy");
    if (copyBtn) copyBtn.onclick = async () => {
      if (!await confirmDialog(T("sched.copyTitle"), T("sched.copyMsg"), T("sched.copyWeek"), null, false)) return;
      copyBtn.disabled = true; // double-submit guard
      try {
        const r = await edge("schedule.copy_week", {
          from_week_start: schedAddIso(weekStart, -7),
          to_week_start: weekStart,
        });
        showSavedToast(T("sched.copyDone"));
        if (r.shifts) state.sched.shifts = r.shifts;
        router();
      } catch (e) { flashError(e.detail || T("sched.copyFail")); }
      finally { copyBtn.disabled = false; }
    };
    const flip = async (btn, action, title, msg, confirmLabel, doneMsg) => {
      if (!await confirmDialog(title, msg, confirmLabel, null, false)) return;
      btn.disabled = true; // double-submit guard
      try {
        await edge(action, { schedule_id: state.sched.schedule.id });
        showSavedToast(doneMsg);
        router();
      } catch (e) { flashError(e.detail || T("sched.publishFail")); }
      finally { btn.disabled = false; }
    };
    const pubBtn = document.getElementById("sched-publish");
    if (pubBtn) pubBtn.onclick = () => flip(pubBtn, "schedule.publish", T("sched.publishTitle"), T("sched.publishMsg"), T("sched.publish"), T("sched.published"));
    const unpubBtn = document.getElementById("sched-unpublish");
    if (unpubBtn) unpubBtn.onclick = () => flip(unpubBtn, "schedule.unpublish", T("sched.unpublishTitle"), T("sched.unpublishMsg"), T("sched.unpublish"), T("sched.unpublished"));
    // Pinned weekly patterns (Job 4): pin this week's pattern, apply pins, unpin.
    const pinBtn = document.getElementById("sched-pin-week");
    if (pinBtn) pinBtn.onclick = async () => {
      if (!await confirmDialog(T("sched.pinTitle"), T("sched.pinMsg"), T("sched.pinWeek"), null, false)) return;
      pinBtn.disabled = true; // double-submit guard
      try {
        const per = schedPinnedRowsFromWeek();
        let n = 0;
        for (const [pid, rows] of per) {
          await edge("schedule.set_pinned", { profile_id: pid, rows });
          n++;
        }
        showSavedToast(T("sched.pinnedDone").replace("{n}", String(n)));
        router();
      } catch (e) { flashError(e.detail || T("sched.pinFail")); }
      finally { pinBtn.disabled = false; }
    };
    const applyBtn = document.getElementById("sched-apply-pins");
    if (applyBtn) applyBtn.onclick = async () => {
      if (!await confirmDialog(T("sched.applyTitle"), T("sched.applyMsg"), T("sched.applyPins"), null, false)) return;
      applyBtn.disabled = true; // double-submit guard
      try {
        const r = await edge("schedule.apply_pinned", { schedule_id: state.sched.schedule.id });
        schedApplyResultHtml(r); // modal; closing it refreshes the grid
      } catch (e) { flashError(e.detail || T("sched.applyFail")); }
      finally { applyBtn.disabled = false; }
    };
    // Auto-generate draft (Job 5): fills open staffing needs, never publishes.
    const genBtn = document.getElementById("sched-generate");
    if (genBtn) genBtn.onclick = async () => {
      if (!await confirmDialog(T("sched.genTitle"), T("sched.genMsg"), T("sched.generate"), null, false)) return;
      genBtn.disabled = true; // double-submit guard
      try {
        const r = await edge("schedule.generate", { schedule_id: state.sched.schedule.id });
        schedGenerateResultHtml(r); // modal; closing it refreshes the grid
      } catch (e) { flashError(e.detail || T("sched.genFail")); }
      finally { genBtn.disabled = false; }
    };
    body.querySelectorAll("[data-unpin-pid]").forEach(b => b.onclick = async () => {
      const pid = b.dataset.unpinPid;
      const name = (((state.sched.people || []).find(x => String(x.id) === String(pid))) || {}).name || pid;
      if (!await confirmDialog(T("sched.unpinTitle").replace("{name}", name), T("sched.unpinMsg"))) return;
      b.disabled = true; // double-submit guard
      try {
        await edge("schedule.clear_pinned", { profile_id: pid });
        showSavedToast(T("sched.unpinnedDone").replace("{name}", name));
        router();
      } catch (e) { flashError(e.detail || T("sched.unpinFail")); b.disabled = false; }
    });
    body.querySelectorAll("[data-add-shift]").forEach(b => b.onclick = () => {
      const [pid, iso] = b.dataset.addShift.split("|");
      schedShiftEditor(pid, iso, null);
    });
    body.querySelectorAll("[data-add-open-shift]").forEach(b => b.onclick = () => {
      schedShiftEditor(null, b.dataset.addOpenShift, null);
    });
    body.querySelectorAll("[data-edit-shift]").forEach(b => b.onclick = () => {
      const id = b.dataset.editShift;
      const s = (state.sched.shifts || []).find(x => String(x.id) === String(id));
      if (s) schedShiftEditor(String(s.profile_id), String(s.date).slice(0, 10), s);
    });
    body.querySelectorAll("[data-show-warns]").forEach(b => b.onclick = () => {
      const [pid, iso] = b.dataset.showWarns.split("|");
      const msgs = [...new Set(schedCellShifts(pid, iso).flatMap(s => (state.sched.warns[String(s.id)] || []).map(schedWarnMsg)))];
      showModal(`<h3>⚠️ ${esc(T("sched.warningsTitle"))}</h3>
        <ul>${msgs.map(m => `<li>${esc(m)}</li>`).join("")}</ul>
        <div class="modal-actions"><button class="btn" id="warn-ok">${esc(T("common.confirm"))}</button></div>`);
      document.getElementById("warn-ok").onclick = closeModal;
    });
  }
  if (sub === "my") {
    body.querySelectorAll("[data-release-shift]").forEach(b => b.onclick = async () => {
      const lbl = b.dataset.shiftLabel ? b.dataset.shiftLabel + "\n" : "";
      if (!await confirmDialog(T("sched.releaseTitle"), lbl + T("sched.releaseMsg"), T("sched.release"), null, false)) return;
      b.disabled = true; // double-submit guard
      try {
        await edge("swaps.release", { shift_id: b.dataset.releaseShift });
        showSavedToast(T("sched.released"));
        router();
      } catch (e) { flashError(e.detail || T("sched.releaseFail")); b.disabled = false; }
    });
  }
  if (sub === "swaps") {
    body.querySelectorAll("[data-claim]").forEach(b => b.onclick = async () => {
      const card = b.closest("[data-swap]");
      if (!card) return;
      const lbl = b.dataset.shiftLabel ? b.dataset.shiftLabel + "\n" : "";
      if (!await confirmDialog(T("sched.pickupTitle"), lbl + T("sched.pickupMsg"), T("sched.pickup"), null, false)) return;
      b.disabled = true; // double-submit guard
      try {
        const r = await edge("swaps.claim", { swap_id: card.dataset.swap });
        const warns = (r.warnings || []).map(w => w.message || w.code).filter(Boolean);
        showSavedToast(T("sched.claimSent") + (warns.length ? " ⚠️ " + warns.join("; ") : ""));
        router();
      } catch (e) { flashError(e.detail || T("sched.claimFail")); b.disabled = false; }
    });
    body.querySelectorAll("[data-swap-decide]").forEach(b => b.onclick = async () => {
      const card = b.closest("[data-swap]");
      if (!card) return;
      const approved = b.dataset.swapDecide === "approved";
      const label = approved ? T("review.approveYes") : T("sched.deny");
      if (!await confirmDialog(T("sched.swapDecideTitle"), T("sched.swapDecideMsg"), label, null, approved)) return;
      b.disabled = true; // double-submit guard
      try {
        await edge("swaps.decide", { swap_id: card.dataset.swap, decision: b.dataset.swapDecide });
        showSavedToast(T("common.saved"));
        router();
      } catch (e) { flashError(e.detail || T("sched.swapDecideFail")); b.disabled = false; }
    });
    body.querySelectorAll("[data-swap-cancel]").forEach(b => b.onclick = async () => {
      const card = b.closest("[data-swap]");
      if (!card) return;
      if (!await confirmDialog(T("sched.cancelTitle"), T("sched.cancelMsg"), T("sched.cancelSwap"), null, false)) return;
      b.disabled = true; // double-submit guard
      try {
        await edge("swaps.cancel", { swap_id: card.dataset.swap });
        showSavedToast(T("sched.cancelled"));
        router();
      } catch (e) { flashError(e.detail || T("sched.swapDecideFail")); b.disabled = false; }
    });
    body.querySelectorAll("[data-swap-relist]").forEach(b => b.onclick = async () => {
      b.disabled = true; // double-submit guard
      try {
        await edge("swaps.release", { shift_id: b.dataset.swapRelist });
        showSavedToast(T("sched.released"));
        router();
      } catch (e) { flashError(e.detail || T("sched.releaseFail")); b.disabled = false; }
    });
  }
  if (sub === "timeoff") {
    const todayLocal = schedIso(new Date());
    const fromEl = document.getElementById("to-start"), toEl = document.getElementById("to-end");
    // Default the To date to the From date when picking the start (F-319).
    if (fromEl && toEl) fromEl.onchange = () => { if (!toEl.value || toEl.value < fromEl.value) toEl.value = fromEl.value; };
    const sendBtn = document.getElementById("to-send");
    if (sendBtn) sendBtn.onclick = async () => {
      const s = document.getElementById("to-start").value, e = document.getElementById("to-end").value;
      const err = document.getElementById("to-err");
      const fail = (msg) => { err.innerHTML = `<div class="error">${esc(msg)}</div>`; };
      if (!s || !e) { fail(T("sched.needDates")); return; }
      if (e < s) { fail(T("sched.badDates")); return; }
      if (s < todayLocal) { fail(T("sched.pastDate")); return; }
      sendBtn.disabled = true; // double-submit guard
      try {
        await edge("timeoff.create", {
          start_date: s, end_date: e,
          reason: document.getElementById("to-reason").value.trim() || null,
        });
        if (state.sched) state.sched.avail = null; // picker candidates go stale
        showSavedToast(T("sched.requestSent"));
        router();
      } catch (ex) { err.innerHTML = `<div class="error">${esc(ex.detail || T("sched.requestFail"))}</div>`; }
      finally { sendBtn.disabled = false; }
    };
    // Manager: add approved time off for an employee (paper REQ backfill).
    const forSendBtn = document.getElementById("to-for-send");
    if (forSendBtn) forSendBtn.onclick = async () => {
      const sel = document.getElementById("to-for-person");
      const s = document.getElementById("to-for-start").value, e = document.getElementById("to-for-end").value;
      const err = document.getElementById("to-for-err");
      const fail = (msg) => { err.innerHTML = `<div class="error">${esc(msg)}</div>`; };
      if (!sel || !sel.value) { fail(T("sched.pickPerson")); return; }
      if (!s || !e) { fail(T("sched.needDates")); return; }
      if (e < s) { fail(T("sched.badDates")); return; }
      forSendBtn.disabled = true; // double-submit guard
      try {
        await edge("timeoff.create_for", {
          profile_id: sel.value,
          start_date: s, end_date: e,
          reason: document.getElementById("to-for-reason").value.trim() || null,
        });
        if (state.sched) { state.sched.reqs = null; state.sched.avail = null; } // builder REQ chips + picker go stale
        showSavedToast(T("common.saved"));
        router();
      } catch (ex) { err.innerHTML = `<div class="error">${esc(ex.detail || T("sched.addTimeOffForFail"))}</div>`; }
      finally { forSendBtn.disabled = false; }
    };
    body.querySelectorAll("[data-decide]").forEach(b => b.onclick = async () => {
      const card = b.closest("[data-req]");
      if (!card) return;
      b.disabled = true;
      try {
        // Affected-shift context: pull every week the request spans
        // (best-effort — the confirm still works if a fetch fails).
        let affected = [];
        try {
          const rs = card.dataset.reqStart, re = card.dataset.reqEnd;
          const seenWeeks = new Set();
          for (let d = rs; d <= re; d = schedAddIso(d, 7)) {
            const wk = await schedGetWeek(schedIso(schedWeekStart(new Date(d + "T12:00:00"))));
            if (!wk || seenWeeks.has(wk.week_start)) continue;
            seenWeeks.add(wk.week_start);
            affected = affected.concat((wk.shifts || []).filter(s =>
              String(s.profile_id) === String(card.dataset.reqProfile)
              && s.date >= rs && s.date <= re));
          }
        } catch (e) { /* context is best-effort */ }
        const verb = b.dataset.decide === "approved" ? T("review.approveYes") : T("sched.deny");
        const when = card.dataset.reqStart === card.dataset.reqEnd
          ? schedDayLabel(card.dataset.reqStart)
          : schedDayLabel(card.dataset.reqStart) + " → " + schedDayLabel(card.dataset.reqEnd);
        let msg = `${verb}: ${card.dataset.reqName} — ${when}`;
        if (card.dataset.reqReason) msg += `\n"${card.dataset.reqReason}"`;
        if (affected.length) {
          msg += `\n${T("sched.affectedShifts")}:\n` + affected
            .map(s => `• ${schedDayLabel(s.date)} ${schedFmtTime(s.start_time)}–${schedFmtTime(s.end_time)}`)
            .join("\n");
        }
        if (!await confirmDialog(T("sched.decideTitle"), msg, verb, null, b.dataset.decide !== "approved")) { b.disabled = false; return; }
        await edge("timeoff.decide", { id: card.dataset.req, decision: b.dataset.decide });
        if (state.sched) state.sched.avail = null; // picker candidates go stale
        showSavedToast(T("common.saved"));
        router();
      } catch (e) { flashError(e.detail || T("sched.decideFail")); b.disabled = false; }
    });
    body.querySelectorAll("[data-req-cancel]").forEach(b => b.onclick = async () => {
      const card = b.closest("[data-req]");
      if (!card) return;
      if (!await confirmDialog(T("sched.cancelTitle"), T("sched.cancelRequestConfirm"), T("sched.cancelRequest"))) return;
      b.disabled = true; // double-submit guard
      try {
        await edge("timeoff.cancel", { id: card.dataset.req });
        if (state.sched) state.sched.avail = null; // picker candidates go stale
        showSavedToast(T("common.saved"));
        router();
      } catch (e) { flashError(e.detail || e.message || T("sched.cancelRequestFail")); b.disabled = false; }
    });
  }
  if (sub === "avail") {
    const markDirty = () => { state.schedDirty = true; };
    body.addEventListener("input", markDirty);
    body.addEventListener("change", markDirty);
    // Apply-to-all: copy Monday's row (first day row) to the other six days.
    const applyAll = document.getElementById("av-apply-all");
    if (applyAll) applyAll.onclick = () => {
      const rows = [...body.querySelectorAll("[data-avail-day]")];
      const src = rows[0];
      if (!src) return;
      const get = (sel) => src.querySelector(sel);
      rows.slice(1).forEach(r => {
        r.querySelector("[data-av-status]").value = get("[data-av-status]").value;
        r.querySelector("[data-av-start]").value = get("[data-av-start]").value;
        r.querySelector("[data-av-end]").value = get("[data-av-end]").value;
        r.querySelector("[data-av-note]").value = get("[data-av-note]").value;
        r.querySelector("[data-av-status]").dispatchEvent(new Event("change", { bubbles: true }));
      });
      state.schedDirty = true;
    };
    body.querySelectorAll("[data-avail-day]").forEach(row => {
      const sel = row.querySelector("[data-av-status]");
      const times = row.querySelectorAll("[data-av-times]");
      sel.onchange = () => times.forEach(t => t.style.display = hasTimes(sel.value) ? "" : "none");
    });
    // Manager grid: tap a cell for the full availability detail.
    body.querySelectorAll(".avail-cell").forEach(c => c.onclick = () => {
      const d = c.dataset;
      showModal(`<h3>${esc(d.availName)}</h3>
        <p class="muted" style="margin-top:0">${esc(d.availDay)}</p>
        <p><strong>${esc(d.availStatus)}</strong>${d.availTimes ? ` · ${esc(d.availTimes)}` : ""}</p>
        ${d.availNote ? `<p>${esc(d.availNote)}</p>` : ""}
        <div class="modal-actions"><button class="btn btn-primary" id="av-detail-ok" style="flex:1">${esc(T("common.close"))}</button></div>`);
      document.getElementById("av-detail-ok").onclick = () => closeModal();
    });
    const avSave = document.getElementById("av-save");
    if (avSave) avSave.onclick = async () => {
      const rows = [...body.querySelectorAll("[data-avail-day]")].map(row => {
        const rec = { weekday: Number(row.dataset.availDay), status: row.querySelector("[data-av-status]").value };
        if (rec.status === "limited" || rec.status === "blocked") {
          rec.start_time = row.querySelector("[data-av-start]").value || null;
          rec.end_time = row.querySelector("[data-av-end]").value || null;
        }
        rec.note = row.querySelector("[data-av-note]").value.trim() || null;
        return rec;
      });
      avSave.disabled = true; // double-submit guard
      try {
        const forId = schedAvailForId();
        await edge("availability.set", schedAvailSetBody(forId, rows));
        if (state.sched) state.sched.avail = null; // picker candidates go stale
        state.schedDirty = false;
        showSavedToast();
        router();
      } catch (e) {
        const er = document.getElementById("av-err");
        if (er) er.innerHTML = `<div class="error">${esc(e.detail || T("sched.availFail"))}</div>`;
      }
      finally { avSave.disabled = false; }
    };
  }
  if (sub === "staffing") {
    drawStaffingArrange();
    const markDirty = () => { state.schedDirty = true; };
    body.addEventListener("input", markDirty);
    body.addEventListener("change", markDirty);
    const saveT = document.getElementById("staffing-save-targets");
    if (saveT) saveT.onclick = async () => {
      saveT.disabled = true; // double-submit guard
      try {
        const positions = schedPositions.length ? schedPositions : ["Server", "Bartender", "Busser", "Runner", "Host", "Barback", "Expo"];
        const targets = [];
        body.querySelectorAll("[data-tg]").forEach(inp => {
          const parts = inp.dataset.tg.split("|");
          const v = inp.value === "" ? 0 : Number(inp.value);
          if (v > 0) targets.push({ weekday: Number(parts[0]), daypart: parts[1], position: positions[Number(parts[2])], required: v });
        });
        const r = await edge("staffing.save_targets", { targets });
        const tmap = new Map();
        for (const t of (r.targets || [])) tmap.set(t.weekday + "|" + t.daypart + "|" + String(t.position).toLowerCase(), t.required);
        if (state.staffing) state.staffing.tmap = tmap;
        state.schedDirty = false;
        showSavedToast(T("sched.staffingSaved"));
      } catch (e) { flashError(e.detail || e.message || "Error"); }
      saveT.disabled = false;
    };
  }
}

/* ---------- per-user schedule-access controls (Manage → Users) ---------- */
/* Non-superadmin managers can set schedule view access, department and
 * position. The "can manage schedule" checkbox renders ONLY for superadmin
 * editors, and is disabled on the superadmin target row. */
/** Datalist options for the schedule-group field: existing groups, A–Z. */
function schedGroupOptionsHtml() {
  const groups = [...new Set((state.users || []).map(x => (x.sched_group || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  return groups.map(g => `<option value="${esc(g)}">`).join("");
}
function schedFlagsHtml(u, viewerIsSuper) {
  const isSA = u.role === "superadmin";
  const chk = viewerIsSuper
    ? `<label class="check-row" style="margin-top:8px"><input type="checkbox" data-sf="can_manage_schedule" ${u.can_manage_schedule ? "checked" : ""} ${isSA ? "disabled" : ""}>
      <span>${esc(T("sched.accessManage"))}${isSA ? ` <span class="muted">(${esc(T("admin.saLocked"))})</span>` : ""}</span></label>`
    : "";
  return `<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px">
    <div class="form-row">
      <div class="field"><label>${esc(T("sched.scheduleAccess"))}</label><select data-sf="can_view_schedule">
        <option value="0" ${u.can_view_schedule ? "" : "selected"}>${esc(T("sched.none"))}</option>
        <option value="1" ${u.can_view_schedule ? "selected" : ""}>${esc(T("sched.accessView"))}</option></select></div>
      <div class="field"><label>${esc(T("sched.department"))}</label><select data-sf="department">
        <option value="">—</option>
        <option value="FOH" ${u.department === "FOH" ? "selected" : ""}>FOH</option>
        <option value="BOH" ${u.department === "BOH" ? "selected" : ""}>BOH</option></select></div>
      <div class="field"><label>${esc(T("sched.position"))}</label>${schedPositionInputHtml('data-sf="position"', u.position)}</div>
      <div class="field"><label>${esc(T("sched.group"))}</label>
        <input data-sf="sched_group" list="sched-group-${u.id}" value="${esc(u.sched_group || "")}" maxlength="40" placeholder="—" autocomplete="off">
        <datalist id="sched-group-${u.id}">${schedGroupOptionsHtml()}</datalist></div>
    </div>
    ${chk}
    <label class="check-row" style="margin-top:8px"><input type="checkbox" data-sf="can_open" ${u.can_open ? "checked" : ""}>
      <span>${esc(T("sched.canOpen"))}</span></label>
    <label class="check-row" style="margin-top:8px"><input type="checkbox" data-sf="can_close" ${u.can_close ? "checked" : ""}>
      <span>${esc(T("sched.canClose"))}</span></label>
    <button class="btn btn-small btn-primary" data-u-sched style="width:100%;margin-top:8px">${esc(T("sched.saveFlags"))}</button>
  </div>`;
}

/* ============================ INIT ============================= */
let booted = false;
function init() { if (booted) return; booted = true; boot(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init(); // script sits at end of body; DOM is already parsed
