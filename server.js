//..............Include Express..................................//
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');

//..............Create an Express server object..................//
const app = express();

//..............Apply Express middleware to the server object....//
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

//.............Define server routes..............................//
//Express checks routes in the order in which they are defined

app.get('/', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index");
});

app.get('/play', function(request, response) {
    let players = JSON.parse(fs.readFileSync('data/opponents.json'));
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("play", {
      data: players
    });
});

app.get('/results', function(request, response) {
    let players = JSON.parse(fs.readFileSync('data/opponents.json'));

    //accessing URL query string information from the request object
    let opponent = request.query.opponent;
    let playerThrow = request.query.throw;

    if(players[opponent]){
      let opponentThrowChoices=["Paper", "Rock", "Scissors"];
      let results={};

      results["playerThrow"]=playerThrow;
      results["opponentName"]=opponent;
      results["opponentPhoto"]=players[opponent].photo;
      results["opponentThrow"] = opponentThrowChoices[Math.floor(Math.random() * 3)];

      if(results["playerThrow"]===results["opponentThrow"]){
        results["outcome"] = "tie";
      }else if(results["playerThrow"]==="Paper"){
        if(results["opponentThrow"]=="Scissors") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }else if(results["playerThrow"]==="Scissors"){
        if(results["opponentThrow"]=="Rock") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }else{
        if(results["opponentThrow"]=="Paper") results["outcome"] = "lose";
        else results["outcome"] = "win";
      }

      if(results["outcome"]=="lose") players[opponent]["win"]++;
      else if(results["outcome"]=="win") players[opponent]["lose"]++;
      else players[opponent]["tie"]++;

      //update data store to permanently remember results
      fs.writeFileSync('data/opponents.json', JSON.stringify(players));

      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.render("results", {
        data: results
      });
    }else{
      response.status(404);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"404"
      });
    }
});

app.get('/musicians', function(request, response) {
  let musicians = JSON.parse(fs.readFileSync('data/musicians.json'));
  let musicianArray=[];

  //create an array to use sort, and dynamically generate win percent
  for(stageName in musicians){
    musicianArray.push(musicians[stageName])
  }
    musicianArray.sort(function(a, b){
  })

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("musicians",{
    musicians: musicianArray
  });
});

app.get('/musician/:musicianName', function(request, response) {
  let musicians = JSON.parse(fs.readFileSync('data/musicians.json'));

  // using dynamic routes to specify resource request information
  let musicianName = request.params.musicianName;

  if(musicians[musicianName]){
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("musicianDetails",{
      musician: musicians[musicianName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/tracks', function(request, response) {
  let tracks = JSON.parse(fs.readFileSync('data/tracks.json'));
  let trackArray=[];

  //create an array to use sort, and dynamically generate win percent
  for(title in tracks){
    trackArray.push(tracks[title])
  }
    trackArray.sort(function(a, b){
  })

  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("tracks",{
    tracks: trackArray
  });
});

app.get('/track/:trackName', function(request, response) {
  let tracks = JSON.parse(fs.readFileSync('data/tracks.json'));

  // using dynamic routes to specify resource request information
  let trackName = request.params.trackName;

  if(tracks[trackName]){
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("trackDetails",{
      track: tracks[trackName]
    });

  }else{
    response.status(404);
    response.setHeader('Content-Type', 'text/html')
    response.render("error", {
      "errorCode":"404"
    });
  }
});

app.get('/opponentCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("opponentCreate");
});
app.post('/musicianCreate', function(request, response) {
    let musicianStageName = request.musician.stageName;
    let musicianName = request.musician.name;
    let musicianYears = request.musician.years;
    let musicianLabel = request.musician.label;
    let musicianGenre = request.musician.genre;
    let musicianCount = request.musician.count;
    let musicianTracks = request.musician.tracks;
    let musicianBiography = request.musician.biography;
    if(musicianName&&musicianName&&musicianYears&&musicianLabel&&musicianGenre&&musicianCount&&musicianTracks&&musicianBiography){
      let musicians = JSON.parse(fs.readFileSync('data/musicians.json'));
      let newMusician={
        "stageName": musicianName,
        "name": musicianName,
        "years": musicianYears,
        "label": musicianLabel,
        "genre": musicianGenre,
        "count": musicianCount,
        "tracks": musicianTracks,
        "biography": musicianBiography
      }
      musicians[musicianName] = newMusician;
      fs.writeFileSync('data/musicians.json', JSON.stringify(musicians));
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/musician/"+musicianName);
    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
      });
    }
});

// Because routes/middleware are applied in order,
// this will act as a default error route in case of
// a request fot an invalid route
app.use("", function(request, response){
  response.status(404);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    "errorCode":"404"
  });
});

//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
