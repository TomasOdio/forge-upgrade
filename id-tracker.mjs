import fs from 'fs';

class IDReplacementTracker {
  constructor() {
    this.replacements = new Map();
    this.logEntries = [];
  }

  /**
   * Track an ID replacement
   * @param {string} oldId - The original forge-button ID that will be replaced
   * @param {string} newId - The nested button ID that will replace it
   * @param {string} filePath - The file where this replacement occurred
   */
  trackReplacement(oldId, newId, filePath) {
    if (!oldId || !newId || oldId === newId) {
      return;
    }

    this.replacements.set(oldId, newId);
    this.logEntries.push({
      type: 'tracked',
      oldId,
      newId,
      sourceFile: filePath,
      timestamp: new Date().toISOString()
    });

    console.log(`ID replacement tracked: "${oldId}" -> "${newId}" in ${filePath}`);
  }

  /**
   * Log a successful replacement operation
   */
  logReplacement(oldId, newId, filePath, lineNumber, oldContent, newContent) {
    this.logEntries.push({
      type: 'replaced',
      oldId,
      newId,
      file: filePath,
      line: lineNumber,
      oldContent: oldContent.trim(),
      newContent: newContent.trim(),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate the configuration file for ID replacements
   */
  generateConfigFile(outputPath = 'id-replacements.json') {
    if (this.replacements.size === 0) {
      console.log('No ID replacements to generate.');
      return null;
    }

    const htmlPatterns = [];
    const jsPatterns = [];
    const cssPatterns = [];

    for (const [oldId, newId] of this.replacements.entries()) {
      // HTML attribute patterns - REMOVED id="..." patterns as requested
      // Only keeping 'for' attribute patterns for labels
      htmlPatterns.push(
        { from: `for="${oldId}"`, to: `for="${newId}"` },
        { from: `for='${oldId}'`, to: `for='${newId}'` }
      );

      // JavaScript patterns - escape special regex characters
      const escapedOldId = this.escapeRegex(oldId);
      const escapedNewId = newId;

      jsPatterns.push(
        // getElementById patterns
        { from: `getElementById\\(["']${escapedOldId}["']\\)`, to: `getElementById("${escapedNewId}")` },
        // querySelector patterns
        { from: `querySelector\\(["']#${escapedOldId}["']\\)`, to: `querySelector("#${escapedNewId}")` },
        { from: `querySelectorAll\\(["']#${escapedOldId}["']\\)`, to: `querySelectorAll("#${escapedNewId}")` },
        // jQuery patterns
        { from: `\\$\\(["']#${escapedOldId}["']\\)`, to: `$("#${escapedNewId}")` },
        // Cypress patterns - cy.get('#id')
        { from: `cy\\.get\\(["']#${escapedOldId}["']\\)`, to: `cy.get("#${escapedNewId}")` },
        // jQuery function call patterns - jQuery('#id')
        { from: `jQuery\\(["']#${escapedOldId}["']\\)`, to: `jQuery("#${escapedNewId}")` },
        // Function call patterns with ID as string parameter - functionName('id')
        { from: `\\(["']${escapedOldId}["']\\)`, to: `("${escapedNewId}")` },
        // String literal patterns for CSS selectors - "#id"
        { from: `["']#${escapedOldId}["']`, to: `"#${escapedNewId}"` },
        // String literal patterns for bare IDs - "id" (but not in function calls)
        { from: `(\\s|=|:|,)["']${escapedOldId}["']`, to: `$1"${escapedNewId}"` },

      );

      // CSS/SCSS patterns
      cssPatterns.push(
        { from: `#${escapedOldId}\\b`, to: `#${escapedNewId}` },
        { from: `["']#${escapedOldId}["']`, to: `"#${escapedNewId}"` }
      );
    }

    const config = {
      name: "ID Replacements from forge-button migration",
      operations: [
        {
          files: "**/*.{html,htm,jsp,aspx,cshtml,erb}",
          patterns: htmlPatterns
        },
        {
          files: "**/*.{ts,js,tsx,jsx}",
          patterns: jsPatterns
        },
        {
          files: "**/*.{scss,css,less}",
          patterns: cssPatterns
        }
      ]
    };

    fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
    console.log(`Generated ${outputPath} with ${this.replacements.size} ID replacements`);
    return outputPath;
  }

  /**
   * Generate a detailed log file
   */
  generateLogFile(outputPath = 'id-replacement-log.json') {
    const logData = {
      summary: {
        totalReplacements: this.replacements.size,
        generatedAt: new Date().toISOString()
      },
      replacements: Array.from(this.replacements.entries()).map(([oldId, newId]) => ({
        oldId,
        newId
      })),
      detailedLog: this.logEntries
    };

    fs.writeFileSync(outputPath, JSON.stringify(logData, null, 2));
    console.log(`Generated detailed log: ${outputPath}`);
    return outputPath;
  }

  /**
   * Escape special regex characters in ID strings
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Check if we have any replacements tracked
   */
  hasReplacements() {
    return this.replacements.size > 0;
  }

  /**
   * Get all tracked replacements
   */
  getReplacements() {
    return new Map(this.replacements);
  }
}

// Global instance to be shared across the migration
let globalTracker = null;

/**
 * Get or create the global ID replacement tracker
 */
export function getIDTracker() {
  if (!globalTracker) {
    globalTracker = new IDReplacementTracker();
  }
  return globalTracker;
}

/**
 * Reset the global tracker (useful for testing)
 */
export function resetIDTracker() {
  globalTracker = null;
}

export default IDReplacementTracker;
