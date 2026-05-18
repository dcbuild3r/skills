import { promises as fs } from "node:fs";
import path from "node:path";

const SCRIPT_EXTENSIONS = new Set([".sh", ".py", ".js", ".mjs", ".ts", ".tsx"]);
const IGNORED_DIRS = new Set([".git", "node_modules", "dist"]);

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(root, predicate = () => true) {
  const out = [];

  async function visit(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile() && predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  }

  await visit(root);
  return out.sort();
}

function rel(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end === -1) return {};
  const yaml = text.slice(3, end).trim();
  const fields = {};
  let activeKey = null;

  for (const line of yaml.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      activeKey = match[1];
      fields[activeKey] = match[2].replace(/^["']|["']$/g, "").trim();
      continue;
    }
    if (activeKey && /^\s+/.test(line)) {
      fields[activeKey] = `${fields[activeKey]} ${line.trim()}`.trim();
    }
  }

  return fields;
}

function sourceForSkill(relativeDir) {
  const parts = relativeDir.split("/");
  if (parts[0] === "personal-agents") {
    return { area: "Personal agent skills", group: parts[1] ?? "personal-agents" };
  }
  if (parts[0] === "code-agents") {
    return { area: "Workspace-local agent skills", group: parts[1] ?? "code-agents" };
  }
  if (parts[0] === "personal-codex") {
    return { area: "Personal Codex skills", group: parts[1] ?? "personal-codex" };
  }
  if (parts[0] === "codex-system") {
    return { area: "Codex system skills", group: "codex-system" };
  }
  if (parts[0] === "plugin-cache") {
    return {
      area: parts[1] ?? "Plugin cache",
      group: parts[2] ?? parts[1] ?? "plugin-cache",
    };
  }
  return { area: "Other", group: parts[0] ?? "other" };
}

export async function scanInventory(repoRoot = process.cwd()) {
  const skillsRoot = path.join(repoRoot, "skills");
  const skillFiles = await walk(skillsRoot, (filePath) => path.basename(filePath) === "SKILL.md");
  const skills = [];

  for (const skillFile of skillFiles) {
    const dir = path.dirname(skillFile);
    const relativeDir = rel(skillsRoot, dir);
    const text = await fs.readFile(skillFile, "utf8");
    const frontmatter = parseFrontmatter(text);
    const source = sourceForSkill(relativeDir);
    skills.push({
      id: relativeDir,
      name: frontmatter.name || path.basename(dir),
      description: frontmatter.description || "",
      area: source.area,
      group: source.group,
      root: `skills/${relativeDir}`,
      skillFile: `skills/${relativeDir}/SKILL.md`,
      scriptCount: 0,
      fileCount: 0,
      scripts: [],
    });
  }

  const skillByRoot = new Map(skills.map((skill) => [skill.root, skill]));
  const skillRoots = [...skillByRoot.keys()].sort((a, b) => b.length - a.length);
  const allFiles = await walk(repoRoot);
  const scripts = [];

  for (const absolutePath of allFiles) {
    const relativePath = rel(repoRoot, absolutePath);
    const extension = path.extname(relativePath);
    const owningRoot = skillRoots.find((root) => relativePath.startsWith(`${root}/`));
    if (owningRoot) {
      const skill = skillByRoot.get(owningRoot);
      skill.fileCount += 1;
    }
    if (!SCRIPT_EXTENSIONS.has(extension)) continue;
    const skill = owningRoot ? skillByRoot.get(owningRoot) : null;
    const script = {
      path: relativePath,
      extension,
      area: skill?.area ?? "Repository tooling",
      group: skill?.group ?? "repo",
      skillId: skill?.id ?? null,
      skillName: skill?.name ?? null,
    };
    scripts.push(script);
    if (skill) {
      skill.scriptCount += 1;
      skill.scripts.push(script.path);
    }
  }

  const groups = {};
  for (const skill of skills) {
    const key = `${skill.area} / ${skill.group}`;
    groups[key] ??= { area: skill.area, group: skill.group, skillCount: 0, scriptCount: 0 };
    groups[key].skillCount += 1;
    groups[key].scriptCount += skill.scriptCount;
  }

  return {
    generatedAt: new Date().toISOString(),
    repoRoot,
    counts: {
      skills: skills.length,
      scripts: scripts.length,
      groups: Object.keys(groups).length,
    },
    skills,
    scripts,
    groups: Object.values(groups).sort((a, b) => `${a.area}/${a.group}`.localeCompare(`${b.area}/${b.group}`)),
  };
}

export async function copyDir(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true, force: true, dereference: false });
}

export async function removeEmptyDirs(dir, stopAt) {
  if (!(await pathExists(dir))) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await removeEmptyDirs(path.join(dir, entry.name), stopAt);
    }
  }
  if (path.resolve(dir) === path.resolve(stopAt)) return;
  const remaining = await fs.readdir(dir);
  if (remaining.length === 0) {
    await fs.rmdir(dir);
  }
}
