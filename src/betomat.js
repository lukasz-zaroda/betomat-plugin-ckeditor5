import {Plugin} from "@ckeditor/ckeditor5-core";
import {add} from "@ckeditor/ckeditor5-utils/src/translation-service";
import BetomatHighlights from "./betomathighlights";
import BetomatUI from "./betomatui";
import BetomatCommands from "./betomatcommands";

export default class Betomat extends Plugin {

  constructor(editor) {
    super(editor);

    add('pl', {
      'Show shadows': 'Pokaż cienie',
      'Highlight groups': 'Wyróżnij grupy',
    });
  }

  static get pluginName() {
    return 'Betomat';
  }

  static get requires() {
    return [BetomatCommands, BetomatUI, BetomatHighlights];
  }
}
