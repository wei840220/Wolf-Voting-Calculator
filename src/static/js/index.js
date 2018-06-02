var app = new Vue({
  el: '#app',
  data: {
    timeData: [],
    aliveData: {},
    userData: [],
    voteData: {},
    showDead: true,
    onFocus: {column: '', reverse: false},
    currentTime: {},
    text: ''
  },
  computed: {
    active: function () {
      return this.timeData.length;
    }
  },
  methods: {
    insertData: function(){
      var self = this;
      try {
        var data = self._getDatafromString();
        if (!self._isTimeRepeat(data.timeData.dt)){
          self._appendUserData(data.userData);
          self._updateCurrentTime(data.timeData);
          self._appendTimeData(data.timeData);
          self._appendVoteData(data.voteData);
          self._updateAliveData(data.timeData.day, data.timeData.time, data.userData);
        }
      }
      catch (e) {
        swal('QQ，似乎有點問題', '請再確認投票結果的複製格式是否正確');
      }
      finally {
        self.text = '';
      }
    },
    _isTimeRepeat: function(dt){
      var self = this;
      for (var idx = 0; idx < self.timeData.length; idx++)
        if (self.timeData[idx].dt == dt)
          return true;
      return false;
    },
    _updateCurrentTime: function(data){
      var self = this;
      if (!self.currentTime.dt)
        self.currentTime = {day: data.day, time: data.time, dt: data.dt};
      else if (self.currentTime.day < data.day)
        self.currentTime = {day: data.day, time: data.time, dt: data.dt};
      else if (self.currentTime.day == data.day && self.currentTime.time < data.time)
        self.currentTime = {day: data.day, time: data.time, dt: data.dt};
    },
    _updateAliveData: function(day, time, data){
      var self = this;
      data.forEach(function(id){
        if (!self.aliveData[id])
          self.aliveData[id] = {day: day, time: time, dt: day + '-' + time};
        else if (self.aliveData[id].day < day)
          self.aliveData[id] = {day: day, time: time, dt: day + '-' + time};
        else if (self.aliveData[id].day == day && self.aliveData[id].time < time)
          self.aliveData[id] = {day: day, time: time, dt: day + '-' + time};
      });
    },
    _appendTimeData: function(data){
      var self = this;
      self.timeData.push(data);
      self.timeData.sort(self._compareByDayandTime());
    },
    _appendUserData: function(data){
      var self = this;
      if (self.userData.length == 0)
        self.userData = data;
      else if (self.userData.length < data.length){
        var users = data.filter(function(s){ return self.userData.indexOf(s) == -1 });
        self.userData = self.userData.concat(users);
      }
    },
    _appendVoteData: function(data){
      if (!data)
          return;
      var self = this;
      for (var key in data){
        if (self.voteData[key]){
          self.voteData[key].push(data[key]);
          self.voteData[key].sort(self._compareByDayandTime());
        }
        else
          self.voteData[key] = [data[key]];
      }
    },
    _compareByDayandTime: function(){
      return function(a,b){
        if(a.day > b.day)
          return 1;
        else if(a.day == b.day && a.time > b.time)
          return 1;
        else
          return -1;
      };
    },
    _getDatafromString: function(){
      var self = this;
      var s = self.text.split('\n');
      var dayAndTime = self._getDayAndTimefromString(s[0]);
      var votes = self._getVotesfromString(s.splice(1));

      var voteData = {};
      var userData = [];
      var timeData = Object.assign({show: true}, dayAndTime);
      votes.forEach(function(user){
        var data = {
          target: user.target,
          votes: user.votes,
          day: dayAndTime.day,
          time: dayAndTime.time
        };
        voteData[user.id] = data;
        userData.push(user.id);
      });
      return {
        voteData: voteData,
        userData: userData,
        timeData: timeData
      };
    },
    _getDayAndTimefromString: function(str){
      var s = str.split(" 日目 ");
      var day = s[0], time = s[1].slice(2, s[1].indexOf(' 回目'));
      return {
        day: parseInt(day),
        time: parseInt(time),
        dt: day + '-' + time
      };
    },
    _getVotesfromString: function(arr){
      var voteData = [];
      arr.forEach(function(data){
        var str = data.replace(/	/i, ' ').replace(/	/g, ' ');
        var s = str.split(' ');
        if (s.indexOf('') > 0)
          s.splice(s.indexOf(''), 1);
        if (s[0]!='')
          voteData.push({
            id: s[0],
            votes: parseInt(s[1]),
            target: s[s.length-1]
          });
      });
      return voteData;
    },
    _getVoteDataByTime: function(day, time){
      var self = this;
      var voteData = self.voteData;
      var data = [];
      for (var uid in voteData){
        for (var idx = 0; idx < voteData[uid].length; idx++){
          if (voteData[uid][idx].day == day && voteData[uid][idx].time == time){
            data.push({
              uid: uid,
              votes: voteData[uid][idx]['votes'],
              target: voteData[uid][idx]['target']
            });
            break;
          }
        }
      }
      return data;
    },
    _compareByPropName: function(prop){
      return function(object1,object2){
        var x = object1.prop, y = object2.prop;
        if (x<y)
          return -1;
        else if (x>y)
          return 1;
        else
          return 0;
      }
    },
    _sortByProp: function(prop){
      return function(a,b){
        if(a[prop]<b[prop])
          return -1;
        else if(a[prop]>b[prop])
          return 1;
        else
          return 0;
      };
    },
    sortVoteDataByPropName: function(day, time, prop){
      var self = this;
      var userData = [];
      var column = day + '-' + time + '-' + prop;
      
      if (self.onFocus.column == column && self.onFocus.reverse == false){
        var data = self._getVoteDataByTime(day, time);
        data.sort(self._sortByProp(prop)).reverse();
        data.map(function(user){
          userData.push(user.uid);
        });
        var users = self.userData.filter(function(s){ return userData.indexOf(s) == -1 });
        userData = userData.concat(users);
        self.userData = userData;
        self.onFocus.reverse = !self.onFocus.reverse;
      }
      else{
        var data = self._getVoteDataByTime(day, time);
        data.sort(self._sortByProp(prop));
        data.map(function(user){
          userData.push(user.uid);
        });
        var users = self.userData.filter(function(s){ return userData.indexOf(s) == -1 });
        userData = userData.concat(users);
        self.userData = userData;
        self.onFocus = {column: column, reverse: false};
      }
    },
    showHowToUse: function(){
      swal({
        title: "投票結果複製",
        text: "要包含幾日目第幾回一同複製",
        imageUrl: 'static/images/votes.png',
        imageSize: '260x250'
      });
    }
  }
});