const express = require("express");
const router = express.Router();
const render=require('../services/render')
const controller=require('../controller/control')
const usercontroller = require("../controller/userControl");
const userMiddleware = require("../middileware/userMiddileware"); 


// // Define your routes here
// router.get("/", render.homeRoutes);   //services folder use cheyth inganemm cheyyamm

// router.get("/add-user", (req, res) => {  //ingane nerittum cheyyamm
//   res.render("add_user");
// });

// router.get("/update-user", (req, res) => {
//   res.render("update_user");
// });




//api
router.post("/api/products",controller.create);   // ivide controller folder usecheythuu allandd router pole ivide thanne post req kodukkammm
router.get("/api/products", controller.find); 
router.put("/api/products/:id", controller.update); 
router.delete("/api/products/:id", controller.delete); 

router.post("/api/users/register", usercontroller.userRegister); 
router.get("/api/users/register", usercontroller.getUser); 


router.post("/api/users/login", usercontroller.userLogin, userMiddleware); 


router.post("/api/users/wish", userMiddleware, usercontroller.addToWish);
router.get("/api/users/wish",  usercontroller.getWish);
router.get("/api/users/fetchwish", usercontroller.fetchWish)
router.post("/api/users/delwish", userMiddleware, usercontroller.delwish);


 router.post("/api/users/cart", userMiddleware, usercontroller.addToCart);
 router.get("/api/users/cart", usercontroller.getCart);
 router.get("/api/users/fetchcart", usercontroller.fetchCart);
 router.post("/api/users/delcart", userMiddleware, usercontroller.delcart);

router.put("/api/users/cart",  usercontroller.cartup);



module.exports = router;
