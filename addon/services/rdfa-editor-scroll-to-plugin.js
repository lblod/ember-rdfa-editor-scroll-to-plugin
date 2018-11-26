import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import MetaBlockManagement from '../mixins/meta-block-management';
import uuid from 'uuid/v4';

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

    this.manageMetadata(editor);
  }).restartable(),

  async scrollTo(location){
    let flatScrollLocs = this.flattenInstanceData(document);
    let locationDomInstance = (flatScrollLocs.find(l =>  l.scrollToLogicalName == location) || {}).dataInstance;
    if(!locationDomInstance){
      return;
    }

    //TODO: fix workaround -> transistion end event is not always fired
    let animationClass = 'scrollto-highlight';
    locationDomInstance.classList.add(animationClass);
    locationDomInstance.scrollIntoView();
    window.setTimeout(() => locationDomInstance.classList.remove(animationClass), 2000);

  },

  addScrollToLocation(editor, domNode, logicalName, removePreviousVariables = true, notifyPlugins = true){
    domNode.id = domNode.id ? domNode.id : uuid();
    let metaHtml = `
    <div class="ext_scroll_to" typeof="ext:ScrollToLocation" resource="http://scrollTo/${logicalName}/${domNode.id}">
      <div property="ext:scrollToLogicalName" content="${logicalName}">${logicalName}</div>
      <div property="ext:idInSnippet" content="${domNode.id}">${domNode.id}</div>
    </div>`;

    if(notifyPlugins){
      if(removePreviousVariables){
        this.removeVariables(editor, logicalName);
      }
      let variablesBlock = this.fetchOrCreateMetadataBlock(editor);
      this.moveHtmlToMetaBlock(editor, variablesBlock, metaHtml);
      return;
    }
    /*
     * Note: this could be a temporary code path. Of at least the current implementation.
     * In some cases, we don't want to trigger plugins.
     *   E.g: adding a last-save-point and then transitioning to a new route.
     *        This could make plugins work on non attached dom nodes. Which, for now, results in errors etc.
     *       -> To mitigate the issue above, we'd opt for a general sync point (e.g. a lock of the editor of some sort)
     *        Now, there is no time to dig the topic further, we have 2 days left before release.
     */
    if(removePreviousVariables){
      let variables = document.querySelectorAll(`[property="ext:scrollToLogicalName"][content="${logicalName}"]`);
      variables.forEach(v => v.parentElement.remove());
    }
    let template = document.createElement('template');
    template.innerHTML = metaHtml.trim();
    document.querySelector('[property="ext:metadata"]').appendChild(template.content.firstChild);
  }

});

RdfaEditorScrollToPlugin.reopen({
  who: 'editor-plugins/scroll-to-card'
});
export default RdfaEditorScrollToPlugin;
