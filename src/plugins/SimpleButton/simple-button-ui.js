/**
 * @module SimpleButton/SimpleButtonUi
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class SimpleButtonUi extends Plugin {
	/**
   * @inheritDoc
   */
	init() {
		this.buttons = [];
		const buttonDefinitions = this.editor.config.get( 'simpleButton' ) || [];
		buttonDefinitions.forEach( definition => this.createToolbarButton( definition ) );

		this.editor.on( 'change:isReadOnly', () => {
			this.buttons.forEach( button => {
				if ( button._syncDisabledState ) {
					button.isEnabled = !this.editor.isReadOnly;
				}
			} );
		} );
	}

	/**
	 * Creates a toolbar Button. Clicking this button will execute
	 * the specified callback.
	 *
	 * @param buttonDefinition the button configuration
	 * @private
	 */
	createToolbarButton( buttonDefinition ) {
		const editor = this.editor;

		editor.ui.componentFactory.add( buttonDefinition.name, locale => {
			const button = this.createButton( buttonDefinition, locale );
			button.isEnabled = true;
			button._syncDisabledState = typeof buttonDefinition.syncDisabledState === 'boolean' ? buttonDefinition.syncDisabledState : true;

			// Change enabled state and execute the specific callback on click.
			this.listenTo( button, 'execute', () => {
				this.enableButton( button, false );
				Promise.resolve( buttonDefinition.onClick( button, editor ) )
					.then( () => this.enableButton( button, true ) )
					.catch( () => this.enableButton( button, true ) );
			} );

			this.buttons.push( button );
			return button;
		} );
	}

	/**
	 * Enables or disables the button due to the button config
	 * and the current readOnly-state of the editor.
	 *
	 * @param button the buttonView
	 * @param value new enabled state
	 * @private
	 */
	enableButton( button, value ) {
		if ( button._syncDisabledState ) {
			button.isEnabled = !this.editor.isReadOnly && value;
		} else {
			button.isEnabled = value;
		}
	}

	/**
	 * Internal creation method of ButtonView objects
	 *
	 * @param buttonDefinition an object with button options ( object )
	 * @param icon the button locale ( string )
	 * @private
	 */
	createButton( buttonDefinition, locale ) {
		const button = new ButtonView( locale );

		button.set( {
			label: buttonDefinition.label,
			icon: buttonDefinition.icon,
			tooltip: buttonDefinition.tooltip,
			isToggleable: buttonDefinition.isToggleable || false,
			isOn: buttonDefinition.isOn || false,
			withText: buttonDefinition.withText || false
		} );

		return button;
	}
}
