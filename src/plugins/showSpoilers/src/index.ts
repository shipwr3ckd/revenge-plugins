import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";
import { getAssetByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import { definePlugin } from "@vtypes/plugin";

const MessagesWrapperConnected = findByName("MessagesWrapperConnected")

type MessagesWrapperConnectedReturn = {
    props: {
        messages: {
            _array: ({ content?: string })[]
        }
    }
}


export default definePlugin({
    onLoad() {
        try {
            after("apply", MessagesWrapperConnected, (_, ret: MessagesWrapperConnectedReturn) => {
                ret.props.messages._array.forEach(({ content }) => {
                    if (content) content = content
                        .replace(/\|\|(.*?)\|\|/g, (_, s) => `\`${s.replace(/`/g, "\\`")}\``)
                })
            })
        }catch(e) {
            showToast("There was an error!! omo Please check console", getAssetByName("ic_warning_24x").id);
            console.error(e)
        }
    },
    onUnload() {
        showToast("To revert changes you need to restart the app! -w-", getAssetByName("ic_information_filled_24x").id);
    }
})