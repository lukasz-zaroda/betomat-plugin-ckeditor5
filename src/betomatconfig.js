import SchemaUtils from 'schema-utils';
import {Plugin} from "@ckeditor/ckeditor5-core";
import schema from "./configuration.json";

export default class BetomatConfig extends Plugin {

  wordGroups;

  static get pluginName() {
    return 'BetomatConfiguration';
  }

  constructor(editor) {
    super(editor);

    const configuration = editor.config.get('betomat');

    SchemaUtils.validate(schema, configuration, {
      name: "Betomat configuration",
      baseDataPath: 'config',
    })

    this.wordGroups = configuration.wordGroups;
  }

  getWordGroups() {
    return this.wordGroups;
  }
}