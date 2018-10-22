import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import MetaBlockManagement from '../mixins/meta-block-management';

/**
 * Service responsible for providing scroll to interface
 *
 * @module editor-scroll-to-plugin
 * @class RdfaEditorScrollToPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorScrollToPlugin = Service.extend(MetaBlockManagement, {

  /**
   * Restartable task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, contexts, hintsRegistry, editor, extraInfo = []) {
    if (contexts.length === 0) return [];

     yield timeout(200);

     //if we see event was triggered by this plugin, ignore it
    if(extraInfo.find(i => i && i.who == this.who))
      return [];

    this.set('flatScrollLocs', this.manageMetadata(editor));
  }).restartable(),

  scrollTo(location){
    let locationDomInstance = (this.flatScrollLocs.find(l =>  l.scrollToLogicalName == location) || {}).dataInstance;
    locationDomInstance.scrollIntoView();
  }

});

RdfaEditorScrollToPlugin.reopen({
  who: 'editor-plugins/scroll-to-card'
});
export default RdfaEditorScrollToPlugin;
