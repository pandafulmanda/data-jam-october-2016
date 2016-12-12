const simplex = new SimplexNoise(Math.random);

const sampledNotes = {
  "A" : "./assets/sounds/casio/A1.mp3",
  "C#" : "./assets/sounds/casio/Cs2.mp3",
  "E" : "./assets/sounds/casio/E2.mp3",
  "F#" : "./assets/sounds/casio/Fs2.mp3"
};

const sampledBass = {
  "high-hat": "./assets/sounds/505/hh.mp3",
  "kick": "./assets/sounds/505/kick.mp3",
  "snare": "./assets/sounds/505/snare.mp3"
};

// const eventPan = new Tone.Panner3D().toMaster();
// const memberPan = new Tone.Panner3D().toMaster();
const memberKeys = new Tone.MultiPlayer({
  urls : sampledNotes,
  volume : -12,
  fadeOut : 0.2,
}).toMaster();
// .connect(memberPan).sync();

const eventBass = new Tone.MultiPlayer({
  urls : sampledBass,
  volume : 0,
  fadeOut : 0.1,
}).toMaster();
// .connect(eventPan).sync();

const memberNotes = _.keys(sampledNotes);
const eventDrums = _.keys(sampledBass);

function ratioToPan(ratio){
  const range = 8;
  return ratio * range - range/2;
}

function getNoisySound(time, sounds){
  const noisy = simplex.noise2D(time, 0);
  const noisyIndex = (noisy + 1) / 2 * sounds.length;
  return sounds[Math.round(noisyIndex)];
}

function processData(file, onCompletion){
  Papa.parse(file, {
    download: true,
    header: true,
    complete: function(results) {
      onCompletion(results.data);
    }
  });
}

const typeToDrum = {
  other: 'snare',
  monthly: 'kick',
  'data-jam': 'high-hat'
};

function fadeOut(element){
  element.classList.add('fade');
  _.delay(function(){
    element.classList.add('hide');
  }, 200);
}

function fadeIn(element){
  _.delay(function(){
    element.classList.remove('hide');
    element.classList.remove('fade');
  }, 200);
}

class Meetup {
  constructor (){
    this.title = document.getElementById('title');
    this.playButton = document.getElementById('play');

    this.playButton.addEventListener('click', this.start.bind(this));
    this.playButton.querySelector('a').addEventListener('click', function(clickEvent){
      clickEvent.stopPropagation();
    });


    const pause = this.pause.bind(this);
    const start = this.start.bind(this);
    window.onblur = pause;
    document.onkeydown = function(keyEvent){
      if(keyEvent.code === 'Space'){
        if(Tone.Transport.state === 'started'){
          pause();
        } else {
          start();
        }
      }
    }
  }

  set interests(data){
    this._interests = data;
  }
  get interests(){
    return this._interests;
  }

  set events(data){
    _.forEach(data, function(meetup){
      Tone.Transport.scheduleOnce(function(time){
        title.innerText = meetup.name;
        title.dataset.type = meetup.type;
        // eventPan.setPosition(
        //   ratioToPan(meetup.time.daysRatio),
        //   ratioToPan(meetup.time.monthsRatio),
        //   0
        // );
        if(typeToDrum[meetup.type] === 'high-hat'){
          eventBass.start(typeToDrum[meetup.type], time, 0, 0.1);
        } else {
          eventBass.start(typeToDrum[meetup.type]);
        }
      }, meetup.time.ratio);
    });
    this._events = data;
  }
  get events(){
    return this._events;
  }

  set members(data){
    this._members = data;
    _.forEach(data, function(member, iter){
      Tone.Transport.scheduleOnce(function(time){
        // memberPan.setPosition(
        //   ratioToPan(member.time.daysRatio),
        //   ratioToPan(member.time.monthsRatio),
        //   0
        // );
        memberKeys.start(getNoisySound(time, memberNotes));
      }, member.time.ratio);
    });
    this.interestCounts = _(this._members)
      .map('Interests')
      .flattenDeep()
      .compact()
      .countBy('name')
      .value();

    Tone.Transport.bpm.value = 40;
  }
  get members(){
    return this._members;
  }

  start(){
    fadeOut(this.playButton);
    fadeIn(this.title);
    Tone.Transport.start();
  }

  pause(){
    fadeIn(this.playButton);
    fadeOut(this.title);
    Tone.Transport.pause();
  }
}

function _getMonthProgress(date){
  return date.valueOf() - date.clone().startOf('month').valueOf();
}

var getMonthProgress = _.memoize(_getMonthProgress);

function getMonthDuration(date){
  return getMonthProgress(date.clone().endOf('month'));
}

function getMonthRatio(date){
  return getMonthProgress(date) / getMonthDuration(date);
}

function processThingBase(thing, timeProperty, ...properties){
  let simpleData = _.pick(thing, ...properties);
  let thingMoment = moment(parseInt(thing[timeProperty]));
  simpleData.time = {
    original: thing[timeProperty],
    moment: thingMoment,
    string: thingMoment.format(),
    milliseconds: thingMoment.valueOf(),
    human: thingMoment.format("dddd, MMMM Do YYYY, h:mm:ss a")
  };
  return simpleData;
}

const MONTHLY_MEETUP_EXCEPTIONS = ["An evening with Max De Marzi and graph database Neo4j"];

function getMeetupType(meetup){
  let type = 'other';
  if(meetup.name === 'data jam'){
    type = 'data-jam';
  } else if (_.includes([1, 2], meetup.time.moment.day())) {
    // if meetup day of week is monday or tuesday, assume it's a monthly meetup.
    type = 'monthly';
  } else if (_.includes(MONTHLY_MEETUP_EXCEPTIONS, meetup.name)){
    type = 'monthly';
  }
  return type;
}

function processMeetup(thing, timeProperty, ...properties){
  let meetup = processThingBase(thing, timeProperty, ...properties);
  meetup.type = getMeetupType(meetup);
  return meetup;
}

function setDifferences(sortedThings){
  var startMonthMoment = sortedThings[0].time.moment.clone().startOf('month');
  var endMonthMoment = _.last(sortedThings).time.moment.clone().startOf('month');
  var totalMonths = endMonthMoment.diff(startMonthMoment, 'month');

  _.forEach(sortedThings, function(thing, index){
    if(index > 0){
      thing.time.difference = thing.time.moment.diff(sortedThings[index - 1].time.moment);
      thing.time.from = thing.time.moment.from(sortedThings[index - 1].time.moment);
    } else {
      thing.time.difference = 0;
      thing.time.from = 'none';
    }
    thing.time.sinceStart = thing.time.moment.diff(sortedThings[0].time.moment);
    thing.time.daysRatio = getMonthRatio(thing.time.moment);
    thing.time.monthsRatio = thing.time.moment.diff(startMonthMoment, 'month') / totalMonths;
    thing.time.ratio = thing.time.moment.diff(startMonthMoment, 'month') + thing.time.daysRatio;
  });
}

function processThings(things, processThing, timeProperty, ...properties){
  let formatted = _.map(things, _.partial(processThing, _, timeProperty, ...properties));
  let sortedData = _.sortBy(formatted, 'time.milliseconds');

  setDifferences(sortedData);

  return sortedData;
}

var processMeetups = _.partial(processThings, _, processMeetup, 'time', 'id', 'name');
var processMembers = _.partial(processThings, _, processMember, 'Timestamp', 'Member Id', 'Name', 'Interests');

function getMemberInterests(member){
  let interestIds = member.Interests.split(';');
  let memberInterests = _.map(interestIds, function(interestId){
    return meetup.interests[interestId] || {id: interestId};
  });
  return memberInterests;
}

function processMember(thing, timeProperty, ...properties){
  let member = processThingBase(thing, timeProperty, ...properties);
  member.Interests = getMemberInterests(member);
  member.interestsByName = _.compact(_.map(member.Interests, 'name'));
  return member;
}

function processInterests(data){
  let interests = _.mapKeys(data, function(interest){
    return interest.id;
  });
  return interests;
}

var meetup = new Meetup();
processData('./csv/groups_topics.csv', _.flow(processInterests, _.partial(_.set, meetup, 'interests')));
processData('./csv/data-vis-events.csv', _.flow(processMeetups, _.partial(_.set, meetup, 'events')));
processData('./csv/data-vis-members.csv', _.flow(processMembers, _.partial(_.set, meetup, 'members')));
