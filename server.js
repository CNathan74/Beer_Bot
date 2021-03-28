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
const urlMongo = 'mongodb://' + process.env.MONGODB;
const clientMongo = require('mongodb').MongoClient;
const MongoClient = new clientMongo(urlMongo/*,
    { useNewUrlParser: true, useUnifiedTopology: true }*/);
let db = null
var ObjectId = require('mongodb').ObjectId


//Regex pour vérifier le format d'une url
const regexHTTPs = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

//Commande discord pour utiliser le bot
const cmdDiscord = "beer!"
//Connexion à la base de données
mongoConnection();

//Connexion au bot discord
clientDiscord.login(process.env.DISCORD_TOKEN);

//Démarrage du bot discord
clientDiscord.on("ready", function () {
    console.log("Beer BOT est prêt au combat");
})

//Variables de travail
var addBeerEnCours = false
var addBeerEtape = 0
var addBeerObj

var removeBeerEnCours = false
var removeBeerEtape = 0
var removeBeerID

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// TRAITEMENT MESSAGES DISCORD /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Événement réception message sur le serveur discord
clientDiscord.on("message", function (message) {
    //Si le message ne vient pas du bot
    if(message.author.id !== "820784393080537118") {
        channel = message.channel
        //Si on est entrain d'ajouter une bière
        if (addBeerEnCours) {
            addBeer(message.content);
        }
        else if(removeBeerEnCours)
        {
            removeBeer(message.content)
        }
        //Intéraction classique (getBeer, lancement addBeer, ...)
        else {
            if (message.content.startsWith(cmdDiscord + "all") === true) {
                getAllBeers();
            }
            else if (message.content.startsWith(cmdDiscord + "add") === true) {
                if (channel.id === "825842123613667358") {
                    addBeerEnCours = true
                    addBeer()
                } else {
                    channel.send("Merci d'utiliser le salon **#add** pour ajouter une bière")
                }
            }
            else if (message.content.startsWith(cmdDiscord + "remove") === true) {
                if (channel.id === "825842138494533633") {
                    removeBeerEnCours = true
                    removeBeer(message.content.substring((cmdDiscord + "remove").length + 1))
                } else {
                    channel.send("Merci d'utiliser le salon **#remove** pour supprimer une bière")
                }
            }
        }
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

function getBeersByName(name){

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

function addBeer(message = null){
    switch (addBeerEtape) {
        case 0:
            cleanChannel(channel)
            addBeerObj = new Object()
            channel.send("Nous allons ajouter une bière ensemble")
            channel.send("Commençons par son **nom** :")
            addBeerEtape = addBeerEtape + 1
            break
        case 1:
            addBeerObj.name = message
            channel.send("Maintenant quelques informations sur la **brasserie**")
            channel.send("Pour commencer, le **nom** :")
            addBeerEtape = addBeerEtape + 1
            break
        case 2:
            Object.assign(addBeerObj, {
                brasserie: {
                    name: message
                }
            })
            channel.send("L'adresse du **site web** (mettre **#** sinon) :")
            addBeerEtape = addBeerEtape + 1
            break
        case 3:
            addBeerObj.brasserie.site = message
            channel.send("Pour finir, le **logo de la brasserie** (mettre **#** sinon) :")
            addBeerEtape = addBeerEtape + 1
            break
        case 4:
            addBeerObj.brasserie.logo = message
            channel.send("Très bien, revenons sur notre bière maintenant")
            channel.send("Il me faut la **couleur** :")
            addBeerEtape = addBeerEtape + 1
            break
        case 5:
            addBeerObj.color = message
            channel.send("Une petite **description** :")
            addBeerEtape = addBeerEtape + 1
            break
        case 6:
            addBeerObj.description = message
            channel.send("Les **degrés** d'alcool :")
            addBeerEtape = addBeerEtape + 1
            break
        case 7:
            addBeerObj.degre = message
            channel.send("C'est bientôt fini, le **prix** :")
            addBeerEtape = addBeerEtape + 1
            break
        case 8:
            addBeerObj.price = message
            channel.send("Et la cerise sur le gâteau, une **photo de la bouteille** (mettre **#** sinon) : ")
            addBeerEtape = addBeerEtape + 1
            break
        case 9:
            addBeerObj.image = message
            channel.send("Parfait, voilà le résultat : ")
            displayBeer(addBeerObj)
            channel.send("Si tu veux enregistrer cette bière, répond par '**yes**', sinon par '**no**'")
            addBeerEtape = addBeerEtape + 1
            break
        case 10:
            if(message === "yes" || message === "y") {
                addBeerEtape = 0
                addBeerEnCours = false
                cleanChannel(channel)
                db.collection("beers").insertOne(addBeerObj, function(err, res) {
                    if (err){
                        channel.send("Échec de l'ajout d'une bière")
                    }
                    else{
                        channel.send("Bière enregistrer")
                    }
                });
            }
            else if(message === "no" || message === "n"){
                addBeerEtape = 0
                addBeerEnCours = false
                cleanChannel(channel)
                channel.send("Bière annulée")
            }
            else {
                channel.send("Réponse incorrect **'" + message + "'**" )
                channel.send("Si tu veux enregistrer cette bière, répond par '**yes**', sinon par '**no**'")
            }
            break


    }
}

function removeBeer(message){
    switch (removeBeerEtape){
        case 0:
            var beers = db.collection('beers').find({name : message});
            if(beers.size > 1){
                channel.send("Voulez vous supprimer cette bière ? Répondre avec '**yes**' ou '**no**'")
                removeBeerEtape = 1
            }
            else{
                channel.send("Plusieurs bières ont le même nom, merci de renseigner l'id de celle à supprimer")
            }
            beers.forEach(function (beer) {
                channel.send("ID : " + beer._id)
                displayBeer(beer)
            })
            break
    }
}

//Permet de vider les 100 derniers messages du salon
function cleanChannel(c){
    c.bulkDelete(100);                //Pour vider le salon add
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

