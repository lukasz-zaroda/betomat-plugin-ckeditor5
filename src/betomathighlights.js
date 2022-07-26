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
    const mainView = this.editor.editing.view;
    const mainViewRoot = mainView.document.getRoot();

    this.listenTo(model.document, 'change:data', (evt, batch) => {
      for (const wordGroup of state.getWordGroups()) {
        updateMarkersCommand.execute(evt.source.model, evt.source.differ, wordGroup);
      }
    });

    this._defineConverters();

    /*
     * Add classes representing enabled settings to the editor's source element.
     */
    const sourceElement = this.editor.sourceElement;
    const shadowEnabledClass = 'betomat:highlight:shadow';

    // Make shadows switchable.
    if (state.showShadowHighlights) {
      sourceElement.classList.add(shadowEnabledClass)
    }

    state.on('change:showShadowHighlights', (evt, propertyName, newValue) => {
      mainView.change(writer => {
        if (newValue) {
          writer.addClass(shadowEnabledClass, mainViewRoot);
        } else {
          writer.removeClass(shadowEnabledClass, mainViewRoot);
        }
  	  });
    });

    // Make highlights switchable.
    const wordGroupHighlightedClassCreator = function (type) {
      return 'betomat:highlight:word-group:' + type;
    };

    for (const wordGroup of state.wordGroups) {
      if (wordGroup.isHighlighted) {
        mainView.change(writer => {
          writer.addClass(wordGroupHighlightedClassCreator(wordGroup.type), mainViewRoot);
    	});
      }

      wordGroup.on('change:isHighlighted', (evt, propertyName, newValue) => {
        mainView.change(writer => {
          if (newValue) {
            writer.addClass(wordGroupHighlightedClassCreator(wordGroup.type), mainViewRoot);
          } else {
            writer.removeClass(wordGroupHighlightedClassCreator(wordGroup.type), mainViewRoot);
          }
    	  });
      });
    }
  }

  _defineConverters() {
    const {editor} = this;

    const converter = ({markerName}) => {
      const id = extractMarkerId(markerName);
      const type = extractMarkerType(markerName);

      const classes = [];

      classes.push(`betomat-result--${type}`);

      // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
      // A minimal option is to return a new object for each converted marker...
      return {
        name: 'span',
        classes: ['betomat-result', ...classes],
        attributes: {
          // ...however, adding a unique attribute should be future-proof..
          'data-betomat-id': id,
          'data-betomat-word-group': type,
        }
      };
    }

    editor.conversion.for('downcast').markerToHighlight({
      model: getMarkerNameBasePrefix(),
      view: converter,
    });
  }
}
