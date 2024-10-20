import { showToast } from "@vendetta/ui/toasts";
import { getAssetByName } from "@vendetta/ui/assets"
import { definePlugin } from "@vtypes/plugin";
import Settings from "./Settings";


export default definePlugin({
    onLoad() {
        showToast("It loaded! ^w^", getAssetByName("ic_sticker_24px").id);
    },
    onUnload() {
        showToast("It unloaded... -w-", getAssetByName("ic_sticker_icon_24px").id);
    },
    settings: Settings
});