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

var Target = function(common, uncommon, superset, beginning, end) {
  this.common = common;
  this.uncommon = uncommon;
  this.superset = superset;
  this.beginning = beginning;
  this.end = end;
  this.sentence = function(version) {
    switch(version) {
      case 0:
        return this.beginning + " " + this.superset + " and " + this.common + this.end;
        break;
      case 1:
        return this.beginning + " " + this.superset + " and " + this.uncommon + this.end;
        break;
      case 2:
        return this.beginning + " " + this.common + " and " + this.superset + this.end;
        break;
      case 3:
        return this.beginning + " " + this.uncommon + " and " + this.superset + this.end;
        break;
      case 4:
        return this.beginning + " " + this.common + " and other " + this.superset + this.end;
        break;
      case 5:
        return this.beginning + " " + this.uncommon + " and other " + this.superset + this.end;
        break;
      default:
        console.log("ERROR 8: THAT'S NOT A VERSION I KNOW ABOUT!!!");
    }
  }
}

var qTypes = shuffle([0,1,2,3,4,5,-1,-1,-1,-1,-1,-1]); //-1 means filler
var fillers = [ "a filler sentence"
  , "a filler sentence"
  , "a filler sentence"
  , "a filler sentence"
  , "a filler sentence"
  , "a filler sentence"]
var targets = [ new Target("roses", "daffodils", "flowers", "This shop sells", ".")
  , new Target("biologists", "paleontologists", "scientists", "The advisory panel included a number of", ".")
  , new Target("beef", "veal", "meat", "The recipe called for", " to be included in the stew.")
  , new Target("Oaks", "Spruces", "trees", "", " lined the path through the forest.")
  , new Target("anesthesiologists", "surgeons", "doctors", "At the conference there was a special informational session for", ".")
  , new Target("horse", "waterfowl", "animal", "Lilly ran a ", " rescue operation in the small town.") ]

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
    if (trialType == -1) {
      sentence = fillers.shift();
    } else {
      var target = targets.shift();
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
  
