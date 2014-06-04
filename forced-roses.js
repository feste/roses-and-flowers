function caps(a) {return a.substring(0,1).toUpperCase() + a.substring(1,a.length);}
function uniform(a, b) { return ( (Math.random()*(b-a))+a ); }
function showSlide(id) { $(".slide").hide(); $("#"+id).show(); }
function shuffle(v) { newarray = v.slice(0);for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);return newarray;} // non-destructive.
function sample(v) {return(shuffle(v)[0]);}
function rm(v, item) {if (v.indexOf(item) > -1) { v.splice(v.indexOf(item), 1); }}
function rm_sample(v) {var item = sample(v); rm(v, item); return item;}
function sample_n(v, n) {var lst=[]; var v_copy=v.slice(); for (var i=0; i<n; i++) {lst.push(rm_sample(v_copy))}; return(lst);}
function rep(e, n) {var lst=[]; for (var i=0; i<n; i++) {lst.push(e);} return(lst);}
function b(string) {return "<b>" + string + "</b>";}
var startTime;

var Target = function(subset, superset, beginning, end, article) {
  this.subset = subset;
  this.superset = superset;
  this.beginning = beginning;
  this.end = end;
  this.article = article == null ? function() {return "";} : article;

  this.sentence = function(version) {
    var hasOther = version.hasOther; //true or false
    var order = version.order; //subSuper or superSub
    var conjunction = hasOther ? " and other " : " and ";
    var a;
    var b;
    if (order == "subSuper") {
      b = this.superset;
      a = this.subset;
    } else {
      a = this.superset;
      b = this.subset;
    }
    if (this.beginning == "") {
      a = caps(a);
    }
    return this.beginning + this.article(a) + a + conjunction + b + this.end;
  }
}

var targets = {"flowers": new Target("daffodils", "flowers", "This shop sells ", ".")
  , "scientists": new Target("paleontologists", "scientists", "The advisory panel included a number of ", ".")
  , "meat": new Target("veal", "meat", "The recipe called for ", " to be included in the stew.")
  , "trees": new Target("spruces", "trees", "", " lined the path through the forest.")
  , "doctors": new Target("anesthesiologists", "doctors", "At the conference there was a special informational session for ", ".")
  , "animal": new Target("waterfowl", "animal", "Lilly ran ", " rescue operation in the small town.", function(nextWord) {
    if (nextWord == "animal") {
      return "an ";
    } else {
      return "a "
    }
  })};

// returns selected elements and creates a new array with those elements (called 'foo')
function range(start, end)
{
    var foo = [];
    for (var i = start; i <= end; i++)
        foo.push(i);
    return foo;
}

var randomization = {
  versions: shuffle([
    [
      {type:"target", order:"superSub", hasOther:false, label:"Ss"},
      {type:"target", order:"subSuper", hasOther:true, label:"other"},
      {type:"target", order:"subSuper", hasOther:false, label:"sS"}
    ],
    [
      {type:"target", order:"superSub", hasOther:false, label:"Ss"},
      {type:"target", order:"subSuper", hasOther:false, label:"sS"},
      {type:"target", order:"subSuper", hasOther:true, label:"other"}
    ],
    [
      {type:"target", order:"subSuper", hasOther:true, label:"other"},
      {type:"target", order:"superSub", hasOther:false, label:"Ss"},
      {type:"target", order:"subSuper", hasOther:false, label:"sS"}
    ],
    [
      {type:"target", order:"subSuper", hasOther:false, label:"sS"},
      {type:"target", order:"superSub", hasOther:false, label:"Ss"},
      {type:"target", order:"subSuper", hasOther:true, label:"other"}
    ],
    [
      {type:"target", order:"subSuper", hasOther:true, label:"other"},
      {type:"target", order:"subSuper", hasOther:false, label:"sS"},
      {type:"target", order:"superSub", hasOther:false, label:"Ss"}
    ],
    [
      {type:"target", order:"subSuper", hasOther:false, label:"sS"},
      {type:"target", order:"subSuper", hasOther:true, label:"other"},
      {type:"target", order:"superSub", hasOther:false, label:"Ss"}
    ],
    shuffle([
      {type:"filler", sentence:"Off a cliff sprang the giddy driver.", label:"cliff"},
      {type:"filler", sentence:"The giddy driver sprang off a cliff.", label:"cliffA"},
      {type:"filler", sentence:"Off a cliff the giddy driver sprang.", label:"cliffB"}
    ]),
    shuffle([
      {type:"filler", sentence:"The gopher dug a tunnel underneath the fence.", label:"gopher"},
      {type:"filler", sentence:"As for the gopher, it dug a tunnel underneath the fence.", label:"gopherA"},
      {type:"filler", sentence:"Underneath the fence the gopher dug a tunnel.", label:"gopherB"}
    ]),
    shuffle([
      {type:"filler", sentence:"A math textbook and a spiral notebook were lying on the kitchen table.", label:"math"},
      {type:"filler", sentence:"A math textbook and a spiral notebook lay on the kitchen table.", label:"mathA"},
      {type:"filler", sentence:"A math textbook and a spiral notebook were on the kitchen table.", label:"mathB"}
    ]),
    shuffle([
      {type:"filler", sentence:"Adam and Charlie liked to play cops and robbers together when they were little.", label:"adam"},
      {type:"filler", sentence:"When they were little, Adam and Charlie liked to play cops and robbers together.", label:"adamA"},
      {type:"filler", sentence:"Together Adam and Charlie liked to play cops and robbers when they were little.", label:"adamB"}
    ]),
    shuffle([
      {type:"filler", sentence:"Nobody knew the solution to any of the logic puzzles in the book.", label:"puzzles"},
      {type:"filler", sentence:"As for the logic puzzles in the book, nobody knew the solution to any of them.", label:"puzzlesA"},
      {type:"filler", sentence:"Nobody could solve any of the logic puzzles in the book.", label:"puzzlesB"}
    ])
  ]),
  items: shuffle(["flowers", "scientists", "doctors", "animal", "trees", "meat"])
};

n_trials = randomization.versions.length;

n_targets_completed = 0;

$(document).ready(function() {
  showSlide("consent");
  $("#mustaccept").hide();
  startTime = Date.now();
});

var experiment = {
  data: {
    "randomization": randomization,
    "trials": []
  },
  intro: function() {
    showSlide("introduction");
    $(".continue").click(function() {
      $(".continue").unbind("click");
      experiment.trial(0);
    });
  },

  trial: function(q_number) {
    $('.bar').css('width', ( (q_number / n_trials)*100 + "%"));
    $(".err").hide();
    showSlide("trial");

    var versions = randomization.versions[q_number];

    if (versions[0].type == "target") {
      var item = randomization.items[n_targets_completed];

      var response_data = {
        "item":item,
        "type":"target"
      };

      $("#sentence0").html(targets[item].sentence(versions[0]));
      $("#sentence1").html(targets[item].sentence(versions[1]));
      $("#sentence2").html(targets[item].sentence(versions[2]));

      n_targets_completed++
    } else {
      var response_data = {
        "type":"filler",
        "item":"NA",
      };
      $("#sentence0").html(versions[0].sentence);
      $("#sentence1").html(versions[1].sentence);
      $("#sentence2").html(versions[2].sentence);
    }

    var choice = null;
    $('input:radio[name=myradio]').click(function() {
      choice = $('input:radio[name=myradio]:checked').val();
    });

    //continue button
    $(".continue").click(function() {
      if (choice != null) {
        $(".continue").unbind("click");
        $('input:radio[name=myradio]').unbind("click");
        response_data["response"] = versions[parseInt(choice)].label;
        experiment.data["trials"].push(response_data);
        if (q_number + 1 < n_trials) {
          experiment.trial(q_number + 1);
          $('input:radio[name=myradio]').attr('checked',false);
        } else {
          experiment.questionnaire();
        }
      } else {
        $(".err").show();
      }
    });
  },
  questionnaire: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });

    //progress bar complete
    $('.bar').css('width', ( "100%"));

    showSlide("questionnaire");

    //submit to turk (using mmturkey)
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
