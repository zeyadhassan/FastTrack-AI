import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import { TextDocumentChangeEvent } from 'vscode';
import { diff_match_patch } from 'diff-match-patch';
import { 
  GraphManager, 
  Storage, 
  NodeType, 
  EdgeType,
  CodeBlockNode,
  FileNode,
  Analyzer,
  Node,
  Edge
} from '@fasttrack-ai/core';

// Type for code insertion detection
interface CodeInsertion {
  startLine: number;
  endLine: number;
  content: string;
  aiTool: string;
}

// Type for AI code detection result
interface CodeBlock {
  startLine: number;
  endLine: number;
  content: string;
  confidence: number;
}

/**
 * CodeDetector class for identifying AI-generated code
 */
export class CodeDetector {
  private previousContents: Map<string, string> = new Map();
  private insertionThreshold = 10; // Min characters for tracking
  private diffMatcher: any = new diff_match_patch();
  private analyzer: Analyzer = new Analyzer();
  
  // Developer ID (hardcoded for now, would typically come from Git config)
  private developerId = 'default-developer';
  
  constructor(
    private graphManager: GraphManager,
    private storage: Storage
  ) {
    // Ensure developer exists in graph
    this.ensureDeveloperExists();
  }
  
  /**
   * Ensure the current developer exists in the graph
   */
  private async ensureDeveloperExists(): Promise<void> {
    if (!this.graphManager.findNodeById(this.developerId)) {
      // In a real implementation, this would get the developer name from Git config
      this.graphManager.createDeveloperNode(
        this.developerId,
        'Developer',
        'developer@example.com'
      );
      
      await this.storage.saveGraph(this.graphManager.getGraph());
    }
  }
  
  /**
   * Process document changes to detect AI code insertions
   */
  async processDocumentChange(event: TextDocumentChangeEvent): Promise<void> {
    const document = event.document;
    
    // Skip non-source files
    if (!this.isSourceFile(document)) {
      return;
    }
    
    const documentKey = document.uri.toString();
    const currentContent = document.getText();
    const previousContent = this.previousContents.get(documentKey) || '';
    
    // Skip if content is the same
    if (currentContent === previousContent) {
      return;
    }
    
    // Identify significant insertions that might be AI-generated
    const insertions = this.detectCodeInsertions(previousContent, currentContent, document);
    
    // Process each significant insertion
    for (const insertion of insertions) {
      if (this.isLikelyAIGenerated(insertion)) {
        await this.tagCodeBlock(document, insertion.startLine, insertion.endLine, insertion.aiTool);
      }
    }
    
    // Update previous content
    this.previousContents.set(documentKey, currentContent);
  }
  
  /**
   * Detect significant code insertions between old and new content
   */
  private detectCodeInsertions(oldContent: string, newContent: string, document: vscode.TextDocument): CodeInsertion[] {
    const insertions: CodeInsertion[] = [];
    
    // Compute the diff between old and new content
    const diffs = this.diffMatcher.diff_main(oldContent, newContent);
    this.diffMatcher.diff_cleanupSemantic(diffs);
    
    let currentPosition = 0;
    
    for (const [operation, text] of diffs) {
      if (operation === 1) { // Insertion
        // Skip small insertions
        if (text.length < this.insertionThreshold) {
          currentPosition += text.length;
          continue;
        }
        
        // Calculate the position in the document
        const startPos = document.positionAt(currentPosition);
        const endPos = document.positionAt(currentPosition + text.length);
        
        // Create insertion object
        insertions.push({
          startLine: startPos.line,
          endLine: endPos.line,
          content: text,
          aiTool: this.guessAITool(text)
        });
      }
      
      // Update current position
      if (operation !== -1) { // Not a deletion
        currentPosition += text.length;
      }
    }
    
    return insertions;
  }
  
  /**
   * Determine if an insertion is likely AI-generated
   */
  private isLikelyAIGenerated(insertion: CodeInsertion): boolean {
    // Simple heuristics:
    // 1. Significant amount of code (multiple lines)
    // 2. Contains at least one function or class definition 
    // 3. Was inserted all at once
    
    const lineCount = insertion.endLine - insertion.startLine + 1;
    
    // Require at least 3 lines
    if (lineCount < 3) {
      return false;
    }
    
    // Check for function or class patterns
    const hasFunction = /function\s+\w+\s*\(|class\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(|let\s+\w+\s*=\s*(?:async\s*)?\(/.test(insertion.content);
    
    return hasFunction;
  }
  
  /**
   * Make an educated guess about which AI tool generated the code
   */
  private guessAITool(_content: string): string {
    // This is a simplified version - in a real implementation,
    // we would use more sophisticated heuristics or integration with
    // the actual Copilot/Cursor APIs
    
    // For now, default to Copilot
    return 'Copilot';
  }
  
  /**
   * Tag a code block as AI-generated
   */
  async tagCodeBlock(document: vscode.TextDocument, startLine: number, endLine: number, aiTool: string): Promise<void> {
    // Get the full document path
    const filePath = document.uri.fsPath;
    
    // Ensure file exists in graph
    const fileId = await this.ensureFileExists(document);
    
    // Get the content of the code block
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    const range = new vscode.Range(startPos, endPos);
    const content = document.getText(range);
    
    // Generate IDs
    const aiSuggestionId = this.generateId('ai', filePath, startLine, endLine);
    const codeBlockId = this.generateId('code', filePath, startLine, endLine);
    
    // Create AI suggestion node
    const aiSuggestion = this.graphManager.createAISuggestionNode(
      aiSuggestionId,
      aiTool
    );
    
    // Create code block node
    const codeBlock = this.graphManager.createCodeBlockNode(
      codeBlockId,
      fileId,
      startLine,
      endLine,
      content
    );
    
    // Calculate complexity
    codeBlock.complexity = this.analyzer.calculateComplexity(content);
    
    // Create edges
    this.graphManager.createEdge(
      `generated-${aiSuggestionId}-${codeBlockId}`,
      EdgeType.Generated,
      aiSuggestion.id,
      codeBlock.id
    );
    
    this.graphManager.createEdge(
      `authored-${this.developerId}-${codeBlockId}`,
      EdgeType.Authored,
      this.developerId,
      codeBlock.id
    );
    
    // Save changes
    await this.storage.saveGraph(this.graphManager.getGraph());
    
    // Optionally insert a comment above the code block
    await this.insertAIComment(document, startLine, aiTool);
  }
  
  /**
   * Generate a unique ID for a graph node
   */
  private generateId(prefix: string, filePath: string, startLine: number, endLine: number): string {
    const hash = crypto.createHash('md5')
      .update(`${filePath}:${startLine}-${endLine}:${Date.now()}`)
      .digest('hex')
      .substring(0, 8);
    
    return `${prefix}-${hash}`;
  }
  
  /**
   * Ensure a file exists in the graph
   */
  private async ensureFileExists(document: vscode.TextDocument): Promise<string> {
    const filePath = document.uri.fsPath;
    const relativePath = vscode.workspace.asRelativePath(filePath);
    
    // Try to find existing file node
    const existingFile = this.graphManager.getGraph().nodes.find(
      (node: Node) => node.type === NodeType.File && 'path' in node && node.path === relativePath
    ) as FileNode | undefined;
    
    if (existingFile) {
      return existingFile.id;
    }
    
    // Create new file node
    const fileId = `file-${crypto.createHash('md5').update(filePath).digest('hex').substring(0, 8)}`;
    const language = this.getLanguageFromDocument(document);
    
    this.graphManager.createFileNode(fileId, relativePath, language);
    await this.storage.saveGraph(this.graphManager.getGraph());
    
    return fileId;
  }
  
  /**
   * Get language ID from document
   */
  private getLanguageFromDocument(document: vscode.TextDocument): string {
    return document.languageId;
  }
  
  /**
   * Insert a comment above AI-generated code
   */
  private async insertAIComment(document: vscode.TextDocument, line: number, aiTool: string): Promise<void> {
    // Skip if already has an AI comment
    const lineText = document.lineAt(line).text;
    if (lineText.includes('AI generated')) {
      return;
    }
    
    // Determine comment style based on language
    const language = document.languageId;
    let commentPrefix = '// ';
    
    if (['python', 'ruby'].includes(language)) {
      commentPrefix = '# ';
    } else if (['html', 'xml'].includes(language)) {
      commentPrefix = '<!-- ';
    }
    
    const commentSuffix = language === 'html' || language === 'xml' ? ' -->' : '';
    
    // Create edit
    const edit = new vscode.WorkspaceEdit();
    const position = new vscode.Position(line, 0);
    const comment = `${commentPrefix}AI generated by ${aiTool}${commentSuffix}\n`;
    
    edit.insert(document.uri, position, comment);
    
    try {
      await vscode.workspace.applyEdit(edit);
    } catch (error) {
      console.error('Failed to insert AI comment:', error);
    }
  }
  
  /**
   * Detect AI-generated code in a file
   */
  async detectAICode(content: string, _fileUri: vscode.Uri): Promise<CodeBlock[]> {
    const blocks: CodeBlock[] = [];
    
    // Split the content into lines
    const lines = content.split('\n');
    
    let blockStart = -1;
    let blockContent = '';
    let inPotentialAIBlock = false;
    
    // Very simple detection algorithm:
    // Look for blocks of code that have specific patterns, structural complexity,
    // or follow common AI generation patterns
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (line.trim() === '') {
        continue;
      }
      
      // Check for the start of a function or class
      if (!inPotentialAIBlock && (
        line.includes('function ') || 
        line.includes('class ') || 
        line.includes(' = function') || 
        line.includes(' = (') || 
        line.match(/const \w+ = \(/)
      )) {
        blockStart = i;
        blockContent = line;
        inPotentialAIBlock = true;
        continue;
      }
      
      // Add to current block
      if (inPotentialAIBlock) {
        blockContent += '\n' + line;
        
        // Check for end of block (closing brace on a line by itself)
        if (line.trim() === '}' || line.trim() === 'end') {
          // Calculate confidence
          const confidence = this.calculateAIConfidence(blockContent);
          
          if (confidence > 0.6) {
            blocks.push({
              startLine: blockStart,
              endLine: i,
              content: blockContent,
              confidence
            });
          }
          
          inPotentialAIBlock = false;
          blockContent = '';
        }
      }
    }
    
    return blocks;
  }
  
  /**
   * Calculate confidence score that code is AI-generated
   */
  private calculateAIConfidence(content: string): number {
    // This would be a more sophisticated algorithm in a real implementation
    // Factors to consider:
    // - Structure and formatting consistency
    // - Variable naming conventions
    // - Comment style
    // - Use of advanced features
    // - Code structure complexity
    
    let score = 0.5; // Start at 50%
    
    // Length factors
    const length = content.length;
    if (length > 500) score += 0.1;
    if (length > 1000) score += 0.1;
    
    // Structure factors
    if (content.includes('try') && content.includes('catch')) score += 0.05;
    const commentCount = content.match(/\/\/ /g)?.length ?? 0;
    if (commentCount > 2) score += 0.05; // Multiple comments
    if (content.includes('async') && content.includes('await')) score += 0.05;
    if (content.includes('forEach') || content.includes('map') || content.includes('reduce')) score += 0.05;
    
    // Pattern factors
    if (content.match(/\{\s*return /)) score += 0.05; // One-line return in blocks
    if (content.match(/const \w+ = \(/)) score += 0.05; // Arrow function pattern
    
    // Cap the score
    return Math.min(score, 0.95);
  }
  
  /**
   * Analyze a file for AI-generated code
   */
  async analyzeFile(fileUri: vscode.Uri): Promise<void> {
    try {
      const document = await vscode.workspace.openTextDocument(fileUri);
      const content = document.getText();
      
      // Skip non-source files
      if (!this.isSourceFile(document)) {
        return;
      }
      
      // Detect AI blocks
      const aiBlocks = await this.detectAICode(content, fileUri);
      
      // Tag detected blocks
      for (const block of aiBlocks) {
        await this.tagCodeBlock(document, block.startLine, block.endLine, 'Copilot');
      }
      
      // Update file information
      await this.updateFileInfo(document);
      
    } catch (error) {
      console.error(`Error analyzing file ${fileUri.fsPath}:`, error);
    }
  }
  
  /**
   * Update file information in the graph
   */
  async updateFileInfo(document: vscode.TextDocument): Promise<void> {
    // Skip non-source files
    if (!this.isSourceFile(document)) {
      return;
    }
    
    const fileId = await this.ensureFileExists(document);
    
    // Find test files that might cover this file
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const baseName = path.basename(document.fileName, path.extname(document.fileName));
      const testPatterns = [
        new vscode.RelativePattern(workspaceFolder, `**/${baseName}.test.*`),
        new vscode.RelativePattern(workspaceFolder, `**/${baseName}.spec.*`),
        new vscode.RelativePattern(workspaceFolder, `**/*test*/${baseName}.*`),
        new vscode.RelativePattern(workspaceFolder, `**/__tests__/${baseName}.*`)
      ];
      
      // Find test files
      let testFiles: vscode.Uri[] = [];
      for (const pattern of testPatterns) {
        testFiles = [...testFiles, ...(await vscode.workspace.findFiles(pattern))];
      }
      
      // Process tests and link to code blocks
      for (const testFile of testFiles) {
        await this.processTestFile(testFile, fileId);
      }
    }
  }
  
  /**
   * Process a test file and link it to code blocks
   */
  private async processTestFile(testFile: vscode.Uri, sourceFileId: string): Promise<void> {
    try {
      const document = await vscode.workspace.openTextDocument(testFile);
      const content = document.getText();
      const relativePath = vscode.workspace.asRelativePath(testFile);
      
      // Create test node
      const testId = `test-${crypto.createHash('md5').update(testFile.fsPath).digest('hex').substring(0, 8)}`;
      this.graphManager.findNodeById(testId) || 
      this.graphManager.createTestNode(testId, relativePath);
      
      // Find code blocks in the source file
      const sourceCodeBlocks = this.graphManager.getGraph().nodes.filter(
        (node: Node) => node.type === NodeType.CodeBlock && 
               'fileId' in node && 
               (node as CodeBlockNode).fileId === sourceFileId
      ) as CodeBlockNode[];
      
      // For each code block, check if the test covers it
      for (const block of sourceCodeBlocks) {
        const functionNames = this.analyzer.extractFunctionNames(block.content);
        
        // Check if any function name is mentioned in the test
        const isTested = functionNames.some((name: string) => content.includes(name));
        
        if (isTested) {
          // Check if the edge already exists
          const existingEdge = this.graphManager.getGraph().edges.find(
            (edge: Edge) => edge.type === EdgeType.TestedBy && 
                   edge.source === block.id &&
                   edge.target === testId
          );
          
          if (!existingEdge) {
            // Create tested_by edge
            this.graphManager.createEdge(
              `tested-${block.id}-${testId}`,
              EdgeType.TestedBy,
              block.id,
              testId
            );
            
            // Update code block
            block.isTested = true;
            this.graphManager.addNode(block);
          }
        }
      }
      
      await this.storage.saveGraph(this.graphManager.getGraph());
      
    } catch (error) {
      console.error(`Error processing test file ${testFile.fsPath}:`, error);
    }
  }
  
  /**
   * Check if a document is a source code file
   */
  private isSourceFile(document: vscode.TextDocument): boolean {
    const supportedLanguages = [
      'javascript', 'typescript', 'javascriptreact', 'typescriptreact',
      'python', 'java', 'go', 'ruby', 'c', 'cpp', 'csharp', 'php'
    ];
    
    return supportedLanguages.includes(document.languageId);
  }
}