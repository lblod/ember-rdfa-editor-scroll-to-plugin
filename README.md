@lblod/ember-rdfa-editor-scroll-to-plugin
==============================================================================

Plugin which provides a scroll to element in editor-document interface.

Installation
------------------------------------------------------------------------------

```
ember install ember-rdfa-editor-scroll-to-plugin
```

Usage
------------------------------------------------------------------------------
Location where to scroll to are defined in template as:
```
<!-- Define some meta data about the location in your template. -->

<div class="ext_scroll_to" typeof="ext:ScrollToLocation" resource="http://uri/1">
  <div property="ext:scrollToLogicalName" content="feynmans_scientific_work">feynmans_scientific_work</div>
  <div property="ext:idInSnippet" content="a-uuid">a-uuid</div>
</div>

<!-- Somehwere in the text, the element of interest is provided. -->

<div id="a-uuid"> Selected scientific work. </div>
```

A component could use is as:
```
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  scrollToPlugin: service('rdfa-editor-scroll-to-plugin'),
  actions: {
    scrollToFeynmansScientificWork(){
      this.scrollToPlugin.scrollTo('feynmans_scientific_work');
    }
  }
```

Notes:
* Only the first instance of ext:ScrollToLocation will work as a location scroll to.
* You are in charge of making sure `<div property="ext:idInSnippet" content="foo">foo</div>` and ` id="foo"` are in sync and unique.
* `class="ext_scroll_to"` is optional, but makes your meta block invisible

In host app:  styles/app.scss:
```
@import 'ember-rdfa-editor-scroll-to-plugin';
```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-rdfa-editor-scroll-to-plugin`
* `npm install`

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
