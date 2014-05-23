(function(factory) {

    // Register as an anonymous module.
    if ( typeof define == 'function' && define.amd )
        define(['shadow', 'jquery'], factory)

    // Or using browser globals.
    else factory(shadow, jQuery)

}(function(shadow, $) { 'use strict';


var el = shadow._.el
var $document = $(document)


/**
 * Construct a picker object.
 */
shadow('picker', {

    extend: 'data-field',

    attrs: {
        opened: false
    },

    classNames: {
        host: '',
        opened: '--opened',
        holder: 'holder',
        frame: 'frame',
        wrap: 'wrap',
        box: 'box'
    },
    classNamesPrefix: 'picker',


    /**
     * Create a picker object.
     */
    create: function(options) {

        var picker = this._super(options)
        var classes = picker.classNames

        // Setup the states of the host element.
        var $host = picker.$host.addClass(classes.host)
        picker.on('set:opened', function(event) {
            var value = event.value
            $host.toggleClass(classes.opened, value)
            if ( value ) {
                bindDocumentClickToClose(picker)
            }
            else {
                $document.off('click.' + picker.id)
            }
        })

        // If it’s already opened, bind the document click.
        if ( picker.attrs.opened ) {
            picker.open()
        }

        // Bind the open/close triggers.
        var eventNames = 'click.' + picker.id + ' focusin.' + picker.id
        picker.$el.on(eventNames, function() {
            picker.open()
        })
        if ( picker.$el[0] !== picker.$host[0] ) {
            picker.$host.on(eventNames, function() {
                picker.open()
            })
        }

        return picker
    },


    /**
     * Build out the templating for the picker.
     */
    template: function() {

        var picker = this
        var classes = picker.classNames

        // Create the nodes that contain the content.
        var pickerHolder = el(classes.holder,
            el(classes.frame,
                el(classes.wrap,
                    el(classes.box,
                        picker.content)
                    )
                )
            )

        var frag = document.createDocumentFragment()
        frag.appendChild(pickerHolder)
        return frag
    }, //template


    /**
     * Open & close the picker.
     */
    open: function() {
        if ( !this.attrs.opened ) this.attrs.opened = true
    },
    close: function() {
        if ( this.attrs.opened ) this.attrs.opened = false
    },
    toggle: function() {
        this.attrs.opened = !this.attrs.opened
    }

}) //shadow('picker')


/**
 * When the document is clicked, close the picker.
 */
function bindDocumentClickToClose(picker) {

    var pickerEl = picker.$el[0]
    var pickerHost = picker.$host[0]

    $document.on('click.' + picker.id, function(event) {
        var target = event.target
        if (
            pickerEl !== target &&
            pickerHost !== target &&
            !pickerEl.contains(target) &&
            !pickerHost.contains(target)
        ) {
            picker.close()
        }
    })
}


}));