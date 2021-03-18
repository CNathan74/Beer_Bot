//Création du client discord
const Discord = require('discord.js');
const clientDiscord = new Discord.Client();

//Création du client Mongo
const dbMongo = 'beer_bot';
const urlMongo = 'mongodb://localhost:27017';
const clientMongo = require('mongodb').MongoClient(urlMongo);


//Regex pour vérifier le format d'une url
const regexHTTPs = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm;

//Connexion à la base de données
mongoConnection();

//Démarrage du bot discord
clientDiscord.on("ready", function () {
    console.log("Beer BOT prêt au combat");
})


//Événement réception message sur le serveur discord
clientDiscord.on("message", function (message) {

})

async function mongoConnection(){
    try {
        // Connect to the MongoDB cluster
        await clientMongo.connect();
        console.log('MongoDB connecté')

        if(await  dbConnection(clientMongo)) {
            console.log("Base de données connectée")
        } else {
            console.log("Échec de connexion à la base de données")
        }

    } catch (e) {
        console.error(e);
    } finally {
        await clientMongo.close();
    }
}

//Permet de vérifier si la base de donnée existe.
//Retourne true si elle existe, false sinon
async function dbConnection(client){
    var result = false;

    databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach(db => {
        if(db.name === dbMongo){
            result = true;
        }
    });
    return result;
};