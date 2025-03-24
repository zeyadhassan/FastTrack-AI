"use strict";
/**
 * Main exports for the FastTrack AI core module
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.Storage = exports.Analyzer = exports.GraphManager = void 0;
// Export all models
__exportStar(require("./models"), exports);
// Export GraphManager class
var graph_1 = require("./graph");
Object.defineProperty(exports, "GraphManager", { enumerable: true, get: function () { return graph_1.GraphManager; } });
// Export Analyzer class
var analyzer_1 = require("./analyzer");
Object.defineProperty(exports, "Analyzer", { enumerable: true, get: function () { return analyzer_1.Analyzer; } });
// Export Storage class
var storage_1 = require("./storage");
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_1.Storage; } });
// Export version information
exports.VERSION = '0.1.0';
