var semantics = function(params) {
return function(state) {
 return {
    blue: ["bigblue","smallblue"].includes(state) ? params.colorNoiseVal : 1 - params.colorNoiseVal, 
    red: ["bigred"].includes(state) ? params.colorNoiseVal : 1 - params.colorNoiseVal,
    big: ["bigred","bigblue"].includes(state) ? params.sizeNoiseVal : 1 - params.sizeNoiseVal,
    small: ["smallblue"].includes(state) ? params.sizeNoiseVal : 1 - params.sizeNoiseVal,
    pin: 1,
  }
  }
};

var model = function(params) {
  return {
    words : ["big", "small", "blue", "red", "pin"],
    wordCost: {
      "big" : 0,
      "small" : 0,
      "blue" : 0,
      'red'  : 0,
      'pin'  : 0
    },
  }
}
var params = {
    alpha : 30.000000,
    sizeNoiseVal : 0.800000,
    colorNoiseVal : 0.990000,
    sizeCost : 0.000000,
    colorCost : 0.000000,
    nounCost : 0.000000
  }
    
var model = extend(model(params), 
 {states : ["bigblue","bigred","smallblue"], utterances : ["big pin","small pin","blue pin","red pin","big blue pin","small blue pin","big red pin"]}) 
                 
var safeDivide = function(x , y){
  if(y == 0) {
  return(0)
  } else {
  return(x / y)
  }
}

var getTransitions = function(str) {
  var result = []
  var splitStr = str.split(" ")
  var indices = _.range(splitStr.length)
  map(function(i) {
    var transition = (splitStr.slice(0,i + 1)).join(" ")
    result.push(transition)
    },indices)
  return result
}

var licitTransitions = function(model) {
  return _.uniq(_.flatten(map(function(x) { 
  return getTransitions(x) }, model.utterances)))
}

var wordPrior = function(model) {
  return uniformDraw(model.words)
}

var stringCost = function(string,model) {
  var wordcosts = map(function(x) {return model.wordCost[x]}, string)
  return sum(wordcosts)
}

var stringMeanings = function (context, state, model, semantics) {
  var cSplit = context.split(" ")
     var meaning = semantics(state)
    return reduce(function(x, acc) { return meaning[x] * acc; }, 1, cSplit) }

// outputs values on the interval [0,1]: a string s's semantic value at a world w 
// is the sum of semantic values of complete continuations of s true at w, 
// divided by the total number of complete continuations of s:
var stringSemantics = function(context, state, model, semantics) {
  var allContinuations = filter(function(x) {
    return x.startsWith(context)
  } , model.utterances)
  var trueContinuations = reduce(function(x, acc) { return stringMeanings(x, state, model, semantics) + acc; }, 
                                 0, allContinuations)
  return safeDivide(trueContinuations,allContinuations.length)
}

var globalLiteralListener =  function(utterance, model, params, semantics) {
  return Infer(function() {
    var state = uniformDraw(model.states)
    var meaning = stringMeanings(utterance,state,model,semantics)
    if(params.sizeNoiseVal == 1 & params.colorNoiseVal == 1) {
      condition(meaning)
    } else {
      factor(meaning)
    } 
    return state
  }
              )}

var globalUtteranceSpeaker = cache(function(state, model, params, semantics) {
  return Infer({model: function() {
  var utterance = uniformDraw(model.utterances)
  var listener = globalLiteralListener(utterance, model, params, semantics)
  factor(params.alpha * (listener.score(state) - stringCost(utterance.split(" "),model)))
    return utterance } })
})

// literal listener
var incrementalLiteralListener = function(string,model,semantics) {
  return Infer({model: function(){
    var state = uniformDraw(model.states)
    var meaning = Math.log(stringSemantics(string, state, model, semantics))
    factor(meaning)
    return state
  }}
)}

var wordSpeaker = function(context, state, model, params, semantics) {
  return Infer({model: function(){
    var word = wordPrior(model)
    var newContext = context.concat([word])
    // grammar constraint: linear order must be allowed in language
    condition(licitTransitions(model).includes(newContext.join(" "))) 
    // note: condition basically goes away
    var result = (stringMeanings(context.join(" "),state,model,semantics) == 0) ? 1 : params.alpha * (incrementalLiteralListener(newContext.join(" "),model,semantics).score(state) - stringCost(newContext,model))
    factor(result)
    return word
  }})
}

var pragmaticWordListener = function(word, context, model, params, semantics) {
  return Infer({model: function(){
    var state = uniformDraw(model.states)
    factor(wordSpeaker(state, context, model, params, semantics).score(word))
    return state
  }})
}

// S1^{UTT-IP} from the paper: defined according to equation 7
var incrementalUtteranceSpeaker = cache(function(utt, state, model, params, semantics) {
  var string = utt.split(" ")
    var indices = _.range(string.length)
    var probs = map(function(i) {
        var context = string.slice(0,i) 
        //print(context)       
        return Math.exp(wordSpeaker(context,state,model,params,semantics).score(string[i]))  
    },indices)
    return reduce(function(x, acc) { return x * acc; }, 1, probs)
}, 100000)
Math.exp(globalUtteranceSpeaker("smallblue", model, params, semantics(params)).score("big red pin"))