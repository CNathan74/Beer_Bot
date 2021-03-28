////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// INIT /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Pour le fichier .env
require('dotenv').config();

//Création du client discord
const Discord = require('discord.js');
const clientDiscord = new Discord.Client();
var channel = null

//Création du client Mongo
const dbMongo = 'beer_bot';
const urlMongo = 'mongodb://localhost:27017';
const clientMongo = require('mongodb').MongoClient;
const MongoClient = new clientMongo(urlMongo/*,
    { useNewUrlParser: true, useUnifiedTopology: true }*/);
let db = null
var ObjectId = require('mongodb').ObjectId


//Regex pour vérifier le format d'une url
const regexHTTPs = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

//Connexion à la base de données
mongoConnection();

//Connexion au bot discord
clientDiscord.login(process.env.DISCORD_TOKEN);

//Démarrage du bot discord
clientDiscord.on("ready", function () {
    console.log("Beer BOT est prêt au combat");
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// TRAITEMENT MESSAGES DISCORD /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Événement réception message sur le serveur discord
clientDiscord.on("message", function (message) {
    channel = message.channel
    if (message.content.startsWith("beer!all") === true){
        getAllBeers();
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// FONCTIONS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Permet de tester la connexion avec MongoDB
async function mongoConnection(){
    try {
        // Connect to the MongoDB cluster
        await MongoClient.connect(err => {
            db = MongoClient.db(dbMongo)
        })
        console.log('MongoDB connecté')

        if(await  dbConnection(MongoClient)) {
            console.log("Base de données connectée");
        } else {
            console.log("Échec de connexion à la base de données");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await MongoClient.close();
    }
}

//Permet de vérifier si la base de donnée existe.
//Retourne true si existe, false sinon
async function dbConnection(client){
    var result = false;
    var databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach(db => {
        if(db.name === dbMongo){
            result = true;
        }
    });
    return result;
}

function getBeerByID(id){

}

function getBeerByColor(color){

}

function getAllBeers(){
    var beers =  db.collection('beers').find();
    beers.forEach(function (beer) {
        displayBeer(beer)
    })
}

async function displayBeer(beer){
    let ContentEmbed = new Discord.MessageEmbed();
    ContentEmbed.setTitle(beer.name)
    if(beer.brasserie.site.match(regexHTTPs) && beer.brasserie.logo.match(regexHTTPs)){
        ContentEmbed.setAuthor(beer.brasserie.name, beer.brasserie.logo, beer.brasserie.site)
    }
    else{
        ContentEmbed.setAuthor(beer.brasserie.name)
    }
    ContentEmbed.setDescription(beer.description)
    ContentEmbed.addFields(
        { name: 'Degré', value: beer.degre + "%", inline: true },
        { name: 'Couleur', value: beer.color, inline: true },
        { name: 'Prix', value: beer.price + "€", inline: true },
    )
    if(beer.image.match(regexHTTPs)) {
        ContentEmbed.setThumbnail(beer.image)
    }
    channel.send(ContentEmbed)
}