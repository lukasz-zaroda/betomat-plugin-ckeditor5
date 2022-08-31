import {Collection} from "@ckeditor/ckeditor5-utils";
import {Plugin} from "@ckeditor/ckeditor5-core";
import MarkerCollection from "@ckeditor/ckeditor5-engine/src/model/markercollection";
import WordGroup from "./wordgroup";
import BetomatConfig from "./betomatconfig";

export default class BetomatState extends Plugin {

  static get pluginName() {
    return 'BetomatState';
  }

  static get requires() {
 		return [BetomatConfig];
 	}

  constructor(editor) {
    super(editor);

    const wordGroupCollection = new Collection({
      idProperty: 'type',
    });

    /** @type {BetomatConfig} */
    const betomatConfig = editor.plugins.get(BetomatConfig.pluginName);

    const wordGroupsConfig = betomatConfig.getWordGroups();
    for (const wordGroupConfig of wordGroupsConfig) {
      wordGroupCollection.add(
        new WordGroup(wordGroupConfig.type, wordGroupConfig.label, wordGroupConfig.words)
      );
    }

    this.set('wordGroups', wordGroupCollection);
    this.set('showShadowHighlights', true);
    this.set('markers', new MarkerCollection());
  }

  /**
   * Should be run after any markers modification.
   */
  reconvertMarkers(prefix = null) {
    const markersIterator = prefix ? this.markers.getMarkersGroup(prefix) : this.markers;

    for (const marker of markersIterator) {
      this.editor.editing.reconvertMarker(marker);
    }
  }

  /**
   * @param {Collection} wordGroups
   */
  setWordGroups(wordGroups) {
    this.wordGroups = wordGroups;
  }

  /**
   * @returns {Collection}
   */
  getWordGroups() {
    return this.wordGroups;
  }

  updateWordGroupSetting(wordGroupType, setting, value) {
    if (!this.wordGroups.has(wordGroupType)) {
      throw new Error('WordGroup type doesn\'t exist.');
    }

    /**
     * @type {WordGroup}
     */
    const wordGroup = this.wordGroups.get(wordGroupType);
    wordGroup[setting] = value;
  }

  getWordGroupSetting(wordGroupType, setting) {
    if (!this.wordGroups.has(wordGroupType)) {
      throw new Error('WordGroup type doesn\'t exist.');
    }

    /**
     * @type {WordGroup}
     */
    const wordGroup = this.wordGroups.get(wordGroupType);

    return wordGroup[setting];
  }
}
