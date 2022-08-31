import {Command} from "@ckeditor/ckeditor5-core";
import {
  createFinderCallbackForWords,
  createMarkerNamePrefix,
  extractMarkerType,
  updateResultsFromRange
} from "./utils";

export default class UpdateMarkersCommand extends Command {

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


  execute(model, differ, wordGroup) {

    /**
     * @type {MarkerCollection}
     */
    const results = this._state.markers;

    const changedNodes = new Set();
    const removedMarkers = new Set();
    const wordGroupType = wordGroup.type;

    const changes = differ.getChanges();

    // Get nodes in which changes happened to re-run a search callback on them.
    changes.forEach(change => {
      if (
        change.name === '$text' ||
        (
          change.position &&
          change.position.nodeAfter &&
          model.schema.isInline(change.position.nodeAfter)
        )
      ) {
        changedNodes.add(change.position.parent);

        [...model.markers.getMarkersAtPosition(change.position)].forEach(markerAtChange => {
          if (!markerAtChange.name.startsWith(createMarkerNamePrefix(wordGroupType))) {
            return;
          }
          removedMarkers.add(markerAtChange.name);
        });
      } else if (change.type === 'insert') {
        changedNodes.add(change.position.nodeAfter);
      }
    });

    // Get markers from removed nodes also.
    differ.getChangedMarkers().forEach(({name, data: {newRange}}) => {
      if (
        !newRange ||
        newRange.start.root.rootName !== '$graveyard' ||
        extractMarkerType(name) !== wordGroupType
      ) {
        return;
      }
      removedMarkers.add(name);
    });

    // Get markers from the updated nodes and remove all (search will be re-run on these nodes).
    changedNodes.forEach(node => {
      const markersInNode = [
        ...model.markers.getMarkersIntersectingRange(model.createRangeIn(node))
      ].filter(({name}) => extractMarkerType(name) === wordGroupType);

      markersInNode.forEach(marker => removedMarkers.add(marker.name));
    });

    // Remove results & markers from the changed part of content.
    model.change(writer => {
      removedMarkers.forEach(markerName => {

        if (extractMarkerType(markerName) !== wordGroupType) {
          return;
        }

        // Remove the result first - in order to prevent rendering a removed marker.
        if (results.has(markerName)) {
          results._remove(markerName);
        }

        writer.removeMarker(markerName);
      });
    });

    const searchCallback = createFinderCallbackForWords(wordGroup.words);

    // Run search callback again on updated nodes.
    changedNodes.forEach(nodeToCheck => {
      updateResultsFromRange(
        model.createRangeOn(nodeToCheck),
        model,
        searchCallback,
        results,
        wordGroupType,
      );
    });
  }
}
