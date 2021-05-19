/**
 * Stores classes and methods which modelling and interacting with HTML content
 */
/**
 * generateHTML content from the given weather data
 * @param {JSON} data weather data from OWM ass JSON object.
 * @returns the HTML as String
 */
function generateWeatherDataHTML(data) {

    let header = generateSimpleHeader("header", "Weather at: Lat: " + data.coord.lat + ", Long: " + data.coord.lon + ", in: " + data.name + ", " + data.sys.country, 3);
    let temperatureParagraph = generateSimpleParagraph("temperatureP", "The temperature is " + data.main.temp + " degree Celsius, feels like: " + data.main.feels_like + " degree celsius.");
    let temperatureMinMax = generateSimpleParagraph("temperatureMinMax", "Temperatures measured from: " + data.main.temp_min + " to " + data.main.temp_max + " degree celsius.");
    let descriptionParagraph = generateSimpleParagraph("descriptionParagraph", "Weather description: " + data.weather[0].description + ":");
    let weatherIcon = new HTMLTagWithoutInnerHTML("img", [new HTMLAttribute("src", generateIconLink(data.weather[0].icon))]);
    let windParagraph = generateSimpleParagraph("windParagraph", "Wind speed: " + data.wind.speed + "m/s, wind direction: " + data.wind.deg + " degree");
    let div = new HTMLTagWithInnerHTML("div", [new HTMLAttribute("id", "weatherData")], new InnerHTMLComplex([header, temperatureParagraph, temperatureMinMax, descriptionParagraph, weatherIcon, windParagraph]));
    htmlString = div.toString();
    return htmlString;
}

/**
 * These method generate a simple HTML Paragraph (<p>) object.
 * @param {String} id an value for the id key of the HTML Tag. 
 * @param {String} text will be put inside the paragraph. 
 * @returns An TagWithInnerHTML object storing the given information.
 */
function generateSimpleParagraph(id, text) {
    return new HTMLTagWithInnerHTML("p", [new HTMLAttribute("id", id)], new InnerHTMLPrimitive(text));
}

/**
 * These method generate a simple HTML Header (<h_>) object.
 * @param {String} id an value for the id key of the HTML Tag. 
 * @param {String} text will be put inside the paragraph. 
 * @param {Number} order a number between 1 and 6 describing the order of the header, e.g. order=2 ==> <h2>
 * @returns An TagWithInnerHTML object storing the given information.
 */
function generateSimpleHeader(id, text, order = 1) {
    if (order < 1 || order > 6) {
        throw new Error("order is not in range (must be from 1-6)");
    }
    return new HTMLTagWithInnerHTML("h" + order, [new HTMLAttribute("id", id)], new InnerHTMLPrimitive(text));
}

/**
 * Stores information about an HTML attribute, for example the id attribute.
 * @class
 */
class HTMLAttribute {

    /**
     * 
     * @param {String} key string represantion of the key, e.g "id" or "src". 
     * @param {String} value The value, wich is linked to the key e.g. "exampleID" or "script.js"
     * @constructor
     */
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }


    /**
     * Build an String representation of the attribute, which can be used in HTML code.
     * @returns The String represantion of the attribute as valid HTML-code
     */
    toString() {
        return this.key + "=\"" + this.value + "\""
    }
}

/**
 * These class works as an abstract class. Not recommended to construct an object of these class. Works as superclass for HTMLTagWithInnerHTML
 * and HTMLTagWithoutInnerHTML. Stores information about an HTML Tag. Sub classes need to implement an method totring(), which must return
 * the information stored in the object as valid HTML code.
 * @class
 * @abstract
 */
class HTMLTag {

    /**
     * 
     * @param {String} tagname The name of the HTMLTag, e.g. "div", "h1" or "p".
     * @param {HTMLTag[]} attributes The attributes which are holded by the HTML Tag. Should be stored as Array, by default an empty Array.
     * @constructor
     */
    constructor(tagname, attributes = []) {
        this.tagname = tagname;
        this.attributes = attributes;
    }

    /**
     * Building a String represantion of the tag. Here implemented for a tag without innerHTML.
     * @returns A String represantion of the Tag as HTML code.
     */
    toString() {
        if (this.attributes == []) {
            return "<" + this.tagname + "/>";
        } else {
            let out = "<" + this.tagname;
            for (let i = 0; i < this.attributes.length; i++) {
                out += " " + this.attributes[i].toString();

            }
            out += "/>"
            return out;
        }

    }
}

/**
 * These class is for HTMLTags with innerHTML. The innerHTML is stored in an InnerHTML object. 
 * @class
 * @extends {HTMLTag}
 */
class HTMLTagWithInnerHTML extends HTMLTag {

    /**
     * 
     * @param {String} tagname The name of the HTMLTag, e.g. "div", "h1" or "p".
     * @param {HTMLTag[]} attributes The attributes which are holded by the HTML Tag. Should be stored as Array, by default an empty Array.
     * @param {InnerHTML} innerHTML the InnerHTML of the tag. By default an InnerHTMLPrimitive object with an enpty String. 
     * @constructor
     */
    constructor(tagName, attributes = [], innerHTML = new InnerHTMLPrimitive()) {

        super(tagName, attributes);
        this.innerHTML = innerHTML;
    }

    /**
     * Building a String repreantion of the tag.
     * @returns A String represantion of the Tag as HTML code.
     */
    toString() {
        if (this.attributes == []) {
            return "<" + this.tagname + ">" + this.innerHTML.toString() + "</" + this.tagname + ">";
        } else {
            let out = "<" + this.tagname;
            for (let i = 0; i < this.attributes.length; i++) {
                out += " " + this.attributes[i].toString();

            }
            out += ">" + this.innerHTML.toString() + "</" + this.tagname + ">";
            return out;
        }
    }
}

/**
 * These class store information about HTML Tags without an innerHTML. It behaves like their superclass object. The constructor and toString()
 * method only calls their super method/constructor
 * @class
 * @extends {HTMLTag}
 */
class HTMLTagWithoutInnerHTML extends HTMLTag {

    /**
     * 
     * @param {String} tagname The name of the HTMLTag, e.g. "div", "h1" or "p".
     * @param {HTMLTag[]} attributes The attributes which are holded by the HTML Tag. Should be stored as Array, by default an empty Array.
     * @constructor
     */
    constructor(tagName, attributes = []) { super(tagName, attributes); }

    /**
    * Building a String represantion of the tag. Here implemented for a tag without innerHTML.
    * @returns A String represantion of the Tag as HTML code.
    */
    toString() { return super.toString(); }
}

/**
 * These class works as abstract super class for InnerHTMLPrimitive and InnerHTMLComplex. Do not initialize objects from these class.
 * It only holds structuring informations, their ar no logical things implemented.
 * @class
 * @abstract
 */
class InnerHTML {
    constructor() { };
    toString() { };
}


/**
 * These class represent simple innerHTML. These innerHTMl can only hold primitive data as String, for example the content of a <p> tag.
 * @class
 * @extends {InnerHTML}
 */
class InnerHTMLPrimitive extends InnerHTML {

    /**
     * 
     * @param {String} innerHTML The String, which should stand inside the HTML tag.  
     */
    constructor(innerHTML = "") {
        super();
        this.innerHTML = innerHTML;
    }

    /**
     * 
     * @returns The innerHTML String.
     */
    toString() {
        return this.innerHTML;
    }
}

/**
 * These class store information about complex innerHTML. Inside these object we can store an Array of HTMLTags, these makes it possible to
 * define an tree of nested HTMLTags
 * @class
 * @extends {InnerHTML}
 */
class InnerHTMLComplex extends InnerHTML {

    /**
     * 
     * @param {HTMLTag[]} htmlTags the tags, which should be inside the innerHTMl stored ass an Array. By default an empty array. 
     */
    constructor(htmlTags = []) {
        super();
        this.htmlTags = htmlTags;
    }

    /**
     * 
     * @returns All String represantions of the htmlTags lined up.
     */
    toString() {
        let out = "";
        for (let i = 0; i < this.htmlTags.length; i++) {
            out += this.htmlTags[i].toString()

        }
        return out;
    }
}