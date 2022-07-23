import {Command} from "@ckeditor/ckeditor5-core";

export default class UpdateWordGroupSettingCommand extends Command {

  /**
   * @type {BetomatState}
   */
  _state;

  /**
   * @param editor
   * @param {BetomatState} state
   */
  constructor(editor, state) {
    super(editor);
    this._state = state;

    this.affectsData = false;
  }

  execute(wordGroupType, setting, value) {
    this._state.updateWordGroupSetting(wordGroupType, setting, value);
    this._state.reconvertMarkers();
  }
}
