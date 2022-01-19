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

app.get('/about', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("about");
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

app.get('/musician/:stageName', function(request, response) {
  let musicians = JSON.parse(fs.readFileSync('data/musicians.json'));

  // using dynamic routes to specify resource request information
  let musicianName = request.params.stageName;

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

app.get('/track/:title', function(request, response) {
  let tracks = JSON.parse(fs.readFileSync('data/tracks.json'));

  // using dynamic routes to specify resource request information
  let trackName = request.params.title;

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

app.get('/musicianCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("musicianCreate");
});
app.post('/musicianCreate', function(request, response) {
    let stageName = request.body.stageName;
    let name = request.body.name;
    let years = request.body.years;
    let label = request.body.label;
    let genre = request.body.genre;
    let count = request.body.count;
    let tracks = request.body.tracks;
    let biography = request.body.biography;
    if(stageName&&name&&years&&label&&genre&&count&&tracks&&biography){
      let musicians = JSON.parse(fs.readFileSync('data/musicians.json'));
      console.log("it worked");
      let newMusician = {
        "stageName": stageName,
        "name": name,
        "years": years,
        "label": label,
        "genre": genre,
        "count": count,
        "tracks": tracks,
        "biography": biography
      }
      musicians[stageName] = newMusician;
      fs.writeFileSync('data/musicians.json', JSON.stringify(musicians));
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/musician/"+stageName);
    }else{
      response.status(400);
      response.setHeader('Content-Type', 'text/html')
      response.render("error", {
        "errorCode":"400"
      });
    }
});
app.get('/trackCreate', function(request, response) {
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("trackCreate");
});
app.post('/trackCreate', function(request, response) {
    let title = request.body.title;
    let date = request.body.date;
    let musicians = request.body.musicians;
    let label = request.body.label;
    let genre = request.body.genre;
    let commentary = request.body.commentary;
    if(title&&date&&musicians&&label&&genre&&commentary){
      let tracks = JSON.parse(fs.readFileSync('data/tracks.json'));
      let newTrack = {
        "title": title,
        "date": date,
        "musicians": musicians,
        "label": label,
        "genre": genre,
        "commentary": commentary,
      }
      tracks[title] = newTrack;
      fs.writeFileSync('data/tracks.json', JSON.stringify(tracks));
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/track/"+title);
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
