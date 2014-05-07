
/*!
 * <%= pkg.title %> v<%= pkg.version %>, <%= grunt.template.today("yyyy/mm/dd") %>
 * By <%= pkg.author.name %>, <%= pkg.author.url %>
 * Hosted on <%= pkg.homepage %>
 * Licensed under <%= pkg.licenses[0].type %>
 */

(function (root, factory) {

    // Setup the exports for Node module pattern...
    if ( typeof module == 'object' && typeof module.exports == 'object' )
        module.exports = factory(root, root.jQuery)

    // ...AMD...
    else if ( typeof define == 'function' && define.amd )
        define('shadow', [root, 'jquery'], factory)

    // ...and basic `script` includes.
    else root.shadow = factory(root, root.jQuery)

}(this, function(window, $, undefined) {

'use strict';