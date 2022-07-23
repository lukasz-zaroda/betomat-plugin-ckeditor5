import {Command} from "@ckeditor/ckeditor5-core";

export default class SetShowShadowHighlightsCommand extends Command {

  /** @type {BetomatState} */
  _state;

  constructor(editor, state) {
    super(editor);

    this._state = state;

    this.affectsData = false;
  }

  /**
   * @param {boolean} showShadowHighlights
   */
  execute(showShadowHighlights) {
    this._state.showShadowHighlights = showShadowHighlights;
    this._state.reconvertMarkers();
  }
}