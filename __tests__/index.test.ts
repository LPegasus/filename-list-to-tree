import { normalizePath, relative } from "../src/normalize";
import { Node } from "../src/Node";

it("normalizePath", () => {
  expect(normalizePath(".")).toEqual("");
  expect(normalizePath("a/b/c/")).toEqual("a/b/c");
  expect(normalizePath("a/b/c")).toEqual("a/b/c");
  expect(normalizePath("/a/b/c")).toEqual("/a/b/c");
  expect(normalizePath("a/././b/./c/./")).toEqual("a/b/c");
  expect(normalizePath("a/../b/../c/")).toEqual("c");
  expect(normalizePath("a\\b\\.\\c\\")).toEqual("a/b/c");
});

it("relative", () => {
  expect(relative("a/b/", "a/b/c/d")).toEqual("c/d");
  expect(relative("a/c/d", "a/b")).toEqual("../../b");
  expect(relative("", ".gitignore")).toEqual(".gitignore");
});

it("generateRootNode", () => {
  const allFiles: string[] = [
    ".gitignore",
    "apps/infra/libs/package.json",
    "apps/infra/project1/src/App.tsx",
    "apps/infra/project1/src/index.tsx",
    "apps/infra/project1/package.json",
    "common/config/rush/.pnpmfile.cjs",
    "common/config/rush/common-version.json",
    "package.json",
  ];
  const root = Node.From(allFiles);
  expect(root.toJSON()).toMatchSnapshot();
});

it("generateRootNode combine path", () => {
  const allFiles: string[] = [
    ".gitignore",
    "apps/tools/tool1/tool2/package.json",
    "apps/infra/libs/package.json",
    "apps/infra/project1/src/App.tsx",
    "apps/infra/project1/src/index.tsx",
    "apps/infra/project1/package.json",
    "common/config/rush/.pnpmfile.cjs",
    "common/config/rush/common-version.json",
    "package.json",
  ];
  const root = Node.From(allFiles);
  const result = root.combinePath().toJSON();
  const assertFn = (d: Node) => {
    if (d.isFolder) {
      const folders = d.filesOrFolders.filter((dd) => dd.isFolder);
      expect(d.filesOrFolders.length > 1 || folders.length === 0).toBe(true);
      folders.forEach((f) => assertFn(f));
    }
  };
  result.filesOrFolders.forEach(assertFn);
  expect(result).toMatchSnapshot();
});
