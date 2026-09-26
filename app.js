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

function fmtMoney(n) {
  return "$" + (Number(n) || 0).toFixed(2);
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
  "common.save": "Save", "common.delete": "Delete", "common.name": "Name",
  "common.notes": "Notes", "common.move": "Move", "common.notAuth": "Not authorized.",
  "common.saving": "Saving…", "common.checking": "Checking…",
  "common.item": "Item", "common.continue": "Continue",
  "nav.homeAria": "Home", "nav.logoutAria": "Log out",
  "role.manager": "Manager", "role.staff": "Staff", "role.view": "View",
  "move.title": "Move to area", "move.current": "current",
  "login.prompt": "Enter your PIN to sign in", "login.signin": "Sign in",
  "login.needPin": "Enter your PIN.", "login.wrong": "Wrong PIN. Try again.",
  "login.langToggle": "Español",
  "setpin.title": "Set your PIN", "setpin.step1": "Enter a new PIN (min 4 digits)",
  "setpin.step2": "Enter it again to confirm", "setpin.min4": "PIN must be at least 4 digits.",
  "setpin.mismatch": "PINs don't match. Start over.", "setpin.fail": "Could not set PIN. Try again.",
  "home.hi": "Hi", "home.parBanner": "Set par levels to generate orders",
  "home.parBanner2": "items have pars.", "home.openPar": "Open bulk par editor →",
  "home.start": "Start New Count", "home.orders": "Order History", "home.manage": "Manage",
  "home.viewOrders": "View Orders", "home.drafts": "Draft counts",
  "home.noDrafts": "No draft counts.", "home.count": "Count",
  "home.review": "Review", "home.resume": "Resume", "home.view": "View",
  "home.discard": "Abandon", "home.abandonTitle": "Abandon count?",
  "home.abandonMsg": "This draft count will be discarded. This cannot be undone.",
  "home.abandonYes": "Abandon", "home.abandonFail": "Could not abandon count.",
  "home.startFail": "Could not start a new count.", "home.noSession": "Server did not return a session id.",
  "home.replay": "🔁 Replay tour",
  "par.title": "Bulk par editor",
  "par.hint": "Only items with a par above 0 generate order lines. Leave blank = no par.",
  "par.par": "Par", "par.price": "Price", "par.saveAll": "Save all",
  "par.saved1": "Saved 1 change.", "par.savedN": "Saved {n} changes.",
  "par.saveFail": "Save failed.", "par.change": "change", "par.changes": "changes",
  "count.loading": "Loading count…",
  "pill.not": "Not counted", "pill.counted": "Counted", "pill.zero": "Zero confirmed",
  "pill.done": "Done", "pill.review": "Needs review",
  "count.noPar": "no par", "count.dec": "Decrease", "count.inc": "Increase",
  "count.countFor": "Count for", "count.parFor": "Par for",
  "count.full": "Full", "count.clear": "Clear", "count.markZero": "Mark Zero",
  "count.doneBtn": "✓ Done", "count.moveArea": "Move area",
  "count.noParHint": "No par set — enter count",
  "count.search": "🔍 Search items…", "count.noItems": "No items here",
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
  "count.moveTitle": "Move item?", "count.moveMsg": "Move {name} from {from} to {to}?",
  "count.moveFail": "Could not move item.", "count.parFail": "Could not update par.",
  "review.loading": "Loading review…", "review.title": "Review & approve",
  "review.notCounted": "Not counted", "review.allCounted": "Everything has a count. 🎉",
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
  "review.onlyManagers": "Only managers or the super admin can approve.",
  "review.approveTitle": "Approve count?",
  "review.approveMsg": "This finalizes the count and generates orders. Continue?",
  "review.approveYes": "Approve", "review.approveFail": "Approval failed.",
  "review.blockTitle": "Cannot approve — these items need review:",
  "review.blockMsg": "Open each item in the count and resolve it, then approve again.",
  "review.info": "ℹ️ Info", "review.warn": "⚠️ Warning",
  "orders.loading": "Loading orders…", "orders.title": "Orders",
  "orders.print": "🖨 Print",
  "orders.none": "No orders yet. Approve a count to generate orders.",
  "orders.draft": "draft", "orders.sent": "sent", "orders.received": "received",
  "orders.markSent": "Mark sent", "orders.markReceived": "Mark received",
  "orders.share": "📤 Share image", "orders.copy": "📋 Copy text",
  "orders.copied": "✓ Copied", "orders.imgFail": "Could not create the order image.",
  "orders.statusFail": "Could not update order status.",
  "admin.manage": "Manage", "admin.items": "Items", "admin.areas": "Areas",
  "admin.vendors": "Vendors", "admin.users": "Users",
  "users.delete": "Delete", "users.deleteTitle": "Delete user?",
  "users.deleteMsg": "This permanently removes {name}. This cannot be undone.",
  "users.deleteFail": "Could not delete user.",
  "admin.addItem": "Add item", "admin.area": "Area", "admin.vendor": "Vendor",
  "admin.unit": "Unit", "admin.price": "Price", "admin.exItem": "e.g. Bluefin tuna",
  "admin.itemNeedName": "Item name can't be empty.",
  "admin.addItemFail": "Could not add item.", "admin.archived": "ARCHIVED",
  "admin.unarchive": "Unarchive", "admin.archive": "Archive",
  "admin.mode": "Mode", "admin.modeAuto": "auto (generates orders)",
  "admin.modeManual": "manual", "admin.countStyle": "Count style",
  "admin.exCase": "e.g. case", "admin.pieces": "Pieces per case",
  "admin.noVendor": "no vendor", "admin.saveItemFail": "Could not save item.",
  "admin.csvTitle": "Bulk edit (CSV)",
  "admin.csvHelp": "Download the catalog as a spreadsheet, edit pars, areas, vendors and prices, then upload it back. Blank id = new item. Unknown area/vendor names are skipped.",
  "admin.csvDownload": "Download CSV", "admin.csvFile": "CSV file",
  "admin.csvUpload": "Upload & apply", "admin.csvNeedFile": "Choose a CSV file first.",
  "admin.csvBadFile": "Could not read that CSV file.",
  "admin.csvResult": "Updated {u}, added {c}.", "admin.csvErrors": "{n} rows skipped:",
  "admin.csvRow": "Row {r} ({name}): {error}",
  "admin.killTitle": "Kill switch",
  "admin.killHelp": "Shutting off the app blocks everyone except superadmins. Counts, approvals and orders stop working immediately. Nothing is deleted — you can turn it back on at any time.",
  "admin.killLive": "LIVE", "admin.killDead": "SHUT OFF",
  "admin.killOff": "Shut off app", "admin.killOn": "Re-enable app",
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
  "admin.addVendor": "Add vendor",
  "admin.vendorNeedName": "Vendor name can't be empty.",
  "admin.addVendorFail": "Could not add vendor.",
  "admin.vendorSaveFail": "Could not save vendor.",
  "vendor.orderDays": "Order days", "vendor.orderBy": "Order by",
  "vendor.deliveryDays": "Delivery days",
  "admin.addUser": "Add user", "admin.role": "Role",
  "admin.initPin": "Initial PIN (min 4 digits)",
  "admin.userNeedName": "Name can't be empty.",
  "admin.addUserFail": "Could not add user.", "admin.you": "you",
  "admin.active": "active", "admin.disabled": "disabled",
  "admin.enable": "Enable", "admin.disable": "Disable",
  "admin.saveRole": "Save role", "admin.setNewPin": "Set new PIN (enter twice)",
  "admin.newPin": "New PIN", "admin.confirmPin": "Confirm PIN",
  "admin.setPinBtn": "Set PIN",
  "admin.userStatusFail": "Could not change user status.",
  "admin.roleFail": "Could not update role.", "admin.setPinFail": "Could not set PIN.",
  "admin.email": "Email", "admin.moveItemTitle": "Move item?",
  "admin.moveItemMsg": "Move {item} from {from} to {to}?",
  "admin.moveFail": "Could not move item.",
  "admin.pinNeed4": "PIN must be at least 4 digits.",
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
  "tour.langT": "English / Español",
  "tour.langB": "Tap the 🌐 button anytime to switch languages. Orders always go out in English.",
  "tour.c1T": "This is what you enter",
  "tour.c1B": "Type the count in the box — or tap − / + to adjust. It saves automatically.",
  "tour.c2T": "Areas",
  "tour.c2B": "Switch areas with these tabs. The numbers show how many items are done.",
  "tour.c3T": "Quick buttons",
  "tour.c3B": "0, fractions, Full, and ✓ Done speed things up. Mark Zero if the shelf is empty.",
  "tour.replay": "🔁 Replay tour",
},
es: {
  "common.cancel": "Cancelar", "common.confirm": "Confirmar", "common.back": "← Atrás",
  "common.save": "Guardar", "common.delete": "Eliminar", "common.name": "Nombre",
  "common.notes": "Notas", "common.move": "Mover", "common.notAuth": "No autorizado.",
  "common.saving": "Guardando…", "common.checking": "Revisando…",
  "common.item": "Artículo", "common.continue": "Continuar",
  "nav.homeAria": "Inicio", "nav.logoutAria": "Cerrar sesión",
  "role.manager": "Gerente", "role.staff": "Personal", "role.view": "Lectura",
  "move.title": "Mover a área", "move.current": "actual",
  "login.prompt": "Ingresa tu PIN para entrar", "login.signin": "Entrar",
  "login.needPin": "Ingresa tu PIN.", "login.wrong": "PIN incorrecto. Intenta de nuevo.",
  "login.langToggle": "English",
  "setpin.title": "Crea tu PIN", "setpin.step1": "Ingresa un PIN nuevo (mín. 4 dígitos)",
  "setpin.step2": "Ingrésalo de nuevo para confirmar", "setpin.min4": "El PIN debe tener al menos 4 dígitos.",
  "setpin.mismatch": "Los PIN no coinciden. Empieza de nuevo.", "setpin.fail": "No se pudo guardar el PIN. Intenta de nuevo.",
  "home.hi": "Hola", "home.parBanner": "Pon los niveles de par para generar pedidos",
  "home.parBanner2": "artículos tienen par.", "home.openPar": "Abrir editor de pars →",
  "home.start": "Empezar nuevo conteo", "home.orders": "Historial de pedidos", "home.manage": "Administrar",
  "home.viewOrders": "Ver pedidos", "home.drafts": "Conteos en borrador",
  "home.noDrafts": "No hay conteos en borrador.", "home.count": "Conteo",
  "home.review": "Revisar", "home.resume": "Continuar", "home.view": "Ver",
  "home.discard": "Descartar", "home.abandonTitle": "¿Descartar conteo?",
  "home.abandonMsg": "Este borrador se eliminará. No se puede deshacer.",
  "home.abandonYes": "Descartar", "home.abandonFail": "No se pudo descartar el conteo.",
  "home.startFail": "No se pudo empezar el conteo.", "home.noSession": "El servidor no devolvió un id de sesión.",
  "home.replay": "🔁 Ver recorrido",
  "par.title": "Editor de pars",
  "par.hint": "Solo los artículos con par mayor a 0 generan pedidos. Vacío = sin par.",
  "par.par": "Par", "par.price": "Precio", "par.saveAll": "Guardar todo",
  "par.saved1": "Se guardó 1 cambio.", "par.savedN": "Se guardaron {n} cambios.",
  "par.saveFail": "No se pudo guardar.", "par.change": "cambio", "par.changes": "cambios",
  "count.loading": "Cargando conteo…",
  "pill.not": "Sin contar", "pill.counted": "Contado", "pill.zero": "Cero confirmado",
  "pill.done": "Listo", "pill.review": "Revisar",
  "count.noPar": "sin par", "count.dec": "Disminuir", "count.inc": "Aumentar",
  "count.countFor": "Conteo de", "count.parFor": "Par de",
  "count.full": "Lleno", "count.clear": "Borrar", "count.markZero": "Marcar cero",
  "count.doneBtn": "✓ Listo", "count.moveArea": "Mover de área",
  "count.noParHint": "Sin par — ingresa el conteo",
  "count.search": "🔍 Buscar artículos…", "count.noItems": "No hay artículos aquí",
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
  "count.moveTitle": "¿Mover artículo?", "count.moveMsg": "¿Mover {name} de {from} a {to}?",
  "count.moveFail": "No se pudo mover el artículo.", "count.parFail": "No se pudo actualizar el par.",
  "review.loading": "Cargando revisión…", "review.title": "Revisar y aprobar",
  "review.notCounted": "Sin contar", "review.allCounted": "Todo tiene conteo. 🎉",
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
  "review.onlyManagers": "Solo gerentes o el super admin pueden aprobar.",
  "review.approveTitle": "¿Aprobar conteo?",
  "review.approveMsg": "Esto finaliza el conteo y genera los pedidos. ¿Continuar?",
  "review.approveYes": "Aprobar", "review.approveFail": "Falló la aprobación.",
  "review.blockTitle": "No se puede aprobar — estos artículos necesitan revisión:",
  "review.blockMsg": "Abre cada artículo en el conteo y resuélvelo, luego aprueba de nuevo.",
  "review.info": "ℹ️ Info", "review.warn": "⚠️ Advertencia",
  "orders.loading": "Cargando pedidos…", "orders.title": "Pedidos",
  "orders.print": "🖨 Imprimir",
  "orders.none": "Aún no hay pedidos. Aprueba un conteo para generar pedidos.",
  "orders.draft": "borrador", "orders.sent": "enviado", "orders.received": "recibido",
  "orders.markSent": "Marcar enviado", "orders.markReceived": "Marcar recibido",
  "orders.share": "📤 Compartir imagen", "orders.copy": "📋 Copiar texto",
  "orders.copied": "✓ Copiado", "orders.imgFail": "No se pudo crear la imagen del pedido.",
  "orders.statusFail": "No se pudo actualizar el estado del pedido.",
  "admin.manage": "Administrar", "admin.items": "Artículos", "admin.areas": "Áreas",
  "admin.vendors": "Proveedores", "admin.users": "Usuarios",
  "users.delete": "Eliminar", "users.deleteTitle": "¿Eliminar usuario?",
  "users.deleteMsg": "Esto elimina permanentemente a {name}. No se puede deshacer.",
  "users.deleteFail": "No se pudo eliminar el usuario.",
  "admin.addItem": "Agregar artículo", "admin.area": "Área", "admin.vendor": "Proveedor",
  "admin.unit": "Unidad", "admin.price": "Precio", "admin.exItem": "p. ej. atún bluefin",
  "admin.itemNeedName": "El nombre no puede estar vacío.",
  "admin.addItemFail": "No se pudo agregar el artículo.", "admin.archived": "ARCHIVADO",
  "admin.unarchive": "Desarchivar", "admin.archive": "Archivar",
  "admin.mode": "Modo", "admin.modeAuto": "auto (genera pedidos)",
  "admin.modeManual": "manual", "admin.countStyle": "Estilo de conteo",
  "admin.exCase": "p. ej. caso", "admin.pieces": "Piezas por caso",
  "admin.noVendor": "sin proveedor", "admin.saveItemFail": "No se pudo guardar el artículo.",
  "admin.csvTitle": "Edición masiva (CSV)",
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
  "admin.addVendor": "Agregar proveedor",
  "admin.vendorNeedName": "El nombre del proveedor no puede estar vacío.",
  "admin.addVendorFail": "No se pudo agregar el proveedor.",
  "admin.vendorSaveFail": "No se pudo guardar el proveedor.",
  "vendor.orderDays": "Días de pedido", "vendor.orderBy": "Pedir antes de",
  "vendor.deliveryDays": "Días de entrega",
  "admin.addUser": "Agregar usuario", "admin.role": "Rol",
  "admin.initPin": "PIN inicial (mín. 4 dígitos)",
  "admin.userNeedName": "El nombre no puede estar vacío.",
  "admin.addUserFail": "No se pudo agregar el usuario.", "admin.you": "tú",
  "admin.active": "activo", "admin.disabled": "desactivado",
  "admin.enable": "Activar", "admin.disable": "Desactivar",
  "admin.saveRole": "Guardar rol", "admin.setNewPin": "Poner PIN nuevo (dos veces)",
  "admin.newPin": "PIN nuevo", "admin.confirmPin": "Confirmar PIN",
  "admin.setPinBtn": "Poner PIN",
  "admin.userStatusFail": "No se pudo cambiar el estado del usuario.",
  "admin.roleFail": "No se pudo actualizar el rol.", "admin.setPinFail": "No se pudo poner el PIN.",
  "admin.email": "Correo", "admin.moveItemTitle": "¿Mover artículo?",
  "admin.moveItemMsg": "¿Mover {item} de {from} a {to}?",
  "admin.moveFail": "No se pudo mover el artículo.",
  "admin.pinNeed4": "El PIN debe tener al menos 4 dígitos.",
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
  "tour.langT": "English / Español",
  "tour.langB": "Toca el botón 🌐 cuando quieras para cambiar el idioma. Los pedidos siempre salen en inglés.",
  "tour.c1T": "Aquí anotas el conteo",
  "tour.c1B": "Escribe el número en la casilla, o toca − / + para ajustar. Se guarda automáticamente.",
  "tour.c2T": "Áreas",
  "tour.c2B": "Cambia de área con estas pestañas. Los números muestran cuántos artículos ya contaste.",
  "tour.c3T": "Botones rápidos",
  "tour.c3B": "0, fracciones, Lleno y ✓ Listo aceleran el conteo. Marca cero si el estante está vacío.",
  "tour.replay": "🔁 Ver recorrido",
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

/** Display label for a role value. Super Admin stays English (Gabe's screens). */
const roleLabel = (r) => {
  if (r === "superadmin") return "Super Admin";
  const k = { manager: "role.manager", staff: "role.staff", view: "role.view" }[r];
  return k ? T(k) : (r ? r.charAt(0).toUpperCase() + r.slice(1) : "");
};

/* ============================ STATE ============================= */
const state = {
  session: null,       // { token, profile: { id, name, role, must_change_pin? } }
  areas: [],           // [{id, name}]
  vendors: [],         // [{id, name, email, notes}]
  items: [],           // [{id, name, area_id, vendor_id, par, unit, mode, count_style, pieces_per_case, price, notes, active}]
  sessions: [],        // draft sessions
  orders: [],          // orders list
  count: null,         // { sessionId, session, areaId, entries: {itemId:{count,status,note}}, search, highlight }
  review: null,        // { sessionId, flags: [], aiRan: bool }
  route: null,
  saveTimers: {},      // debounced entry saves per item
  settings: null,      // { store_name, show_prices } — loaded via settings.get
  cardData: {},        // order-card payloads keyed by card id (for image share)
  lang: "en",          // UI language: "en" | "es" (per device; orders always English)
};

/** Load store settings (store name, price toggle). Cached; cheap to refresh. */
async function loadSettings() {
  const fallback = { store_name: "Sumo Sushi", show_prices: false };
  try {
    const r = await edge("settings.get");
    state.settings = Object.assign({}, fallback, r.settings || {});
  } catch (e) { state.settings = state.settings || fallback; }
  return state.settings;
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
 *  Errors arrive as {error:'code', detail?} and are thrown as exceptions. */
async function edge(action, payload = {}) {
  const res = await fetch(CONFIG.SUPABASE_URL + "/functions/v1/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, token: state.session ? state.session.token : null, ...payload }),
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* non-JSON */ }
  if (data && data.error) {
    // Kill switch: the server only sends app_disabled to non-superadmins
    // (superadmins are never gated), so this client is done for the session.
    if (data.error === "app_disabled") {
      state.killed = true;
      showKilled();
    }
    throw { code: data.error, detail: data.detail, status: res.status, data };
  }
  if (!res.ok) throw { code: "edge_" + res.status, status: res.status, data };
  return data;
}

/* ======================= SESSION / AUTH ======================= */
const SESSION_KEY = "sumoV2session";

function saveSession(s) {
  // NOTE: PIN is never stored — only the opaque token + profile.
  state.session = s;
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function dropSession() {
  state.session = null;
  localStorage.removeItem(SESSION_KEY);
}

/** Boot: restore session from localStorage, verify it with a cheap
 *  call (areas.list works for any role). On 401 -> drop + login. */
async function boot() {
  try { state.lang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { state.lang = "en"; }
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      state.session = JSON.parse(raw);
      // NOTE: when the kill switch is on, areas.list throws app_disabled for
      // non-superadmins (superadmins are never gated server-side), so the
      // server — not the saved login copy — decides who sees the dead screen.
      const r = await edge("areas.list");
      state.areas = r.areas || r || [];
      if (state.session.profile && state.session.profile.must_change_pin) {
        location.hash = "#/set-pin";
        return;
      }
    } catch (e) {
      if (e && e.code === "app_disabled") { state.killed = true; showKilled(); return; }
      dropSession(); // bad/expired token -> force login
    }
  }
  router();
  window.addEventListener("hashchange", router);
  // Top-bar Home button, delegated so every view gets it without per-view wiring.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-home"]');
    if (t) go("#/home");
  });
  // Language toggle (EN/ES) in the top bar — re-render the current view.
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-act="nav-lang"]');
    if (t) { setLang(lang() === "es" ? "en" : "es"); router(); }
  });
  // Order-card actions (share image / copy text), delegated for the same reason.
  document.addEventListener("click", (e) => {
    const sh = e.target.closest("[data-share-card]");
    if (sh) { shareOrderCard(sh.dataset.shareCard, sh); return; }
    const cp = e.target.closest("[data-copy-card]");
    if (cp) { copyCardText(cp.dataset.copyCard, cp); }
  });
}

/** Logout: tell the server, then wipe local session. */
async function logout() {
  try { await edge("logout"); } catch (e) { /* best effort */ }
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
  else if (view === "count") renderCount(arg);
  else if (view === "review") renderReview(arg);
  else if (view === "orders") renderOrders();
  else if (view === "admin" && arg === "par") renderBulkPar();
  else if (view === "admin") renderAdmin(arg || "items");
  else renderLogin();
}

function go(h) { if (location.hash === h) router(); else location.hash = h; }

/* ========================= TOP NAV ============================ */
function navHtml(title) {
  const p = state.session ? state.session.profile : {};
  const isSuper = p.role === "superadmin";
  return `<div class="topnav no-print">
    <div><button class="brand-btn" data-act="nav-home" aria-label="Home"><span class="brand">SUMO<span class="dot">•</span>INV</span></button></div>
    <div class="user">${esc(p.name || "")} · ${esc(roleLabel(p.role))}</div>
    <div style="display:flex;gap:4px;align-items:center">
      ${isSuper ? "" : `<button class="btn btn-small btn-ghost" data-act="nav-lang" aria-label="Language" title="English / Español">🌐 ${lang() === "es" ? "EN" : "ES"}</button>`}
      <button class="btn btn-small btn-ghost" data-act="nav-home" aria-label="${esc(T("nav.homeAria"))}">⌂</button>
      <button class="btn btn-small btn-ghost" data-act="nav-logout" aria-label="${esc(T("nav.logoutAria"))}">⎋</button>
    </div>
  </div>`;
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

/** Promise-based confirm dialog with custom text. */
function confirmDialog(title, message, confirmLabel = null, cancelLabel = null) {
  return new Promise((resolve) => {
    showModal(`<h3>${esc(title)}</h3><p>${esc(message)}</p>
      <div class="modal-actions">
        <button class="btn" id="cf-no">${esc(cancelLabel || T("common.cancel"))}</button>
        <button class="btn btn-danger" id="cf-yes">${esc(confirmLabel || T("common.confirm"))}</button>
      </div>`);
    document.getElementById("cf-no").onclick = () => { closeModal(); resolve(false); };
    document.getElementById("cf-yes").onclick = () => { closeModal(); resolve(true); };
  });
}

/** Area picker modal -> resolves with area id or null. */
function pickArea(currentId) {
  return new Promise((resolve) => {
    const opts = state.areas.map(a =>
      `<button class="btn area-opt" data-area="${a.id}">${esc(a.name)}${a.id === currentId ? " (" + esc(T("move.current")) + ")" : ""}</button>`
    ).join("");
    showModal(`<h3>${esc(T("move.title"))}</h3>${opts}
      <div class="modal-actions"><button class="btn" id="pa-cancel">${esc(T("common.cancel"))}</button></div>`);
    document.getElementById("pa-cancel").onclick = () => { closeModal(); resolve(null); };
    document.getElementById("modal-back").querySelectorAll("[data-area]").forEach(b =>
      b.onclick = () => { closeModal(); resolve(b.dataset.area); });
  });
}

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
function clearFlash() {
  const el = document.getElementById("flash");
  if (el) el.remove();
}

/* ====================== VIEW: LOGIN ============================ */
/* Numeric PIN pad. No placeholder, no hint, no default value —
 * nothing that suggests any particular PIN. */
function renderLogin() {
  const pad = { digits: "" };
  state._pad = pad;
  $app().innerHTML = `
  <div class="view pin-pad-wrap">
    <h1 style="text-align:center">SUMO<span style="color:var(--accent-hi)">•</span>INV</h1>
    <p class="muted" style="text-align:center">${esc(T("login.prompt"))}</p>
    <div class="pin-dots" id="pin-dots" aria-live="polite"></div>
    <div id="login-err"></div>
    <div class="pin-pad" id="pin-pad">
      ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" data-k="${n}">${n}</button>`).join("")}
      <button class="pin-key" data-k="clear" aria-label="Clear">⌫</button>
      <button class="pin-key" data-k="0">0</button>
      <button class="pin-key" data-k="back" aria-label="Backspace">←</button>
    </div>
    <div style="margin-top:16px"><button class="btn btn-primary" id="pin-go" style="width:100%">${esc(T("login.signin"))}</button></div>
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
  document.getElementById("login-lang").onclick = () => { setLang(lang() === "es" ? "en" : "es"); renderLogin(); };
  pad.digits = ""; dots();
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
    // First-login accounts must change PIN before any other call is allowed.
    if (r.profile && r.profile.must_change_pin) { go("#/set-pin"); return; }
    const a = await edge("areas.list");
    state.areas = a.areas || a || [];
    go("#/home");
  } catch (e) {
    errBox.innerHTML = `<div class="error">${esc(e.detail || T("login.wrong"))}</div>`;
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
      <button class="pin-key" data-k="clear" aria-label="Clear">⌫</button>
      <button class="pin-key" data-k="0">0</button>
      <button class="pin-key" data-k="back" aria-label="Backspace">←</button>
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
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">Loading…</div></div>`;
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
  } catch (e) {
    if (e.code === "unauthorized" || e.status === 401) { dropSession(); go("#/login"); return; }
  }

  const drafts = state.sessions.filter(x => x.status === "draft");
  const canManage = has("manage");
  const isSuper = has("superadmin");

  /* Par banner: visible to manager+ on Home. Nudges par setup so orders can generate. */
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
  if (canManage) cards.push(`<button class="menu-card" data-go="#/admin/items"><span class="ico">🗃️</span>${esc(T("home.manage"))}</button>`);
  if (isSuper) cards.push(`<button class="menu-card" data-go="#/admin/io"><span class="ico">⚙️</span>Super Admin</button>`);
  if (!has("count")) cards.push(`<button class="menu-card" data-go="#/orders"><span class="ico">👁</span>${esc(T("home.viewOrders"))}</button>`);

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("home.hi"))}, ${esc(p.name)}</h1>
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
    ${isSuper ? "" : `<div style="text-align:center;margin-top:18px" class="no-print"><button class="btn btn-small btn-ghost" data-act="replay-tour">${esc(T("tour.replay"))}</button></div>`}
  </div>`;

  $app().querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
    if (b.dataset.go === "#/count/new") startNewCount();
    else go(b.dataset.go);
  });
  $app().querySelectorAll("[data-open-count]").forEach(b => b.onclick = () => go("#/count/" + b.dataset.openCount));
  $app().querySelectorAll("[data-open-review]").forEach(b => b.onclick = () => go("#/review/" + b.dataset.openReview));
  $app().querySelectorAll("[data-abandon]").forEach(b => b.onclick = async () => {
    if (await confirmDialog(T("home.abandonTitle"), T("home.abandonMsg"), T("home.abandonYes"))) {
      try { await edge("sessions.abandon", { session_id: b.dataset.abandon }); renderHome(); }
      catch (e) { flashError(e.detail || T("home.abandonFail")); }
    }
  });
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

async function startNewCount() {
  try {
    const r = await edge("sessions.create");
    const id = r.session_id || r.id || (r.session && r.session.id);
    if (!id) throw { detail: T("home.noSession") };
    go("#/count/" + id);
  } catch (e) {
    flashError(e.detail || T("home.startFail"));
  }
}

/* ================== VIEW: BULK PAR EDITOR ====================== */
/* Simple table: item | par input, one Save. Linked from the Home banner. */
function renderBulkPar() {
  if (!has("manage")) { $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div></div>`; return; }
  const active = state.items.filter(i => i.active !== false);
  const rows = active.map(i => `
    <tr>
      <td>${esc(i.name)}<div class="muted" style="font-size:12px">${esc(areaName(i.area_id))}</div></td>
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

/* ====================== VIEW: COUNT ============================ */
/* #/count/:sessionId — the counting screen.
 * Status pills: not counted / counted / zero confirmed / done / needs review. */
async function renderCount(sessionId) {
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">${esc(T("count.loading"))}</div></div>`;
  try {
    const [it, v, a] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
    ]);
    state.items = it.items || it || [];
    state.vendors = v.vendors || v || [];
    state.areas = a.areas || a || [];
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { dropSession(); go("#/login"); return; } }

  const editable = has("count");
  const highlight = new URLSearchParams(state.route.query || "").get("item");

  // Load existing entries for this session (PostgREST).
  let entries = {};
  try {
    const rows = await api("GET", `/entries?session_id=eq.${encodeURIComponent(sessionId)}&select=*`);
    for (const r of rows || []) entries[r.item_id] = { count: r.count, status: r.status, note: r.note };
  } catch (e) { /* session may be new / RLS edge — start empty */ }

  const activeItems = state.items.filter(i => i.active !== false);
  const areasUsed = state.areas.filter(a => activeItems.some(i => String(i.area_id) === String(a.id)));
  const firstArea = areasUsed[0] && areasUsed[0].id;

  state.count = {
    sessionId, entries, search: "",
    areaId: highlight ? (activeItems.find(i => String(i.id) === String(highlight)) || {}).area_id || firstArea : firstArea,
    highlight,
  };

  drawCount();
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

function drawCount() {
  const c = state.count;
  const editable = has("count");
  const q = c.search.trim().toLowerCase();

  // Items for the current tab, optionally filtered by search (v1 lacked this).
  let items = state.items.filter(i => i.active !== false && String(i.area_id) === String(c.areaId));
  if (q) items = items.filter(i => i.name.toLowerCase().includes(q));

  const tabs = state.areas
    .filter(a => state.items.some(i => i.active !== false && String(i.area_id) === String(a.id)))
    .map(a => {
      const list = state.items.filter(i => i.active !== false && String(i.area_id) === String(a.id));
      const done = list.filter(i => isDone(i.id)).length;
      return `<button class="area-tab ${String(a.id) === String(c.areaId) ? "active" : ""}" data-area="${esc(a.id)}">
        ${esc(a.name)}<span class="pill-mini">${done}/${list.length}</span></button>`;
    }).join("");

  $app().innerHTML = navHtml() + `
  <div class="view" style="padding-top:0">
    <div class="area-tabs no-print">${tabs}</div>

    <div class="ai-bar no-print">
      <div class="ai-row">
        <input class="ai-input" id="ai-text" placeholder="${esc(T("count.aiPh"))}" aria-label="AI count input">
        <button class="btn btn-small" id="ai-mic" aria-label="Dictate">🎤</button>
      </div>
      <div class="ai-row" style="margin-top:8px">
        <button class="btn btn-primary" id="ai-parse" style="flex:1">${esc(T("count.aiParse"))}</button>
      </div>
      <div id="ai-out"></div>
    </div>

    <input class="searchbar no-print" id="item-search" placeholder="${esc(T("count.search"))}" value="${esc(c.search)}" aria-label="${esc(T("count.search"))}">

    <div id="cards">
      ${items.length === 0 ? `<p class="muted">${esc(T("count.noItems"))}${q ? esc(T("count.noItemsSearch")) : ""}.</p>` : items.map(i => itemCardHtml(i, editable)).join("")}
    </div>

    <div style="display:flex;gap:10px;margin:18px 0" class="no-print">
      <button class="btn" data-act="back-home">${esc(T("common.back"))}</button>
      ${has("approve") ? `<button class="btn btn-primary" data-act="to-review" style="flex:1">${esc(T("count.toReview"))}</button>` : ""}
    </div>
  </div>`;

  // --- area tabs ---
  $app().querySelectorAll("[data-area]").forEach(t => t.onclick = () => {
    c.areaId = t.dataset.area; c.highlight = null; drawCount();
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
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  const toRev = $app().querySelector('[data-act="to-review"]');
  if (toRev) toRev.onclick = () => go("#/review/" + c.sessionId);
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
function entryOf(itemId) { return state.count.entries[itemId] || null; }

function statusOf(itemId) {
  const e = entryOf(itemId);
  if (!e) return "not";
  return e.status || "counted";
}
function isDone(itemId) { const s = statusOf(itemId); return s === "done" || s === "counted" || s === "zero" || s === "review"; }

function pillHtml(itemId) {
  const s = statusOf(itemId);
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

function itemCardHtml(item, editable) {
  const e = entryOf(item.id);
  const v = vendorOf(item.vendor_id);
  const sub = [v.name, item.par > 0 ? `par ${fmtCount(item.par)}` : T("count.noPar"), item.unit].filter(Boolean).join(" · ");
  const canManage = has("manage");

  if (!editable) {
    return `<div class="item-card" data-card="${esc(item.id)}">
      <div class="card-head"><div><div class="item-name">${esc(item.name)}</div>
      <div class="item-sub">${esc(sub)}</div></div>${pillHtml(item.id)}</div>
      <div class="readonly-count">${e ? fmtCount(e.count) + (item.unit ? " " + esc(item.unit) : "") : "—"}</div>
    </div>`;
  }

  return `<div class="item-card" data-card="${esc(item.id)}">
    <div class="card-head"><div><div class="item-name">${esc(item.name)}</div>
      <div class="item-sub">${esc(sub)}</div></div>${pillHtml(item.id)}</div>
    <div class="count-row">
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
      <button class="btn" data-cact="clear">${esc(T("count.clear"))}</button>
    </div>
    <div class="row2">
      <button class="btn" data-cact="markzero">${esc(T("count.markZero"))}</button>
      <button class="btn ${statusOf(item.id) === "done" ? "done-on" : ""}" data-cact="done">${esc(T("count.doneBtn"))}</button>
    </div>
    ${canManage ? `<div class="admin-extras">
        <span class="par-edit">${esc(T("par.par"))} <input inputmode="decimal" data-cact="par" value="${Number(item.par) > 0 ? esc(item.par) : ""}" placeholder="—" aria-label="${esc(T("count.parFor"))} ${esc(item.name)}"></span>
        <button class="btn btn-small" data-cact="move">${esc(T("count.moveArea"))}</button>
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
  const act = btn.dataset.cact;
  const cur = entryOf(item.id);
  const curCount = cur ? Number(cur.count) : null;

  if (act === "inc") setCount(item, r025((curCount == null ? 0 : curCount) + 0.5), "counted");
  else if (act === "dec") setCount(item, r025((curCount == null ? 0 : curCount) - 0.5), "counted");
  else if (act === "set0") setCount(item, 0, "counted");
  else if (act === "add025") setCount(item, r025((curCount == null ? 0 : curCount) + 0.25), "counted");
  else if (act === "add05") setCount(item, r025((curCount == null ? 0 : curCount) + 0.5), "counted");
  else if (act === "add075") setCount(item, r025((curCount == null ? 0 : curCount) + 0.75), "counted");
  else if (act === "full") fullCount(item, card);
  else if (act === "clear") clearEntry(item);
  else if (act === "markzero") setCount(item, 0, "zero");
  else if (act === "done") toggleDone(item);
  else if (act === "move") moveItem(item);
}

function onCardChange(ev) {
  const el = ev.target.closest("[data-cact]");
  if (!el) return;
  const card = ev.target.closest("[data-card]");
  const item = itemById(card.dataset.card);
  if (el.dataset.cact === "manual") {
    const v = el.value.trim();
    if (v === "") return;
    const n = Number(v);
    if (isNaN(n) || n < 0) { el.value = entryOf(item.id) ? fmtCount(entryOf(item.id).count) : ""; return; }
    setCount(item, r025(n), "counted");
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
function fullCount(item, card) {
  const par = Number(item.par) || 0;
  if (par > 0) {
    setCount(item, r025(par), "counted");
  } else {
    const hint = card.querySelector("[data-hint]");
    if (hint) hint.textContent = T("count.noParHint");
    const inp = card.querySelector('[data-cact="manual"]');
    if (inp) { inp.focus(); inp.select(); }
  }
}

function setCount(item, n, status) {
  if (n < 0) n = 0;
  state.count.entries[item.id] = { count: r025(n), status: status || "counted", note: (entryOf(item.id) || {}).note || null };
  persistEntry(item);
  drawCount();
}

function clearEntry(item) {
  delete state.count.entries[item.id];
  // Remove from the server too (fire-and-forget; server also gates by role/session state).
  api("DELETE", `/entries?session_id=eq.${encodeURIComponent(state.count.sessionId)}&item_id=eq.${encodeURIComponent(item.id)}`)
    .catch(() => {});
  drawCount();
}

function toggleDone(item) {
  const cur = entryOf(item.id);
  if (statusOf(item.id) === "done") {
    state.count.entries[item.id] = { count: cur.count, status: "counted", note: cur.note };
  } else {
    state.count.entries[item.id] = { count: cur ? cur.count : 0, status: "done", note: cur ? cur.note : null };
  }
  persistEntry(item);
  drawCount();
}

/** Upsert entry to PostgREST: POST with Prefer: resolution=merge-duplicates
 *  and on_conflict=session_id,item_id. Debounced per item. */
function persistEntry(item) {
  const key = item.id;
  clearTimeout(state.saveTimers[key]);
  state.saveTimers[key] = setTimeout(async () => {
    const e = entryOf(item.id);
    if (!e) return;
    try {
      await api("POST", "/entries?on_conflict=session_id,item_id",
        {
          session_id: state.count.sessionId,
          item_id: item.id,
          count: e.count,
          status: e.status,
          note: e.note || null,
          updated_by: state.session.profile.id,
        },
        { "Prefer": "resolution=merge-duplicates" });
    } catch (err) {
      flashError(T("count.saveFail").replace("{name}", item.name));
    }
  }, 400);
}

/** Manager+: move an item to another area, with explicit confirm dialog. */
async function moveItem(item) {
  const oldName = areaName(item.area_id);
  const newId = await pickArea(item.area_id);
  if (!newId || String(newId) === String(item.area_id)) return;
  const newName = areaName(newId);
  const ok = await confirmDialog(T("count.moveTitle"), T("count.moveMsg").replace("{name}", item.name).replace("{from}", oldName).replace("{to}", newName), T("common.move"));
  if (!ok) return;
  try {
    await edge("items.move", { item_id: item.id, area_id: newId });
    item.area_id = newId;
    state.count.areaId = newId;
    drawCount();
  } catch (e) { flashError(e.detail || T("count.moveFail")); }
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
        // Low-confidence parses go to needs_review rather than being silently trusted.
        const status = (d.confidence != null && d.confidence < 0.5) ? "needs_review" : "counted";
        state.count.entries[item.id] = { count: r025(d.qty), status, note: "AI-parsed" };
        persistEntry(item);
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
  if (has("count")) steps.push({ sel: '[data-go="#/count/new"]', title: T("tour.startT"), body: T("tour.startB") });
  steps.push({ sel: '[data-go="#/orders"]', title: T("tour.ordersT"), body: T("tour.ordersB") });
  steps.push({ sel: '[data-act="nav-lang"]', title: T("tour.langT"), body: T("tour.langB") });
  return steps;
}

function countTourSteps() {
  return [
    { sel: ".item-card .count-input", title: T("tour.c1T"), body: T("tour.c1B") },
    { sel: ".area-tabs", title: T("tour.c2T"), body: T("tour.c2B") },
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
    const [it, v, a, sg] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.items = it.items || it || [];
    state.vendors = v.vendors || v || [];
    state.areas = a.areas || a || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { dropSession(); go("#/login"); return; } }

  let rows = [];
  try {
    rows = await api("GET", `/entries?session_id=eq.${encodeURIComponent(sessionId)}&select=*`) || [];
  } catch (e) { /* keep empty */ }

  const byItem = {};
  for (const r of rows) byItem[r.item_id] = r;
  const activeItems = state.items.filter(i => i.active !== false);
  const notCounted = activeItems.filter(i => !byItem[i.id]);
  const needsReview = activeItems.filter(i => byItem[i.id] && byItem[i.id].status === "review");

  state.review = { sessionId, flags: [], aiRan: false, blocking: null, _byItem: byItem };

  const canApprove = has("approve");
  drawReview(notCounted, needsReview, canApprove);
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

function drawReview(notCounted, needsReview, canApprove) {
  const c = state.review;

  const rowHtml = (i, label) => `
    <div class="review-row">
      <div><strong>${esc(i.name)}</strong><div class="muted" style="font-size:13px">${esc(areaName(i.area_id))} · ${esc(label)}</div></div>
      <button class="btn btn-small" data-jump="${esc(i.id)}">${esc(T("review.open"))}</button>
    </div>`;

  // Vendor order preview: auto-mode items with par>0, grouped by vendor.
  // Rendered as the clean vendor-facing order card (no internal counts/pars).
  // IMPORTANT: only items WITH an entry generate order lines — this matches
  // the server (sessions.approve ignores uncounted items). Uncounted items
  // must never appear as phantom orders.
  const byItem = c._byItem || {};
  const entryCount = Object.keys(byItem).length;
  const previewGroups = {};
  let orderLineCount = 0;
  for (const i of state.items.filter(x => x.active !== false && x.mode === "auto" && Number(x.par) > 0)) {
    const e = byItem[i.id];
    if (!e) continue; // not counted -> no order line, listed under "Not counted" instead
    const have = Number(e.count);
    // Whole units only: vendors don't sell fractional cases/eaches.
    const order = Math.max(0, Math.ceil(Number(i.par) - have - 1e-9));
    if (order <= 0) continue;
    orderLineCount++;
    const vid = i.vendor_id || "__none__";
    (previewGroups[vid] = previewGroups[vid] || []).push({ item: i, order, line: order * (Number(i.price) || 0) });
  }
  c._orderLineCount = orderLineCount;
  c._entryCount = entryCount;

  const emptyPreviewMsg = entryCount === 0 ? T("review.nothingCounted") : T("review.nothingToOrder");
  const previewHtml = Object.keys(previewGroups).length === 0
    ? `<p class="muted">${esc(emptyPreviewMsg)}</p>`
    : Object.entries(previewGroups).map(([vid, lines]) => {
        const v = vendorOf(vid);
        const d = orderCardData(v, lines.map(l => ({
          name: l.item.name, qty: l.order, unit: l.item.unit, line: l.line,
        })), fmtLongDateEn());
        return orderCardHtml(d, { actions: false });
      }).join("");

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("review.title"))}</h1>
    <div id="approve-err"></div>

    <h2>${esc(T("review.notCounted"))} (${notCounted.length})</h2>
    ${notCounted.length === 0 ? `<p class="muted">${esc(T("review.allCounted"))}</p>` : notCounted.map(i => rowHtml(i, T("review.noEntry"))).join("")}

    <h2>${esc(T("review.needsReview"))} (${needsReview.length})</h2>
    ${needsReview.length === 0 ? `<p class="muted">${esc(T("review.noneFlagged"))}</p>` : needsReview.map(i => rowHtml(i, T("review.flagged"))).join("")}

    <h2>${esc(T("review.aiCheck"))}</h2>
    <div class="no-print"><button class="btn" id="ai-check">${esc(T("review.runAi"))}</button></div>
    <div id="ai-flags" style="margin-top:10px">${c.aiRan && c.flags.length === 0 ? `<p class="muted">${esc(T("review.noIssues"))}</p>` : ""}</div>

    <h2>${esc(T("review.preview"))}</h2>
    ${previewHtml}

    <div style="display:flex;gap:10px;margin:18px 0" class="no-print">
      <button class="btn" data-act="back-home">${esc(T("common.back"))}</button>
      ${canApprove ? `<button class="btn btn-primary" id="approve-btn" style="flex:1">${esc(T("review.approve"))}</button>` : `<p class="muted">${esc(T("review.onlyManagers"))}</p>`}
    </div>
  </div>`;

  $app().querySelectorAll("[data-jump]").forEach(b => b.onclick = () => {
    const item = itemById(b.dataset.jump);
    location.hash = `#/count/${c.sessionId}?item=${encodeURIComponent(b.dataset.jump)}`;
  });
  document.getElementById("ai-check").onclick = () => aiReview();
  const ap = document.getElementById("approve-btn");
  if (ap) ap.onclick = () => approveSession();
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;

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
  box.innerHTML = `<div class="error"><strong>${esc(T("review.blockTitle"))}</strong>
    <ul>${c.blocking.map(b => `<li>${esc(b.item_name || b.name || b)}</li>`).join("")}</ul>
    ${esc(T("review.blockMsg"))}</div>`;
  box.scrollIntoView();
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
  box.innerHTML = "";
  const entryCount = c._entryCount || 0;
  const lineCount = c._orderLineCount || 0;
  let ok;
  if (entryCount === 0) {
    // Nothing was counted — approving would silently generate zero orders.
    ok = await confirmDialog(T("review.approveEmptyTitle"), T("review.approveEmptyMsg"), T("review.approveEmptyYes"), T("review.keepCounting"));
  } else if (lineCount === 0) {
    // Counts exist but everything is at/above par — no orders will result.
    ok = await confirmDialog(T("review.approveNoLinesTitle"), T("review.approveNoLinesMsg"), T("review.approveEmptyYes"), T("common.cancel"));
  } else {
    ok = await confirmDialog(T("review.approveTitle"), T("review.approveMsg"), T("review.approveYes"));
  }
  if (!ok) return;
  try {
    await edge("sessions.approve", { session_id: c.sessionId });
    go("#/orders");
  } catch (e) {
    if (e.status === 409 || e.code === "needs_review") {
      c.blocking = (e.data && (e.data.blocking || e.data.items)) || e.detail || [];
      if (!Array.isArray(c.blocking)) c.blocking = [c.blocking];
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
  const cleanLines = lines.map(l => ({
    name: l.name,
    qty: fmtCount(l.qty) + (l.unit ? " " + l.unit : ""),
  }));
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
      <div class="order-card-foot">${d.count} item${d.count === 1 ? "" : "s"}${d.total ? ` · Estimated total: ${esc(d.total)}` : ""}</div>
    </div>
    ${opts.actions === false ? "" : `<div class="order-card-actions no-print">
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
  H += 34;                           // gap before footer
  H += 62;                           // footer
  if (d.total) H += 56;              // total line
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
  y += 34;
  x.fillStyle = SEAM;
  x.fillRect(PAD, y, W - PAD * 2, 2);
  y += 62;
  x.fillStyle = INK;
  x.font = F(700, 44);
  x.fillText(`${d.count} item${d.count === 1 ? "" : "s"}`, PAD, y - 8);
  if (d.total) {
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
    const [o, v, sg] = await Promise.all([
      edge("orders.list").catch(() => ({ orders: [] })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.orders = o.orders || o || [];
    state.vendors = v.vendors || v || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { dropSession(); go("#/login"); return; } }

  const canManage = has("approve"); // manager+: mark sent/received
  const statusLabel = (s) => s === "sent" ? T("orders.sent") : s === "received" ? T("orders.received") : T("orders.draft");
  const pill = (s) => {
    const cls = s === "sent" ? "pill-sent" : s === "received" ? "pill-received" : "pill-draft";
    return `<span class="pill ${cls}">${esc(statusLabel(s))}</span>`;
  };

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${esc(T("orders.title"))}</h1>
    <div class="no-print" style="margin-bottom:10px"><button class="btn btn-small" onclick="window.print()">${esc(T("orders.print"))}</button></div>
    ${state.orders.length === 0 ? `<p class="muted">${esc(T("orders.none"))}</p>` : ""}
    ${state.orders.map(ord => {
      const v = vendorOf(ord.vendor_id) || {};
      const vendor = {
        name: v.name || ord.vendor_name || "Vendor",
        order_days: v.order_days || ord.vendor_order_days,
        order_cutoff: v.order_cutoff || ord.vendor_order_cutoff,
        delivery_days: v.delivery_days || ord.vendor_delivery_days,
      };
      const lines = (ord.lines || []).map(l => ({
        name: l.item_name, qty: l.order_qty, unit: l.unit, line: Number(l.line_cost) || 0,
      }));
      const d = orderCardData(vendor, lines, fmtLongDateEn(ord.created_at));
      return `<div class="order-wrap">
        <div class="order-status-row no-print">
          ${pill(ord.status)}
          <span style="display:flex;gap:8px">
            ${canManage && ord.status !== "sent" && ord.status !== "received"
              ? `<button class="btn btn-small" data-sent="${esc(ord.id)}">${esc(T("orders.markSent"))}</button>` : ""}
            ${canManage && ord.status === "sent"
              ? `<button class="btn btn-small" data-received="${esc(ord.id)}">${esc(T("orders.markReceived"))}</button>` : ""}
          </span>
        </div>
        ${orderCardHtml(d)}
      </div>`;
    }).join("")}
    <div style="margin-top:16px" class="no-print"><button class="btn" data-act="back-home">${esc(T("common.back"))}</button></div>
  </div>`;

  // Card actions (share image / copy text) are wired via delegation in boot().
  $app().querySelectorAll("[data-sent]").forEach(b => b.onclick = () => setOrderStatus(b.dataset.sent, "sent"));
  $app().querySelectorAll("[data-received]").forEach(b => b.onclick = () => setOrderStatus(b.dataset.received, "received"));
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
}

async function setOrderStatus(orderId, status) {
  try {
    await edge("orders.update-status", { order_id: orderId, status });
    renderOrders();
  } catch (e) { flashError(e.detail || T("orders.statusFail")); }
}

/* ====================== VIEW: ADMIN ============================ */
/* Manager+: Items, Areas, Vendors, Users tabs (full catalog + user mgmt,
 * except the superadmin account itself, which is untouchable by managers).
 * Superadmin only: Import/Export tab. Everyone else: "not authorized." */
async function renderAdmin(tab) {
  const canManage = has("manage");
  const isSuper = has("superadmin");
  if (!canManage && !isSuper) {
    $app().innerHTML = navHtml() + `<div class="view"><div class="error">${esc(T("common.notAuth"))}</div>
      <button class="btn" onclick="location.hash='#/home'">${esc(T("common.back"))}</button></div>`;
    $app().querySelector('[data-act="nav-logout"]').onclick = logout;
    return;
  }
  $app().innerHTML = navHtml() + `<div class="view"><div class="loading">Loading admin…</div></div>`;
  try {
    const [it, a, v, u, sg] = await Promise.all([
      edge("items.list").catch(() => ({ items: state.items })),
      edge("areas.list").catch(() => ({ areas: state.areas })),
      edge("vendors.list").catch(() => ({ vendors: state.vendors })),
      edge("users.list").catch(() => ({ users: [] })),
      edge("settings.get").catch(() => ({ settings: state.settings })),
    ]);
    state.items = it.items || it || [];
    state.areas = a.areas || a || [];
    state.vendors = v.vendors || v || [];
    state.users = u.users || u || [];
    if (sg.settings) state.settings = Object.assign({ store_name: "Sumo Sushi", show_prices: false }, sg.settings);
  } catch (e) { if (e.status === 401 || e.code === "unauthorized") { dropSession(); go("#/login"); return; } }

  const allTabs = [["items", T("admin.items")], ["areas", T("admin.areas")], ["vendors", T("admin.vendors")], ["users", T("admin.users")], ["io", "Import/Export"]];
  // Managers get Items/Areas/Vendors/Users; Import/Export is superadmin-only.
  const tabs = allTabs.filter(([id]) => id === "io" ? isSuper : canManage);
  if (!tabs.some(([id]) => id === tab)) tab = tabs[0][0];
  let body = "";
  if (tab === "items") body = adminItemsHtml();
  else if (tab === "areas") body = adminAreasHtml();
  else if (tab === "vendors") body = adminVendorsHtml();
  else if (tab === "users") body = adminUsersHtml();
  else body = adminIOHtml();

  $app().innerHTML = navHtml() + `
  <div class="view">
    <h1>${tab === "io" ? "Super Admin" : esc(T("admin.manage"))}</h1>
    <div class="admin-tabs no-print">
      ${tabs.map(([id, label]) => `<button class="admin-tab ${tab === id ? "active" : ""}" data-atab="${id}">${label}</button>`).join("")}
    </div>
    <div id="admin-body">${body}</div>
    <div style="margin-top:16px" class="no-print"><button class="btn" data-act="back-home">${esc(T("common.back"))}</button></div>
  </div>`;

  $app().querySelectorAll("[data-atab]").forEach(b => b.onclick = () => go("#/admin/" + b.dataset.atab));
  $app().querySelector('[data-act="back-home"]').onclick = () => go("#/home");
  $app().querySelector('[data-act="nav-logout"]').onclick = logout;
  wireAdmin(tab);
}

/* ---------------- Items tab ---------------- */
function adminItemsHtml() {
  const areaOpts = (sel) => state.areas.map(a =>
    `<option value="${esc(a.id)}" ${String(a.id) === String(sel) ? "selected" : ""}>${esc(a.name)}</option>`).join("");
  const vendorOpts = (sel) => `<option value="">—</option>` + state.vendors.map(v =>
    `<option value="${esc(v.id)}" ${String(v.id) === String(sel) ? "selected" : ""}>${esc(v.name)}</option>`).join("");

  return `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("admin.csvTitle"))}</h3>
      <p class="muted">${esc(T("admin.csvHelp"))}</p>
      <button class="btn" id="csv-download" style="width:100%">${esc(T("admin.csvDownload"))}</button>
      <div class="field" style="margin-top:10px"><label>${esc(T("admin.csvFile"))}</label>
        <input type="file" id="csv-file" accept=".csv,text/csv"></div>
      <div id="csv-err"></div>
      <button class="btn btn-primary" id="csv-upload" style="width:100%">${esc(T("admin.csvUpload"))}</button>
      <div id="csv-result" style="margin-top:10px"></div>
    </div>
    <div class="admin-card">
      <h3 style="margin-top:0">${esc(T("admin.addItem"))}</h3>
      <div class="field"><label>${esc(T("common.name"))}</label><input id="ni-name" placeholder="${esc(T("admin.exItem"))}"></div>
      <div class="form-row">
        <div class="field"><label>${esc(T("admin.area"))}</label><select id="ni-area">${areaOpts()}</select></div>
        <div class="field"><label>${esc(T("admin.vendor"))}</label><select id="ni-vendor">${vendorOpts()}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label>Par</label><input id="ni-par" type="number" inputmode="decimal" min="0" step="0.25" placeholder="0"></div>
        <div class="field"><label>${esc(T("admin.unit"))}</label><input id="ni-unit" placeholder="cs / lb / ea"></div>
        <div class="field"><label>${esc(T("admin.price"))}</label><input id="ni-price" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></div>
      </div>
      <div id="ni-err"></div>
      <button class="btn btn-primary" id="ni-add" style="width:100%">${esc(T("admin.addItem"))}</button>
    </div>
    ${state.items.map(i => `
    <div class="admin-card" data-item="${esc(i.id)}">
      <div class="card-head">
        <div><strong>${esc(i.name)}</strong>
          <div class="muted" style="font-size:13px">${esc(areaName(i.area_id))} · ${esc(vendorOf(i.vendor_id).name || T("admin.noVendor"))}${i.active === false ? " · " + esc(T("admin.archived")) : ""}</div>
        </div>
        <button class="btn btn-small" data-ai-toggle>${esc(i.active === false ? T("admin.unarchive") : T("admin.archive"))}</button>
      </div>
      <div class="form-row" style="margin-top:8px">
        <div class="field"><label>${esc(T("common.name"))}</label><input data-f="name" value="${esc(i.name)}"></div>
        <div class="field"><label>${esc(T("admin.unit"))}</label><input data-f="unit" value="${esc(i.unit || "")}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>Par</label><input data-f="par" type="number" inputmode="decimal" min="0" step="0.25" value="${Number(i.par) > 0 ? esc(i.par) : ""}" placeholder="—"></div>
        <div class="field"><label>${esc(T("admin.price"))}</label><input data-f="price" type="number" inputmode="decimal" min="0" step="0.01" value="${Number(i.price) > 0 ? esc(i.price) : ""}" placeholder="—"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("admin.mode"))}</label><select data-f="mode">
          <option value="auto" ${i.mode === "auto" ? "selected" : ""}>${esc(T("admin.modeAuto"))}</option>
          <option value="manual" ${i.mode !== "auto" ? "selected" : ""}>${esc(T("admin.modeManual"))}</option></select></div>
        <div class="field"><label>${esc(T("admin.countStyle"))}</label><input data-f="count_style" value="${esc(i.count_style || "")}" placeholder="${esc(T("admin.exCase"))}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label>${esc(T("admin.pieces"))}</label><input data-f="pieces_per_case" type="number" inputmode="numeric" min="0" value="${esc(i.pieces_per_case || "")}" placeholder="—"></div>
        <div class="field"><label>${esc(T("admin.area"))}</label><select data-f="area_id">${areaOpts(i.area_id)}</select></div>
      </div>
      <div class="field"><label>${esc(T("admin.vendor"))}</label><select data-f="vendor_id">${vendorOpts(i.vendor_id)}</select></div>
      <div class="field"><label>${esc(T("common.notes"))}</label><input data-f="notes" value="${esc(i.notes || "")}"></div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary btn-small" data-ai-save style="flex:1">${esc(T("common.save"))}</button>
        <button class="btn btn-small" data-ai-move>${esc(T("common.move"))}</button>
      </div>
    </div>`).join("")}`;
}

/* ---------------- Areas tab ---------------- */
function adminAreasHtml() {
  return `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("admin.addArea"))}</h3>
      <div class="field"><label>${esc(T("common.name"))}</label><input id="na-name" placeholder="e.g. Walk-in"></div>
      <div id="na-err"></div>
      <button class="btn btn-primary" id="na-add" style="width:100%">${esc(T("admin.addArea"))}</button>
    </div>
    ${state.areas.map(a => `
    <div class="admin-card" data-area-row="${esc(a.id)}">
      <div class="field"><label>${esc(T("admin.areaName"))}</label><input data-aname value="${esc(a.name)}"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-small btn-primary" data-arename style="flex:1">${esc(T("admin.rename"))}</button>
        <button class="btn btn-small btn-danger" data-adelete>${esc(T("common.delete"))}</button>
      </div>
    </div>`).join("")}`;
}

/* ---------------- Vendors tab ---------------- */
function adminVendorsHtml() {
  return `<div class="admin-card">
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
      <div class="form-row">
        <div class="field"><label>${esc(T("common.name"))}</label><input data-f="name" value="${esc(v.name)}"></div>
        <div class="field"><label>${esc(T("admin.email"))}</label><input data-f="email" type="email" value="${esc(v.email || "")}"></div>
      </div>
      <div class="field"><label>${esc(T("common.notes"))}</label><input data-f="notes" value="${esc(v.notes || "")}"></div>
      <div class="form-row">
        <div class="field"><label>${esc(T("vendor.orderDays"))}</label><input data-f="order_days" value="${esc(v.order_days || "")}" placeholder="e.g. Tue, Thu"></div>
        <div class="field"><label>${esc(T("vendor.orderBy"))}</label><input data-f="order_cutoff" value="${esc(v.order_cutoff || "")}" placeholder="e.g. 3pm"></div>
      </div>
      <div class="field"><label>${esc(T("vendor.deliveryDays"))}</label><input data-f="delivery_days" value="${esc(v.delivery_days || "")}" placeholder="e.g. Wed, Fri"></div>
      <button class="btn btn-primary btn-small" data-vsave style="width:100%">${esc(T("common.save"))}</button>
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
  return `<div class="admin-card">
      <h3 style="margin-top:0">${esc(T("admin.addUser"))}</h3>
      <div class="form-row">
        <div class="field"><label>${esc(T("common.name"))}</label><input id="nu-name" placeholder="e.g. Kenji"></div>
        <div class="field"><label>${esc(T("admin.role"))}</label><select id="nu-role">${roleOpts("staff")}</select></div>
      </div>
      <div class="field"><label>${esc(T("admin.initPin"))}</label><input id="nu-pin" inputmode="numeric" placeholder="••••"></div>
      <div id="nu-err"></div>
      <button class="btn btn-primary" id="nu-add" style="width:100%">${esc(T("admin.addUser"))}</button>
    </div>
    ${state.users.map(u => {
    const isSA = u.role === "superadmin";
    const isMe = String(u.id) === String(me);
    return `
    <div class="admin-card" data-user="${esc(u.id)}">
      <div class="card-head">
        <div><strong>${esc(u.name)}</strong>${isMe ? ` <span class="pill pill-counted">${esc(T("admin.you"))}</span>` : ""}
          ${isSA ? ' <span class="pill pill-counted">Super Admin</span>' : ""}
          <div class="muted" style="font-size:13px">${esc(u.active === false ? T("admin.disabled") : T("admin.active"))}</div></div>
        ${isSA
          ? (viewerIsSuper
              ? `<span class="muted" style="font-size:13px">${esc(T("admin.protected"))}</span>`
              : `<span class="muted" style="font-size:13px">${esc(T("admin.saLocked"))}</span>`)
          : `<div style="display:flex;gap:8px">
              <button class="btn btn-small" data-u-toggle data-enable="${u.active === false ? "1" : ""}">${esc(u.active === false ? T("admin.enable") : T("admin.disable"))}</button>
              ${isMe ? "" : `<button class="btn btn-small btn-danger" data-u-delete>${esc(T("users.delete"))}</button>`}
            </div>`}
      </div>
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
    </div>`;
    }).join("")}`;
}

/* ---------------- Import / Export tab ---------------- */
function adminIOHtml() {
  const killed = !!(state.settings && state.settings.app_disabled);
  return `<div class="admin-card" style="border:2px solid #c62828">
      <h3 style="margin-top:0">${esc(T("admin.killTitle"))}</h3>
      <p class="muted">${esc(T("admin.killHelp"))}</p>
      <div style="margin:10px 0;font-size:16px">${killed ? "🔴" : "🟢"} <strong>${esc(killed ? T("admin.killDead") : T("admin.killLive"))}</strong></div>
      ${killed ? "" : `<div class="field"><label>${esc(T("admin.killType"))}</label>
        <input id="kill-confirm" placeholder="${esc(T("admin.killConfirmPh"))}" autocomplete="off"></div>`}
      <div id="kill-err"></div>
      <button class="btn ${killed ? "" : "btn-danger"}" id="kill-toggle" style="width:100%">
        ${esc(killed ? T("admin.killOn") : T("admin.killOff"))}</button>
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
    </div>`;
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
    lines.push([
      i.id, i.name, i.area_name || "", i.vendor_name || "",
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

function wireAdmin(tab) {
  const body = document.getElementById("admin-body");
  const rerender = () => renderAdmin(tab);

  if (tab === "items") {
    document.getElementById("csv-download").onclick = () => {
      const blob = new Blob([itemsToCsv(state.items)], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sumo-items-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    };
    document.getElementById("csv-upload").onclick = async () => {
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
      } catch (e) {
        err.innerHTML = `<div class="error">${esc(e.detail || T("admin.csvBadFile"))}</div>`;
      }
    };
    document.getElementById("ni-add").onclick = async () => {
      const name = document.getElementById("ni-name").value.trim();
      const err = document.getElementById("ni-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.itemNeedName"))}</div>`; return; }
      err.innerHTML = "";
      try {
        await edge("items.create", {
          name,
          area_id: document.getElementById("ni-area").value,
          vendor_id: document.getElementById("ni-vendor").value || null,
          par: Number(document.getElementById("ni-par").value) || 0,
          unit: document.getElementById("ni-unit").value.trim(),
          price: Number(document.getElementById("ni-price").value) || 0,
        });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addItemFail"))}</div>`; }
    };
    body.querySelectorAll("[data-item]").forEach(card => {
      const id = card.dataset.item;
      card.querySelector("[data-ai-save]").onclick = async () => {
        const data = {};
        card.querySelectorAll("[data-f]").forEach(inp => data[inp.dataset.f] = inp.value);
        data.par = data.par === "" ? 0 : Number(data.par);
        data.price = data.price === "" ? 0 : Number(data.price);
        data.pieces_per_case = data.pieces_per_case === "" ? null : Number(data.pieces_per_case);
        if (!data.vendor_id) data.vendor_id = null;
        try { await edge("items.update", { item_id: id, ...data }); flashSaved(card); }
        catch (e) { flashError(e.detail || T("admin.saveItemFail")); }
      };
      card.querySelector("[data-ai-toggle]").onclick = async () => {
        const item = itemById(id);
        try { await edge("items.update", { item_id: id, active: item.active === false }); rerender(); }
        catch (e) { flashError(e.detail || T("admin.archiveFail")); }
      };
      card.querySelector("[data-ai-move]").onclick = async () => {
        const item = itemById(id);
        const oldName = areaName(item.area_id);
        const newId = await pickArea(item.area_id);
        if (!newId || String(newId) === String(item.area_id)) return;
        const ok = await confirmDialog(T("admin.moveItemTitle"),
          T("admin.moveItemMsg").replace("{item}", item.name).replace("{from}", oldName).replace("{to}", areaName(newId)),
          T("common.move"));
        if (!ok) return;
        try { await edge("items.move", { item_id: id, area_id: newId }); rerender(); }
        catch (e) { flashError(e.detail || T("admin.moveFail")); }
      };
    });
  }

  if (tab === "areas") {
    document.getElementById("na-add").onclick = async () => {
      const name = document.getElementById("na-name").value.trim();
      const err = document.getElementById("na-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.areaNeedName"))}</div>`; return; }
      try { await edge("areas.create", { name }); rerender(); }
      catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addAreaFail"))}</div>`; }
    };
    body.querySelectorAll("[data-area-row]").forEach(card => {
      const id = card.dataset.areaRow;
      card.querySelector("[data-arename]").onclick = async () => {
        const name = card.querySelector("[data-aname]").value.trim();
        if (!name) { flashError(T("admin.areaNeedName")); return; }
        try { await edge("areas.rename", { area_id: id, name }); rerender(); }
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
    document.getElementById("nv-add").onclick = async () => {
      const name = document.getElementById("nv-name").value.trim();
      const err = document.getElementById("nv-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.vendorNeedName"))}</div>`; return; }
      try {
        await edge("vendors.create", { name, email: document.getElementById("nv-email").value.trim() });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addVendorFail"))}</div>`; }
    };
    body.querySelectorAll("[data-vendor]").forEach(card => {
      const id = card.dataset.vendor;
      card.querySelector("[data-vsave]").onclick = async () => {
        const data = {};
        card.querySelectorAll("[data-f]").forEach(inp => data[inp.dataset.f] = inp.value);
        try { await edge("vendors.update", { vendor_id: id, ...data }); flashSaved(card); }
        catch (e) { flashError(e.detail || T("admin.vendorSaveFail")); }
      };
    });
  }

  if (tab === "users") {
    document.getElementById("nu-add").onclick = async () => {
      const name = document.getElementById("nu-name").value.trim();
      const pin = document.getElementById("nu-pin").value.trim();
      const err = document.getElementById("nu-err");
      if (!name) { err.innerHTML = `<div class="error">${esc(T("admin.userNeedName"))}</div>`; return; }
      if (pin.length < 4) { err.innerHTML = `<div class="error">${esc(T("admin.pinNeed4"))}</div>`; return; }
      try {
        await edge("users.create", { name, role: document.getElementById("nu-role").value, pin });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.addUserFail"))}</div>`; }
    };
    body.querySelectorAll("[data-user]").forEach(card => {
      const id = card.dataset.user;
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
        if (!await confirmDialog(T("users.deleteTitle"), T("users.deleteMsg").replace("{name}", nm.trim()), T("users.delete"))) return;
        try { await edge("users.delete", { user_id: id }); rerender(); }
        catch (e) { flashError(e.detail || T("users.deleteFail")); }
      };
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
        if (p1.length < 4) { flashError(T("admin.pinNeed4")); return; }
        if (p1 !== p2) { flashError(T("admin.pinMismatch")); return; }
        try { await edge("users.set-pin", { user_id: id, pin: p1 }); flashSaved(card); }
        catch (e) { flashError(e.detail || T("admin.setPinFail")); }
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
        if (!await confirmDialog(T("admin.killTitle"), T("admin.killOn") + "?", T("admin.killOn"))) return;
      }
      try {
        const r = await edge("admin.kill", { disabled: !killed });
        state.settings = Object.assign({}, state.settings, { app_disabled: !!r.app_disabled });
        rerender();
      } catch (e) { err.innerHTML = `<div class="error">${esc(e.detail || T("admin.killFail"))}</div>`; }
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
        msg.innerHTML = `<span style="color:var(--ok)">Saved.</span>`;
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
  const b = card.querySelector("[data-ai-save],[data-vsave],[data-u-role]");
  if (b) { const t = b.textContent; b.textContent = "✓ Saved"; setTimeout(() => b.textContent = t, 1500); }
}

/* ============================ INIT ============================= */
let booted = false;
function init() { if (booted) return; booted = true; boot(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init(); // script sits at end of body; DOM is already parsed
