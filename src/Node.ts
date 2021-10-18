import { normalizePath, relative } from "./normalize";

export class Node {
  public static From(files: string[]): Node {
    return _generateRootNode(files);
  }

  /** If null, means the node is root */
  public parent: null | Node = null;

  /** If null, means this is a file. Other wise, this is a directory. */
  public filesOrFolders: null | Node[] = null;

  public absolutePath: string;

  public get isTheOnlyChildOfParent(): boolean {
    const parent = this.parent;
    if (!parent) {
      return false;
    }
    const f = parent.filesOrFolders;
    return f.length === 1 && f[0] === this;
  }

  public get isFolder(): boolean {
    return this.filesOrFolders !== null;
  }

  public get isFile(): boolean {
    return !this.isFolder;
  }

  private _addFileOrFolder(...nodeList: Node[]) {
    if (!this.filesOrFolders) {
      this.filesOrFolders = [];
    }
    nodeList.forEach((d) => {
      if (!this.filesOrFolders!.includes(d)) {
        this.filesOrFolders!.push(d);
      }
    });
    return this;
  }

  public get relativePath(): string {
    return relative(this.parent?.absolutePath ?? "", this.absolutePath);
  }

  public detachFromParent() {
    if (this.parent) {
      const i = this.parent.filesOrFolders!.indexOf(this);
      this.parent.filesOrFolders!.splice(i, 1);
      this.parent = null;
    }
    return this;
  }

  public updateParent(node: Node) {
    if (node === this.parent) {
      return false;
    }
    this.detachFromParent();
    this.parent = node;
    node._addFileOrFolder(this);
    return true;
  }

  public combinePathAncestors() {
    let prt: Node = this.parent;
    const prtToDetach: Node[] = [];
    while (prt.isTheOnlyChildOfParent) {
      prt = prt.parent;
      prtToDetach.push(prt);
    }
    prtToDetach.forEach((d) => d.detach());
    return this;
  }

  public toJSON() {
    const { absolutePath, isFile, isFolder, filesOrFolders } = this;
    return {
      relativePath: this.relativePath,
      absolutePath,
      isFile,
      isFolder,
      filesOrFolders: filesOrFolders?.map((d) => d.toJSON()),
    };
  }

  public combinePath() {
    const allFiles: Node[] = [];
    const addFile = (d: Node) => {
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

  public detach(): void {
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

  constructor(absolutePath: string, parent: Node | null = null) {
    this.absolutePath = normalizePath(absolutePath);
    if (parent) {
      this.updateParent(parent);
    }
  }
}

function _generateRootNode(files: string[]) {
  const allFiles = files.map((d) => normalizePath(d));
  const root = new Node("");
  const nodeByPath: Record<string, Node> = { "": root };
  allFiles.forEach((fileName) => {
    const xpath = fileName.split("/");
    let i = 0;
    let parent = root;
    while (i < xpath.length) {
      parent = getOrCreateFolderNode(xpath.slice(0, ++i).join("/"), parent);
    }
  });

  function getOrCreateFolderNode(p: string, parent: Node) {
    if (!nodeByPath[p]) {
      nodeByPath[p] = new Node(p);
    }
    nodeByPath[p].updateParent(nodeByPath[parent.absolutePath]);
    return nodeByPath[p];
  }
  return root;
}
