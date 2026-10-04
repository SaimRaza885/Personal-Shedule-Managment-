import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { isTauri } from "./database";

/**
 * File save/open for JSON backups. In the Tauri shell this uses the native
 * save/open dialogs and filesystem plugin; in a plain browser (dev) it falls
 * back to a Blob download and a hidden file input.
 */

const JSON_FILTERS = [{ name: "JSON backup", extensions: ["json"] }];

/**
 * Ask the user where to save a JSON file and write it there.
 * @param {{ fileName: string, content: string }} input
 * @returns {Promise<{ saved: boolean, path: string | null }>} saved: false when the user cancels
 */
export async function saveJsonFile({ fileName, content }) {
  try {
    if (isTauri()) {
      const path = await save({ defaultPath: fileName, filters: JSON_FILTERS });
      if (!path) return { saved: false, path: null };
      await writeTextFile(path, content);
      return { saved: true, path };
    }

    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    // Revoking immediately can abort the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { saved: true, path: fileName };
  } catch (error) {
    console.error("[fileTransfer:saveJsonFile]", error);
    throw new Error("Could not save the backup file. Please try again.");
  }
}

/**
 * Ask the user for a JSON file and read its text.
 * @returns {Promise<{ picked: boolean, path: string | null, content: string | null }>}
 */
export async function openJsonFile() {
  try {
    if (isTauri()) {
      const path = await open({ multiple: false, filters: JSON_FILTERS });
      if (!path) return { picked: false, path: null, content: null };
      const content = await readTextFile(path);
      return { picked: true, path, content };
    }

    const file = await pickFileWithInput();
    if (!file) return { picked: false, path: null, content: null };
    const content = await file.text();
    return { picked: true, path: file.name, content };
  } catch (error) {
    console.error("[fileTransfer:openJsonFile]", error);
    throw new Error("Could not read that file. Please try again.");
  }
}

/**
 * @returns {Promise<File | null>}
 */
function pickFileWithInput() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.setAttribute("aria-label", "Choose a backup file");
    // Kept in the layout as an offscreen element (not display:none) so
    // assistive tech and test tooling can still reach it.
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.top = "0";
    document.body.appendChild(input);

    const finish = (file) => {
      input.remove();
      resolve(file);
    };
    input.addEventListener("change", () => {
      finish(input.files && input.files[0] ? input.files[0] : null);
    });
    input.addEventListener("cancel", () => finish(null));
    input.click();
  });
}
