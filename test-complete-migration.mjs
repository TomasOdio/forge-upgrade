#!/usr/bin/env node

import { executeHtmlMigrations } from './migration-utils.mjs';
import { executeIDReplacements } from './id-replacement-utils.mjs';
import { getIDTracker, resetIDTracker } from './id-tracker.mjs';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

async function runCompleteTest() {
    console.log('🧪 Starting complete ID replacement test...\n');

    // Reset tracker for clean test
    resetIDTracker();

    try {
        // Step 1: Run HTML migrations (this will track ID replacements)
        console.log('📄 Step 1: Running HTML migrations...');
        const htmlFiles = await glob('./test-files/*.html');
        console.log(`Found ${htmlFiles.length} HTML files: ${htmlFiles.join(', ')}`);

        if (htmlFiles.length > 0) {
            const migrations = [
                { name: 'Forge Buttons', path: './migrations/html/v3/posthtml-forge-button.mjs' }
            ];

            const modifiedHtmlFiles = await executeHtmlMigrations({
                files: htmlFiles,
                migrations: migrations,
                dryRun: false // Actually modify files for test
            });

            console.log(`✅ HTML migrations completed. ${modifiedHtmlFiles.length} files modified.`);
        }

        // Step 2: Check what replacements were tracked
        console.log('\n🔍 Step 2: Checking tracked ID replacements...');
        const tracker = getIDTracker();
        if (tracker.hasReplacements()) {
            console.log(`Tracked ${tracker.getReplacements().size} ID replacement(s):`);
            for (const [oldId, newId] of tracker.getReplacements()) {
                console.log(`  "${oldId}" -> "${newId}"`);
            }
        } else {
            console.log('❌ No ID replacements were tracked');
            return;
        }

        // Step 3: Execute ID replacements across all files
        console.log('\n🔄 Step 3: Executing ID replacements...');
        const modifiedIdFiles = await executeIDReplacements({
            rootPath: './test-files',
            dryRun: false, // Actually modify files
            ignoreGlobs: []
        });

        console.log(`✅ ID replacements completed. ${modifiedIdFiles.length} files modified.`);

        // Step 4: Verify the results
        console.log('\n✨ Step 4: Verifying results...');

        // Check the modified HTML file
        const htmlContent = fs.readFileSync('./test-files/test-button.html', 'utf-8');
        console.log('HTML file after migration:');
        console.log('  - forge-button element:', htmlContent.includes('<forge-button id="actual-button-id"') ? '✅ ID updated' : '❌ ID not updated');
        console.log('  - JavaScript getElementById:', htmlContent.includes('getElementById("actual-button-id")') ? '✅ Updated' : '❌ Not updated');
        console.log('  - CSS selector:', htmlContent.includes('#actual-button-id') ? '✅ Updated' : '❌ Not updated');
        console.log('  - Label for attribute:', htmlContent.includes('for="actual-button-id"') ? '✅ Updated' : '❌ Not updated');

        // Check JavaScript file
        const jsContent = fs.readFileSync('./test-files/button-controller.js', 'utf-8');
        const jsUpdated = !jsContent.includes('old-forge-id');
        console.log('JavaScript file:', jsUpdated ? '✅ All references updated' : '❌ Some references not updated');

        // Check CSS file
        const cssContent = fs.readFileSync('./test-files/button-styles.css', 'utf-8');
        const cssUpdated = !cssContent.includes('#old-forge-id');
        console.log('CSS file:', cssUpdated ? '✅ All selectors updated' : '❌ Some selectors not updated');

        // Step 5: Display log file
        if (fs.existsSync('id-replacement-log.json')) {
            console.log('\n📋 Step 5: Replacement log summary:');
            const logContent = JSON.parse(fs.readFileSync('id-replacement-log.json', 'utf-8'));
            console.log(`  Total replacements: ${logContent.summary.totalReplacements}`);
            console.log(`  Files modified: ${logContent.detailedLog.filter(entry => entry.type === 'replaced').length}`);
            console.log(`  Log file: id-replacement-log.json`);
        }

        console.log('\n🎉 Complete test finished successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Cleanup function
async function cleanup() {
    console.log('\n🧹 Cleaning up test files...');
    const filesToRemove = [
        './test-files/test-button.html',
        './test-files/button-controller.js',
        './test-files/button-styles.css',
        'id-replacement-log.json'
    ];

    for (const file of filesToRemove) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log(`Removed: ${file}`);
        }
    }

    // Remove test-files directory if empty
    try {
        fs.rmdirSync('./test-files');
        console.log('Removed: ./test-files directory');
    } catch (e) {
        // Directory not empty or doesn't exist, ignore
    }
}

// Run the test
runCompleteTest()
    .then(() => {
        console.log('\nTest completed. Run with --cleanup to remove test files.');
        if (process.argv.includes('--cleanup')) {
            return cleanup();
        }
    })
    .catch(console.error);
