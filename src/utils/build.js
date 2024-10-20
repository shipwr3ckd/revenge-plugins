import { writeFile, readdir } from "fs/promises";
import { createHash } from "crypto";
import { build } from "esbuild"
import { watch } from "fs";
import { dirname, join, resolve } from "path";

import COLORS from "./colors.js"

const __filename = new URL(import.meta.url).pathname;
const __dirname = dirname(__filename);

const SRC_DIR = join(__dirname, "..");
const ROOT_DIR = join(SRC_DIR, "..");
const PLUGINS_DIR = join(SRC_DIR, "plugins");
const DIST_DIR = join(ROOT_DIR, "dist");

const VAR_SET_RETURN_REGEX = /^(?:var|const|let) \w+\s?=\s?(.*);(?:$|\s)/i
const REQUIRE_NAME_REGEX = /(?:var|const|let)\s?(\w+)=\(\w+=>typeof require.{1,400}?supported'\)}\);/i
const IMPORT_REGEX = (importPrefix = "", requireFunctionName = "\\w+") => new RegExp(`${requireFunctionName}\\((?:"|'|\`)(${importPrefix})(?:"|'|\`)\\)`, "gi")
const VENDETTA_IMPORT_REGEX = (requireFunctionName = "\\w+") => IMPORT_REGEX("@vendetta.*?", requireFunctionName)
const REACT_IMPORT_REGEX = (requireFunctionName = "\\w+") => IMPORT_REGEX("react", requireFunctionName);
const REACTNATIVE_IMPORT_REGEX = (requireFunctionName = "\\w+") => IMPORT_REGEX("react-native", requireFunctionName);


const startBuilding = async (forceBuildPluginList) => {
    const plugins = forceBuildPluginList ?? await readdir(PLUGINS_DIR)
    
    for (let p of plugins) {
        console.log(`${COLORS.fg.cyan}[BUILD] Building plugin "${p}"...${COLORS.style.reset}`)

        /** @type {import("../types/plugin.ts").PluginManifest} */
        let manifest;
        try {
            manifest = (await import(
                resolve(join(PLUGINS_DIR, p, "manifest.js")) + `?ts=${Date.now()}`
            )).default;
        }
        catch (e) {
            console.error(COLORS.fg.red, e, `\n\n[BUILD] Failed to load manifest for ${p}! Is it a valid plugin? Skipping...${COLORS.style.reset}`);
            continue;
        }

        const outDir = join(DIST_DIR, p);

        try {
            const result = await build({
                entryPoints: [
                    join(PLUGINS_DIR, p, manifest.main)
                ],
                external: ["@vendetta", "@vendetta/*", "react", "react-native"],
                format: "iife",
                minify: true,
                bundle: true,
                write: false,
                globalName: "plugin",
                tsconfig: join(ROOT_DIR, "tsconfig.json"),
            })

            let code = result.outputFiles[0].text

            const requireFunctionName = code.match(REQUIRE_NAME_REGEX)?.[1]
    
            // Replace require statements with globals and return the plugin
            code = code
                .replace(VAR_SET_RETURN_REGEX, `(()=>{return $1})()`)
                .replace(REQUIRE_NAME_REGEX, "")
                .replace(VENDETTA_IMPORT_REGEX(requireFunctionName), (_, path) => path.slice(1).replace(/\//g, "."))
                .replace(REACT_IMPORT_REGEX(requireFunctionName), "React")
                .replace(REACTNATIVE_IMPORT_REGEX(requireFunctionName), "ReactNative")

            /** @type {import("../types/plugin.ts").PluginManifest} */
            const buildManifest = { 
                ...manifest,
                hash: createHash("sha256").update(code).digest("hex"),
                main: "index.js"
            }

            await writeFile(join(outDir, buildManifest.main), code)
            await writeFile(join(outDir, "manifest.json"), JSON.stringify(buildManifest));
        
            console.log(`${COLORS.fg.cyan}[BUILD] Successfully built "${manifest.name}"!${COLORS.style.reset}`);
        } catch (e) {
            console.error(COLORS.fg.red, e, `\n\nFailed to build plugin "${p}"! Skipping...${COLORS.style.reset}`);
            continue;
        }
    }

}

if(process.argv.slice(2).includes("--watch")) {
    let lastChange = 0;
    watch(PLUGINS_DIR, { recursive: true }, async (event, path) => {
        if(Date.now() - lastChange < 300) return; // <- implemented as a workaround for a twice trigger bug
        lastChange = Date.now();

        const pluginToUpdate = path.split("/").shift()
        console.log(`\n\n${COLORS.fg.yellow}[WATCHER] --- Detected ${event} in plugin "${pluginToUpdate}". Rebuilding... ---${COLORS.style.reset}`)
        await startBuilding([ pluginToUpdate ])

        console.log(`${COLORS.fg.gray}[WATCHER] Watching for changes...${COLORS.style.reset}`)
    })
}

startBuilding().then(() => console.log(`${COLORS.fg.gray}[WATCHER] Watching for changes...${COLORS.style.reset}`));
