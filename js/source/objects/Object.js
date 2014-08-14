
/**
 * The core shadow object prototype.
 *
 * @class shadow.Object
 * @static
 */
shadow.Object = Object.create({}, {


    /**
     * The name of the object.
     *
     * Classes are `PascalCased` and objects are `camelCased`.
     *
     * @attribute name
     * @type String
     * @readOnly
     */
    name: {
        enumerable: true,
        value: 'Object'
    },


    /**
     * Create an instance of the shadow object.
     *
     * @method create
     * @param {Object} options Options to extend the object’s prototype.
     * @return {shadow.Object} An instance of the shadow object.
     * @static
     */
    create: {
        enumerable: true,
        value: function(options) {
            var Base = this
            var object = Object.create(Base)
            Object.defineProperties(object, {
                name: { value: _.caseCamel(Base.name), enumerable: true },
                create: { value: _.noop },
                extend: { value: _.noop }
            })
            for ( var item in options ) {
                if ( item in Base ) {
                    var isBasePropertyFn = typeof Base[item] == 'function'
                    if ( shadow.IS_DEBUGGING && isBasePropertyFn ) {
                        checkForSuperCall(options, item)
                    }
                    var value = options[item]
                    if ( isBasePropertyFn && typeof value == 'function' ) {
                        value = superFun(Base, item, value)
                    }
                    _.define(object, item, value)
                }
                else if ( shadow.IS_DEBUGGING ) {
                    throw new ReferenceError('The `' + item + '` property is not recognized by ' + Base + '.')
                }
            }
            return object
        }
    },


    /**
     * Extend the object using prototypes. Based on:
     * http://aaditmshah.github.io/why-prototypal-inheritance-matters/#inheriting_from_multiple_prototypes
     *
     * @method extend
     * @param {Object} options Options to extend the object’s prototype.
     * @return {shadow.Object} An extension of the shadow object class.
     * @static
     */
    extend: {
        enumerable: true,
        value: function(prototype) {

            var Base = this

            if ( !Base.isClass() ) {
                console.debug(Base)
                throw new TypeError('Cannot extend a constructed object.')
            }

            var Instance = Object.create(Base)

            for ( var property in prototype ) {
                if ( prototype.hasOwnProperty(property) ) {
                    if ( property == '_super' ) {
                        throw new Error('The `_super` property is reserved ' +
                            'to allow object method inheritance.')
                    }
                    var isBasePropertyFn = typeof Base[property] == 'function' &&
                        Base[property] !== Object[property]
                    if ( isBasePropertyFn ) {
                        checkForSuperCall(prototype, property)
                    }
                    var value =
                        isBasePropertyFn && typeof prototype[property] == 'function' ?
                            superFun(Base, property, prototype[property]) :
                        $.isPlainObject(Base[property]) && $.isPlainObject(prototype[property]) ?
                            $.extend({}, Base[property], prototype[property]) :
                        prototype[property]
                    _.define(Instance, property, value)
                }
            }

            if ( !Instance.name.match(/^[A-Z]/) ) {
                throw new TypeError('An object’s name must be PascalCased.');
            }
            if ( hasOwnProperty.call(shadow, Instance.name) ) {
                throw new TypeError('An object by the name of “' +
                    Instance.name + '” already exists.')
            }
            shadow[Instance.name] = Instance

            return Instance
        }
    }, //extend


    /**
     * Check if the object is a class.
     *
     * @method isClass
     * @return {Boolean}
     */
    isClass: {
        enumerable: true,
        value: function() {
            var object = this
            var Base = Object.getPrototypeOf(object)
            return object === shadow.Object || !Base.isPrototypeOf(object)
        }
    },


    /**
     * Check if the object inherits from the class of another. Inspiration from:
     * http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
     *
     * @method isClassOf
     * @param {shadow.Object} Instance The instance of a shadow object.
     * @return {Boolean}
     */
    isClassOf: {
        enumerable: true,
        value: function(Instance) {
            var Base = this
            if ( _.isTypeOf(Instance, 'object') ) do {
                Instance = Object.getPrototypeOf(Instance)
                if ( Base === Instance ) {
                    return true
                }
            } while (Instance)
            return false
        }
    },


    /**
     * Check if the object is an instance of another. Inspiration from:
     * http://aaditmshah.github.io/why-prototypal-inheritance-matters/#fixing_the_instanceof_operator
     *
     * @method isInstanceOf
     * @param {shadow.Object} Base The class of a shadow object.
     * @return {Boolean}
     */
    isInstanceOf: {
        enumerable: true,
        value: function(Base) {
            return this.isClassOf.call(Base, this)
        }
    },


    /**
     * Check if the object is the prototype of another.
     *
     * @method isPrototypeOf
     * @param {shadow.Object} object A shadow object.
     * @return {Boolean}
     */
    isPrototypeOf: {
        enumerable: true,
        value: function(object) {
            var Base = this
            var Prototype = Object.getPrototypeOf(object)
            return Base === Prototype &&
                object.name === _.caseCamel(Prototype.name)
        }
    },


    /**
     * Cast the object into a string representation.
     *
     * @method toString
     * @return {String} A string representation of the shadow object.
     */
    toString: {
        enumerable: true,
        value: function() {
            if ( shadow.IS_DEBUGGING ) {
                return this.toFullString()
            }
            var object = this
            var isClass = object.isClass()
            var type = isClass ? 'class' : 'object'
            var Base = isClass ? object : Object.getPrototypeOf(object)
            return '{' + type + ' ' + Base.name + '}'
        }
    },


    /**
     * Cast the object into a full string representation.
     *
     * @method toFullString
     * @return {String} A full trace string representation of the shadow object.
     * @private
     */
    toFullString: {
        enumerable: true,
        value: function() {
            var object = this
            var isClass = object.isClass()
            var type = isClass ? 'class' : 'object'
            var names = []
            if ( !isClass ) {
                object = Object.getPrototypeOf(object)
            }
            do {
                names.push(object.name)
                object = Object.getPrototypeOf(object)
            } while (object && object.name)
            return '{' + type + ' ' + names.join(':') + '}'
        }
    }

}) //shadow.Object


// Check if the super method was called within a wrapped method..
function checkForSuperCall(prototype, property) {
    var methodString = '' + prototype[property]
    var variableNameMatch = methodString.match(/(\w+) *= *this/)
    var variableName = variableNameMatch && variableNameMatch[1] + '|' || ''
    var invoker = '(\\.(call|apply))?\\('
    var superRegex = new RegExp('(?:' + variableName + 'this)\\._super(' + invoker + ')')
    if ( !methodString.match(superRegex) ) {
        console.warn('Overriding the base method `' + property + '` ' +
            'without calling `this._super()` within the method might cause ' +
            'unexpected results. Make sure this is the behavior you desire.\n',
            prototype)
    }
}


// Allow inheritence of super methods. Based on:
// http://ejohn.org/blog/simple-javascript-inheritance/
function superFun(Base, property, fn) {
    return function superWrapper() {
        var object = this
        object._super = Base[property]
        var ret = fn.apply(object, arguments)
        delete object._super
        return ret
    }
}
