#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const crypto = require("crypto");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const REPO_URL =
  "https://github.com/RamySobhieh/context-engineering-framework.git";
const tempDir = path.join(
  os.tmpdir(),
  `context-engineering-framework-${crypto.randomBytes(6).toString("hex")}`
);

// Clone the repo to a temp directory
execSync(`git clone --depth 1 ${REPO_URL} "${tempDir}"`, { stdio: "ignore" });

// Get available languages from the cloned repo
const availableLangs = fs
  .readdirSync(path.join(tempDir, "Rules"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.replace(".md", ""));

const argv = yargs(hideBin(process.argv))
  .option("name", {
    alias: "n",
    type: "string",
    description: "The name of the project",
    demandOption: true,
  })
  .option("lang", {
    alias: "l",
    type: "string",
    description: "The language of the project",
    choices: availableLangs,
    demandOption: true,
  })
  .option("llm", {
    alias: "m",
    type: "string",
    description: "The LLM to use",
    choices: ["GEMINI", "CLAUDE"],
    demandOption: true,
    coerce: (arg) => arg.toUpperCase(),
  }).argv;

const projectName = argv.name;
const lang = argv.lang;
const llm = argv.llm;

const projectDir = path.resolve(process.cwd(), projectName);
const templateDir = tempDir;

fs.mkdirSync(projectDir);

fs.copySync(
  path.join(templateDir, ".context"),
  path.join(projectDir, ".context")
);
fs.copySync(
  path.join(templateDir, "examples"),
  path.join(projectDir, "examples")
);
if (argv.llm === "CLAUDE") {
  fs.copySync(
    path.join(templateDir, "CLAUDE.md"),
    path.join(projectDir, "CLAUDE.md")
  );
} else {
  fs.copySync(
    path.join(templateDir, "GEMINI.md"),
    path.join(projectDir, "GEMINI.md")
  );
}

fs.copySync(
  path.join(templateDir, "INITIAL_EXAMPLE.md"),
  path.join(projectDir, "INITIAL_EXAMPLE.md")
);
fs.copySync(
  path.join(templateDir, "INITIAL.md"),
  path.join(projectDir, "INITIAL.md")
);
fs.copySync(
  path.join(templateDir, "README.md"),
  path.join(projectDir, "README.md")
);

const prpTemplatePath = path.join(
  projectDir,
  ".context",
  "templates",
  "prp_template.md"
);
const langTemplatePath = path.join(
  projectDir,
  ".context",
  "templates",
  `prp_template_${lang}.md`
);

if (fs.existsSync(langTemplatePath)) {
  let prpContent = fs.readFileSync(langTemplatePath, "utf8");
  prpContent = prpContent.replace(/{{LLM_AGENT}}/g, llm);
  fs.writeFileSync(prpTemplatePath, prpContent);
}

const geminiRulesPath = path.join(projectDir, "GEMINI.md");
const claudeRulesPath = path.join(projectDir, "CLAUDE.md");
const langRulesPath = path.join(templateDir, "Rules", `${lang}.md`);

if (fs.existsSync(langRulesPath)) {
  const langRulesContent = fs.readFileSync(langRulesPath, "utf8");
  if (argv.llm === "GEMINI") {
    fs.writeFileSync(langRulesPath, geminiRulesPath);
  } else {
    fs.writeFileSync(langRulesPath, claudeRulesPath);
  }
}

fs.mkdirSync(path.join(projectDir, projectName));

execSync("git init", { cwd: path.join(projectDir, projectName) });

// Clean up temp directory
fs.removeSync(tempDir);

console.log(`Project ${projectName} created successfully!`);
