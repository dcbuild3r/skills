import { promises as fs } from "node:fs";
import { scanInventory } from "./skill-inventory.mjs";

const inventory = await scanInventory(process.cwd());
const lines = [
  "# Scripts Inventory",
  "",
  `Generated from the local repository snapshot. Current count: ${inventory.counts.scripts} script files.`,
  "",
  "| Script | Owner | Source |",
  "| --- | --- | --- |",
];

for (const script of inventory.scripts) {
  const owner = script.skillName ? `\`${script.skillName}\`` : "Repository tooling";
  lines.push(`| \`${script.path}\` | ${owner} | ${script.area} / ${script.group} |`);
}

await fs.writeFile("SCRIPTS.md", `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote SCRIPTS.md with ${inventory.counts.scripts} scripts.`);
