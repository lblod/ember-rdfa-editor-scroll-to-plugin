import Mixin from '@ember/object/mixin';
/**
 * This mixin contains logic to manipulate the DOM linked to the TasklistMetaData
 *************
 * WARNING
 *************
 * The logic contained in here is a brutal copy paste + tweak from what has been written
 * https://github.com/lblod/ember-rdfa-editor-template-variables-manager-plugin
 * A least this logic is concentrated on ONE visible place IN this plugin
 */
export default Mixin.create({

  manageMetadata(editor){
    let metadataBlock = this.fetchOrCreateMetadataBlock(editor);
    this.movedataToMetaBlock(editor, metadataBlock);
    let flatData  = this.flattenInstanceData(editor.rootNode);
    return this.cleanUpNullReferences(editor, flatData);
  },

  /**
   * When new template is added, it might contain metadata
   * We want to move these nodes to a (dom) MetaDataBlock at the beginning of the document.
   * @param {Object} editor
   * @param {Object} domNode containing the centralized meta data block
   */
  movedataToMetaBlock(editor, variablesBlock){
    let variables = [ ...editor.rootNode.querySelectorAll("[typeof='ext:ScrollToLocation']")];
    variables = variables.filter(node => !variablesBlock.contains(node));

    variables.forEach(v => {
      let variableHtml = v.outerHTML;
      editor.prependChildrenHTML(variablesBlock, variableHtml, false, [ this ]);
      editor.removeNode(v, [ this ]);
    });
  },

  moveHtmlToMetaBlock(editor, variablesBlock, variableHtml){
    editor.prependChildrenHTML(variablesBlock, variableHtml, false, [ this ]);
  },

  /**
   * We want to fetch or create the metadata block in the editor-document.
   * This will containing the meta data of the variables
   * @param {Object} editor
   *
   * @return {Object} domNode containing the centralized meta data block
   */
  fetchOrCreateMetadataBlock(editor){
    let variablesBlock = [ ...editor.rootNode.querySelectorAll("[property='ext:metadata']")];
    if(variablesBlock.length > 0){
      return variablesBlock[0];
    }
    return editor.prependChildrenHTML(editor.rootNode,
                                      `<div class="ext_metadata" contenteditable="false" property="ext:metadata">
                                       &nbsp;
                                       </div>`,
                                      true, [ this ])[0];
  },

  /**
   * Find all instances and return as list together with some meta data
   * @param {Object} editor
   *
   * @return {Array} [{intentionUri, TasklistDataInstance, variabelState, TasklistDataMeta}]
   */
  flattenInstanceData(node){
    let dataInstances = [ ...node.querySelectorAll("[typeof='ext:ScrollToLocation']")];
    return dataInstances.map( data => {
      return {
        scrollToLogicalName: this.getScrollToLogicalName(data),
        idInSnipped: this.getScrollToIdInSnippet(data),
        dataInstance: this.getdataDomInstance(data),
        dataMeta: data
      };
    });
  },

  getScrollToLogicalName(domMeta){
    let logicalName = [...domMeta.children].find(child => child.attributes.property.value === 'ext:scrollToLogicalName');
    if(logicalName)
      return logicalName.attributes.content.value;
    return '';
  },

  getScrollToIdInSnippet(domMeta){
    let idInSnippet = [...domMeta.children].find(child => child.attributes.property.value === 'ext:idInSnippet');
    if(idInSnippet)
      return idInSnippet.attributes.content.value;
    return '';
  },

  /**
   * Returns TasklistData dom-instance linked to MetaTasklistDataData
   * @param {Object} domNode
   *
   * @return {Object} domNode
   */
  getdataDomInstance(domMeta){
    let domId =  [...domMeta.children].find(child => child.attributes.property.value === 'ext:idInSnippet').attributes.content.value;
    return document.querySelectorAll(`[id='${domId}']`)[0];
  },

  /**
   * Clean up null reference variables
   * @param {Object} editor
   * @param {Array} [{variableInstance, variableMeta}]
   * @return {Array} up to date [{intentionUri, variableState, variableInstance, variableMeta}]
   */
  cleanUpNullReferences(editor, flatTaskinstanceData){
    return flatTaskinstanceData.reduce((acc, v) => {
      if(!v.dataInstance){
        editor.removeNode(v.dataMeta, [ this ]);
      }
      else{
        acc.push(v);
      }
      return acc;
    }, []);
  },

  removeVariables(editor, logicalName){
    let flatData  = this.flattenInstanceData(editor.rootNode);
    let variables = flatData.filter(v => v.scrollToLogicalName == logicalName);
    variables.forEach(v => editor.removeNode(v.dataMeta, [ this ]));
  }
});
