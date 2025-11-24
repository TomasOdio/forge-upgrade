import { replaceInFile } from 'replace-in-file';
import fs from 'fs';
import path from 'path';
import { getIDTracker } from './id-tracker.mjs';

/**
 * Execute ID replacement operations with detailed logging
 * @param {string} rootPath - The root directory to search in
 * @param {boolean} dryRun - Whether to perform a dry run
 * @param {string[]} ignoreGlobs - Globs to ignore during replacement
 * @returns {Promise<string[]>} Array of modified file paths
 */
export async function executeIDReplacements({ rootPath, dryRun = false, ignoreGlobs = [] }) {
  const tracker = getIDTracker();

  if (!tracker.hasReplacements()) {
    console.log('No ID replacements to perform.');
    return [];
  }

  // Generate the configuration file
  const configPath = tracker.generateConfigFile('temp-id-replacements.json');
  if (!configPath) {
    return [];
  }

  let modifiedFiles = [];

  try {
    // Read the generated configuration
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    console.log(`\\nExecuting ID replacements with ${config.operations.length} operation(s)...`);

    // Execute each operation
    for (const operation of config.operations) {
      // Properly construct the file pattern
      let files;
      if (rootPath === '.' || rootPath === './') {
        files = operation.files;
      } else {
        // Ensure rootPath doesn't end with slash and operation.files starts with **
        const cleanRootPath = rootPath.replace(/[\/\\]$/, '');
        const pattern = operation.files.startsWith('**/') ? operation.files.substring(3) : operation.files;
        files = path.join(cleanRootPath, pattern).replace(/\\/g, '/'); // Normalize for glob
      }

      console.log(`\\nProcessing files matching: ${operation.files}`);
      console.log(`Actual file pattern: ${files}`);
      console.log(`Found ${operation.patterns.length} replacement pattern(s) for this file type`);

      for (const pattern of operation.patterns) {
        try {
          const options = {
            files,
            from: new RegExp(pattern.from, 'g'),
            to: pattern.to,
            dry: dryRun,
            allowEmptyPaths: true,
            ignore: [
              'node_modules/**/*',
              '**/*/node_modules/**/*',
              'temp-id-replacements.json',
              'id-replacement-log.json',
              ...ignoreGlobs
            ]
          };

          const results = await replaceInFile(options);

          // Log successful replacements
          for (const result of results) {
            if (result.hasChanged) {
              modifiedFiles.push(result.file);

              // Extract old and new IDs from the pattern for logging
              const fromMatch = pattern.from.match(/["']([^"']+)["']/);
              const toMatch = pattern.to.match(/["']([^"']+)["']/);

              if (fromMatch && toMatch) {
                const oldId = fromMatch[1].replace('#', '');
                const newId = toMatch[1].replace('#', '');

                // Log this replacement
                tracker.logReplacement(
                  oldId,
                  newId,
                  result.file,
                  'multiple', // Line numbers would require additional file parsing
                  pattern.from,
                  pattern.to
                );
              }

              if (!dryRun) {
                console.log(`  ✓ Replaced in: ${result.file}`);
              } else {
                console.log(`  ✓ Would replace in: ${result.file}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error processing pattern "${pattern.from}" -> "${pattern.to}": ${error.message}`);
        }
      }
    }

    // Clean up temporary config file
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    // Generate detailed log
    tracker.generateLogFile('id-replacement-log.json');

    console.log(`\\nID replacement complete. ${modifiedFiles.length} file(s) modified.`);

    return [...new Set(modifiedFiles)]; // Remove duplicates

  } catch (error) {
    console.error('Error executing ID replacements:', error.message);

    // Clean up on error
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    throw error;
  }
}

/**
 * Enhanced replace operation with detailed logging for any configuration
 * @param {Object} options - Replacement options
 * @param {string} options.rootPath - Root directory
 * @param {string} options.configPath - Path to replacement configuration JSON
 * @param {boolean} options.dryRun - Whether to perform dry run
 * @param {string[]} options.ignoreGlobs - Globs to ignore
 * @returns {Promise<string[]>} Array of modified file paths
 */
export async function executeEnhancedReplacements({ rootPath, configPath, dryRun = false, ignoreGlobs = [] }) {
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);

  console.log(`\\nExecuting replacements from: ${configPath}`);
  console.log(`Configuration: ${config.name || 'Unnamed'}`);

  const modifiedFiles = [];

  for (const operation of config.operations) {
    const files = path.join(rootPath, operation.files);
    const patterns = operation.patterns || [];

    console.log(`\\nProcessing ${patterns.length} pattern(s) for files: ${operation.files}`);

    const from = patterns.map(p => new RegExp(p.from, 'g'));
    const to = patterns.map(p => p.to);

    try {
      const options = {
        files,
        from,
        to,
        dry: dryRun,
        allowEmptyPaths: true,
        ignore: [
          'node_modules/**/*',
          '**/*/node_modules/**/*',
          ...ignoreGlobs
        ]
      };

      const results = await replaceInFile(options);
      const changedFiles = results
        .filter(result => result.hasChanged)
        .map(result => result.file);

      changedFiles.forEach(file => {
        modifiedFiles.push(file);
        if (!dryRun) {
          console.log(`  ✓ Modified: ${file}`);
        } else {
          console.log(`  ✓ Would modify: ${file}`);
        }
      });

    } catch (error) {
      console.error(`Error in operation for ${operation.files}: ${error.message}`);
    }
  }

  return [...new Set(modifiedFiles)]; // Remove duplicates
}
