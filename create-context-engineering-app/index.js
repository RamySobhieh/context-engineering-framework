#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");
const crypto = require("crypto");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

// Constants
const REPO_URL =
  "https://github.com/RamySobhieh/context-engineering-framework.git";
const SUPPORTED_LLMS = ["GEMINI", "CLAUDE"];
const REQUIRED_FILES = ["INITIAL_EXAMPLE.md", "INITIAL.md", "README.md"];

/**
 * Generates a temporary directory path for cloning the repository
 * @returns {string} Temporary directory path
 */
function generateTempDir() {
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  return path.join(
    os.tmpdir(),
    `context-engineering-framework-${randomSuffix}`
  );
}

/**
 * Clones the repository to a temporary directory
 * @param {string} tempDir - The temporary directory path
 * @throws {Error} If git clone fails
 */
function cloneRepository(tempDir) {
  try {
    console.log("Cloning repository...");
    execSync(`git clone --depth 1 ${REPO_URL} "${tempDir}"`, {
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

/**
 * Gets available languages from the cloned repository
 * @param {string} tempDir - The temporary directory path
 * @returns {string[]} Array of available language codes
 * @throws {Error} If Rules directory doesn't exist or is empty
 */
function getAvailableLanguages(tempDir) {
  const rulesDir = path.join(tempDir, "Rules");

  if (!fs.existsSync(rulesDir)) {
    throw new Error("Rules directory not found in the cloned repository");
  }

  const languages = fs
    .readdirSync(rulesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(".md", ""));

  if (languages.length === 0) {
    throw new Error("No language files found in Rules directory");
  }

  return languages;
}

/**
 * Parses and validates command line arguments
 * @param {string[]} availableLanguages - Available language options
 * @returns {Object} Parsed arguments
 */
function parseArguments(availableLanguages) {
  return yargs(hideBin(process.argv))
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
      choices: availableLanguages,
      demandOption: true,
    })
    .option("llm", {
      alias: "m",
      type: "string",
      description: "The LLM to use",
      choices: SUPPORTED_LLMS,
      demandOption: true,
      coerce: (arg) => arg.toUpperCase(),
    })
    .help()
    .alias("help", "h")
    .version()
    .alias("version", "v")
    .strict().argv;
}

/**
 * Validates that the project directory doesn't already exist
 * @param {string} projectDir - The project directory path
 * @throws {Error} If directory already exists
 */
function validateProjectDirectory(projectDir) {
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory '${projectDir}' already exists`);
  }
}

/**
 * Creates the main project directory
 * @param {string} projectDir - The project directory path
 */
function createProjectDirectory(projectDir) {
  try {
    fs.mkdirSync(projectDir, { recursive: true });
    console.log(`Created project directory: ${projectDir}`);
  } catch (error) {
    throw new Error(`Failed to create project directory: ${error.message}`);
  }
}

/**
 * Copies core directories from template to project
 * @param {string} templateDir - Source template directory
 * @param {string} projectDir - Target project directory
 */
function copyCoreDiretories(templateDir, projectDir) {
  const coreDirectories = [".context", "examples"];

  coreDirectories.forEach((dir) => {
    const srcPath = path.join(templateDir, dir);
    const destPath = path.join(projectDir, dir);

    if (fs.existsSync(srcPath)) {
      fs.copySync(srcPath, destPath);
      console.log(`Copied ${dir} directory`);
    }
  });
}

/**
 * Copies required files from template to project
 * @param {string} templateDir - Source template directory
 * @param {string} projectDir - Target project directory
 */
function copyRequiredFiles(templateDir, projectDir) {
  REQUIRED_FILES.forEach((file) => {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(projectDir, file);

    if (fs.existsSync(srcPath)) {
      fs.copySync(srcPath, destPath);
      console.log(`Copied ${file}`);
    }
  });
}

/**
 * Copies the appropriate LLM-specific file
 * @param {string} templateDir - Source template directory
 * @param {string} projectDir - Target project directory
 * @param {string} llm - The selected LLM
 */
function copyLLMFile(templateDir, projectDir, llm) {
  const llmFile = `${llm}.md`;
  const srcPath = path.join(templateDir, llmFile);
  const destPath = path.join(projectDir, llmFile);

  if (fs.existsSync(srcPath)) {
    fs.copySync(srcPath, destPath);
    console.log(`Copied ${llmFile}`);
  }
}

/**
 * Configures the PRP template with language and LLM settings
 * @param {string} projectDir - The project directory
 * @param {string} language - Selected language
 * @param {string} llm - Selected LLM
 */
function configurePRPTemplate(projectDir, language, llm) {
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
    `prp_template_${language}.md`
  );

  if (fs.existsSync(langTemplatePath)) {
    let prpContent = fs.readFileSync(langTemplatePath, "utf8");
    prpContent = prpContent.replace(/{{LLM_AGENT}}/g, llm);
    fs.writeFileSync(prpTemplatePath, prpContent);
    console.log(`Configured PRP template for ${language} and ${llm}`);
  }
}

/**
 * Applies language-specific rules to the appropriate LLM file
 * @param {string} templateDir - Source template directory
 * @param {string} projectDir - Target project directory
 * @param {string} language - Selected language
 * @param {string} llm - Selected LLM
 */
function applyLanguageRules(templateDir, projectDir, language, llm) {
  const langRulesPath = path.join(templateDir, "Rules", `${language}.md`);

  if (!fs.existsSync(langRulesPath)) {
    console.warn(`Warning: No language rules found for ${language}`);
    return;
  }

  const langRulesContent = fs.readFileSync(langRulesPath, "utf8");
  const targetRulesPath = path.join(projectDir, `${llm}.md`);

  fs.writeFileSync(targetRulesPath, langRulesContent);
  console.log(`Applied ${language} rules to ${llm}.md`);
}

/**
 * Creates the project source directory and initializes git
 * @param {string} projectDir - The project directory
 * @param {string} projectName - The project name
 */
function initializeProjectStructure(projectDir, projectName) {
  const srcDir = path.join(projectDir, projectName);
  fs.mkdirSync(srcDir, { recursive: true });
  console.log(`Created source directory: ${srcDir}`);

  try {
    execSync("git init", {
      cwd: srcDir,
      stdio: "pipe",
    });
    console.log("Initialized git repository");
  } catch (error) {
    console.warn(
      `Warning: Failed to initialize git repository: ${error.message}`
    );
  }
}

/**
 * Cleans up template files that are no longer needed
 * @param {string} projectDir - The project directory
 */
function cleanupTemplateFiles(projectDir) {
  const templatesDir = path.join(projectDir, ".context", "templates");

  if (!fs.existsSync(templatesDir)) {
    return;
  }

  fs.readdirSync(templatesDir).forEach((file) => {
    if (file !== "prp_template.md") {
      const filePath = path.join(templatesDir, file);
      fs.removeSync(filePath);
    }
  });

  console.log("Cleaned up template files");
}

/**
 * Removes the temporary directory
 * @param {string} tempDir - The temporary directory to remove
 */
function cleanupTempDirectory(tempDir) {
  try {
    fs.removeSync(tempDir);
    console.log("Cleaned up temporary files");
  } catch (error) {
    console.warn(
      `Warning: Failed to cleanup temporary directory: ${error.message}`
    );
  }
}

/**
 * Main function that orchestrates the project creation process
 */
async function main() {
  const tempDir = generateTempDir();

  try {
    // Setup phase
    cloneRepository(tempDir);
    const availableLanguages = getAvailableLanguages(tempDir);
    const argv = parseArguments(availableLanguages);

    const { name: projectName, lang: language, llm } = argv;
    const projectDir = path.resolve(process.cwd(), projectName);

    // Validation phase
    validateProjectDirectory(projectDir);

    // Creation phase
    console.log(
      `Creating project '${projectName}' with ${language} language rules for ${llm}...`
    );

    createProjectDirectory(projectDir);
    copyCoreDiretories(tempDir, projectDir);
    copyRequiredFiles(tempDir, projectDir);
    copyLLMFile(tempDir, projectDir, llm);

    // Configuration phase
    configurePRPTemplate(projectDir, language, llm);
    applyLanguageRules(tempDir, projectDir, language, llm);
    initializeProjectStructure(projectDir, projectName);

    // Cleanup phase
    cleanupTemplateFiles(projectDir);

    console.log(`\n✅ Project '${projectName}' created successfully!`);
    console.log(`📁 Location: ${projectDir}`);
    console.log(`🔧 Language: ${language}`);
    console.log(`🤖 LLM: ${llm}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    cleanupTempDirectory(tempDir);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main();
}
