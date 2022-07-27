"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const app = (0, express_1.default)();
const port = 3000;
const rootDir = process.argv[2] || '.';
const cacheDir = rootDir + "/.imgcache";
// 上に書かれたルールが優先
app.use('/.imgcache', express_1.default.static(cacheDir));
function responseFile(res, absPath, relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirname = relPath.replace(/^[^\/]+$|\/[^\/]+$/, "");
        yield promises_1.default.mkdir(`${cacheDir}/displaysize/${dirname}`, { recursive: true });
        try {
            yield promises_1.default.stat(`${cacheDir}/displaysize/${relPath}`);
            console.log(`cache exist ${cacheDir}/displaysize/${relPath}`);
        }
        catch (_a) {
            console.log(`cache generating ${cacheDir}/displaysize/${relPath}`);
            yield (0, sharp_1.default)(`${rootDir}/${relPath}`).resize(1536, undefined, { withoutEnlargement: true }).toFile(`${cacheDir}/displaysize/${relPath}`);
        }
        res.send(`<html><body style="margin: 0;"><img src="/.imgcache/displaysize/${relPath}" style="width: 100%"></body></html>`);
    });
}
function responseDirectory(res, absPath, relPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirents = yield promises_1.default.readdir(absPath, { withFileTypes: true });
        let html = `<html><body style="margin: 0;"><a href="..">..</a><br>`;
        const dirBasenames = [];
        const fileBasenames = [];
        yield promises_1.default.mkdir(`${cacheDir}/thumbnail/${relPath}`, { recursive: true });
        for (const ent of dirents) {
            if (ent.isDirectory()) {
                dirBasenames.push(ent.name);
                html += `DIR <a href="${ent.name}">${ent.name}</a><br>`;
            }
            else if (ent.isFile()) {
                if (/\.jpg|\.jpeg|\.png/i.test(ent.name)) {
                    const imgRelPath = `${relPath}/${ent.name}`;
                    try {
                        yield promises_1.default.stat(`${cacheDir}/thumbnail/${imgRelPath}`);
                        console.log(`cache exist ${cacheDir}/thumbnail/${imgRelPath}`);
                    }
                    catch (_a) {
                        console.log(`cache generating ${cacheDir}/thumbnail/${imgRelPath}`);
                        yield (0, sharp_1.default)(`${rootDir}/${imgRelPath}`).resize(160, 120, { fit: "inside" }).toFile(`${cacheDir}/thumbnail/${imgRelPath}`);
                    }
                    html += `<a href="${ent.name}"><img src="/.imgcache/thumbnail/${imgRelPath}"><br>${ent.name}</a><br>`;
                    fileBasenames.push(ent.name);
                }
            }
        }
        html += `</body></html>`;
        res.send(html);
    });
}
app.get(/^\/(.*)/, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const relPath = req.params[0];
        const filePath = `${rootDir}/${relPath}`; // トラバーサル対策してない
        const stat = yield promises_1.default.stat(filePath);
        if (stat.isDirectory()) {
            // ディレクトリインデックス
            yield responseDirectory(res, filePath, relPath);
        }
        else if (stat.isFile()) {
            // ファイル
            yield responseFile(res, filePath, relPath);
        }
        else {
            throw new Error("path is not file nor directory");
        }
    }
    catch (error) {
        res.send(`Error: ${error}`);
    }
}));
app.listen(port, () => {
    console.log(`ios9-safari-image-viewer app listening on http://localhost:${port}`);
});
