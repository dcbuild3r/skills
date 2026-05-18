const state = {
  inventory: null,
  decisions: {},
  selectedSkillId: null,
  visibleSkillIds: [],
};

const els = {
  totalSkills: document.querySelector("#totalSkills"),
  keepCount: document.querySelector("#keepCount"),
  removeCount: document.querySelector("#removeCount"),
  unreviewedCount: document.querySelector("#unreviewedCount"),
  scriptCount: document.querySelector("#scriptCount"),
  visibleCount: document.querySelector("#visibleCount"),
  scriptsVisibleCount: document.querySelector("#scriptsVisibleCount"),
  skillList: document.querySelector("#skillList"),
  scriptList: document.querySelector("#scriptList"),
  detailContent: document.querySelector("#detailContent"),
  searchInput: document.querySelector("#searchInput"),
  areaFilter: document.querySelector("#areaFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  scriptsOnly: document.querySelector("#scriptsOnly"),
  statusLog: document.querySelector("#statusLog"),
  saveSelection: document.querySelector("#saveSelection"),
  buildUpload: document.querySelector("#buildUpload"),
  applySelection: document.querySelector("#applySelection"),
  confirmApply: document.querySelector("#confirmApply"),
  applyDialog: document.querySelector("#applyDialog"),
  refreshData: document.querySelector("#refreshData"),
  keepVisible: document.querySelector("#keepVisible"),
  removeVisible: document.querySelector("#removeVisible"),
  clearVisible: document.querySelector("#clearVisible"),
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

function setLog(message, tone = "normal") {
  els.statusLog.textContent = message;
  els.statusLog.dataset.tone = tone;
}

function decisionFor(skillId) {
  return state.decisions[skillId] || "unreviewed";
}

function setDecision(skillId, decision) {
  if (decision === "unreviewed") delete state.decisions[skillId];
  else state.decisions[skillId] = decision;
  render();
}

function counts() {
  let keep = 0;
  let remove = 0;
  let unreviewed = 0;
  for (const skill of state.inventory.skills) {
    const decision = decisionFor(skill.id);
    if (decision === "keep") keep += 1;
    else if (decision === "remove") remove += 1;
    else unreviewed += 1;
  }
  return { keep, remove, unreviewed };
}

function matchesFilters(skill) {
  const query = els.searchInput.value.trim().toLowerCase();
  const area = els.areaFilter.value;
  const status = els.statusFilter.value;
  if (area !== "all" && skill.area !== area) return false;
  if (status !== "all" && decisionFor(skill.id) !== status) return false;
  if (els.scriptsOnly.checked && skill.scriptCount === 0) return false;
  if (!query) return true;
  const haystack = [
    skill.name,
    skill.description,
    skill.area,
    skill.group,
    skill.root,
    ...skill.scripts,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function visibleSkills() {
  return state.inventory.skills.filter(matchesFilters);
}

function statusLabel(status) {
  if (status === "keep") return "Keep";
  if (status === "remove") return "Remove";
  return "Unreviewed";
}

function renderStats() {
  const summary = counts();
  els.totalSkills.textContent = state.inventory.counts.skills;
  els.keepCount.textContent = summary.keep;
  els.removeCount.textContent = summary.remove;
  els.unreviewedCount.textContent = summary.unreviewed;
  els.scriptCount.textContent = state.inventory.counts.scripts;
  els.buildUpload.disabled = summary.unreviewed > 0;
  els.applySelection.disabled = summary.unreviewed > 0;
}

function renderAreas() {
  const current = els.areaFilter.value || "all";
  const areas = [...new Set(state.inventory.skills.map((skill) => skill.area))].sort();
  els.areaFilter.innerHTML = [
    `<option value="all">All sources</option>`,
    ...areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`),
  ].join("");
  els.areaFilter.value = areas.includes(current) ? current : "all";
}

function renderSkillList() {
  const skills = visibleSkills();
  state.visibleSkillIds = skills.map((skill) => skill.id);
  els.visibleCount.textContent = `${skills.length} visible`;
  els.skillList.innerHTML = skills.map((skill) => {
    const status = decisionFor(skill.id);
    const selected = state.selectedSkillId === skill.id ? " selected" : "";
    return `
      <article class="skill-row${selected}" data-skill-id="${escapeHtml(skill.id)}">
        <div class="decision" aria-label="Decision for ${escapeHtml(skill.name)}">
          <button class="secondary ${status === "keep" ? "active-keep" : ""}" data-action="keep">Keep</button>
          <button class="secondary ${status === "remove" ? "active-remove" : ""}" data-action="remove">Remove</button>
        </div>
        <div class="skill-main" data-action="select">
          <div class="skill-title">
            <strong>${escapeHtml(skill.name)}</strong>
            <span class="status-pill status-${status}">${statusLabel(status)}</span>
          </div>
          <div class="skill-desc">${escapeHtml(skill.description || "No description in frontmatter.")}</div>
        </div>
        <div class="meta" data-action="select">
          <div>${escapeHtml(skill.area)}</div>
          <div>${escapeHtml(skill.group)}</div>
          <div class="path">${escapeHtml(skill.root)}</div>
        </div>
        <div class="counts" data-action="select">
          <span>${skill.fileCount} files</span>
          <span>${skill.scriptCount} scripts</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderScripts() {
  const query = els.searchInput.value.trim().toLowerCase();
  const area = els.areaFilter.value;
  const scripts = state.inventory.scripts.filter((script) => {
    if (area !== "all" && script.area !== area) return false;
    if (!query) return true;
    return [script.path, script.skillName, script.area, script.group].join(" ").toLowerCase().includes(query);
  });
  els.scriptsVisibleCount.textContent = `${scripts.length} listed`;
  els.scriptList.innerHTML = scripts.map((script) => `
    <div class="script-item">
      <code>${escapeHtml(script.path)}</code>
      <div class="script-owner">${escapeHtml(script.skillName || "Repository tooling")} · ${escapeHtml(script.area)}</div>
    </div>
  `).join("");
}

function renderDetails() {
  const skill = state.inventory.skills.find((item) => item.id === state.selectedSkillId);
  if (!skill) {
    els.detailContent.innerHTML = "<p>Select a skill to inspect its files and scripts.</p>";
    return;
  }
  const status = decisionFor(skill.id);
  els.detailContent.innerHTML = `
    <h3>${escapeHtml(skill.name)}</h3>
    <span class="status-pill status-${status}">${statusLabel(status)}</span>
    <p style="margin-top: 12px">${escapeHtml(skill.description || "No description in frontmatter.")}</p>
    <dl>
      <dt>Source</dt><dd>${escapeHtml(skill.area)}</dd>
      <dt>Group</dt><dd>${escapeHtml(skill.group)}</dd>
      <dt>Root</dt><dd><code>${escapeHtml(skill.root)}</code></dd>
      <dt>Files</dt><dd>${skill.fileCount}</dd>
      <dt>Scripts</dt><dd>${skill.scriptCount}</dd>
    </dl>
    <div class="decision">
      <button class="secondary ${status === "keep" ? "active-keep" : ""}" data-detail-action="keep">Keep</button>
      <button class="secondary ${status === "remove" ? "active-remove" : ""}" data-detail-action="remove">Remove</button>
    </div>
    <h2 style="margin-top: 18px">Scripts</h2>
    <div class="script-mini-list" style="margin-top: 8px">
      ${skill.scripts.length ? skill.scripts.map((script) => `<div class="script-item"><code>${escapeHtml(script)}</code><div class="script-owner">skill helper</div></div>`).join("") : "<p>No scripts in this skill.</p>"}
    </div>
  `;
}

function render() {
  if (!state.inventory) return;
  renderStats();
  renderSkillList();
  renderScripts();
  renderDetails();
}

async function load() {
  setLog("Loading skill and script inventory...");
  const [inventory, selection] = await Promise.all([
    api("/api/inventory"),
    api("/api/selection"),
  ]);
  state.inventory = inventory;
  state.decisions = selection.decisions || {};
  state.selectedSkillId = inventory.skills[0]?.id ?? null;
  renderAreas();
  render();
  setLog(`Loaded ${inventory.counts.skills} skills and ${inventory.counts.scripts} scripts. Review every skill before applying.`);
}

async function saveSelection() {
  const result = await api("/api/selection", {
    method: "POST",
    body: JSON.stringify({ decisions: state.decisions }),
  });
  setLog(`Selection saved at ${result.updatedAt}.`);
}

async function buildUpload() {
  await saveSelection();
  const result = await api("/api/build-upload", {
    method: "POST",
    body: JSON.stringify({ decisions: state.decisions }),
  });
  setLog(`Upload preview built at ${result.outputDir} with ${result.manifest.counts.keptSkills} kept skills.`);
}

function bulkSet(decision) {
  for (const id of state.visibleSkillIds) {
    if (decision === "unreviewed") delete state.decisions[id];
    else state.decisions[id] = decision;
  }
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.skillList.addEventListener("click", (event) => {
  const row = event.target.closest(".skill-row");
  if (!row) return;
  const skillId = row.dataset.skillId;
  const action = event.target.dataset.action || event.target.closest("[data-action]")?.dataset.action;
  if (action === "keep" || action === "remove") {
    setDecision(skillId, decisionFor(skillId) === action ? "unreviewed" : action);
    return;
  }
  state.selectedSkillId = skillId;
  render();
});

els.detailContent.addEventListener("click", (event) => {
  const action = event.target.dataset.detailAction;
  if (!action || !state.selectedSkillId) return;
  setDecision(state.selectedSkillId, decisionFor(state.selectedSkillId) === action ? "unreviewed" : action);
});

for (const element of [els.searchInput, els.areaFilter, els.statusFilter, els.scriptsOnly]) {
  element.addEventListener("input", render);
}

els.saveSelection.addEventListener("click", () => saveSelection().catch((error) => setLog(error.message, "error")));
els.buildUpload.addEventListener("click", () => buildUpload().catch((error) => setLog(error.message, "error")));
els.applySelection.addEventListener("click", () => els.applyDialog.showModal());
els.confirmApply.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    await saveSelection();
    const result = await api("/api/apply-selection", {
      method: "POST",
      body: JSON.stringify({ decisions: state.decisions, confirmed: true }),
    });
    els.applyDialog.close();
    setLog(`Working tree applied: ${result.manifest.counts.keptSkills} kept, ${result.manifest.counts.removedSkills} removed.`);
    await load();
  } catch (error) {
    setLog(error.message, "error");
  }
});
els.refreshData.addEventListener("click", () => load().catch((error) => setLog(error.message, "error")));
els.keepVisible.addEventListener("click", () => bulkSet("keep"));
els.removeVisible.addEventListener("click", () => bulkSet("remove"));
els.clearVisible.addEventListener("click", () => bulkSet("unreviewed"));

load().catch((error) => setLog(error.message, "error"));
