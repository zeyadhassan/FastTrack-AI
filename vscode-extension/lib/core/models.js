"use strict";
/**
 * Node and edge type definitions for the FastTrack AI graph
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeType = exports.NodeType = void 0;
// Node Types
var NodeType;
(function (NodeType) {
    NodeType["Developer"] = "Developer";
    NodeType["AI_Suggestion"] = "AI_Suggestion";
    NodeType["CodeBlock"] = "CodeBlock";
    NodeType["File"] = "File";
    NodeType["Test"] = "Test";
    NodeType["Commit"] = "Commit";
})(NodeType || (exports.NodeType = NodeType = {}));
// Edge Types
var EdgeType;
(function (EdgeType) {
    EdgeType["Generated"] = "generated";
    EdgeType["Authored"] = "authored";
    EdgeType["Modified"] = "modified";
    EdgeType["LinkedTo"] = "linked_to";
    EdgeType["TestedBy"] = "tested_by";
    EdgeType["UnchangedFor"] = "unchanged_for";
})(EdgeType || (exports.EdgeType = EdgeType = {}));
