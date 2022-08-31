import EscapeRegExp from "lodash-es/escapeRegExp";
import {uid} from "@ckeditor/ckeditor5-utils";
import MarkerCollection from "@ckeditor/ckeditor5-engine/src/model/markercollection";

// Maps RegExp match result to find result.
function regexpMatchToFindResult(matchResult) {
  const lastGroupIndex = matchResult.length - 1;

  let startOffset = matchResult.index;

  // Searches with match all flag have an extra matching group with empty string or white space matched before the word.
  // If the search term starts with the space already, there is no extra group even with match all flag on.
  if (matchResult.length === 3) {
    startOffset += matchResult[1].length;
  }

  return {
    label: matchResult[lastGroupIndex],
    start: startOffset,
    end: startOffset + matchResult[lastGroupIndex].length
  };
}

/**
 * Returns text representation of a range. The returned text length should be the same as range length.
 * In order to achieve this, this function will replace inline elements (text-line) as new line character ("\n").
 *
 * @param {module:engine/model/range~Range} range The model range.
 * @returns {String} The text content of the provided range.
 */
function rangeToText(range) {
  return Array.from(range.getItems()).reduce((rangeText, node) => {
    // Trim text to a last occurrence of an inline element and update range start.
    if (!(node.is('text') || node.is('textProxy'))) {
      // Editor has only one inline element defined in schema: `<softBreak>` which is treated as new line character in blocks.
      // Special handling might be needed for other inline elements (inline widgets).
      return `${rangeText}\n`;
    }

    return rangeText + node.data;
  }, '');
}

/**
 * @param {string[]} words The searched words.
 *
 * @returns {Function}
 */
export function createFinderCallbackForWords(words) {
  const nonLetterGroup = '[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]';
  let regExpQuery =
    `(^|${nonLetterGroup}|_)(` +
    words.map((item) => EscapeRegExp(item)).join('|') +
    `)(?=_|${nonLetterGroup}|$)`;

  const regExp = new RegExp(regExpQuery, 'gui');

  function findCallback({text}) {
    const matches = [...text.matchAll(regExp)];

    return matches.map(regexpMatchToFindResult);
  }

  return findCallback;
}

/**
 * Executes findCallback and updates marker list.
 *
 * @param {string} wordGroupType
 * @param {module:engine/model/range~Range} range The model range to scan for matches.
 * @param {module:engine/model/model~Model} model The model.
 * @param {Function} findCallback The callback that should return `true` if provided text matches the search term.
 * @param {MarkerCollection} [startResults] An optional collection of find matches that the function should
 * start with. This would be a collection returned by a previous `updateFindResultFromRange()` call.
 * @returns {MarkerCollection} A collection of markers describing find match.
 */
export function updateResultsFromRange(range, model, findCallback, startResults, wordGroupType) {
  const results = startResults || new MarkerCollection();

  model.change(writer => {
    [...range].forEach(({type, item}) => {
      if (type === 'elementStart') {
        if (model.schema.checkChild(item, '$text')) {
          const foundItems = findCallback({
            item,
            text: rangeToText(model.createRangeIn(item))
          });

          if (!foundItems) {
            return;
          }

          foundItems.forEach(foundItem => {
            const resultId = createMarkerName(wordGroupType);
            const marker = writer.addMarker(resultId, {
              usingOperation: false,
              affectsData: false,
              range: writer.createRange(
                writer.createPositionAt(item, foundItem.start),
                writer.createPositionAt(item, foundItem.end)
              )
            });

            results._set(marker, range);
          });
        }
      }
    });
  });

  return results;
}

/**
 * @returns {string}
 */
export function getMarkerNameBasePrefix() {
  return 'betomat';
}

/**
 *
 * @param {string} wordGroupType
 */
export function getMarkerWordGroupPrefix(wordGroupType) {
  return getMarkerNameBasePrefix() + ':' + wordGroupType;
}

/**
 * @param {string} wordGroupType
 *
 * @returns {string}
 */
export function createMarkerName(wordGroupType) {
  const prefix = createMarkerNamePrefix(wordGroupType);
  return `${prefix}:${uid()}`;
}

/**
 * @param {string} wordGroupType
 *
 * @returns {string}
 */
export function createMarkerNamePrefix(wordGroupType) {
  const basePrefix = getMarkerNameBasePrefix();
  return `${basePrefix}:${wordGroupType}`;
}

/**
 * @param {string} markerName
 *
 * @returns {boolean}
 */
export function isMarkerSupported(markerName) {
  return markerName.startsWith(getMarkerNameBasePrefix() + ':')
}

/**
 * @param {string} markerName
 *
 * @returns {string|null}
 */
export function extractMarkerType(markerName) {
  if (!isMarkerSupported(markerName)) {
    return null;
  }

  return markerName.split(':')[1];
}

/**
 * @param {string} markerName
 */
export function extractMarkerId(markerName) {
  if (!isMarkerSupported(markerName)) {
    return null;
  }

  return markerName.split(':')[2];
}
