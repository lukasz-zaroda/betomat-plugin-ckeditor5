import {ObservableMixin} from "@ckeditor/ckeditor5-utils";
import {mix} from "@ckeditor/ckeditor5-utils";

export default class WordGroup {

  /**
   * @type string
   */
  type;

  /**
   * @type string
   */
  label;

  /**
   * @type string[]
   */
  words;

  /**
   * @param {string}type
   * @param {string} label
   * @param {string[]} words
   */
  constructor(type, label, words) {
    this.type = type;
    this.words = words;
    this.label = label;

    this.set('isHighlighted', false);
  }

  /**
   * @param {boolean} isHighlighted
   */
  setHighlighted(isHighlighted) {
    this.isHighlighted = isHighlighted;
  }

  /**
   * @returns {boolean}
   */
  getIsHiglighted() {
    return this.isHighlighted;
  }
}

mix(WordGroup, ObservableMixin);