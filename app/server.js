// server.js
// where your node app starts

// init project
// Variables globaux
let error;
let flag=false;
let blacklist = ['user','ajouter','effacer','userAll','query','telecharge','liste','logout','signup','formInscription','up','adminpage'];
let blacklistNoms = ['user','ajouter','effacer','userAll','query','telecharge','liste','logout','signup','formInscription','up','adminpage','admin','guest'];

const express = require('express'),
     session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const assert = require('assert');
// https://expressjs.com/zh-cn/advanced/best-practice-security.html
const helmet = require('helmet');
const consolidate = require('consolidate');
// https://github.com/expressjs/csurf
const csrf = require('csurf');
// https://mongoosejs.com/docs/api.html
const mongoose = require('mongoose');
require('express-async-errors');

const parseForm = bodyParser.urlencoded({ extended: false });

// use modules
app.use(helmet());
app.use(parseForm);
app.engine('html', consolidate.nunjucks);
app.set('view engine', 'ejs');
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// https://defeo.lu/aws/tutorials/reflector
app.use('/s', express.static('public'));
app.use(session( {
  secret : process.env.SECRET,
  resave: false,
  saveUninitialized: false,
} ));
const csrfProtection = csrf(/*{ cookie: true }*/);
//app.use(csrfProtection);

// init database
mongoose.connect('mongodb+srv://'+process.env.DBUSER+':'+process.env.DBPASS+'@cluster0-aitw8.mongodb.net/'+process.env.DBNAME+'?retryWrites=true', {useNewUrlParser: true});
const db = mongoose.connection;
let UsersModel;
let MessagesModel;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('we\'re connected!');
  let usersSchema = new mongoose.Schema({
    login : String,
    password : String,
    admin : Number
  });
  let messagesSchema = new mongoose.Schema({
    text : String,
    time : Date,
    coordinateX : Number,
    coordinateY : Number,
    author : String,
    board : Number
  });
  UsersModel = mongoose.model('users',usersSchema);
  MessagesModel = mongoose.model('messages', messagesSchema); 
});

//createUsers() en cas de besoin;
function createUsers(){
  var adminUser = new UsersModel({'login':'admin','password':'admin','admin':'4'});
  var guestUser = new UsersModel({'login':'guest','password':'guest','admin':'0'});
  var totoUser = new UsersModel({'login':'toto','password':'toto','admin':'1'});
  adminUser.save();
  guestUser.save();
  totoUser.save();
}

/*
router.get(/^\/effacer$/, function(req, res, next){
  console.log('router');
  if(req.session.login==null) {
    res.send('Authentification failed');
    return;
  }
  next();
});*/

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', /*parseForm,*/csrfProtection, async function(req, res) {
  console.log(parseForm);
  console.log(csrfProtection);
  if(req.session.login&&req.session.login!='guest') // Si l'utilisateur est déja connecté il accède directement a la page principale 
  {
    res.render('index.html',{'login':true,'admin':req.session.login,'authorname':req.query.authorname, csrfToken: req.csrfToken()});
  }
  else // sinon il peut se connecter ou pas
  {
    res.render('index.html',{'login':false,'authorname':req.query.authorname,csrfToken: req.csrfToken()});
  }
});

app.post('/ajouter', async (req, res)=>{
  let msg = JSON.parse(req.body.msg);
  let msgGoose = new MessagesModel(msg);
  try
  {
    let ret = await MessagesModel.find({text:msg.text, author:msg.author, time:msg.time});
    if(ret.length!=0) throw "Déjà existe";
    msgGoose.save();   
    flag=req.body.flag;
    res.status(200).send('Ajout réussit');
  }catch(e)
  {
    console.log(e);
    res.status(500).send("error");
  }
});

app.post('/effacer',   async (req, res)=>{
  let msg = JSON.parse(req.body.msg);
  flag=req.body.flag;
  console.log(" Author = ", msg.author,"Text = ", msg.text );
  if(req.body.admin==3) await MessagesModel.deleteOne({text: msg.text,time:msg.time,author:msg.author});
  else if(req.session.login==msg.author) await MessagesModel.deleteOne({text: msg.text,author:msg.author,time:msg.time});
  else res.status(500).send('Suppression failed');
  res.send('Suppression réussite');
});

app.post('/login',async function(req, res) {
  let t=0;
  let rows = await UsersModel.find({});
  for(let u of rows)
  {
    if((u.login == req.body.login) && (u.password == req.body.password))
    {
      t=1;
      req.session.login = u.login;
      let x = await MessagesModel.countDocuments({'author':req.session.login});
      console.log("T = ", x);
      console.log("session ok ") ;
    }
  }
  if(t == 1)
  {
    res.redirect('/');
  }
  else
  {
    let error = "Vous n'avez pas encore de compte ou bien login ou mot de passe incorrect";
    res.render(__dirname + '/views/login.html',{"error":error});
  }
});

app.post('/user', async (req,res)=>{
  if(req.session.login)
    console.log(" ");
  else{
    console.log(req.body);
    req.session.login=req.body.login;
  }
  res.send(await UsersModel.find({'login':req.session.login},'login admin'));    
});

app.post('/userAll', async (req,res)=>{ 
  res.send(await UsersModel.find({},'login admin'));    
});

app.post('/query', async (req,res)=>{
  if(req.session.login){
    let msg = JSON.parse(req.body.msg);
    let results=[];
    console.log(" MSG = ", msg);
    res.send(MessagesModel.find({'text':msg.text, author:req.session.login}));
  }
});

app.post('/modifier', async (req,res)=>{
  if(req.session.login){
    let msg = JSON.parse(req.body.msg);
    let results=[];
    flag=req.body.flag;
    if(req.body.msgSupprime!=null){
      console.log(" MSG = ", req.body.msgSupprime);
      console.log(req.body.admin);
      if(req.body.admin<1) return;
      else if(req.body.admin==3){
        let ret = await MessagesModel.update({text:req.body.msgSupprime,author:msg.author,time:msg.time},{text:msg.text}); 
      }else if(req.session.login==msg.author){
        let ret = await MessagesModel.update({text:req.body.msgSupprime,author:req.session.login,time:msg.time},{text:msg.text}); 
      }else{
        res.send('Modification échec');
      }
    }
    
    res.send('Modification réussite');
  }
});

app.get('/telecharge', (req,res)=>{
    res.sendFile(__dirname+'/README.md');
});

app.post('/liste', async (req,res)=>{
  if(req.session.login){
    let results=[];
    if(req.body.authorname!=null&&req.body.authorname!=''){
      MessagesModel.find({ author : req.body.authorname }, function (err, docs) { res.send(docs);});
    }
    else{
      MessagesModel.find({ }, function (err, docs) { res.send(docs);});
    }
  }
  else{
   res.redirect('/');
  }
});

app.post('/logout', function(req, res) {
  req.session.login=null;
  let error = "Déconnexion réussite !";
  res.render(__dirname + '/views/login.html',{"error":error});
});

app.get('/formInscription', async function(req, res) {
    res.render(__dirname + '/views/formInscription.html');
});
//inscription
app.post('/signup', async function(req, res) {
  let login = req.body.login;
  let password = req.body.password;
  let confirmPass = req.body.confirmPassword;
  //console.log("username = "+password + "    " + confirmPass);
  if(password == confirmPass && blacklistNoms.indexOf(login)==-1 && !login.includes(' ') && password.length!=0)
  {
    if((login!='') && (password!='') && (confirmPass!=''))
    {
      let user = new UsersModel({login: login, password: password, admin:0});
      try
      {
        let ret = await UsersModel.find({login:login});
        if(ret.length!=0) throw "Déjà existe";
        user.save();
        req.session.login = login;
        res.redirect('/');
      }
      catch (exeption)
      {
        console.log(exeption);
        error = "Username déja utilisé ! veuillez choisir un autre !";
        res.render(__dirname + '/views/formInscription.html',{"error":error});
      }
    }
    else 
    {
      error = "Veuillez remplir tout les champs !";
      res.render(__dirname + '/views/formInscription.html',{"error":error});
    }
  }
  else 
  {
    let error = "Champs password differents ou login non permis !";
    res.render(__dirname + '/views/formInscription.html',{"error":error});
  }
});

app.post('/flag', async function(req, res) {
  res.send(flag);
});

//admin
app.post('/up',async(req,res)=>{
  if(req.body.user=='admin'){
    let ad = 0;
    await UsersModel.find({login:req.body.login},'admin',async (err,row)=>{
      if(row[0].admin!=null&&row[0].admin!=3){
        ad = parseInt(row[0].admin); 
      }
      ad+=1;
      let ret = await UsersModel.updateOne({login:req.body.login},{admin: ad});
    });
    res.send();
  }
});

app.get('/adminpage',(req,res)=>{
  if(req.session.login=='admin')
  res.sendFile(__dirname+'/views/admin.html');
});

// has to be put at last !!!
app.get('/:authorname',async (req, res)=>{
  if(req.session.login && blacklist.indexOf(req.params.authorname)==-1){
    let author = await UsersModel.find({login:req.params.authorname});
    if(author.length!=0) res.redirect('/?authorname='+req.params.authorname);
  }
});

/*
function notify(res){}
setInterval(notify,10000);
*/

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log(process.env);
  console.log('Your app is listening on port ' + listener.address().port);
});
