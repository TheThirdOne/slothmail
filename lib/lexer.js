/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the GNU LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 */

function LexerNode(string, regex, regexs){
	this.string = string;
    this.children = [];
	if (string) {
		this.matches = string.match(regex);
		var childElements = string.split(regex);
	}
	if (!this.matches) {
		this.matches = [];
		var childElements = [string];
	}
	if (regexs.length > 0) {
        var nextRegex = regexs[0];
		var nextRegexes = regexs.slice(1);
		for (var i in childElements) {
			this.children.push(new LexerNode(childElements[i], nextRegex, nextRegexes));
        }
    }
    else {
        this.children = childElements;
    }
}

LexerNode.prototype.fillArray = function(array){
    for (var i in this.children) {
        var child = this.children[i];
        if (child.fillArray) 
            child.fillArray(array);
        else if (/[^ \t\n\r]+/i.test(child))
            array.push(child);
        if (i < this.matches.length) {
			var match = this.matches[i];
			if (/[^ \t\n\r]+/i.test(match))
                array.push(match);
        }
    }
}

LexerNode.prototype.toString = function(){
    var array = [];
    this.fillArray(array);
    return array.toString();
}

function Lexer(){
	// Split by numbers, then whitespace, then punctuation
    this.regexs = [/[0-9]*\.[0-9]+|[0-9]+/ig, /[ \t\n\r]+/ig, /[\.\,\?\!]/ig];
}

Lexer.prototype.lex = function(string){
	var array = [];
    var node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));
    node.fillArray(array);
    return array;
}

//var lexer = new Lexer();
//print(lexer.lex("I made $5.60 today in 1 hour of work.  The E.M.T.'s were on time, but only barely.").toString());

/*!
 * jsPOS
 *
 * Copyright 2010, Percy Wegmann
 * Licensed under the LGPLv3 license
 * http://www.opensource.org/licenses/lgpl-3.0.html
 * 
 * Enhanced by Toby Rahilly to use a compressed lexicon format as of version 0.2.
 */
exports.Lexer = Lexer;
exports.LexerNode = LexerNode;
var lexicon = require('./lexicon.js');

function POSTagger(){
    this.lexicon = lexicon.POSTAGGER_LEXICON;
    this.tagsMap = lexicon.LEXICON_TAG_MAP;
}

/**
 * Indicates whether or not this string starts with the specified string.
 * @param {Object} string
 */
String.prototype.startsWith = function(string){
    if (!string) 
        return false;
    return this.indexOf(string) == 0;
}

/**
 * Indicates whether or not this string ends with the specified string.
 * @param {Object} string
 */
String.prototype.endsWith = function(string){
    if (!string || string.length > this.length) 
        return false;
    return this.indexOf(string) == this.length - string.length;
}

POSTagger.prototype.wordInLexicon = function(word){
    var ss = this.lexicon[word];
    if (ss != null) 
        return true;
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss) 
        ss = this.lexicon[word.toLowerCase()];
    if (ss) 
        return true;
    return false;
}

POSTagger.prototype.tag = function(words){
    var ret = new Array(words.length);
    for (var i = 0, size = words.length; i < size; i++) {
        var ss = this.lexicon[words[i]];
        // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
        if (!ss) 
            ss = this.lexicon[words[i].toLowerCase()];
        if (!ss && words[i].length == 1) 
            ret[i] = words[i] + "^";
        if (!ss) 
            ret[i] = "NN";
        else 
            ret[i] = this.tagsMap[ss][0];
    }
	
	/**
     * Apply transformational rules
     **/
    for (var i = 0; i < words.length; i++) {
        word = ret[i];
		//  rule 1: DT, {VBD | VBP} --> DT, NN
        if (i > 0 && ret[i - 1] == "DT") {
            if (word == "VBD" ||
            word == "VBP" ||
            word == "VB") {
                ret[i] = "NN";
            }
        }
        // rule 2: convert a noun to a number (CD) if "." appears in the word
        if (word.startsWith("N")) {
			if (words[i].indexOf(".") > -1) {
                ret[i] = "CD";
            }
			// Attempt to convert into a number
            if (parseFloat(words[i]))
                ret[i] = "CD";
        }
        // rule 3: convert a noun to a past participle if words[i] ends with "ed"
        if (ret[i].startsWith("N") && words[i].endsWith("ed")) 
            ret[i] = "VBN";
        // rule 4: convert any type to adverb if it ends in "ly";
        if (words[i].endsWith("ly")) 
            ret[i] = "RB";
        // rule 5: convert a common noun (NN or NNS) to a adjective if it ends with "al"
        if (ret[i].startsWith("NN") && word.endsWith("al")) 
            ret[i] = i, "JJ";
        // rule 6: convert a noun to a verb if the preceding work is "would"
        if (i > 0 && ret[i].startsWith("NN") && words[i - 1].toLowerCase() == "would") 
            ret[i] = "VB";
        // rule 7: if a word has been categorized as a common noun and it ends with "s",
        //         then set its type to plural common noun (NNS)
        if (ret[i] == "NN" && words[i].endsWith("s")) 
            ret[i] = "NNS";
        // rule 8: convert a common noun to a present participle verb (i.e., a gerund)
        if (ret[i].startsWith("NN") && words[i].endsWith("ing")) 
            ret[i] = "VBG";
    }
	var result = new Array();
	for (i in words) {
		result[i] = [words[i], ret[i]];
	}
    return result;
}

POSTagger.prototype.prettyPrint = function(taggedWords) {
	for (i in taggedWords) {
        print(taggedWords[i][0] + "(" + taggedWords[i][1] + ")");
    }
}
exports.POSTagger = POSTagger

//print(new POSTagger().tag(["i", "went", "to", "the", "store", "to", "buy", "5.2", "gallons", "of", "milk"]));