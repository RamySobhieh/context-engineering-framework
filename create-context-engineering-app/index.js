#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const availableLangs = fs.readdirSync(path.resolve(__dirname, '..', 'Rules'))
  .filter(file => file.endsWith('.md'))
  .map(file => file.replace('.md', ''));

const argv = yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'The name of the project',
    demandOption: true,
  })
  .option('lang', {
    alias: 'l',
    type: 'string',
    description: 'The language of the project',
    choices: availableLangs,
    demandOption: true,
  })
  .option('llm', {
    alias: 'm',
    type: 'string',
    description: 'The LLM to use',
    choices: ['GEMINI', 'CLAUDE'],
    demandOption: true,
    coerce: (arg) => arg.toUpperCase(),
  })
  .argv;

const projectName = argv.name;
const lang = argv.lang;
const llm = argv.llm;

const projectDir = path.resolve(process.cwd(), projectName);
const templateDir = path.resolve(__dirname, '..');

fs.mkdirSync(projectDir);

fs.copySync(path.join(templateDir, '.gemini'), path.join(projectDir, '.gemini'));
fs.copySync(path.join(templateDir, 'examples'), path.join(projectDir, 'examples'));
fs.copySync(path.join(templateDir, 'Rules'), path.join(projectDir, 'Rules'));
fs.copySync(path.join(templateDir, 'src'), path.join(projectDir, 'src'));
fs.copySync(path.join(templateDir, 'tests'), path.join(projectDir, 'tests'));
fs.copySync(path.join(templateDir, '.gitattributes'), path.join(projectDir, '.gitattributes'));
fs.copySync(path.join(templateDir, '.gitignore'), path.join(projectDir, '.gitignore'));
fs.copySync(path.join(templateDir, 'CLAUDE.md'), path.join(projectDir, 'CLAUDE.md'));
fs.copySync(path.join(templateDir, 'GEMINI.md'), path.join(projectDir, 'GEMINI.md'));
fs.copySync(path.join(templateDir, 'INITIAL_EXAMPLE.md'), path.join(projectDir, 'INITIAL_EXAMPLE.md'));
fs.copySync(path.join(templateDir, 'INITIAL.md'), path.join(projectDir, 'INITIAL.md'));
fs.copySync(path.join(templateDir, 'README.md'), path.join(projectDir, 'README.md'));

const prpTemplatePath = path.join(projectDir, '.gemini', 'templates', 'prp_template.md');
const langTemplatePath = path.join(projectDir, '.gemini', 'templates', `prp_template_${lang}.md`);

if (fs.existsSync(langTemplatePath)) {
  let prpContent = fs.readFileSync(langTemplatePath, 'utf8');
  prpContent = prpContent.replace(/{{LLM_AGENT}}/g, llm);
  fs.writeFileSync(prpTemplatePath, prpContent);
}

const geminiRulesPath = path.join(projectDir, 'GEMINI.md');
const claudeRulesPath = path.join(projectDir, 'CLAUDE.md');
const langRulesPath = path.join(projectDir, 'Rules', `${lang}.md`);

if (fs.existsSync(langRulesPath)) {
  const langRulesContent = fs.readFileSync(langRulesPath, 'utf8');
  fs.writeFileSync(geminiRulesPath, langRulesContent);
  fs.writeFileSync(claudeRulesPath, langRulesContent);
}

fs.renameSync(path.join(projectDir, 'src'), path.join(projectDir, projectName));

execSync('git init', { cwd: projectDir });

console.log(`Project ${projectName} created successfully!`);