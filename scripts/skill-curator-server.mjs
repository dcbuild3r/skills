import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  copyDir,
  pathExists,
  removeEmptyDirs,
  scanInventory,
} from "./skill-inventory.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const uiRoot = path.join(repoRoot, "ui");
const selectionPath = path.join(repoRoot, "metadata", "skill-selection.json");
const uploadManifestPath = path.join(repoRoot, "metadata", "upload-manifest.json");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function readSelection() {
  if (!(await pathExists(selectionPath))) {
    return { updatedAt: null, decisions: {} };
  }
  return JSON.parse(await fs.readFile(selectionPath, "utf8"));
}

async function writeSelection(decisions) {
  const payload = {
    updatedAt: new Date().toISOString(),
    decisions,
  };
  await fs.mkdir(path.dirname(selectionPath), { recursive: true });
  await fs.writeFile(selectionPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function evaluateDecisions(inventory, decisions) {
  const known = new Set(inventory.skills.map((skill) => skill.id));
  const kept = [];
  const removed = [];
  const unreviewed = [];

  for (const skill of inventory.skills) {
    const decision = decisions[skill.id];
    if (decision === "keep") kept.push(skill);
    else if (decision === "remove") removed.push(skill);
    else unreviewed.push(skill);
  }

  const unknown = Object.keys(decisions).filter((id) => !known.has(id));
  return { kept, removed, unreviewed, unknown };
}

async function writeUploadManifest(inventory, decisions, mode, outputDir = null) {
  const evaluated = evaluateDecisions(inventory, decisions);
  const keptIds = new Set(evaluated.kept.map((skill) => skill.id));
  const scripts = inventory.scripts.filter((script) => !script.skillId || keptIds.has(script.skillId));
  const payload = {
    generatedAt: new Date().toISOString(),
    mode,
    outputDir,
    counts: {
      keptSkills: evaluated.kept.length,
      removedSkills: evaluated.removed.length,
      unreviewedSkills: evaluated.unreviewed.length,
      scriptsIncluded: scripts.length,
    },
    keptSkills: evaluated.kept.map((skill) => ({ id: skill.id, name: skill.name, root: skill.root })),
    removedSkills: evaluated.removed.map((skill) => ({ id: skill.id, name: skill.name, root: skill.root })),
    scriptsIncluded: scripts.map((script) => script.path),
  };
  await fs.mkdir(path.dirname(uploadManifestPath), { recursive: true });
  await fs.writeFile(uploadManifestPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

function readmeAreaRows(inventory) {
  const count = (area) => inventory.skills.filter((skill) => skill.area === area).length;
  return [
    "| Area | Path | Count | What it is |",
    "| --- | --- | ---: | --- |",
    `| Personal agent skills | \`skills/personal-agents/\` | ${count("Personal agent skills")} | Skills installed into \`~/.agents/skills\`, mostly engineering workflow skills. |`,
    `| Workspace-local agent skills | \`skills/code-agents/\` | ${count("Workspace-local agent skills")} | Skills installed under \`/Users/dcbuilder/Code/.agents/skills\`. |`,
    `| Personal Codex skills | \`skills/personal-codex/\` | ${count("Personal Codex skills")} | User-installed Codex skills from \`~/.codex/skills\`. |`,
    `| Codex system skills | \`skills/codex-system/\` | ${count("Codex system skills")} | Built-in Codex skills from \`~/.codex/skills/.system\`. |`,
    `| OpenAI curated plugins | \`skills/plugin-cache/openai-curated/\` | ${count("openai-curated")} | Skills bundled by enabled Codex plugins such as Vercel, GitHub, Slack, Supabase, and Superpowers. |`,
    `| OpenAI bundled plugins | \`skills/plugin-cache/openai-bundled/\` | ${count("openai-bundled")} | The bundled Browser skill. |`,
    `| OpenAI primary runtime | \`skills/plugin-cache/openai-primary-runtime/\` | ${count("openai-primary-runtime")} | Document, spreadsheet, and presentation skills from the primary runtime cache. |`,
    "| Source metadata | `metadata/` | - | Lockfile and provenance data for the user-installed `.agents` skills. |",
  ].join("\n");
}

function readmePluginRows(inventory) {
  const rows = inventory.groups
    .filter((item) => item.area.startsWith("openai-"))
    .map((item) => ({ group: item.group, count: item.skillCount }))
    .sort((a, b) => a.group.localeCompare(b.group));
  return [
    "| Plugin group | Count |",
    "| --- | ---: |",
    ...rows.map((row) => `| \`${row.group}\` | ${row.count} |`),
  ].join("\n");
}

async function updateReadmeCounts(inventory) {
  const readmePath = path.join(repoRoot, "README.md");
  if (!(await pathExists(readmePath))) return;
  let readme = await fs.readFile(readmePath, "utf8");
  readme = readme.replace(/The (?:dump|curated upload) contains \d+ `SKILL\.md` files:/, `The curated upload contains ${inventory.counts.skills} \`SKILL.md\` files:`);
  readme = readme.replace(/Snapshot date: .+/, `Snapshot date: ${new Date().toISOString().slice(0, 10)}`);
  readme = readme.replace(
    /\| Area \| Path \| Count \| What it is \|\n\| --- \| --- \| ---: \| --- \|\n(?:\|.*\|\n?)+?(?=\nThis is intentionally organized)/,
    `${readmeAreaRows(inventory)}\n`
  );
  readme = readme.replace(
    /\| Plugin group \| Count \|\n\| --- \| ---: \|\n(?:\|.*\|\n?)+?(?=\nPlugin skill files)/,
    `${readmePluginRows(inventory)}\n`
  );
  await fs.writeFile(readmePath, readme, "utf8");
}

async function buildUpload(decisions) {
  const inventory = await scanInventory(repoRoot);
  const evaluated = evaluateDecisions(inventory, decisions);
  if (evaluated.unreviewed.length) {
    return { ok: false, status: 400, error: "Review every skill before building an upload set.", evaluated };
  }
  const outRoot = path.join(repoRoot, "dist", "selected-upload");
  await fs.rm(outRoot, { recursive: true, force: true });
  await fs.mkdir(outRoot, { recursive: true });

  for (const file of ["README.md", "LICENSE"]) {
    const source = path.join(repoRoot, file);
    if (await pathExists(source)) await fs.copyFile(source, path.join(outRoot, file));
  }

  await writeSelection(decisions);
  const manifest = await writeUploadManifest(inventory, decisions, "preview", "dist/selected-upload");
  await fs.mkdir(path.join(outRoot, "metadata"), { recursive: true });
  await fs.copyFile(selectionPath, path.join(outRoot, "metadata", "skill-selection.json"));
  await fs.copyFile(uploadManifestPath, path.join(outRoot, "metadata", "upload-manifest.json"));

  for (const skill of evaluated.kept) {
    await copyDir(path.join(repoRoot, skill.root), path.join(outRoot, skill.root));
  }

  return { ok: true, outputDir: outRoot, manifest };
}

async function applySelection(decisions, confirmed) {
  if (!confirmed) {
    return { ok: false, status: 400, error: "Confirmation is required before removing unselected skills." };
  }
  const inventory = await scanInventory(repoRoot);
  const evaluated = evaluateDecisions(inventory, decisions);
  if (evaluated.unreviewed.length) {
    return { ok: false, status: 400, error: "Review every skill before applying to the working tree.", evaluated };
  }

  await writeSelection(decisions);
  const manifest = await writeUploadManifest(inventory, decisions, "working-tree");
  for (const skill of evaluated.removed) {
    await fs.rm(path.join(repoRoot, skill.root), { recursive: true, force: true });
  }
  await removeEmptyDirs(path.join(repoRoot, "skills"), path.join(repoRoot, "skills"));
  await updateReadmeCounts(await scanInventory(repoRoot));
  return { ok: true, manifest };
}

async function serveStatic(req, res, pathname) {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(uiRoot, `.${normalized}`);
  if (!filePath.startsWith(uiRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const body = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    res.writeHead(200, { "content-type": mimeTypes.get(extension) ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/api/inventory") {
      sendJson(res, 200, await scanInventory(repoRoot));
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/selection") {
      sendJson(res, 200, await readSelection());
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/selection") {
      const body = await readBody(req);
      sendJson(res, 200, await writeSelection(body.decisions ?? {}));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/build-upload") {
      const body = await readBody(req);
      const result = await buildUpload(body.decisions ?? {});
      sendJson(res, result.ok ? 200 : result.status, result);
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/apply-selection") {
      const body = await readBody(req);
      const result = await applySelection(body.decisions ?? {}, body.confirmed === true);
      sendJson(res, result.ok ? 200 : result.status, result);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, "127.0.0.1", () => {
  console.log(`Skill curator running at http://127.0.0.1:${port}`);
});
