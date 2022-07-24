import {Plugin} from "@ckeditor/ckeditor5-core";
import {
  extractMarkerType,
  getMarkerNameBasePrefix,
  extractMarkerId
} from "./utils";
import BetomatState from "./betomatstate";
import Betomat from "./betomat";

export default class BetomatHighlights extends Plugin {

  static get requires() {
    return [Betomat, BetomatState];
  }

  init() {
    const commands = this.editor.commands;
    /** @type {UpdateMarkersCommand} */
    const updateMarkersCommand = commands.get('updateMarkers');

    /** @type {BetomatState} */
    const state = this.editor.plugins.get(BetomatState.pluginName);

    const model = this.editor.model;

    this.listenTo(model.document, 'change:data', (evt, batch) => {
      for (const wordGroup of state.getWordGroups()) {
        updateMarkersCommand.execute(evt.source.model, evt.source.differ, wordGroup);
      }
    });

    this._defineConverters();
  }

  _defineConverters() {
    const {editor} = this;
    /** @type {BetomatState} */
    const state = this.editor.plugins.get(BetomatState.pluginName);

    const converter = ({markerName}) => {
      const id = extractMarkerId(markerName);
      const type = extractMarkerType(markerName);

      const classes = [];

      if (state.showShadowHighlights) {
        classes.push('word-finder-result--shadow');
      }

      if (state.getWordGroupSetting(type, 'isHighlighted')) {
        classes.push(`word-finder-result--${type}`);
      }

      // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
      // A minimal option is to return a new object for each converted marker...
      return {
        name: 'span',
        classes: ['word-finder-result', ...classes],
        attributes: {
          // ...however, adding a unique attribute should be future-proof..
          'data-word-finder-id': id,
          'data-word-finder-type': type,
        }
      };
    }

    editor.conversion.for('downcast').markerToHighlight({
      model: getMarkerNameBasePrefix(),
      view: converter,
    });
  }
}
