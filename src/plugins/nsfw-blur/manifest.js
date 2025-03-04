/** @type {import("@vtypes/plugin").PluginManifest} */
export default {
    name: "NSFW Blur",
    description: `Blur image previews and disable embed media in NSFW channels.`,
    authors: [
        {
            name: "sylv256",
            id: "209015289990348800"
        }
    ],
    main: "src/index.ts",
    vendetta: {
        icon: "ic_image"
    }
}
