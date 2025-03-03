import { logger } from '@vendetta'
import { findByName } from '@vendetta/metro'
import { ReactNative } from '@vendetta/metro/common'
import { before } from '@vendetta/patcher'
import { definePlugin } from '@vtypes/plugin'
import Settings from './Settings'

let patches: Array<Function> = []

export default definePlugin({
	onLoad() {
		const transformMessageAttachments = findByName('transformMessageAttachments', false)
		const createMessageContent = findByName('createMessageContent', false)
		const getChannel = findByProps('getChannel').getChannel

		patches.push(
			before('default', transformMessageAttachments, args => {
				return
				let message = args[0]
				// retain sanity
				if (!message || !(message.attachments instanceof Array)) return

				message.shouldObscureSpoiler = true
				for (const attachment of message.attachments) {
					attachment.spoiler = true
				}
			})
		)

		patches.push(
			before('default', createMessageContent, args => {
				let content = args[0]
				if (!content || typeof content !== 'object') return
				if (!content.message) return
				if (!content.message.channel_id || !getChannel(content.message.channel_id).nsfw_) return
				if (!content.options) return
				content.options.inlineEmbedMedia = false
				let message = content.message
				// retain sanity
				if (!message || !(message.attachments instanceof Array)) return

				content.options.shouldObscureSpoiler = true
				for (const attachment of message.attachments) {
					attachment.spoiler = true
				}
			})
		)

		// for future reference
		//if (m.content) m.content = m.content
		//	.replace(/(http[s?]:\/\/(.+)\.(gif|mp4|png|jpg|jpeg|jxl))/g, (_, s) => `||${s}||`)
	},
	onUnload() {
		for (const unpatch of patches) {
			unpatch()
		}
	}
});
