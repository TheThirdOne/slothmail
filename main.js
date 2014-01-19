function split(str,del){
  var temp = str.split(del);
  for(var i = 0; i < temp.length-1; i++){
    temp[i] += del;
  }
  return temp;
}
function splitMultiple(str,del){
  var temp;
  var next = [str];
  for(var i = 0; i < del.length; i++){
    temp = next;
    next = [];
    for(var k = 0; k < temp.length;k++){
      next = next.concat(split(temp[k],del[i]));
    }
  }
  return next.filter(function(n){return n});
}
var lex = require('./lib/lexer.js');
var lexer = new lex.Lexer(), tagger = new lex.POSTagger();
function work(str){
  var end = str[str.length-1];
  str = str.slice(0, -1);
  var tagged = tagger.tag(lexer.lex(str));
  temp = [];
  for(var i = 0; i < tagged.length; i++){
    if(tagged[i][1] === 'PRP' || tagged[i][1] === 'NN' ){
      temp.push('sloth');
    }else if(tagged[i][1] === 'PRP$'){
      temp.push('sloth\'s');
    }else if(tagged[i][1] === 'NNP'){
      temp.push('Sloth');
    }else{
      temp.push(tagged[i][0]);
    }
  }
  return temp.join(' ')+end;
}
function full(str,del){
  var temp = splitMultiple(str,del);
  var out = [];
  for(var i = 0; i < temp.length;i++){
    out.push(work(temp[i]));
  }
  return out.join(' ');
}
function getText(callback){
  http = require('http');
  http.get({hostname:'www.horoscope.com', port:80, path:'/', agent:false}).on('response', function (response) {
    var body = '';
    var i = 0;
    response.on('data', function (chunk) {
        i++;
        body += chunk;
    });
    response.on('end', function () {
      callback(/\>.*</.exec(/id=\"textline\".*</.exec(body)[0])[0].slice(1,-1));
    });
  });
}
var sendgrid  = require('sendgrid')(process.argv[2], process.argv[3]);
getText(function(data){
  sendgrid.send({
    to:       'benjaminrlanders@gmail.com',
    from:     'example@example.com',
    subject:  'Sloth',
    text:     full(data,['?','.','!'])
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
});
