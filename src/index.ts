import express from "express";
import fsPromises from "fs/promises";
import sharp from "sharp";
const app = express()
const port = 3000

const rootDir = process.argv[2] || '.';
const cacheDir = rootDir + "/.imgcache";

// 上に書かれたルールが優先
app.use('/.imgcache', express.static(cacheDir));

async function responseFile(res: any, absPath: string, relPath: string) {
  const dirname = relPath.replace(/^[^\/]+$|\/[^\/]+$/, "");
  await fsPromises.mkdir(`${cacheDir}/displaysize/${dirname}`, {recursive: true});
  try {
    await fsPromises.stat(`${cacheDir}/displaysize/${relPath}`);
    console.log(`cache exist ${cacheDir}/displaysize/${relPath}`);
  } catch {
    console.log(`cache generating ${cacheDir}/displaysize/${relPath}`);
    await sharp(`${rootDir}/${relPath}`).resize(1536, undefined, {withoutEnlargement: true}).toFile(`${cacheDir}/displaysize/${relPath}`);
  }
  res.send(`<html><body style="margin: 0;"><img src="/.imgcache/displaysize/${relPath}" style="width: 100%"></body></html>`);
}

async function responseDirectory(res: any, absPath: string, relPath: string) {
  const dirents = await fsPromises.readdir(absPath, {withFileTypes: true});
  let html = `<html><body style="margin: 0;"><a href="..">..</a><br>`;
  const dirBasenames: string[] = [];
  const fileBasenames: string[] = [];
  await fsPromises.mkdir(`${cacheDir}/thumbnail/${relPath}`, {recursive: true});
  for (const ent of dirents) {
    if (ent.isDirectory()) {
      dirBasenames.push(ent.name);
      html += `DIR <a href="${ent.name}">${ent.name}</a><br>`;
    } else if (ent.isFile()) {
      if (/\.jpg|\.jpeg|\.png/i.test(ent.name)) {
        const imgRelPath = `${relPath}/${ent.name}`;
        try {
          await fsPromises.stat(`${cacheDir}/thumbnail/${imgRelPath}`);
          console.log(`cache exist ${cacheDir}/thumbnail/${imgRelPath}`);
        } catch {
          console.log(`cache generating ${cacheDir}/thumbnail/${imgRelPath}`);
          await sharp(`${rootDir}/${imgRelPath}`).resize(160, 120, {fit: "inside"}).toFile(`${cacheDir}/thumbnail/${imgRelPath}`);
        }
        html += `<a href="${ent.name}"><img src="/.imgcache/thumbnail/${imgRelPath}"><br>${ent.name}</a><br>`;
        fileBasenames.push(ent.name);
      }
    }
  }
  html += `</body></html>`;
  res.send(html);
}

app.get(/^\/(.*)/, async (req, res) => {
  try {
    const relPath = req.params[0];
  const filePath = `${rootDir}/${relPath}`; // トラバーサル対策してない

  const stat = await fsPromises.stat(filePath);
  if (stat.isDirectory()) {
    // ディレクトリインデックス
    await responseDirectory(res, filePath, relPath);
  } else if (stat.isFile()) {
    // ファイル
    await responseFile(res, filePath, relPath);
  } else {
    throw new Error("path is not file nor directory");
  }
  } catch (error) {
    res.send(`Error: ${error}`);
  }
});

app.listen(port, () => {
  console.log(`ios9-safari-image-viewer app listening on http://localhost:${port}`)
});
