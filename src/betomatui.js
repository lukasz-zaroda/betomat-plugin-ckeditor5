import {Plugin} from "@ckeditor/ckeditor5-core";
import {createDropdown} from "@ckeditor/ckeditor5-ui";

import BetomatWordsFormView from "./ui/betomatwordsformview";
import betomatWordsIcon from "./theme/img/betomat-words-icon.svg";
import BetomatState from "./betomatstate";

export default class BetomatUI extends Plugin {

	static get pluginName() {
   return 'BetomatUI';
 }

	static get requires() {
		return [BetomatState];
	}

  /**
   * @type {BetomatWordsFormView}
	 */
	formView = null;

  init() {
    const editor = this.editor;

		/** @type {BetomatState} */
		const state = this.editor.plugins.get(BetomatState.pluginName);
		const commands = this.editor.commands;

    // Register the toolbar dropdown component.
    editor.ui.componentFactory.add('betomat', locale => {
      const dropdown = createDropdown(locale);
      const formView = this.formView = new BetomatWordsFormView(
				editor.locale,
				state,
				commands.get('setShowShadowHiglights'),
				commands.get('updateWordGroupSetting'),
			);

      // TODO Dropdown should be disabled when in source editing mode.

      dropdown.panelView.children.add(formView);
      this._setupDropdownButton(dropdown);

      return dropdown;
    });
  }

	_setupDropdownButton(dropdown) {
		const editor = this.editor;
		const t = editor.locale.t;

		dropdown.buttonView.set({
			icon: betomatWordsIcon,
			label: 'Betomat',
			keystroke: 'CTRL+Q',
			tooltip: true
		});

		editor.keystrokes.set('Ctrl+Q', (data, cancelEvent) => {
			dropdown.isOpen = true;
			cancelEvent();
		});
	}
}