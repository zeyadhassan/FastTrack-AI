/**
 * Code analysis functionality for FastTrack AI
 */
import { CodeBlockNode } from './models';
export interface ComplexityMetrics {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    halsteadDifficulty: number;
}
/**
 * Analyzer class for code analysis
 */
export declare class Analyzer {
    /**
     * Calculate cyclomatic complexity for JavaScript/TypeScript code
     * This is a simplified implementation - in a real-world scenario,
     * you would use a library like escomplex or create more sophisticated parsing
     */
    calculateComplexity(code: string): number;
    /**
     * Determine if a code block is covered by tests
     */
    isCodeBlockTested(codeBlock: CodeBlockNode, testFiles: string[]): boolean;
    /**
     * Find test files in a directory
     */
    findTestFiles(directory: string): string[];
    /**
     * Check if a file contains tests for a specific function or code block
     */
    doesTestCoverFunction(testFilePath: string, functionName: string): boolean;
    /**
     * Extract function names from code
     */
    extractFunctionNames(code: string): string[];
}
