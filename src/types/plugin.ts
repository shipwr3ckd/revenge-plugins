type PluginAuthor = {
    name: string,
    id: string
}

type PluginVendettaSettings = {
    icon: string
}

export type PluginManifest = {
    /** Name of the plugin */
    name: string;
    /** Description of the plugin */
    description: string,
    /** Authors of the plugin */
    authors: PluginAuthor[],
    /** Entry point of the plugin. Usually it is src/index.ts */
    main: string,
    /** Settings plugin related */
    vendetta: PluginVendettaSettings,
    /**
     * Hash of the plugin. No need to change that as it will be replaced in building process anyways.
     * @readonly
     */
    hash?: Readonly<string>
}

export type Plugin = {
    onLoad?: () => void,
    onUnload?: () => void,
    settings?: React.FC<any>
}

/**
 * Typing helper for defining a plugin
 * @param plugin Plugin data
 * @returns Plugin
 */
export const definePlugin = (plugin: Plugin): Plugin => plugin