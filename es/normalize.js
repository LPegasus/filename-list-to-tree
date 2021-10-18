export function normalizePath(pathname) {
    let path = pathname;
    if (path.indexOf("\\") > 0) {
        path = pathname.replace(/\\/g, "/");
    }
    path = path.replace(/\/$/, "");
    if (path === ".") {
        return "";
    }
    const xpath = path.split("/");
    let i = 0;
    const remain = [];
    while (i < xpath.length) {
        const c = xpath[i];
        i++;
        if (c === "..") {
            remain.pop();
        }
        else if (c !== ".") {
            remain.push(c);
        }
    }
    return remain.join("/");
}
export function relative(from, to) {
    if (from === "") {
        return normalizePath(to);
    }
    const xpathFrom = normalizePath(from).split("/");
    const xpathTo = normalizePath(to).split("/");
    let i = 0;
    while (i < xpathFrom.length) {
        const p1 = xpathFrom[i];
        const p2 = xpathTo[i];
        if (p1 !== p2) {
            break;
        }
        i++;
    }
    const rest = xpathFrom.length - i;
    const prefix = "../".repeat(rest);
    return prefix + xpathTo.slice(i).join("/");
}
