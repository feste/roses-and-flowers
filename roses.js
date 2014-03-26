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

//counterbalance?
var targetItem = sample([
  "This shop sells flowers and roses."
  , "This shop sells flowers and daffodils."
  , "This shop sells roses and flowers."
  , "This shop sells daffodils and flowers."
  , "This shop sells roses and other flowers."
  , "This shop sells daffodils and other flowers."
]);

var fillerItem = "Jill and Tom met at a coffee shop for their first date.";

var practiceItems = shuffle([
  {text:"Sally put her daugher to bed at eight o'clock pm.", rating:"high"}
  , {text:"Pat took out of the closet a stick of mud.", rating:"medium"}
  , {text:"Bill thought his youngest sister Sally a novel.", rating:"low"}
]);

var qTypes = ["practice", "practice", "practice", "noMorePractice"].concat(shuffle(["target", "filler"]));
var nQs = qTypes.length;

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
    var trialType = qTypes[qNumber];
    $('.bar').css('width', ( (qNumber / nQs)*100 + "%"));
    $(".err").hide();

    if (trialType == "noMorePractice") {
      //warn people this is the real thing
      $("#practiceHeader").html("PRACTICE IS OVER");
      $("#trialInstructions").html("The practice session is over now. PLEASE CHOOSE YOUR RESPONSE CAREFULLY. Click CONTINUE to move on to the real thing.");
      $("#sliderTable").hide();
      $("#sentence").hide();
      $(".continue").click(function() {
        $(".continue").unbind("click");
        $("#sliderTable").show();
        $("#sentence").show();
        if (qNumber + 1 < nQs) {
          experiment.trial(qNumber + 1);
        } else {
          experiment.questionaire();
        }
      })
    } else {
      var trialStart = Date.now();
      var trialData = {response:[], rt:[], qNumber:qNumber, trialType:trialType};

      $("#trialInstructions").html("How acceptable do you think the following sentence is?");
      if (trialType == "practice") {
        $("#practiceHeader").show();
        $("#sentence").html(practiceItems[qNumber].text);
        trialData["item"] = practiceItems[qNumber].text;
        trialData["suggestedRating"] = practiceItems[qNumber].rating;
      } else {
        $("#practiceHeader").hide();
        if (trialType == "filler") {
          $("#sentence").html(fillerItem);
          trialData["item"] = fillerItem;
        } else {
          $("#sentence").html(targetItem);
          trialData["item"] = targetItem;
        }
      }

      showSlide("trial");
      var responseNeeded = true;

      $("#sliderContainer").html('<div id="acceptabilitySlider"></div>');
      $("#acceptabilitySlider").slider({
                 animate: true,
                 max: 1 , min: 0, step: .01, value: 0.5,
                 slide: function( event, ui ) {
                     $("#acceptabilitySlider .ui-slider-handle").css({
                        "background":"#E0F5FF",
                        "border-color": "#001F29"
                     });
                 },
                 change: function( event, ui ) {
                     $("#acceptabilitySlider").css({"background":"#99D6EB"});
                     $("#acceptabilitySlider .ui-slider-handle").css({
                       "background":"#667D94",
                       "border-color": "#001F29" });
                     responseNeeded = false;
                     trialData["response"].push(ui.value);
                     trialData["rt"].push(Date.now() - trialStart);
                     console.log(trialData["response"]);
                 }});

      $(".continue").click(function() {
        if (responseNeeded) {
          $(".err").show();
        } else {
          $(".continue").unbind("click");
          $(".err").hide();
          experiment.data["trials"].push(trialData);
          $("#sliderTable").hide();
          $("#feedback").show();
          if (trialType == "practice") {
            var value = trialData["response"].last();
            var rating = value < 0.3333 ? "low" : value > 0.6666 ? "high" : "medium";
            var feedback;
            if (rating == practiceItems[qNumber].rating) {
              feedback = "CORRECT! This sentence should be rated in the " + rating.toUpperCase() + " acceptability range. Please click CONTINUE again for the next question.";
              trialData["isCorrect"] = true;
              $(".continue").click(function() {
                $(".continue").unbind("click");
                $("#sliderTable").show();
                $("#feedback").hide();
                $(".continue").show();
                if (qNumber + 1 < nQs) {
                  experiment.trial(qNumber+1);
                } else {
                  experiment.questionaire();
                }
              });
            } else {
              feedback = "INCORRECT! Please click CONTINUE to try again.";
              trialData["isCorrect"] = false;
              $(".continue").click(function() {
                $(".continue").unbind("click");
                $("#sliderTable").show();
                $("#feedback").hide();
                $(".continue").show();
                if (qNumber + 1 < nQs) {
                  experiment.trial(qNumber);
                } else {
                  experiment.questionaire();
                }
              });
            }
          } else {
            $(".continue").click(function() {
              $(".continue").unbind("click");
              $("#sliderTable").show();
              $("#feedback").hide();
              $(".continue").show();
              if (qNumber + 1 < nQs) {
                experiment.trial(qNumber+1);
              } else {
                experiment.questionaire();
              }
            });
            feedback = "Thanks! Click CONTINUE again for the next question.";
          }
          $("#feedback").html(feedback);
        }
      })
    }
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
  
