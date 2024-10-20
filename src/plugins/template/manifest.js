/** @type {import("../../types/plugin.ts").PluginManifest} */
export default {
    name: "Pyoncord Example Plugin",
    description: `Example plugin for silly discord mod. Build time: ${new Date().toISOString()}`,
    authors: [
        {
            name: "kvba",
            id: "105170831130234880"
        }
    ],
    main: "src/index.ts",
    vendetta: {
        icon: "StatusIdle"
    }
}