import { normalizePath, relative } from "./normalize";
export class Node {
    constructor(absolutePath, parent = null) {
        /** If null, means the node is root */
        this.parent = null;
        /** If null, means this is a file. Other wise, this is a directory. */
        this.filesOrFolders = null;
        this.absolutePath = normalizePath(absolutePath);
        if (parent) {
            this.updateParent(parent);
        }
    }
    static From(files) {
        return _generateRootNode(files);
    }
    get isTheOnlyChildOfParent() {
        const parent = this.parent;
        if (!parent) {
            return false;
        }
        const f = parent.filesOrFolders;
        return f.length === 1 && f[0] === this;
    }
    get isFolder() {
        return this.filesOrFolders !== null;
    }
    get isFile() {
        return !this.isFolder;
    }
    _addFileOrFolder(...nodeList) {
        if (!this.filesOrFolders) {
            this.filesOrFolders = [];
        }
        nodeList.forEach((d) => {
            if (!this.filesOrFolders.includes(d)) {
                this.filesOrFolders.push(d);
            }
        });
        return this;
    }
    get relativePath() {
        return relative(this.parent?.absolutePath ?? "", this.absolutePath);
    }
    detachFromParent() {
        if (this.parent) {
            const i = this.parent.filesOrFolders.indexOf(this);
            this.parent.filesOrFolders.splice(i, 1);
            this.parent = null;
        }
        return this;
    }
    updateParent(node) {
        if (node === this.parent) {
            return false;
        }
        this.detachFromParent();
        this.parent = node;
        node._addFileOrFolder(this);
        return true;
    }
    combinePathAncestors() {
        let prt = this.parent;
        const prtToDetach = [];
        while (prt.isTheOnlyChildOfParent) {
            prt = prt.parent;
            prtToDetach.push(prt);
        }
        prtToDetach.forEach((d) => d.detach());
        return this;
    }
    toJSON() {
        const { absolutePath, isFile, isFolder, filesOrFolders } = this;
        return {
            relativePath: this.relativePath,
            absolutePath,
            isFile,
            isFolder,
            filesOrFolders: filesOrFolders?.map((d) => d.toJSON()),
        };
    }
    combinePath() {
        const allFiles = [];
        const addFile = (d) => {
            if (d.isFile) {
                allFiles.push(d);
                return;
            }
            d.filesOrFolders?.forEach(addFile);
        };
        this.filesOrFolders.forEach(addFile);
        allFiles.forEach((d) => {
            d.combinePathAncestors();
        });
        return this;
    }
    detach() {
        const p = this.parent;
        this.parent = null;
        if (p) {
            const i = p.filesOrFolders.findIndex((d) => d === this);
            if (i >= 0) {
                p.filesOrFolders.splice(i, 1);
            }
        }
        this.filesOrFolders?.forEach((d) => d.updateParent(p));
        this.filesOrFolders = null;
    }
}
function _generateRootNode(files) {
    const allFiles = files.map((d) => normalizePath(d));
    const root = new Node("");
    const nodeByPath = { "": root };
    allFiles.forEach((fileName) => {
        const xpath = fileName.split("/");
        let i = 0;
        let parent = root;
        while (i < xpath.length) {
            parent = getOrCreateFolderNode(xpath.slice(0, ++i).join("/"), parent);
        }
    });
    function getOrCreateFolderNode(p, parent) {
        if (!nodeByPath[p]) {
            nodeByPath[p] = new Node(p);
        }
        nodeByPath[p].updateParent(nodeByPath[parent.absolutePath]);
        return nodeByPath[p];
    }
    return root;
}
