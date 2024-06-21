//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { dirname } from "path";
import { fileURLToPath } from "url";
import lodash from "lodash";




const __dirname=dirname(fileURLToPath(import.meta.url));

const app = express();
const port =3000;

app.use(bodyParser.urlencoded({extended:true}));       //this to to get inputted data

app.set('view engine','ejs');

app.use(express.static("public"));

const dbURI = "mongodb://127.0.0.1:27017/toDOlist";

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const ItemSchema = mongoose.Schema({
    work: String
  });
  
const Item = mongoose.model("Item", ItemSchema);
  

const NewSchema=mongoose.Schema({
    name:String,
    items:[ItemSchema]
});
const Newlist=mongoose.model("Newlist",NewSchema);


app.get("/",(req,res)=>{
    
    Item.find({})
        .then(itemList=>{
            res.render('index',{tasks:itemList});
        })
        .catch(err=>{
            console.log("couldn't find the data.");
        })
    
});

app.get("/:custom",async(req,res)=>{
    const clist=lodash.capitalize(req.params.custom);
    let foundlist={};

    const flist=await Newlist.findOne({name:clist})
    if(!flist){
        const Newitem=new Newlist({
            name:clist,
            items:[{work:"eat"}]
        })
        Newitem.save();
        res.redirect("/"+clist);
    }else{
        res.render('sample',{name:clist,tasks:flist});
    }
    
    
});

app.get("/work",(req,res)=>{
    Item.find({})
        .then(workList=>{
            res.render('work',{workList:workList});
        })
        .catch(err=>{
            console.log("couldn't find the data.");
        })
    
});
/*app.get("/register",(req,res)=>{
    res.sendFile(__dirname + "/register.html");
});*/

app.get("/login",(req,res)=>{
    res.render('login');                //render the ejs files
});



app.post("/",async(req,res)=>{
    var data=req.body["work"];
    var list=req.body["list"];

    const item= new Item({               //here, item added by user is inserted in the database.
        work:data
    });
    if(list==='today'){
        item.save();
        res.redirect("/");
    }else{
        const foundlist=await Newlist.findOne({name:list})
        foundlist.items.push(item);
        foundlist.save();
        
        res.redirect("/"+list);
    }
    
})


app.post("/work",(req,res)=>{
    var data=req.body["work"];
    const item= new Item({               //here, item added by user is inserted in the database.
        work:data
    });
    item.save();

    res.redirect("/work");
})

app.post("/delete",(req,res)=>{
    var id=req.body.checkbox;
    var list=req.body.list;
    if(list==='today'){
        Item.findByIdAndRemove(id)                        //this function is called for finding and removing the data in Item collection from its id.
        .then(res.redirect("/"))
        .catch(err=> console.log(err))
    }else{
        Newlist.findOneAndUpdate({name:list},{$pull:{items:{_id:id}}})
        .then(res.redirect("/"+list))
        .catch(err=>{console.log("error in updating.")})
    }

})
app.post("/submit",(req,res)=>{
    
    var size=req.body["fname"].length + req.body["lname"].length;
    res.render("login.ejs",{letters:size});    
})



app.listen(port,()=>{                                                      //the server will be litening for the reqs on the port
     console.log(`server is running on  port ${port}`);
});