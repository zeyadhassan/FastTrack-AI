"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@types/jest");
const __1 = require("../");
describe('Analyzer', () => {
    let analyzer;
    beforeEach(() => {
        analyzer = new __1.Analyzer();
    });
    test('should calculate complexity for simple code', () => {
        const code = `
      function test() {
        if (x > 10) {
          return true;
        } else if (x < 5) {
          return false;
        } else {
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        }
      }
    `;
        const complexity = analyzer.calculateComplexity(code);
        // The code has 4 decision points: if, else if, else, for
        expect(complexity).toBe(5); // 1 (base) + 4 (decision points)
    });
    test('should extract function names from code', () => {
        const code = `
      function testFunction() {
        console.log('test');
      }
      
      const arrowFunction = () => {
        return true;
      };
      
      class TestClass {
        methodFunction() {
          if (true) {
            return 'test';
          }
        }
      }
    `;
        const functionNames = analyzer.extractFunctionNames(code);
        expect(functionNames).toContain('testFunction');
        expect(functionNames).toContain('arrowFunction');
        expect(functionNames).toContain('methodFunction');
    });
});
