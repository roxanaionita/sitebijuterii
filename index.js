const express = require("express")
const fs=require("fs");

const sharp = require("sharp");
const ejs = require("ejs");
const sass = require("sass");
var cssBootstrap = sass.compile(__dirname + "/resources/scss/customizare_bootstrap.scss",{sourceMap:true});
fs.writeFileSync(__dirname + "/resources/css/biblioteci/bootstrap_custom.css",cssBootstrap.css);


app = express()
//setare preprocesor
app.set("view engine","ejs");

console.log("cale proiect ",__dirname);
app.use("/resources",express.static(__dirname+"/resources"));
app.use("/node_modules",express.static(__dirname+"/node_modules"));

// functie callback
// cerinta 6, index accesat prin diferite metode
app.get(["/","/index","/home"],function(req, res){
    console.log("function init");
    // console.log((2+3)+"")

    // res.sendFile(__dirname+"/index.html");
    //index.html va fi deschis in browser fara fisierele css
    //res.write("nu stiu");
    //res.end();

    //relativ la folderul views
    res.render("pagini/index", {ip: req.ip, imagini:obGlobal.imagini});
})

app.get("*/galerie_animata.css",function(req, res){

    var sirScss=fs.readFileSync(__dirname+"/resources/scss/galerie_animata.scss").toString("utf8");
    var culori=["navy","black","purple","grey"];
    var indiceAleator=Math.floor(Math.random()*culori.length);
    var culoareAleatoare=culori[indiceAleator]; 
    rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});
    console.log(rezScss);
    var caleScss=__dirname+"/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss,rezScss);
    try {
        rezCompilare=sass.compile(caleScss,{sourceMap:true});
        
        var caleCss=__dirname+"/temp/galerie_animata.css";
        fs.writeFileSync(caleCss,rezCompilare.css);
        res.setHeader("Content-Type","text/css");
        console.log("123");
        res.sendFile(caleCss);
    }
    catch (err){
        console.log(err);
        res.send("Eroare");
    }
});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"/temp/galerie-animata.css.map"));
});


app.get("/*.ejs", function(req,res){
    renderError(res,403);
})
 
// cerinta 7 
app.get("/*",function(req, res){
    console.log("url:",req.url);
    
    //relativ la folderul views
    res.render("pagini"+req.url,function(err,rezRandare){
        console.log("Eroare",err);
        console.log("Rezultat randare",rezRandare);
        if(err){
            if(err.message.includes("Failed to lookup view"))
                renderError(res,404);
            else{

            }
        }
        else{
            res.send(rezRandare);
        }
    });
})

obGlobal={
    erori:null,
    imagini:null
}
function createErrors(){
    // nu folosim doar readFile deoarece ne trebuie si o functie
    var continutFisier=fs.readFileSync(__dirname+"/resources/json/erori.json").toString("utf8");
    // console.log(continutFisier);
    // primeste un string si il trns in obiect cu proprietatile din fisier
    obGlobal.erori=JSON.parse(continutFisier);

}
createErrors();

function createImages(){
    var continutFisier=fs.readFileSync(__dirname+"/resources/json/galerie.json").toString("utf8");
    var obiect =JSON.parse(continutFisier);
    console.log(continutFisier);
    obGlobal.imagini = obiect.imagini;
    var dim_mediu = 400;
    var dim_mic = 150;

    obGlobal.imagini.forEach(function(elem){
        [numeFisier, extensie] = elem.cale_fisier.split(".");
        if(!fs.existsSync(obiect.cale_galerie +"/mediu/")){
            fs.mkdirSync(obiect.cale_galerie +"/mediu/");
        }
        elem.fisier_mediu =  obiect.cale_galerie +"/mediu/" + numeFisier + ".webp";
        elem.cale_fisier=obiect.cale_galerie+"/"+elem.cale_fisier;
        sharp(__dirname+"/"+elem.cale_fisier).resize(dim_mediu).toFile(__dirname+"/"+elem.fisier_mediu);

        
    });
    console.log(obGlobal.imagini);

}
createImages();



function renderError(res,identificator,titlu,text,imagine){
    var eroare = obGlobal.erori.info_erori.find(function(elem){
        return elem.identificator==identificator;

    })
    titlu=titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text=text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine=imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.eroare_default.imagine;
    if(eroare && eroare.status){
        res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu,text:text,imagine:imagine});
    }
    else{
        res.render("pagini/eroare",{titlu:titlu,text:text,imagine:imagine});
    }
}


console.log("Hello")


// obiect server express care va asculta pe portul 8080
app.listen(8080)
console.log("Server up")
