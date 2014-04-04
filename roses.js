if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

function caps(a) {return a.substring(0,1).toUpperCase() + a.substring(1,a.length);}
function uniform(a, b) { return ( (Math.random()*(b-a))+a ); }
function showSlide(id) { $(".slide").hide(); $("#"+id).show(); }
function shuffle(v) { newarray = v.slice(0);for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);return newarray;} // non-destructive.
function sample(v) {return(shuffle(v)[0]);}
function rm(v, item) {if (v.indexOf(item) > -1) { v.splice(v.indexOf(item), 1); }}
function rm_sample(v) {var item = sample(v); rm(v, item); return item;}
var startTime;

var Target = function(frequent, infrequent, superset, beginning, end, article) {
  this.frequent = frequent;
  this.infrequent = infrequent;
  this.superset = superset;
  this.beginning = beginning;
  this.end = end;
  this.article = article == null ? function() {return "";} : article;

  this.sentence = function(version) {
    var frequency = version.frequency; //frequent or infrequent
    var hasOther = version.hasOther; //true or false
    var order = version.order; //subSuper or superSub
    var conjunction = hasOther ? " and other " : " and ";
    var a;
    var b;
    if (order == "subSuper") {
      b = this.superset;
      a = frequency == "frequent" ? this.frequent : this.infrequent;
    } else {
      a = this.superset;
      b = frequency == "frequent" ? this.frequent : this.infrequent;
    }
    if (this.beginning == "") {
      a = caps(a);
    }
    return this.beginning + this.article(a) + a + conjunction + b + this.end;
  }
}

var targetTypes = [];
for (var i=0; i<2; i++) {
  for (var j=0; j<2; j++) {
    for (var k=0; k<2; k++) {
      var frequency = ["frequent","infrequent"][i];
      var hasOther = [true, false][j];
      var order = ["subSuper", "superSub"][k];
      if (!(order == "superSub" && hasOther == true)) {
        targetTypes.push({
          frequency:frequency,
          hasOther:hasOther,
          order:order
        })
      }
    }
  }
}
var qTypes = shuffle(targetTypes.concat(["filler0", "filler1", "filler2", "filler3", "filler4", "filler5"]));
var fillers = {"filler0": "Pat telephoned the sister of Sally’s friend yesterday."
  , "filler1": "The gopher dug a tunnel underneath the fence."
  , "filler2": "A math textbook and a spiral notebook were lying on the kitchen table."
  , "filler3": "Adam and Charlie liked to play cops and robbers together when they were little."
  , "filler4": "Nobody knew the solution to any of the logic puzzles in the book."
  , "filler5": "Jill and Tom met at a cafe for their first date."}
var targets = shuffle([ new Target("roses", "daffodils", "flowers", "This shop sells ", ".")
  , new Target("biologists", "paleontologists", "scientists", "The advisory panel included a number of ", ".")
  , new Target("beef", "veal", "meat", "The recipe called for ", " to be included in the stew.")
  , new Target("oaks", "spruces", "trees", "", " lined the path through the forest.")
  , new Target("surgeons", "anesthesiologists", "doctors", "At the conference there was a special informational session for ", ".")
  , new Target("horse", "waterfowl", "animal", "Lilly ran ", " rescue operation in the small town.", function(nextWord) {
    if (nextWord == "animal") {
      return "an ";
    } else {
      return "a "
    }
  })]);

nQs = 12;

$(document).ready(function() {
  showSlide("consent");
  $("#mustaccept").hide();
  startTime = Date.now();
});

var experiment = {
  data: {
    trials:[]
  },
  
  instructions: function() {
    if (turk.previewMode) {
      $("#instructions #mustaccept").show();
    } else {
      showSlide("instructions");
      $("#begin").click(function() { experiment.trial(0); })
    }
  },
  
  trial: function(qNumber) {
    $('.bar').css('width', ( (qNumber / nQs)*100 + "%"));
    $(".err").hide();

    var trialType = qTypes.shift();
    var trialStart = Date.now();
    var trialData = {response:[], rt:[], qNumber:qNumber, trialType:trialType};

    $("#trialInstructions").html("How acceptable do you think the following sentence is?");

    var sentence;
    console.log(trialType);
    if (typeof(trialType) == "string") {
      sentence = fillers[trialType];
    } else {
      var target = targets.shift();
      console.log(qNumber);
      console.log(trialType);
      console.log(target);
      sentence = target.sentence(trialType);
    }
    $("#sentence").html(sentence);

    showSlide("trial");
    var responseNeeded = true;

    $("#sliderContainer").html('<div id="responseSlider"></div>');
    $("#responseSlider").slider({
               animate: true,
               max: 1 , min: 0, step: .01, value: 0.5,
               slide: function( event, ui ) {
                   $("#responseSlider .ui-slider-handle").css({
                      "background":"#E0F5FF",
                      "border-color": "#001F29"
                   });
               },
               change: function( event, ui ) {
                   $("#responseSlider").css({"background":"#99D6EB"});
                   $("#responseSlider .ui-slider-handle").css({
                     "background":"#667D94",
                     "border-color": "#001F29" });
                   responseNeeded = false;
                   trialData["response"].push(ui.value);
                   trialData["rt"].push(Date.now() - trialStart);
               }});

    $(".continue").click(function() {
      if (responseNeeded) {
        $(".err").show();
      } else {
        $(".continue").unbind("click");
        $(".err").hide();
        experiment.data["trials"].push(trialData);
        if (qNumber + 1 < nQs) {
          experiment.trial(qNumber+1);
        } else {
          experiment.questionaire();
        }
      }
    })
  },
  
  questionaire: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });
    //progress bar complete
    $('.bar').css('width', ( "100%"));
    showSlide("questionaire");
    $("#formsubmit").click(function() {
      rawResponse = $("#questionaireform").serialize();
      pieces = rawResponse.split("&");
      var age = pieces[0].split("=")[1];
      var lang = pieces[1].split("=")[1];
      var comments = pieces[2].split("=")[1];
      if (lang.length > 0) {
        experiment.data["language"] = lang;
        experiment.data["comments"] = comments;
        experiment.data["age"] = age;
        var endTime = Date.now();
        experiment.data["duration"] = endTime - startTime;
        showSlide("finished");
        setTimeout(function() { turk.submit(experiment.data) }, 1000);
      }
    });
  }
}
  
