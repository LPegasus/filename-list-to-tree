export declare class Node {
    static From(files: string[]): Node;
    /** If null, means the node is root */
    parent: null | Node;
    /** If null, means this is a file. Other wise, this is a directory. */
    filesOrFolders: null | Node[];
    absolutePath: string;
    get isTheOnlyChildOfParent(): boolean;
    get isFolder(): boolean;
    get isFile(): boolean;
    private _addFileOrFolder;
    get relativePath(): string;
    detachFromParent(): this;
    updateParent(node: Node): boolean;
    combinePathAncestors(): this;
    toJSON(): any;
    combinePath(): this;
    detach(): void;
    constructor(absolutePath: string, parent?: Node | null);
}
