const Userdb=require('../model/model')

//create and save new user

exports.create=(req,res)=>{
    //validation request
    if(!req.body){
        res.status(400).send({message:"content can not be empty"})
    }

    //new user
    const user = new Userdb({
      id: req.body.id,
      name: req.body.name,
      category: req.body.category,
      price:req.body.price,
      image: req.body.image,
      description: req.body.description,
    });

    //save user in the databse

    user
    .save(user)
    .then((data)=>{
        res.send(data)
    })
    .catch((err)=>{
        res.status(500).send({
            message:err.message||"some error occured while creating a create opertion"
        })
    })
}

// retrive and return to all users/retrive and return a single user

exports.find = (req, res) => {
if(req.query.id){

    const id=req.query.id;

    Userdb.findById(id)
        .then((data)=>{
            if(!data){
                res.status(404).send({message:"not found with id"+id})
            }
            else{
                res.send(data)
            }
        })
        .catch((err)=>{
            res.status(500).send({message:"error retriving user with id"+id})
        })
}
else{
    Userdb.find()
    .then((user)=>{
        res.send(user)
    })
    .catch((err)=>{
        res.status(500).send({message:err.message||"error occured while retriving user information"})
    })
};
}


//update a new identifier by user id
exports.update = (req, res) => {
if(!req.body){
    return res
    .status(400)
    .send({message:"Data to update can not be empty"})
}
const id=req.params.id;
Userdb.findByIdAndUpdate(id,req.body,{useFindAndModify:false})
.then((data)=>{
    if(!data){
        res.status(404).send({message:`cannot update user with ${id}.Maybe user not found`})
    }
    else{
        res.send(data)
    }
})
.catch((err)=>{
    res.send(500).send({message:"error update user information"})
})
};



exports.delete = (req, res) => {
    const id=req.params.id;
    Userdb.findByIdAndDelete(id)
    .then((data)=>{
        if(!data){
            res.status(404).send({message:`cannot delete with id ${id}.maybe its wrong`})
        }
        else{
            res.send({message:`user deleted successfully`})
        }
    })
    .catch((err)=>{
        res.send(500).send({message:`error for deleting user details`+id})
    })
}; 