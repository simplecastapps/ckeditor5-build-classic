/**
 * @module PasteMarkdown/paste-markdown
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import { parseHtml } from './filters/parse';
import marked from 'marked';

/**
 * @extends module:core/plugin~Plugin
 */
export default class PasteMarkdown extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'PasteMarkdown';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Clipboard ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.plugins.get( 'Clipboard' ).on(
			'inputTransformation',
			( evt, data ) => {
				// Only convert markdown if it hasn't already been touched by PasteFromOffice and if copy contains markdown characters
				if ( !data.isTransformedWithPasteFromOffice && isMarkdown( data.dataTransfer.getData( 'text' ) ) ) {
					const { body } = parseHtml( marked( data.dataTransfer.getData( 'text' ), { breaks: true, headerIds: false } ) );
					data.content = body;
				}
			},
			{ priority: 'normal' }
		);
	}
}

/* eslint-disable */
function isMarkdown( text ) {
	const imageRegex = /!\[([^\[]+)\]\(([^\)]+)\)/g;
	const linkRegex = /\[([^\[]+)\]\(([^\)]+)\)/g;
	const headingRegex = /\n|^(#+\s*)(.*)/g;
	const boldItalicsRegex = /(\*{1,2}|\_{1,2})(.*?)\1/g;
	const strikethroughRegex = /(\~\~)(.*?)\1/g;
	const blockquoteRegex = /\n|^(&gt;|\>)(.*)/g;
	const horizontalRuleRegex = /\n|^((\-{3,})|(={3,}))/g;
	const unorderedListRegex = /(\n\s*(\-|\+|\*)\s.*)+/g;
	const orderedListRegex = /(\n\s*([0-9]+\.)\s.*)+/g;
	return imageRegex.test( text ) ||
		linkRegex.test( text ) ||
		headingRegex.test( text ) ||
		boldItalicsRegex.test( text ) ||
		strikethroughRegex.test( text ) ||
		blockquoteRegex.test( text ) ||
		horizontalRuleRegex.test( text ) ||
		unorderedListRegex.test( text ) ||
		orderedListRegex.test( text );
}
/* eslint-enable */
