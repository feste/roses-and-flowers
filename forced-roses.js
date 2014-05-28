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

var targets = {"flowers": new Target("roses", "flowers", "This shop sells ", ".")
  , "scientists": new Target("biologists", "scientists", "The advisory panel included a number of ", ".")
  , "meat": new Target("beef", "meat", "The recipe called for ", " to be included in the stew.")
  , "trees": new Target("oaks", "trees", "", " lined the path through the forest.")
  , "doctors": new Target("surgeons", "doctors", "At the conference there was a special informational session for ", ".")
  , "animal": new Target("horse", "animal", "Lilly ran ", " rescue operation in the small town.", function(nextWord) {
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
      {order:"superSub", hasOther:false, label:"Ss"},
      {order:"subSuper", hasOther:true, label:"other"},
      {order:"subSuper", hasOther:false, label:"sS"}
    ],
    [
      {order:"superSub", hasOther:false, label:"Ss"},
      {order:"subSuper", hasOther:false, label:"sS"},
      {order:"subSuper", hasOther:true, label:"other"}
    ],
    [
      {order:"subSuper", hasOther:true, label:"other"},
      {order:"superSub", hasOther:false, label:"Ss"},
      {order:"subSuper", hasOther:false, label:"sS"}
    ],
    [
      {order:"subSuper", hasOther:false, label:"sS"},
      {order:"superSub", hasOther:false, label:"Ss"},
      {order:"subSuper", hasOther:true, label:"other"}
    ],
    [
      {order:"subSuper", hasOther:true, label:"other"},
      {order:"subSuper", hasOther:false, label:"sS"},
      {order:"superSub", hasOther:false, label:"Ss"}
    ],
    [
      {order:"subSuper", hasOther:false, label:"sS"},
      {order:"subSuper", hasOther:true, label:"other"},
      {order:"superSub", hasOther:false, label:"Ss"}
    ]
  ]),
  items: shuffle(["flowers", "scientists", "doctors", "animal", "trees", "meat"])
};

n_trials = randomization.versions.length;

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

    var versions = randomization.versions[q_number]
    var item = randomization.items[q_number]

    console.log(versions);
    console.log(item);

    var response_data = {
      "item":item,
    };

    $("#sentence0").html(targets[item].sentence(versions[0]));
    $("#sentence1").html(targets[item].sentence(versions[1]));
    $("#sentence2").html(targets[item].sentence(versions[2]));

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
