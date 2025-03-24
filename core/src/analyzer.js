"use strict";
/**
 * Code analysis functionality for FastTrack AI
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Analyzer class for code analysis
 */
class Analyzer {
    /**
     * Calculate cyclomatic complexity for JavaScript/TypeScript code
     * This is a simplified implementation - in a real-world scenario,
     * you would use a library like escomplex or create more sophisticated parsing
     */
    calculateComplexity(code) {
        // Simple implementation: count decision points
        // In a real implementation, use a proper parser like escomplex
        const conditionals = [
            'if', 'else if', 'while', 'for', 'case', '&&', '||',
            '?', 'catch', 'finally', 'switch'
        ];
        let complexity = 1; // Base complexity
        for (const conditional of conditionals) {
            const regex = new RegExp(`\\b${conditional}\\b`, 'g');
            const matches = code.match(regex);
            if (matches) {
                complexity += matches.length;
            }
        }
        return complexity;
    }
    /**
     * Determine if a code block is covered by tests
     */
    isCodeBlockTested(codeBlock, testFiles) {
        // In a real implementation, this would be more sophisticated
        // For now, let's assume a test file exists with the same base name
        const fileNode = codeBlock.fileId;
        if (!fileNode)
            return false;
        // Get the base file name without extension
        const baseName = path.basename(fileNode, path.extname(fileNode));
        // Check if any test file matches the pattern (e.g., fileName.test.js)
        const testFilePatterns = [
            `${baseName}.test.`,
            `${baseName}.spec.`,
            `${baseName}-test.`,
            `${baseName}-spec.`,
            `test-${baseName}.`,
            `spec-${baseName}.`
        ];
        for (const testFile of testFiles) {
            for (const pattern of testFilePatterns) {
                if (path.basename(testFile).startsWith(pattern)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Find test files in a directory
     */
    findTestFiles(directory) {
        const testFiles = [];
        // Check if directory exists
        if (!fs.existsSync(directory)) {
            return testFiles;
        }
        // Get all files in the directory
        const files = fs.readdirSync(directory);
        // Filter for test files
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                // If it's a directory, recursively search it
                const subDirTestFiles = this.findTestFiles(filePath);
                testFiles.push(...subDirTestFiles);
            }
            else if (file.includes('.test.') ||
                file.includes('.spec.') ||
                file.includes('-test.') ||
                file.includes('-spec.') ||
                (directory.includes('__tests__') && (file.endsWith('.js') || file.endsWith('.ts')))) {
                // If it's a test file, add it to the list
                testFiles.push(filePath);
            }
        }
        return testFiles;
    }
    /**
     * Check if a file contains tests for a specific function or code block
     */
    doesTestCoverFunction(testFilePath, functionName) {
        try {
            // Read the test file
            const content = fs.readFileSync(testFilePath, 'utf-8');
            // Check if the function name appears in the test file
            // This is a simple heuristic and may need to be improved
            const regex = new RegExp(`\\b${functionName}\\b`, 'g');
            return regex.test(content);
        }
        catch (error) {
            console.error(`Error reading test file: ${testFilePath}`, error);
            return false;
        }
    }
    /**
     * Extract function names from code
     */
    extractFunctionNames(code) {
        const functionNames = [];
        // Match function declarations (function name() {})
        const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            functionNames.push(match[1]);
        }
        // Match method declarations (methodName() {})
        const methodRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{/g;
        while ((match = methodRegex.exec(code)) !== null) {
            functionNames.push(match[1]);
        }
        // Match arrow functions (const name = () => {})
        const arrowFunctionRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)|\w+)\s*=>/g;
        while ((match = arrowFunctionRegex.exec(code)) !== null) {
            functionNames.push(match[1]);
        }
        return functionNames;
    }
}
exports.Analyzer = Analyzer;
