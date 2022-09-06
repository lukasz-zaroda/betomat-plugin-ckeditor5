import {Plugin} from "@ckeditor/ckeditor5-core";
import BetomatState from "./betomatstate";
import SetShowShadowHighlightsCommand from "./setshowshadowhighlightscommand";
import UpdateMarkersCommand from "./updatemarkerscommand";
import UpdateWordGroupSettingCommand from "./updatewordgroupsettingcommand";

export default class BetomatCommands extends Plugin {

  init() {
    this._defineCommands();
  }

  _defineCommands() {
    /** @type {BetomatState} */
    const state = this.editor.plugins.get(BetomatState.pluginName);

    this.editor.commands.add('setShowShadowHiglights', new SetShowShadowHighlightsCommand(this.editor, state));
    this.editor.commands.add('updateMarkers', new UpdateMarkersCommand(this.editor, state));
    this.editor.commands.add('updateWordGroupSetting', new UpdateWordGroupSettingCommand(this.editor, state));
  }

  static get pluginName() {
    return 'BetomatCommands';
  }

  static get requires() {
 		return [BetomatState];
 	}
}
