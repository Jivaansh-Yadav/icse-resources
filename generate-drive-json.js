import fs from "fs";
import { google } from "googleapis";

// 🔐 Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// 🔁 Prevent duplicates (for shortcuts)
const seen = new Set();

// 🔁 Recursive crawl
async function getFolder(folderId, currentPath = "") {
  let files = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType, shortcutDetails)",
      pageToken,
    });

    files = files.concat(res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  const children = [];

  for (const file of files) {
    // 🔥 HANDLE SHORTCUT
    if (file.mimeType === "application/vnd.google-apps.shortcut") {
      const targetId = file.shortcutDetails?.targetId;
      const targetMime = file.shortcutDetails?.targetMimeType;

      if (!targetId) continue;

      // 📂 Shortcut → Folder
      if (targetMime === "application/vnd.google-apps.folder") {
        const newPath = currentPath
          ? `${currentPath} / ${file.name}`
          : file.name;

        children.push({
          name: file.name,
          type: "folder",
          children: await getFolder(targetId, newPath),
        });
      }

      // 📄 Shortcut → File
      else {
        if (seen.has(targetId)) continue;
        seen.add(targetId);

        const meta = await drive.files.get({
          fileId: targetId,
          fields: "name",
        });

        children.push({
          name: meta.data.name,
          type: "file",
          id: targetId,
          path: currentPath,
        });
      }

      continue;
    }

    // 📂 Normal folder
    if (file.mimeType === "application/vnd.google-apps.folder") {
      const newPath = currentPath
        ? `${currentPath} / ${file.name}`
        : file.name;

      children.push({
        name: file.name,
        type: "folder",
        children: await getFolder(file.id, newPath),
      });
    }

    // 📄 Normal file
    else {
      if (seen.has(file.id)) continue;
      seen.add(file.id);

      children.push({
        name: file.name,
        type: "file",
        id: file.id,
        path: currentPath,
      });
    }
  }

  // sort folders first
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return children;
}

// 🔥 FLATTEN FUNCTION (added)
function flattenTree(node, result = []) {
  if (node.type === "file") {
    result.push({
      name: node.name,
      id: node.id,
      path: node.path,
    });
  }

  if (node.type === "folder" && node.children) {
    for (const child of node.children) {
      flattenTree(child, result);
    }
  }

  return result;
}

// 🏁 Main
(async () => {
  try {
    const ROOT_FOLDER_ID = "1CkUuGnUR3idrhEBxgiV5U9fFf5RjbZQK";

    const rootMeta = await drive.files.get({
      fileId: ROOT_FOLDER_ID,
      fields: "name",
    });

    const rootName = rootMeta.data.name;

    const rootChildren = await getFolder(ROOT_FOLDER_ID, rootName);

    // 🔥 Find specific folders
    const cisce = rootChildren.find(f =>
      f.name.toLowerCase().includes("cisce")
    );

    const study = rootChildren.find(f =>
      f.name.toLowerCase().includes("study")
    );

    // 📝 Write tree files
    if (cisce) {
      fs.writeFileSync(
        "public/data/cisce-resources.json",
        JSON.stringify(cisce, null, 2)
      );
      console.log("✅ cisce-resources.json created");
    } else {
      console.log("⚠️ CISCE folder not found");
    }

    if (study) {
      fs.writeFileSync(
        "public/data/study-materials.json",
        JSON.stringify(study, null, 2)
      );
      console.log("✅ study-materials.json created");
    } else {
      console.log("⚠️ Study Materials folder not found");
    }

    // 🔥 CREATE FLATTENED SEARCH INDEX (added)
    const flat = flattenTree({
      type: "folder",
      children: rootChildren,
    });

    fs.writeFileSync(
      "public/data/search-index.json",
      JSON.stringify(flat, null, 2)
    );

    console.log("✅ search-index.json created");

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();