const fs = require("fs").promises;
const path = require("path");
const logger = require("./logger");

async function ensureDirectoryExists(dirPath) {
  try {
    // Clean the path and normalize it
    const cleanDirPath = path.normalize(dirPath.trim());

    logger.info(`Checking directory: ${cleanDirPath}`);

    // Check if directory already exists
    await fs.access(cleanDirPath);
    logger.info(`Directory already exists: ${cleanDirPath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        // Create directory recursively
        const cleanDirPath = path.normalize(dirPath.trim());
        await fs.mkdir(cleanDirPath, { recursive: true });
        logger.info(`✅ Created directory: ${cleanDirPath}`);
      } catch (mkdirError) {
        logger.error(`❌ Failed to create directory: ${dirPath}`, mkdirError);
        throw mkdirError;
      }
    } else {
      logger.error(`❌ Error accessing directory: ${dirPath}`, error);
      throw error;
    }
  }
}

// Validate file path to prevent directory traversal attacks (FIXED)
function validatePath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return false;
  }

  // Clean the path first
  const cleanInputPath = filePath.trim();

  if (!cleanInputPath) {
    return false;
  }

  const normalizedPath = path.normalize(cleanInputPath);

  // Check for directory traversal attempts
  if (normalizedPath.includes("..")) {
    logger.warn(
      `Path validation failed - directory traversal detected: ${filePath}`
    );
    return false;
  }

  // Check for null bytes
  if (normalizedPath.includes("\0")) {
    logger.warn(`Path validation failed - null bytes detected: ${filePath}`);
    return false;
  }

  // Additional validation for Windows paths
  if (process.platform === "win32") {
    // Check for invalid Windows characters in filename parts only (not path separators)
    const pathParts = normalizedPath.split(path.sep);
    const invalidChars = /[<>"|?*]/; // Removed colon from here since it's valid in drive letters

    for (const part of pathParts) {
      if (part && invalidChars.test(part)) {
        // Skip drive letters (like C:)
        if (part.match(/^[A-Za-z]:$/)) {
          continue;
        }
        logger.warn(
          `Path validation failed - invalid Windows characters in part "${part}": ${filePath}`
        );
        return false;
      }
    }

    // Check for reserved Windows names
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    for (const part of pathParts) {
      if (part && reservedNames.test(part.split(".")[0])) {
        // Check only the name part before extension
        logger.warn(
          `Path validation failed - reserved Windows name: ${filePath}`
        );
        return false;
      }
    }
  }

  return true;
}

// Clean and normalize path (NEW FUNCTION)
function cleanPath(inputPath) {
  if (!inputPath || typeof inputPath !== "string") {
    return "";
  }

  // Trim whitespace and normalize separators
  let cleaned = inputPath.trim();

  // Convert backslashes to forward slashes for consistency
  cleaned = cleaned.replace(/\\/g, "/");

  // Normalize the path
  cleaned = path.normalize(cleaned);

  // On Windows, convert back to backslashes for the final path
  if (process.platform === "win32") {
    cleaned = cleaned.replace(/\//g, "\\");
  }

  return cleaned;
}

// Check if path is writable
async function isWritable(filePath) {
  try {
    const cleanFilePath = cleanPath(filePath);
    await fs.access(cleanFilePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// Get file stats
async function getFileStats(filePath) {
  try {
    const cleanFilePath = cleanPath(filePath);
    const stats = await fs.stat(cleanFilePath);
    return {
      exists: true,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

module.exports = {
  ensureDirectoryExists,
  validatePath,
  isWritable,
  getFileStats,
  cleanPath,
};
