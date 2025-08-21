const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const {
  validatePath,
  ensureDirectoryExists,
  cleanPath,
} = require("../utils/file-utils");
const logger = require("../utils/logger");

const router = express.Router();

router.post("/replace-files", async (req, res) => {
  try {
    const {
      entityName,
      tableName,
      frontendPath,
      backendPath,
      generatedCode,
      files,
    } = req.body;

    logger.info(`Starting file replacement for entity: ${entityName}`);

    if (
      !entityName ||
      !frontendPath ||
      !backendPath ||
      !files ||
      !Array.isArray(files)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: entityName, frontendPath, backendPath, or files array",
      });
    }

    const cleanFrontendPath = cleanPath(frontendPath);
    const cleanBackendPath = cleanPath(backendPath);

    if (!validatePath(cleanFrontendPath) || !validatePath(cleanBackendPath)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file paths detected",
      });
    }

    const createdFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        const { filename, path: relativePath, content, type } = file;

        const cleanRelativePath = cleanPath(relativePath);

        const fullPath = path.resolve(cleanRelativePath, filename);
        const dirPath = path.dirname(fullPath);

        logger.info(`Creating ${type} file: ${fullPath}`);
        logger.info(`Directory path: ${dirPath}`);

        await ensureDirectoryExists(dirPath);

        await fs.writeFile(fullPath, content, "utf8");

        createdFiles.push({
          filename,
          path: fullPath,
          type,
          status: "created",
          size: Buffer.byteLength(content, "utf8"),
        });

        logger.info(`✅ Successfully created ${type} file: ${fullPath}`);
      } catch (fileError) {
        logger.error(`❌ Error creating file ${file.filename}:`, fileError);
        errors.push({
          filename: file.filename,
          error: fileError.message,
          path: file.path,
          originalPath: file.path,
        });
      }
    }

    // Response
    if (errors.length === 0) {
      logger.info(
        `✅ Successfully completed file replacement for ${entityName}`
      );
      res.status(200).json({
        success: true,
        message: `Successfully created ${createdFiles.length} files for ${entityName}`,
        data: {
          entityName,
          tableName,
          frontendPath: cleanFrontendPath,
          backendPath: cleanBackendPath,
          createdFiles,
          summary: {
            totalFiles: createdFiles.length,
            frontendFiles: createdFiles.filter((f) => f.type === "frontend")
              .length,
            backendFiles: createdFiles.filter((f) => f.type === "backend")
              .length,
            totalSize: createdFiles.reduce((sum, f) => sum + f.size, 0),
          },
        },
      });
    } else {
      logger.warn(
        `⚠️ Partially completed file replacement for ${entityName}: ${errors.length} errors`
      );
      res.status(207).json({
        // 207 Multi-Status
        success: true,
        message: `Partially completed: ${createdFiles.length} files created, ${errors.length} errors`,
        data: {
          entityName,
          createdFiles,
          errors,
          summary: {
            successCount: createdFiles.length,
            errorCount: errors.length,
          },
        },
      });
    }
  } catch (error) {
    logger.error("Error in replace-files endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while replacing files",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});
router.get("/project-structure", async (req, res) => {
  try {
    const { projectPath } = req.query;

    const cleanProjectPath = cleanPath(projectPath);

    if (!projectPath || !validatePath(cleanProjectPath)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing project path",
      });
    }

    logger.info(`Getting project structure for: ${cleanProjectPath}`);

    async function getDirectoryStructure(
      dirPath,
      maxDepth = 3,
      currentDepth = 0
    ) {
      if (currentDepth >= maxDepth) return null;

      try {
        const items = await fs.readdir(dirPath);
        const structure = {};

        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = await fs.stat(itemPath);

          if (stats.isDirectory()) {
            if (!item.startsWith(".") && !item.includes("node_modules")) {
              structure[item] = await getDirectoryStructure(
                itemPath,
                maxDepth,
                currentDepth + 1
              );
            }
          } else {
            structure[item] = {
              type: "file",
              size: stats.size,
              modified: stats.mtime,
            };
          }
        }

        return structure;
      } catch (error) {
        return null;
      }
    }

    const structure = await getDirectoryStructure(cleanProjectPath);

    res.status(200).json({
      success: true,
      data: {
        projectPath: cleanProjectPath,
        structure,
        scannedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error getting project structure:", error);
    res.status(500).json({
      success: false,
      message: "Error reading project structure",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.post("/validate-paths", async (req, res) => {
  try {
    const { frontendPath, backendPath } = req.body;

    const cleanFrontendPath = cleanPath(frontendPath);
    const cleanBackendPath = cleanPath(backendPath);

    const results = {
      frontendPath: {
        path: cleanFrontendPath,
        valid: false,
        exists: false,
        writable: false,
      },
      backendPath: {
        path: cleanBackendPath,
        valid: false,
        exists: false,
        writable: false,
      },
    };

    if (cleanFrontendPath && validatePath(cleanFrontendPath)) {
      results.frontendPath.valid = true;
      try {
        await fs.access(cleanFrontendPath);
        results.frontendPath.exists = true;
        await fs.access(cleanFrontendPath, fs.constants.W_OK);
        results.frontendPath.writable = true;
      } catch (error) {}
    }

    if (cleanBackendPath && validatePath(cleanBackendPath)) {
      results.backendPath.valid = true;
      try {
        await fs.access(cleanBackendPath);
        results.backendPath.exists = true;
        await fs.access(cleanBackendPath, fs.constants.W_OK);
        results.backendPath.writable = true;
      } catch (error) {}
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error("Error validating paths:", error);
    res.status(500).json({
      success: false,
      message: "Error validating paths",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Code generation API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});


router.post("/replace-files-master-detail", async (req, res) => {
  try {
    const {
      parentEntityName,
      childEntityName,
      parentTableName,
      childTableName,
      frontendPath,
      backendPath,
      generatedCode,
      files,
    } = req.body;

    logger.info(
      `Starting master-detail file replacement for entities: ${parentEntityName} -> ${childEntityName}`
    );

    if (
      !parentEntityName ||
      !childEntityName ||
      !frontendPath ||
      !backendPath ||
      !files ||
      !Array.isArray(files)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: parentEntityName, childEntityName, frontendPath, backendPath, or files array",
      });
    }

    const cleanFrontendPath = cleanPath(frontendPath);
    const cleanBackendPath = cleanPath(backendPath);

    if (!validatePath(cleanFrontendPath) || !validatePath(cleanBackendPath)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file paths detected",
      });
    }

    const createdFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        const { filename, path: relativePath, content, type } = file;

        const cleanRelativePath = cleanPath(relativePath);

        const fullPath = path.resolve(cleanRelativePath, filename);
        const dirPath = path.dirname(fullPath);

        logger.info(`Creating ${type} file: ${fullPath}`);
        logger.info(`Directory path: ${dirPath}`);

        await ensureDirectoryExists(dirPath);

        await fs.writeFile(fullPath, content, "utf8");

        createdFiles.push({
          filename,
          path: fullPath,
          type,
          status: "created",
          size: Buffer.byteLength(content, "utf8"),
        });

        logger.info(`✅ Successfully created ${type} file: ${fullPath}`);
      } catch (fileError) {
        logger.error(`❌ Error creating file ${file.filename}:`, fileError);
        errors.push({
          filename: file.filename,
          error: fileError.message,
          path: file.path,
          originalPath: file.path,
        });
      }
    }

    // Response
    if (errors.length === 0) {
      logger.info(
        `✅ Successfully completed master-detail file replacement for ${parentEntityName} -> ${childEntityName}`
      );
      res.status(200).json({
        success: true,
        message: `Successfully created ${createdFiles.length} master-detail files for ${parentEntityName} -> ${childEntityName}`,
        data: {
          parentEntityName,
          childEntityName,
          parentTableName,
          childTableName,
          frontendPath: cleanFrontendPath,
          backendPath: cleanBackendPath,
          createdFiles,
          summary: {
            totalFiles: createdFiles.length,
            frontendFiles: createdFiles.filter((f) => f.type === "frontend")
              .length,
            backendFiles: createdFiles.filter((f) => f.type === "backend")
              .length,
            totalSize: createdFiles.reduce((sum, f) => sum + f.size, 0),
            parentEntity: parentEntityName,
            childEntity: childEntityName,
          },
        },
      });
    } else {
      logger.warn(
        `⚠️ Partially completed master-detail file replacement for ${parentEntityName} -> ${childEntityName}: ${errors.length} errors`
      );
      res.status(207).json({
        // 207 Multi-Status
        success: true,
        message: `Partially completed: ${createdFiles.length} files created, ${errors.length} errors`,
        data: {
          parentEntityName,
          childEntityName,
          parentTableName,
          childTableName,
          createdFiles,
          errors,
          summary: {
            successCount: createdFiles.length,
            errorCount: errors.length,
          },
        },
      });
    }
  } catch (error) {
    logger.error("Error in replace-files-master-detail endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while replacing master-detail files",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});
module.exports = router;
