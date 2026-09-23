// ==========================================
// TERMINAL SANDBOX, VFS & EXTENDED UNIX ENGINE
// ==========================================
const VFS_STORAGE_KEY = 'vaii_terminal_vfs';
const HISTORY_STORAGE_KEY = 'vaii_terminal_history';
const PKG_STORAGE_KEY = 'vaii_terminal_pkgs';

const SYSTEM_INIT_TIME = Date.now() - 86400000;

export let termEnvironment = {
    "USER": "guest",
    "HOSTNAME": "vaii",
    "HOME": "/home/guest",
    "SHELL": "/bin/sh",
    "PATH": "/bin:/usr/bin",
    "TERM": "xterm-256color"
};

export let termAliases = {};
export const terminalStartTime = Date.now();

let termCurrentPath = "/home/guest";
let termHistoryIndex = -1;

let heredocMode = false;
let heredocDelimiter = "EOF";
let heredocBuffer = [];
let heredocTargetFile = null;
let heredocAppend = false;

let pythonReplMode = false;
let pythonScope = {};

let nanoMode = false;
let nanoTargetFile = null;
let nanoBuffer = [];

export function getDefaultVFS() {
    return {
        "/": { type: "dir", children: ["home", "bin", "usr", "etc", "var", "tmp"], mtime: SYSTEM_INIT_TIME },
        "/home": { type: "dir", children: ["guest"], mtime: SYSTEM_INIT_TIME },
        "/home/guest": { type: "dir", children: ["readme.txt", "welcome.sh"], mtime: SYSTEM_INIT_TIME },
        "/home/guest/readme.txt": { type: "file", content: "Welcome to VAII Unix 3.0!\nInstall tools with: apt install python3 git\nTry: python3, git init, neofetch, pipes (|), &&, ||, ;", mtime: SYSTEM_INIT_TIME },
        "/home/guest/welcome.sh": { type: "file", content: "echo 'VAII Matrix Engine Online!'", mtime: SYSTEM_INIT_TIME },
        "/bin": { type: "dir", children: ["sh", "echo", "ls", "cat", "pwd", "apt", "pkg"], mtime: SYSTEM_INIT_TIME },
        "/usr": { type: "dir", children: ["bin"], mtime: SYSTEM_INIT_TIME },
        "/usr/bin": { type: "dir", children: ["python3", "python"], mtime: SYSTEM_INIT_TIME },
        "/etc": { type: "dir", children: ["os-release", "hosts"], mtime: SYSTEM_INIT_TIME },
        "/etc/os-release": { type: "file", content: "NAME=\"VAII Linux-Subsystem\"\nVERSION=\"3.0.0 LTS\"\nID=vaii\nPRETTY_NAME=\"VAII Unix Sandbox 3.0\"", mtime: SYSTEM_INIT_TIME },
        "/etc/hosts": { type: "file", content: "127.0.0.1 localhost\n::1 localhost ip6-localhost", mtime: SYSTEM_INIT_TIME },
        "/var": { type: "dir", children: ["log"], mtime: SYSTEM_INIT_TIME },
        "/var/log": { type: "dir", children: ["syslog"], mtime: SYSTEM_INIT_TIME },
        "/var/log/syslog": { type: "file", content: "[SYSTEM_BOOT] VFS mounted successfully.\n[APT] Ready for packages.", mtime: SYSTEM_INIT_TIME },
        "/tmp": { type: "dir", children: [], mtime: SYSTEM_INIT_TIME }
    };
}

export function getVFS() {
    try {
        const stored = JSON.parse(localStorage.getItem(VFS_STORAGE_KEY));
        if (stored && typeof stored === 'object' && stored["/"]) {
            Object.keys(stored).forEach(k => {
                if (!stored[k].mtime) stored[k].mtime = stored[k].ctime || SYSTEM_INIT_TIME;
            });
            return stored;
        }
        return getDefaultVFS();
    } catch (e) {
        return getDefaultVFS();
    }
}

export function saveVFS(vfs) {
    localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(vfs));
}

export function getInstalledPackages() {
    try {
        return JSON.parse(localStorage.getItem(PKG_STORAGE_KEY)) || ["coreutils", "apt", "bash", "python3", "python"];
    } catch (e) {
        return ["coreutils", "apt", "bash", "python3", "python"];
    }
}

export function saveInstalledPackages(pkgs) {
    localStorage.setItem(PKG_STORAGE_KEY, JSON.stringify(pkgs));
}

export function getTerminalHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

export function saveTerminalHistory(history) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(-100)));
}

export function normalizePath(path) {
    if (!path) return "/";
    const parts = path.split('/').filter(Boolean);
    const resolved = [];
    for (const part of parts) {
        if (part === '.') continue;
        if (part === '..') {
            resolved.pop();
        } else {
            resolved.push(part);
        }
    }
    return '/' + resolved.join('/');
}

export function resolvePath(target) {
    if (!target || target === ".") return termCurrentPath;
    if (target.startsWith("~")) target = "/home/guest" + target.slice(1);
    if (target.startsWith("/")) return normalizePath(target);
    const combined = (termCurrentPath === "/") ? `/${target}` : `${termCurrentPath}/${target}`;
    return normalizePath(combined);
}

export function triggerBrowserDownload(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 1500);
}

export function parseCommandPipeline(input) {
    const tokens = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;

    for (let i = 0; i < input.length; i++) {
        const c = input[i];
        if (c === "'" && !inDouble) {
            inSingle = !inSingle;
            current += c;
        } else if (c === '"' && !inSingle) {
            inDouble = !inDouble;
            current += c;
        } else if (!inSingle && !inDouble) {
            if (c === ';') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: ';' });
                current = "";
            } else if (c === '&' && input[i + 1] === '&') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '&&' });
                current = "";
                i++;
            } else if (c === '|' && input[i + 1] === '|') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '||' });
                current = "";
                i++;
            } else if (c === '|') {
                if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
                tokens.push({ type: 'op', val: '|' });
                current = "";
            } else {
                current += c;
            }
        } else {
            current += c;
        }
    }
    if (current.trim()) tokens.push({ type: 'cmd', val: current.trim() });
    return tokens;
}

export function executePythonCode(codeStr, logs) {
    if (!codeStr || !codeStr.trim()) return;

    try {
        const stdout = [];
        const pyPrint = (...args) => {
            stdout.push(args.map(a => typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)).join(" "));
        };

        const context = {
            print: pyPrint,
            len: (obj) => obj ? (obj.length ?? Object.keys(obj).length) : 0,
            range: (start, stop, step = 1) => {
                if (stop === undefined) { stop = start; start = 0; }
                const arr = [];
                for (let i = start; step > 0 ? i < stop : i > stop; i += step) arr.push(i);
                return arr;
            },
            str: (v) => String(v),
            int: (v) => parseInt(v, 10) || 0,
            float: (v) => parseFloat(v) || 0.0,
            bool: (v) => Boolean(v),
            True: true,
            False: false,
            None: null,
            ...pythonScope
        };

        const lines = codeStr.replace(/\r\n/g, "\n").split("\n");
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith("#")) return "";

            let l = line;
            l = l.replace(/(['"])(.*?)\1/g, (match) => match);
            l = l.replace(/\bTrue\b/g, "true");
            l = l.replace(/\bFalse\b/g, "false");
            l = l.replace(/\bNone\b/g, "null");

            // Python f-strings f"hello {name}" -> `hello ${name}`
            l = l.replace(/\bf(["'])(.*?)\1/g, '`$2`');

            // Handle bare single line expression in REPL
            if (!l.includes("=") && !l.includes("print(") && !l.startsWith("def ") && !l.startsWith("for ") && !l.startsWith("if ") && !l.startsWith("while ")) {
                if (trimmed.length > 0 && !trimmed.endsWith(";")) {
                    return `__last_eval = (${l});`;
                }
            }

            // Assign variables directly to context scope
            const assignMatch = l.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
            if (assignMatch && !l.startsWith("def ")) {
                return `this.${assignMatch[1]} = ${assignMatch[2]};`;
            }

            return l;
        });

        const scriptBody = `
            let __last_eval = undefined;
            ${processedLines.join("\n")};
            return __last_eval;
        `;

        const runner = new Function("context", `
            with (context) {
                ${scriptBody}
            }
        `);

        const lastEval = runner.call(pythonScope, context);
        Object.assign(pythonScope, context);

        if (stdout.length > 0) {
            logs.innerHTML += stdout.join("\n") + "\n";
        }
        if (lastEval !== undefined && stdout.length === 0) {
            logs.innerHTML += `<span style="color:#3572A5;">${typeof lastEval === 'object' ? JSON.stringify(lastEval) : lastEval}</span>\n`;
        }
    } catch (e) {
        logs.innerHTML += `<span style="color:#f85149;">Traceback (most recent call last):\n  File "&lt;stdin&gt;", line 1, in &lt;module&gt;\n${e.name}: ${e.message}</span>\n`;
    }
}

export function executeShellCommand(cmdStr, logs, container, prompt, stdIn = "", captureOutput = false) {
    if (!cmdStr) return { success: true, output: "" };

    let outputBuffer = "";
    const printLog = (str, rawHtml = false) => {
        if (captureOutput) {
            outputBuffer += str;
        } else {
            logs.innerHTML += rawHtml ? str : `${str}`;
        }
    };

    let expandedCmd = cmdStr;
    const firstWord = cmdStr.split(" ")[0];
    if (termAliases[firstWord]) {
        expandedCmd = cmdStr.replace(firstWord, termAliases[firstWord]);
    }

    const heredocMatch = expandedCmd.match(/^cat\s*<<\s*['"]?([a-zA-Z0-9_-]+)['"]?\s*(>>|>)\s*([^\s]+)/i);
    if (heredocMatch) {
        heredocDelimiter = heredocMatch[1];
        heredocAppend = heredocMatch[2] === ">>";
        heredocTargetFile = heredocMatch[3];
        heredocBuffer = [];
        heredocMode = true;
        if (prompt) {
            prompt.innerText = ">";
            prompt.style.color = "#e3b341";
        }
        logs.innerHTML += `<span style="color:#8b949e;">[Heredoc input started. Enter '${heredocDelimiter}' on a new line to ${heredocAppend ? 'append to' : 'write to'} ${heredocTargetFile}, or 'cancel']</span>\n`;
        return { success: true, output: "" };
    }

    const echoRedirectMatch = expandedCmd.match(/^echo\s+([\s\S]+?)\s*(>>|>)\s*([^\s]+)$/i);
    if (echoRedirectMatch) {
        let content = echoRedirectMatch[1].trim();
        const isAppend = echoRedirectMatch[2] === ">>";
        const filename = echoRedirectMatch[3].trim();

        if ((content.startsWith("'") && content.endsWith("'")) || (content.startsWith('"') && content.endsWith('"'))) {
            content = content.slice(1, -1);
        }

        let vfs = getVFS();
        const filePath = resolvePath(filename);
        const pureName = filePath.split('/').filter(Boolean).pop();
        const parentDir = normalizePath(filePath.substring(0, filePath.lastIndexOf('/')) || '/');

        const existingContent = (isAppend && vfs[filePath]?.content) ? vfs[filePath].content + "\n" : "";
        vfs[filePath] = { type: "file", content: existingContent + content, mtime: Date.now() };

        if (vfs[parentDir] && !vfs[parentDir].children.includes(pureName)) {
            vfs[parentDir].children.push(pureName);
        }
        saveVFS(vfs);
        return { success: true, output: "" };
    }

    const parts = expandedCmd.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    let vfs = getVFS();
    let pkgs = getInstalledPackages();

    switch (cmd) {
        case "exit":
        case "logout":
            container.style.display = "none";
            const hubInput = document.getElementById('hub-input');
            if (hubInput) hubInput.focus();
            return { success: true, output: "" };

        case "help":
            printLog(`Extended Unix Shell Utilities & Package Engine:
  <span style="color:#58a6ff;">apt / pkg install &lt;pkg&gt;</span> Install packages (python3, git, node, neofetch, cowsay, nano, htop)
  <span style="color:#58a6ff;">python3 [file.py]</span>       Interactive REPL, run file, or python3 -c "code"
  <span style="color:#58a6ff;">git &lt;init/status/add/commit/log/clone&gt;</span> Version control engine
  <span style="color:#58a6ff;">nano &lt;file&gt;</span>             Simple text editor (:wq to save, :q to quit)
  <span style="color:#58a6ff;">ls [-l]</span>                 List directory entries
  <span style="color:#58a6ff;">tree [path]</span>             Directory tree hierarchy
  <span style="color:#58a6ff;">pwd / cd &lt;dir&gt;</span>          Directory navigation
  <span style="color:#58a6ff;">cat / head / tail</span>       File inspection
  <span style="color:#58a6ff;">grep / wc / diff</span>        Text manipulation & pipes
  <span style="color:#58a6ff;">curl / wget &lt;url&gt;</span>       HTTP fetch
  <span style="color:#58a6ff;">Separators</span>              cmd1 ; cmd2 | cmd1 && cmd2 | cmd1 || cmd2 | cmd1 | cmd2\n`, true);
            return { success: true, output: outputBuffer };

        case "apt":
        case "apt-get":
        case "pkg":
            if (args[0] === "install") {
                const targetPkg = (args[1] || "").toLowerCase();
                const availablePkgs = {
                    "python3": ["python3", "python", "py"],
                    "python": ["python3", "python", "py"],
                    "git": ["git"],
                    "node": ["node", "nodejs", "npm"],
                    "nodejs": ["node", "nodejs", "npm"],
                    "neofetch": ["neofetch"],
                    "cowsay": ["cowsay"],
                    "nano": ["nano"],
                    "htop": ["htop"],
                    "gcc": ["gcc", "g++"]
                };

                if (!targetPkg) {
                    printLog(`Usage: ${cmd} install <package_name>\nAvailable packages: python3, git, node, neofetch, cowsay, nano, htop, gcc\n`);
                    return { success: false, output: outputBuffer };
                }

                if (availablePkgs[targetPkg]) {
                    printLog(`<span style="color:#8b949e;">Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${targetPkg}\nUnpacking ${targetPkg} (3.11.0-vaii)... Done\nSetting up ${targetPkg} (3.11.0-vaii)... Done</span>\n<span style="color:#7ee787;">Successfully installed ${targetPkg}.</span>\n`, true);
                    
                    if (!pkgs.includes(targetPkg)) {
                        pkgs.push(targetPkg);
                        saveInstalledPackages(pkgs);
                    }

                    if (!vfs["/usr/bin"].children.includes(targetPkg)) {
                        vfs["/usr/bin"].children.push(targetPkg);
                    }
                    vfs[`/usr/bin/${targetPkg}`] = { type: "file", content: `#!/bin/sh\n# ${targetPkg} binary package`, mtime: Date.now() };
                    saveVFS(vfs);
                    return { success: true, output: outputBuffer };
                } else {
                    printLog(`<span style="color:#f85149;">E: Unable to locate package ${targetPkg}</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
            } else if (args[0] === "list" || args[0] === "search") {
                printLog(`Installed packages: ${pkgs.join(", ")}\nAvailable for install: python3, git, node, neofetch, cowsay, nano, htop, gcc\n`);
                return { success: true, output: outputBuffer };
            } else {
                printLog(`Usage: ${cmd} install <pkg> | ${cmd} list\n`);
                return { success: true, output: outputBuffer };
            }

        case "python":
        case "python3":
        case "py":
            if (!pkgs.includes("python3") && !pkgs.includes("python")) {
                printLog(`<span style="color:#f85149;">python3: command not found. Install it with: <span style="color:#58a6ff;">apt install python3</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }

            // Handle inline command flag: python3 -c "print('hello')"
            if (args[0] === "-c") {
                const cIdx = expandedCmd.indexOf("-c");
                let codeStr = expandedCmd.slice(cIdx + 2).trim();
                if ((codeStr.startsWith("'") && codeStr.endsWith("'")) || (codeStr.startsWith('"') && codeStr.endsWith('"'))) {
                    codeStr = codeStr.slice(1, -1);
                }
                executePythonCode(codeStr, logs);
                return { success: true, output: outputBuffer };
            }

            // Handle executing a python file: python3 script.py
            if (args[0]) {
                const pyFile = resolvePath(args[0]);
                if (vfs[pyFile] && vfs[pyFile].type === "file") {
                    executePythonCode(vfs[pyFile].content, logs);
                    return { success: true, output: outputBuffer };
                } else {
                    printLog(`<span style="color:#f85149;">python3: can't open file '${args[0]}': [Errno 2] No such file</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
            } else {
                pythonReplMode = true;
                prompt.innerText = ">>>";
                prompt.style.color = "#3572A5";
                printLog(`Python 3.11.0 (vaii-subsystem, ${new Date().toLocaleDateString()})\nType "help", "copyright", "credits" or "license" for more information.\nType exit() or quit() to return to shell.\n`);
                return { success: true, output: outputBuffer };
            }

        case "node":
        case "nodejs":
            if (!pkgs.includes("node") && !pkgs.includes("nodejs")) {
                printLog(`<span style="color:#f85149;">node: command not found. Install it with: <span style="color:#58a6ff;">apt install node</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }
            if (args[0]) {
                const jsFile = resolvePath(args[0]);
                if (vfs[jsFile] && vfs[jsFile].type === "file") {
                    try {
                        let res = window.eval(vfs[jsFile].content);
                        if (res !== undefined) printLog(`${res}\n`);
                    } catch (err) {
                        printLog(`<span style="color:#f85149;">NodeError: ${err.message}</span>\n`, true);
                    }
                    return { success: true, output: outputBuffer };
                }
            }
            printLog(`Welcome to Node.js v20.10.0.\nUse 'js <expr>' or 'node <file.js>' to execute.\n`);
            return { success: true, output: outputBuffer };

        case "git":
            if (!pkgs.includes("git")) {
                printLog(`<span style="color:#f85149;">git: command not found. Install it with: <span style="color:#58a6ff;">apt install git</span></span>\n`, true);
                return { success: false, output: outputBuffer };
            }
            const gitSub = args[0]?.toLowerCase();
            const gitConfigPath = resolvePath(".git");

            if (gitSub === "init") {
                vfs[resolvePath(".git")] = { type: "dir", children: ["config", "HEAD"], mtime: Date.now() };
                vfs[resolvePath(".git/HEAD")] = { type: "file", content: "ref: refs/heads/main\n", mtime: Date.now() };
                vfs[resolvePath(".git/config")] = { type: "file", content: "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n", mtime: Date.now() };
                const curDir = vfs[termCurrentPath];
                if (curDir && !curDir.children.includes(".git")) curDir.children.push(".git");
                saveVFS(vfs);
                printLog(`<span style="color:#7ee787;">Initialized empty Git repository in ${termCurrentPath}/.git/</span>\n`, true);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "status") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository (or any of the parent directories): .git</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const staged = vfs[resolvePath(".git/staged")]?.content ? vfs[resolvePath(".git/staged")].content.split("\n") : [];
                printLog(`On branch main\n${staged.length > 0 ? `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\t<span style="color:#7ee787;">${staged.join("\n\t")}</span>\n` : "nothing to commit, working tree clean\n"}`, true);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "add") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const targetAdd = args[1] || ".";
                vfs[resolvePath(".git/staged")] = { type: "file", content: targetAdd, mtime: Date.now() };
                saveVFS(vfs);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "commit") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const mIdx = args.indexOf("-m");
                const commitMsg = (mIdx !== -1 && args[mIdx + 1]) ? args.slice(mIdx + 1).join(" ").replace(/^['"]|['"]$/g, '') : "Update files";
                const commitHash = Math.random().toString(16).substring(2, 9);
                const logEntry = `commit ${commitHash}\nAuthor: ${termEnvironment.USER} <guest@vaii.local>\nDate:   ${new Date().toUTCString()}\n\n    ${commitMsg}\n\n`;
                const oldLog = vfs[resolvePath(".git/log")]?.content || "";
                vfs[resolvePath(".git/log")] = { type: "file", content: logEntry + oldLog, mtime: Date.now() };
                delete vfs[resolvePath(".git/staged")];
                saveVFS(vfs);
                printLog(`[main ${commitHash}] ${commitMsg}\n 1 file changed, ${Math.floor(Math.random() * 20) + 1} insertions(+)\n`);
                return { success: true, output: outputBuffer };
            } else if (gitSub === "log") {
                if (!vfs[gitConfigPath]) {
                    printLog(`<span style="color:#f85149;">fatal: not a git repository</span>\n`, true);
                    return { success: false, output: outputBuffer };
                }
                const logContent = vfs[resolvePath(".git/log")]?.content;
                printLog(logContent || "fatal: your current branch 'main' does not have any commits yet\n");
                return { success: true, output: outputBuffer };
            } else if (gitSub === "clone") {
                const repoUrl = args[1];
                if (!repoUrl) {
                    printLog(`Usage: git clone <repository_url>\n`);
                    return { success: false, output: outputBuffer };
                }
                const folderName = repoUrl.split("/").pop().replace(".git", "");
                printLog(`Cloning into '${folderName}'...\nremote: Enumerating objects: 128, done.\nremote: Total 128 (delta 32), reused 128\nReceiving objects: 100% (128/128), done.\n`);
                const newRepoPath = resolvePath(folderName);
                vfs[newRepoPath] = { type: "dir", children: [".git", "README.md"], mtime: Date.now() };
                vfs[`${newRepoPath}/README.md`] = { type: "file", content: `# ${folderName}\nCloned from ${repoUrl}`, mtime: Date.now() };
                vfs[`${newRepoPath}/.git`] = { type: "dir", children: ["HEAD"], mtime: Date.now() };
                const parent = vfs[termCurrentPath];
                if (parent && !parent.children.includes(folderName)) parent.children.push(folderName);
                saveVFS(vfs);
                return { success: true, output: outputBuffer };
            } else {
                printLog(`git: '${args.join(" ")}' is not a git command. See 'git --help'.\n`);
                return { success: true, output: outputBuffer };
            }

        case "nano":
            if (!args[0]) {
                printLog(`Usage: nano <filename>\n`);
                return { success: false, output: outputBuffer };
            }
            nanoMode = true;
            nanoTargetFile = args[0];
            const existingNanoPath = resolvePath(nanoTargetFile);
            nanoBuffer = vfs[existingNanoPath]?.content ? vfs[existingNanoPath].content.split("\n") : [];
            prompt.innerText = `nano:${nanoTargetFile}>`;
            prompt.style.color = "#e3b341";
            printLog(`[ GNU nano 7.2 | Type lines to append. Type ':wq' to save & exit, ':q' to abort without saving ]\n`);
            if (nanoBuffer.length > 0) printLog(`--- Current Content ---\n${nanoBuffer.join("\n")}\n--- End Content ---\n`);
            return { success: true, output: outputBuffer };

        case "neofetch":
            printLog(`<span style="color:#58a6ff;">
       /\\         ${termEnvironment.USER}@${termEnvironment.HOSTNAME}
      /  \\        --------------------
     /\\   \\       OS: VAII Linux Subsystem x86_64
    /      \\      Host: Web Browser Virtual Sandbox
   /   ,,   \\     Kernel: 6.6.0-vaii-posix
  /   |  |  -\\    Uptime: ${Math.floor((Date.now() - terminalStartTime) / 1000)}s
 /_-''    ''-_\\   Shell: vaii-sh 3.0
                  Packages: ${pkgs.length} (pkg)
                  Memory: 512MiB / 2048MiB
</span>\n`, true);
            return { success: true, output: outputBuffer };

        case "cowsay":
            const cowMsg = stdIn || args.join(" ") || "Moo! VAII Terminal is awesome!";
            const border = "-".repeat(cowMsg.length + 2);
            printLog(` ${border}\n< ${cowMsg} >\n ${border}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||\n`);
            return { success: true, output: outputBuffer };

        case "htop":
            printLog(`  CPU[||||||||||               32.4%]   Tasks: 3, 1 thr; 1 running
  Mem[|||||||||||||||        142/2048MB]   Load average: 0.12 0.05 0.01
  Swp[                         0/1024MB]   Uptime: ${Math.floor((Date.now() - terminalStartTime) / 1000)}s

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
    1 guest      20   0  120M  12M   4M S  0.0  0.6  0:00.08 init
   14 guest      20   0  140M  18M   6M S  0.1  0.9  0:00.14 vaii-sh
  210 guest      20   0  180M  32M   8M R 32.0  1.5  0:00.04 htop\n`);
            return { success: true, output: outputBuffer };

        case "clear":
            logs.innerHTML = "";
            return { success: true, output: "" };

        case "pwd":
            printLog(`${termCurrentPath}\n`);
            return { success: true, output: `${termCurrentPath}\n` };

        case "ls":
            const isLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
            const curDir = vfs[termCurrentPath];
            if (!curDir || curDir.type !== "dir") {
                printLog(`<span style="color:#f85149;">Error: Directory missing (${termCurrentPath}). Resetting to root.</span>\n`, true);
                termCurrentPath = "/";
                return { success: false, output: "" };
            }
            if (isLong) {
                let totalLines = `total ${curDir.children.length}\n`;
                curDir.children.forEach(name => {
                    const full = resolvePath(name);
                    const n = vfs[full];
                    const isDir = n?.type === "dir";
                    const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--";
                    const size = isDir ? 4096 : (n?.content?.length || 0);
                    const timestamp = n?.mtime || SYSTEM_INIT_TIME;
                    const dateStr = new Date(timestamp).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false 
                    });
                    totalLines += `${perms} 1 ${termEnvironment.USER} ${termEnvironment.USER} ${String(size).padStart(6, ' ')} ${dateStr} ${isDir ? `<span style="color:#58a6ff;font-weight:bold;">${name}/</span>` : name}\n`;
                });
                printLog(totalLines, true);
                return { success: true, output: totalLines };
            } else {
                const listing = curDir.children.map(name => {
                    const full = resolvePath(name);
                    return vfs[full]?.type === "dir" ? `<span style="color:#58a6ff; font-weight:bold;">${name}/</span>` : name;
                }).join("  ");
                printLog(`${listing || "(empty directory)"}\n`, true);
                return { success: true, output: curDir.children.join("\n") + "\n" };
            }

        case "tree":
            const treePath = args[0] ? resolvePath(args[0]) : termCurrentPath;
            if (!vfs[treePath] || vfs[treePath].type !== "dir") {
                printLog(`<span style="color:#f85149;">tree: [${args[0] || termCurrentPath}]: No such directory</span>\n`, true);
                return { success: false, output: "" };
            }
            const treeOut = `<span style="color:#58a6ff;font-weight:bold;">${treePath}</span>\n` + (renderTreeHelper(vfs, treePath) || "└── (empty)\n");
            printLog(treeOut, true);
            return { success: true, output: treeOut };

        case "cd":
            const targetDir = args[0] ? resolvePath(args[0]) : "/home/guest";
            if (vfs[targetDir] && vfs[targetDir].type === "dir") {
                termCurrentPath = targetDir;
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">cd: no such file or directory: ${args[0] || ""}</span>\n`, true);
                return { success: false, output: "" };
            }

        case "cat":
            const catTarget = args[0] ? resolvePath(args[0]) : null;
            const contentToDisplay = catTarget ? vfs[catTarget]?.content : stdIn;
            if (contentToDisplay !== undefined) {
                printLog(`${contentToDisplay}\n`);
                return { success: true, output: `${contentToDisplay}\n` };
            } else {
                printLog(`<span style="color:#f85149;">cat: ${args[0] || "stdin"}: No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "head":
            let headLines = 10;
            let hFile = args[0];
            if (args[0] === "-n" && args[1]) { headLines = parseInt(args[1], 10) || 10; hFile = args[2]; }
            const hText = hFile ? vfs[resolvePath(hFile)]?.content : stdIn;
            if (hText !== undefined) {
                const res = hText.split("\n").slice(0, headLines).join("\n");
                printLog(`${res}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">head: cannot open '${hFile || "stdin"}'</span>\n`, true);
            return { success: false, output: "" };

        case "tail":
            let tailLines = 10;
            let tFile = args[0];
            if (args[0] === "-n" && args[1]) { tailLines = parseInt(args[1], 10) || 10; tFile = args[2]; }
            const tText = tFile ? vfs[resolvePath(tFile)]?.content : stdIn;
            if (tText !== undefined) {
                const res = tText.split("\n").slice(-tailLines).join("\n");
                printLog(`${res}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">tail: cannot open '${tFile || "stdin"}'</span>\n`, true);
            return { success: false, output: "" };

        case "grep":
            const gPattern = args[0]?.replace(/^['"]|['"]$/g, '');
            const gFile = args[1] ? resolvePath(args[1]) : null;
            const gContent = gFile ? vfs[gFile]?.content : stdIn;
            if (gPattern && gContent !== undefined) {
                const matched = gContent.split("\n").filter(l => l.includes(gPattern));
                const res = matched.join("\n");
                printLog(`${res ? res + "\n" : ""}`);
                return { success: matched.length > 0, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">grep: pattern or input missing</span>\n`, true);
            return { success: false, output: "" };

        case "wc":
            const wcFile = args[args.length - 1];
            const wcText = (wcFile && vfs[resolvePath(wcFile)]) ? vfs[resolvePath(wcFile)].content : stdIn;
            if (wcText !== undefined) {
                const lines = wcText.split("\n").filter(Boolean).length;
                const words = wcText.trim() ? wcText.trim().split(/\s+/).length : 0;
                const chars = wcText.length;
                let res = `  ${lines}  ${words}  ${chars}`;
                if (args.includes("-l")) res = `${lines}`;
                else if (args.includes("-w")) res = `${words}`;
                else if (args.includes("-c")) res = `${chars}`;
                printLog(`${res} ${wcFile || ""}\n`);
                return { success: true, output: `${res}\n` };
            }
            printLog(`<span style="color:#f85149;">wc: file not found</span>\n`, true);
            return { success: false, output: "" };

        case "stat":
            if (!args[0]) {
                printLog(`Usage: stat <file/dir>\n`);
                return { success: false, output: outputBuffer };
            }
            const statPath = resolvePath(args[0]);
            if (vfs[statPath]) {
                const node = vfs[statPath];
                const res = `  File: ${args[0]}\n  Size: ${node.type === "file" ? node.content.length : 4096} bytes\n  Type: ${node.type === "file" ? "regular file" : "directory"}\nModify: ${new Date(node.mtime || SYSTEM_INIT_TIME).toISOString()}\n`;
                printLog(res);
                return { success: true, output: res };
            } else {
                printLog(`<span style="color:#f85149;">stat: cannot stat '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "download":
            if (!args[0]) {
                printLog(`Usage: download <filename>\n`);
                return { success: false, output: "" };
            }
            const dlPath = resolvePath(args[0]);
            if (vfs[dlPath] && vfs[dlPath].type === "file") {
                const pureName = args[0].split('/').filter(Boolean).pop();
                triggerBrowserDownload(pureName, vfs[dlPath].content);
                printLog(`<span style="color:#7ee787;">Downloaded '${pureName}' successfully.</span>\n`, true);
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">download: '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "touch":
            if (!args[0]) return { success: false, output: "" };
            const newFile = resolvePath(args[0]);
            if (!vfs[newFile]) {
                vfs[newFile] = { type: "file", content: "", mtime: Date.now() };
                const fileNameOnly = newFile.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(newFile.substring(0, newFile.lastIndexOf('/')) || '/');
                if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                    vfs[parentDir].children.push(fileNameOnly);
                }
                saveVFS(vfs);
            } else {
                vfs[newFile].mtime = Date.now();
                saveVFS(vfs);
            }
            return { success: true, output: "" };

        case "mkdir":
            if (!args[0]) return { success: false, output: "" };
            const newDir = resolvePath(args[0]);
            if (!vfs[newDir]) {
                vfs[newDir] = { type: "dir", children: [], mtime: Date.now() };
                const dirNameOnly = newDir.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(newDir.substring(0, newDir.lastIndexOf('/')) || '/');
                if (vfs[parentDir] && !vfs[parentDir].children.includes(dirNameOnly)) {
                    vfs[parentDir].children.push(dirNameOnly);
                }
                saveVFS(vfs);
            } else {
                vfs[newDir].mtime = Date.now();
                saveVFS(vfs);
            }
            return { success: true, output: "" };

        case "rm":
            if (!args[0]) return { success: false, output: "" };
            const rmTarget = resolvePath(args[0]);
            if (vfs[rmTarget]) {
                delete vfs[rmTarget];
                const targetNameOnly = rmTarget.split('/').filter(Boolean).pop();
                const parentDir = normalizePath(rmTarget.substring(0, rmTarget.lastIndexOf('/')) || '/');
                if (vfs[parentDir]) {
                    vfs[parentDir].children = vfs[parentDir].children.filter(c => c !== targetNameOnly);
                }
                saveVFS(vfs);
                return { success: true, output: "" };
            } else {
                printLog(`<span style="color:#f85149;">rm: cannot remove '${args[0]}': No such file</span>\n`, true);
                return { success: false, output: "" };
            }

        case "echo":
            let fullEcho = args.join(" ");
            if ((fullEcho.startsWith("'") && fullEcho.endsWith("'")) || (fullEcho.startsWith('"') && fullEcho.endsWith('"'))) {
                fullEcho = fullEcho.slice(1, -1);
            }
            printLog(`${fullEcho}\n`);
            return { success: true, output: `${fullEcho}\n` };

        case "js":
            try {
                const evalCode = args.join(" ");
                const res = window.eval(evalCode);
                printLog(`<span style="color:#bc8cff;">${res !== undefined ? res : "undefined"}</span>\n`, true);
                return { success: true, output: `${res}\n` };
            } catch (err) {
                printLog(`<span style="color:#f85149;">EvalError: ${err.message}</span>\n`, true);
                return { success: false, output: "" };
            }

        case "whoami":
            printLog(`${termEnvironment.USER}\n`);
            return { success: true, output: `${termEnvironment.USER}\n` };

        case "uname":
            const unameStr = args.includes("-a") ? `Linux ${termEnvironment.HOSTNAME} 6.6.0-vaii-subsystem #1 SMP PREEMPT_DYNAMIC JavaScript/VFS x86_64 GNU/Linux\n` : `Linux\n`;
            printLog(unameStr);
            return { success: true, output: unameStr };

        case "resetfs":
            localStorage.removeItem(VFS_STORAGE_KEY);
            localStorage.removeItem(PKG_STORAGE_KEY);
            termCurrentPath = "/home/guest";
            pythonScope = {};
            printLog(`Virtual filesystem and package registries reset to factory defaults.\n`);
            return { success: true, output: "" };

        default:
            printLog(`<span style="color:#f85149;">command not found: ${cmd}</span>\n`, true);
            return { success: false, output: "" };
    }
}

function renderTreeHelper(vfs, dirPath, prefix = "") {
    const dir = vfs[dirPath];
    if (!dir || dir.type !== "dir") return "";
    let output = "";
    const children = dir.children || [];
    children.forEach((childName, idx) => {
        const isLast = idx === children.length - 1;
        const pointer = isLast ? "└── " : "├── ";
        const childPath = dirPath === "/" ? `/${childName}` : `${dirPath}/${childName}`;
        const node = vfs[childPath];
        const isDir = node?.type === "dir";
        output += `${prefix}${pointer}${isDir ? `<span style="color:#58a6ff;font-weight:bold;">${childName}/</span>` : childName}\n`;
        if (isDir) {
            output += renderTreeHelper(vfs, childPath, prefix + (isLast ? "    " : "│   "));
        }
    });
    return output;
}

export function runCommandPipeline(rawCmd, logs, termContainer, prompt) {
    const tokens = parseCommandPipeline(rawCmd);
    let lastSuccess = true;
    let pipeInput = "";

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'op') {
            if (token.val === '&&' && !lastSuccess) {
                i++;
                continue;
            }
            if (token.val === '||' && lastSuccess) {
                i++;
                continue;
            }
            if (token.val === '|') {
                continue;
            }
            if (token.val === ';') {
                pipeInput = "";
                continue;
            }
        } else if (token.type === 'cmd') {
            const isPiped = (tokens[i + 1] && tokens[i + 1].val === '|');
            const result = executeShellCommand(token.val, logs, termContainer, prompt, pipeInput, isPiped);
            lastSuccess = result.success;
            pipeInput = result.output || "";
        }
    }
}

export function launchTerminalSandbox() {
    let termContainer = document.getElementById('vaii-terminal-overlay');
    if (!termContainer) {
        termContainer = document.createElement('div');
        termContainer.id = 'vaii-terminal-overlay';
        termContainer.style = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100dvh; 
            max-height: 100dvh;
            background: #0d1117; 
            color: #58a6ff; 
            font-family: 'Courier New', Courier, monospace;
            padding: 12px 14px; 
            box-sizing: border-box; 
            z-index: 99999; 
            display: flex;
            flex-direction: column; 
            overflow: hidden;
        `;

        termContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 8px; margin-bottom: 6px; flex-shrink: 0;">
                <span style="color: #7ee787; font-weight: bold; font-size: 0.9rem;">⚡ VAII Unix Terminal Sandbox [v3.0 Extended]</span>
                <span style="color: #8b949e; font-size: 0.75rem;">Type 'exit' or 'logout' to return</span>
            </div>
            
            <div id="terminal-logs" style="flex: 1 1 auto; min-height: 0; overflow-y: auto; white-space: pre-wrap; line-height: 1.4; color: #c9d1d9; font-size: 0.9rem; padding-bottom: 8px;"></div>
            
            <div style="display: flex; align-items: center; gap: 6px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 8px 10px; margin-top: auto; flex-shrink: 0;">
                <span id="terminal-prompt" style="color: #7ee787; font-weight: bold; font-size: 0.85rem; white-space: nowrap;">${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$</span>
                <input id="terminal-cli-input" type="text" autocomplete="off" spellcheck="false" placeholder="type a command..." style="
                    flex: 1; background: transparent; border: none; outline: none; color: #f0f6fc;
                    font-family: inherit; font-size: 0.9rem; padding: 0; margin: 0;
                ">
            </div>
        `;
        document.body.appendChild(termContainer);
    } else {
        termContainer.style.display = "flex";
    }

    const logs = document.getElementById('terminal-logs');
    const input = document.getElementById('terminal-cli-input');
    const prompt = document.getElementById('terminal-prompt');

    logs.innerHTML = `VAII Extended Unix Environment Initialized.\nPOSIX Subsystem Ready. Package Manager Synced.\nType <span style="color:#e3b341;">help</span> to inspect shell commands.\n\n`;
    input.value = "";
    input.focus();

    termContainer.onclick = () => input.focus();

    input.onkeydown = (e) => {
        let history = getTerminalHistory();
        if (e.key === 'Enter') {
            const rawLine = input.value;
            
            if (heredocMode) {
                logs.innerHTML += `\n<span style="color:#e3b341;">></span> ${rawLine}\n`;
                if (rawLine.trim() === heredocDelimiter) {
                    let vfs = getVFS();
                    const fullContent = heredocBuffer.join("\n");
                    const targetPath = resolvePath(heredocTargetFile);
                    const prevContent = (heredocAppend && vfs[targetPath]?.content) ? vfs[targetPath].content + "\n" : "";
                    vfs[targetPath] = { type: "file", content: prevContent + fullContent, mtime: Date.now() };
                    
                    const fileNameOnly = targetPath.split('/').filter(Boolean).pop();
                    const parentDir = normalizePath(targetPath.substring(0, targetPath.lastIndexOf('/')) || '/');
                    
                    if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                        vfs[parentDir].children.push(fileNameOnly);
                    }
                    saveVFS(vfs);

                    logs.innerHTML += `<span style="color:#7ee787;">[Saved '${heredocTargetFile}' (${(prevContent + fullContent).length} bytes)]</span>\n`;
                    heredocMode = false;
                    heredocBuffer = [];
                    heredocTargetFile = null;
                    heredocAppend = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                } else if (rawLine.trim() === "cancel" || rawLine.trim() === "exit") {
                    heredocMode = false;
                    heredocBuffer = [];
                    heredocTargetFile = null;
                    heredocAppend = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                    logs.innerHTML += `<span style="color:#f85149;">[Heredoc aborted]</span>\n`;
                } else {
                    heredocBuffer.push(rawLine);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            if (pythonReplMode) {
                logs.innerHTML += `\n<span style="color:#3572A5;">>>></span> ${rawLine}\n`;
                if (rawLine.trim() === "exit()" || rawLine.trim() === "quit()") {
                    pythonReplMode = false;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                    logs.innerHTML += `[Python REPL session closed]\n`;
                } else {
                    executePythonCode(rawLine, logs);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            if (nanoMode) {
                logs.innerHTML += `\n${rawLine}\n`;
                if (rawLine.trim() === ":wq" || rawLine.trim() === ":q") {
                    if (rawLine.trim() === ":wq") {
                        let vfs = getVFS();
                        const targetPath = resolvePath(nanoTargetFile);
                        vfs[targetPath] = { type: "file", content: nanoBuffer.join("\n"), mtime: Date.now() };
                        const fileNameOnly = targetPath.split('/').filter(Boolean).pop();
                        const parentDir = normalizePath(targetPath.substring(0, targetPath.lastIndexOf('/')) || '/');
                        if (vfs[parentDir] && !vfs[parentDir].children.includes(fileNameOnly)) {
                            vfs[parentDir].children.push(fileNameOnly);
                        }
                        saveVFS(vfs);
                        logs.innerHTML += `<span style="color:#7ee787;">[Wrote ${nanoBuffer.length} lines to '${nanoTargetFile}']</span>\n`;
                    } else {
                        logs.innerHTML += `<span style="color:#8b949e;">[Quit without saving]</span>\n`;
                    }
                    nanoMode = false;
                    nanoBuffer = [];
                    nanoTargetFile = null;
                    prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
                    prompt.style.color = "#7ee787";
                } else {
                    nanoBuffer.push(rawLine);
                }
                input.value = "";
                logs.scrollTop = logs.scrollHeight;
                return;
            }

            const rawCmd = rawLine.trim();
            if (rawCmd) {
                history.push(rawCmd);
                saveTerminalHistory(history);
                termHistoryIndex = history.length;
            }
            logs.innerHTML += `\n<span style="color:#7ee787;">${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$</span> ${rawLine}\n`;

            runCommandPipeline(rawCmd, logs, termContainer, prompt);

            input.value = "";
            if (!heredocMode && !pythonReplMode && !nanoMode) {
                prompt.innerText = `${termEnvironment.USER}@${termEnvironment.HOSTNAME}:${termCurrentPath}$`;
            }
            logs.scrollTop = logs.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (!heredocMode && !pythonReplMode && !nanoMode && termHistoryIndex > 0) {
                termHistoryIndex--;
                input.value = history[termHistoryIndex] || "";
            }
        } else if (e.key === 'ArrowDown') {
            if (!heredocMode && !pythonReplMode && !nanoMode) {
                if (termHistoryIndex < history.length - 1) {
                    termHistoryIndex++;
                    input.value = history[termHistoryIndex] || "";
                } else {
                    termHistoryIndex = history.length;
                    input.value = "";
                }
            }
        }
    };
}
