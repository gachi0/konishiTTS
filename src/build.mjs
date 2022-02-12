import pkg from "pkg";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import archiver from "archiver";

await promisify(exec)("npx tsc");
await pkg.exec([".", "--out-path", "./dist/exes"]);

for (const e of fs.readdirSync("dist/exes")) {
    const out = fs.createWriteStream(`dist/${e.split(".")[0]}.zip`);
    const archive = archiver("zip", { zlib: { level: 9 } })
        .file("config.toml.sample", { name: "config.toml" })
        .file(`dist/exes/${e}`, { name: e })
        .directory("node_modules/sqlite3", "sqlite3");
    archive.pipe(out);
    await archive.finalize();
    fs.rmSync(`dist/exes/${e}`);
}

fs.rmdirSync("dist/exes");