(function () {
        const tbody        = document.getElementById("rows");
        const addBtn       = document.getElementById("add-row");
        const statTotal    = document.getElementById("stat-total");
        const statPrayed   = document.getElementById("stat-prayed");
        const statPending  = document.getElementById("stat-pending");

        // Popover refs
        const overlay      = document.getElementById("notes-overlay");
        const textarea     = document.getElementById("notes-textarea");
        const btnSave      = document.getElementById("notes-save");
        const btnCancel    = document.getElementById("notes-cancel");

        // Drawer refs
        const drawerOverlay = document.getElementById("drawer-overlay");
        const drawer        = document.getElementById("drawer");
        const drawerClose   = document.getElementById("drawer-close");
        const drawerEditBtn = document.getElementById("drawer-edit-notes");
        const notesBadge    = document.getElementById("notes-badge");

        let activeNotesCell = null;
        let activeDrawerRow = null;

        // ---------- CSRF ----------
        function getCookie(name) {
            const m = document.cookie.match("(^|;)\\s*" + name + "=([^;]+)");
            return m ? decodeURIComponent(m.pop()) : "";
        }
        const csrfToken = getCookie("csrftoken");

        // ---------- Network ----------
        async function api(method, url, payload) {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: payload === undefined ? null : JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`${method} ${url} failed: ${res.status} ${text}`);
            }
            if (res.status === 204) return null;
            return res.json();
        }

        // ---------- Stats ----------
        function refreshStats() {
            const dataRows = tbody.querySelectorAll("tr[data-id]");
            let prayed = 0;
            dataRows.forEach(tr => {
                const td = tr.querySelector('.prayed-cell');
                if (td && td.classList.contains("is-prayed")) prayed++;
            });
            statTotal.textContent = dataRows.length;
            statPrayed.textContent = prayed;
            statPending.textContent = Math.max(0, dataRows.length - prayed);
        }

        // ---------- Empty-state helpers ----------
        function applyNotesEmptyState(td) {
            const text = td.textContent.trim();
            td.classList.toggle("is-empty", text === "");
            if (text === "") td.textContent = "Add prayer notes…";
        }
        function clearNotesEmptyState(td) {
            if (td.classList.contains("is-empty")) {
                td.textContent = "";
                td.classList.remove("is-empty");
            }
        }

        // Initial pass on server-rendered rows
        tbody.querySelectorAll(".notes-cell").forEach(applyNotesEmptyState);

        // ---------- Row creation (in-memory, before server confirms) ----------
        function makeBlankRow() {
            const tr = document.createElement("tr");
            tr.dataset.id = "";   // assigned after server response
            tr.innerHTML = `
                <td class="text-cell px-4 py-3 border-r-2 border-black align-top"
                    contenteditable="true" data-field="name" data-placeholder="Full name"></td>
                <td class="text-cell is-num px-4 py-3 border-r-2 border-black align-top"
                    contenteditable="true" data-field="age"></td>
                <td class="text-cell px-4 py-3 border-r-2 border-black align-top"
                    contenteditable="true" data-field="phone_number" data-placeholder="+1 555 000 0000"></td>
                <td class="text-cell px-4 py-3 border-r-2 border-black align-top"
                    contenteditable="true" data-field="address" data-placeholder="Street, City"></td>
                <td class="notes-cell is-empty px-4 py-3 border-r-2 border-black align-top"
                    data-field="prayer_notes" tabindex="0">Add prayer notes…</td>
                <td class="prayed-cell px-4 py-3 border-r-2 border-black align-top"
                    data-field="prayed_for" tabindex="0" title="Click to toggle prayed for"></td>
                <td class="px-4 py-3 align-top">
                    <div class="flex gap-1 justify-center">
                        <button class="row-action" data-action="view" title="View details" aria-label="View details">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button class="row-action is-danger" data-action="del" title="Delete row" aria-label="Delete row">&times;</button>
                    </div>
                </td>
            `;
            return tr;
        }

        // Replace a row's contents from a server payload
        function hydrateRow(tr, data) {
            tr.dataset.id = data.id;
            const fieldMap = {
                name: data.name,
                age: data.age,
                phone_number: data.phone_number,
                address: data.address,
            };
            for (const [field, value] of Object.entries(fieldMap)) {
                const td = tr.querySelector(`[data-field="${field}"]`);
                if (td) td.textContent = value === 0 ? "" : (value == null ? "" : String(value));
            }
            const notesTd = tr.querySelector('[data-field="prayer_notes"]');
            notesTd.textContent = data.prayer_notes || "";
            applyNotesEmptyState(notesTd);
            const prayedTd = tr.querySelector('[data-field="prayed_for"]');
            prayedTd.classList.toggle("is-prayed", !!data.prayed_for);
            prayedTd.textContent = data.prayed_for ? "✓" : "";
        }

        // ---------- Notes popover ----------
        function openNotesPopover(td) {
            overlay.classList.remove("is-open");
            activeNotesCell = td;
            clearNotesEmptyState(td);
            textarea.value = td.textContent.trim();
            overlay.classList.add("is-open");
            setTimeout(() => textarea.focus(), 30);
        }
        function closeNotesPopover({ keepValue = false } = {}) {
            overlay.classList.remove("is-open");
            if (!keepValue && activeNotesCell) applyNotesEmptyState(activeNotesCell);
            activeNotesCell = null;
        }
        async function saveNotesPopover() {
            if (!activeNotesCell) return;
            const td = activeNotesCell;
            const tr = td.closest("tr");
            const id = tr.dataset.id;
            const value = textarea.value;

            // If the row hasn't been saved yet, defer until name is filled.
            if (!id) {
                td.textContent = value;
                applyNotesEmptyState(td);
                closeNotesPopover({ keepValue: true });
                return;
            }

            try {
                const updated = await api("PATCH", `/api/guests/${id}/`, { prayer_notes: value });
                hydrateRow(tr, updated);
                if (activeDrawerRow === tr) hydrateDrawer(tr);
                refreshStats();
            } catch (err) {
                console.error(err);
                alert("Could not save notes. Please try again.");
            }
            closeNotesPopover({ keepValue: true });
        }

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeNotesPopover();
        });
        btnCancel.addEventListener("click", closeNotesPopover);
        btnSave.addEventListener("click", saveNotesPopover);
        document.addEventListener("keydown", (e) => {
            if (!overlay.classList.contains("is-open")) return;
            if (e.key === "Escape") closeNotesPopover();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNotesPopover();
        });

        // ---------- Text-cell editing (inline, autosave on blur) ----------
        async function commitCell(td) {
            const tr = td.closest("tr");
            const field = td.dataset.field;
            const value = td.textContent.trim();
            const id = tr.dataset.id;

            // First save of a brand-new row: name is required to create the row.
            if (!id) {
                if (field === "name" && value) {
                    try {
                        const payload = { name: value, phone_number: "", address: "", prayer_notes: "", prayed_for: false };
                        const ageCell = tr.querySelector('[data-field="age"]');
                        const ageText = ageCell?.textContent.trim();
                        if (ageText !== "") payload.age = Number(ageText);

                        const created = await api("POST", "/api/guests/", payload);
                        hydrateRow(tr, created);
                        refreshStats();
                        removeEmptyStateRow();
                    } catch (err) {
                        console.error(err);
                        alert("Could not save the new guest. Name is required.");
                    }
                }
                return;
            }

            try {
                const payload = { [field]: value };
                if (field === "age") payload.age = value === "" ? null : Number(value);
                const updated = await api("PATCH", `/api/guests/${id}/`, payload);
                hydrateRow(tr, updated);
                if (activeDrawerRow === tr) hydrateDrawer(tr);
            } catch (err) {
                console.error(err);
                alert(`Could not save ${field}.`);
            }
        }

        function removeEmptyStateRow() {
            const es = document.getElementById("empty-state");
            if (es) es.remove();
        }

        // Strip pasted HTML
        tbody.addEventListener("paste", (e) => {
            if (!e.target.classList.contains("text-cell")) return;
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text");
            document.execCommand("insertText", false, text);
        });

        // Keyboard: Enter commits the edit on text cells.
        tbody.addEventListener("keydown", (e) => {
            if (e.target.classList.contains("notes-cell")) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openNotesPopover(e.target);
                }
            } else if (e.target.classList.contains("text-cell")) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur();
                }
            }
        });

        // Commit on blur (autosave)
        tbody.addEventListener("blur", (e) => {
            if (e.target.classList.contains("text-cell")) commitCell(e.target);
        }, true);

        // ---------- Prayed-for toggle ----------
        tbody.addEventListener("click", async (e) => {
            const prayedTd = e.target.closest(".prayed-cell");
            if (!prayedTd) return;
            const tr = prayedTd.closest("tr");
            const id = tr.dataset.id;
            if (!id) return;     // ignore toggles on unsaved rows
            const now = !prayedTd.classList.contains("is-prayed");
            try {
                const updated = await api("PATCH", `/api/guests/${id}/`, { prayed_for: now });
                hydrateRow(tr, updated);
                if (activeDrawerRow === tr) hydrateDrawer(tr);
                refreshStats();
            } catch (err) {
                console.error(err);
            }
        });

        // ---------- Row actions: view + delete ----------
        tbody.addEventListener("click", async (e) => {
            const btn = e.target.closest("[data-action]");
            if (!btn) {
                const notesTd = e.target.closest(".notes-cell");
                if (notesTd) openNotesPopover(notesTd);
                return;
            }
            const tr = btn.closest("tr");
            const id = tr.dataset.id;

            if (btn.dataset.action === "del") {
                if (id && !confirm("Delete this guest?")) return;
                if (id) {
                    try { await api("DELETE", `/api/guests/${id}/delete/`); }
                    catch (err) { console.error(err); alert("Could not delete."); return; }
                }
                tr.remove();
                refreshStats();
                if (activeDrawerRow === tr) closeDrawer();
                maybeShowEmptyState();
                return;
            }

            if (btn.dataset.action === "view") {
                openDrawer(tr);
            }
        });

        function maybeShowEmptyState() {
            if (tbody.querySelector("tr[data-id]")) return;
            tbody.innerHTML = `
                <tr id="empty-state"><td colspan="7" class="px-4 py-12 text-center text-gray-500 uppercase tracking-wider">
                    No guests yet — click <span class="font-bold">+ Add Guest</span>
                </td></tr>`;
            refreshStats();
        }

        // ---------- Drawer ----------
        function openDrawer(tr) {
            activeDrawerRow = tr;
            hydrateDrawer(tr);
            drawer.classList.add("is-open");
            drawerOverlay.classList.add("is-open");
            drawerOverlay.setAttribute("aria-hidden", "false");
        }
        function closeDrawer() {
            drawer.classList.remove("is-open");
            drawerOverlay.classList.remove("is-open");
            drawerOverlay.setAttribute("aria-hidden", "true");
            activeDrawerRow = null;
        }
        function hydrateDrawer(tr) {
            const get = (field) => {
                const td = tr.querySelector(`[data-field="${field}"]`);
                if (!td) return "";
                if (td.classList.contains("is-empty")) return "";
                return td.textContent.trim();
            };
            const set = (field, value, placeholder = "—") => {
                const el = drawer.querySelector(`[data-drawer="${field}"]`);
                if (!el) return;
                el.textContent = value || placeholder;
                el.classList.toggle("is-empty", !value);
            };
            set("name",        get("name"));
            set("age",         get("age"));
            set("phone_number",get("phone_number"));
            set("address",     get("address"));
            const notesText = get("prayer_notes");
            set("prayer_notes", notesText, "(no notes yet)");
            notesBadge.textContent = `${notesText.length} chars`;
            const prayedTd = tr.querySelector('[data-field="prayed_for"]');
            set("prayed_for", prayedTd && prayedTd.classList.contains("is-prayed") ? "Yes ✓" : "Not yet", "Not yet");
        }
        drawerClose.addEventListener("click", closeDrawer);
        drawerOverlay.addEventListener("click", closeDrawer);
        drawerEditBtn.addEventListener("click", () => {
            if (!activeDrawerRow) return;
            const td = activeDrawerRow.querySelector(".notes-cell");
            closeDrawer();
            openNotesPopover(td);
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
        });

        // ---------- Add row ----------
        addBtn.addEventListener("click", () => {
            closeDrawer();
            closeNotesPopover({ keepValue: true });
            const tr = makeBlankRow();
            tbody.prepend(tr);
            removeEmptyStateRow();
            refreshStats();
            const nameCell = tr.querySelector('.text-cell[data-field="name"]');
            if (nameCell) {
                nameCell.focus();
                const range = document.createRange();
                range.selectNodeContents(nameCell);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

        refreshStats();
    })();