const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Userdb = require("../model/usermodel");

const productDatas = require("../model/model")


exports.userRegister = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const userExists = await Userdb.findOne({ username }); // Check if user already exists
    if (userExists) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Userdb({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Registration failed");
  }
};





exports.getUser = (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    Userdb.findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "not found with id" + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "error retriving user with id" + id });
      });
  } else {
    Userdb.find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res
          .status(500)
          .send({
            message:
              err.message || "error occured while retriving user information",
          });
      });
  }
};




// Login
exports.userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Userdb.findOne({ username });

    console.log("user=",user)

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1hr",
        }
      );


      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60,
      });


      res.setHeader("Authorization", token);
      console.log( "requested token=",token);

      res.status(200).json({ message: "welcome user", token ,UserID:user._id });
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed");
  }
};





exports.addToWish = async (req, res) => {
  try {
    const productId = req.body.id;

    console.log(productId)

    // Fetch the product by its ID using productDatas.findById
    const product = await productDatas.findById(productId);
    console.log(product)

    // If the product is not found, return a 404 response
    if (!product) {
      return res.status(404).json({ message: "Product not foundddd" });
    }

    // Retrieve the token from the request cookies
    const token = req.cookies.token;

    console.log("token=",token)

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by their username in the database
    const user = await Userdb.findOne({ username: decoded.username });

    if (user.wishlist.includes(productId)) {
      return res
        .status(400)
        .json({ message: "product is already in wishlist" });
    }

    // Populate the 'wish' field of the user object before sending the response
    const updatedUser = await Userdb.findById(user._id).populate('wishlist');

    // Add the product to the user's wishlist
    user.wishlist.push(productId);

    // Save the updated user object with the new wishlist
    await user.save();

    // Send a 200 response with a success message and the updated user object
    res.status(200).json({
      message: "Product added to wish successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    // If there's an error, send a 500 response with an error message
    res.status(500).json({ error: "Server error", message: err.message });
  }
};




// exports.getWish = (req, res) => {
//   if (req.query.id) {
//     const id = req.query.id;
//     console.log(id)

//     Userdb.findById(id)
//       .then((data) => {
//         if (!data) {
//           res.status(404).send({ message: "not found with id" + id });
//         } else {
//           res.send(data);
//         }
//       })
//       .catch((err) => {
//         res.status(500).send({ message: "error retriving user with id" + id });
//       });
//   } else {
//     Userdb.find()
//       .then((user) => {
//         res.send(user);
//       })
//       .catch((err) => {
//         res.status(500).send({
//           message:
//             err.message || "error occured while retriving user information",
//         });
//       });
//   }
// };


exports.getWish=async(res,req)=>{
  try{
    const user=await productDatas.find({})
    res.json(user)
  }
  catch(err){
    console.log(err)
  }
}



// exports.fetchWish=async(req,res)=>{
//   try{
// const user=await Userdb.findById(req.body.sessionid)

// const products=await Userdb.find(
//   {
//     _id: {$in: user.wishlist}
//   }
// )
// res.json({products})
// console.log("products=",products)
//   }
//   catch(error){
//     res.json(error)
//   }
// }

exports.fetchWish = async (req, res) => {
  try {
    // Assuming Userdb is correctly defined/imported

    // Validate session ID
    const userId = req.query.id;
    console.log(userId)
    if (!userId) {
      res.status(400).json({ error: "Invalid session ID" });
      return;
    }

    const user = await Userdb.findById(userId);
    console.log(user)
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const products = await productDatas.find({ _id: { $in: user.wishlist } });
    res.json({ products });
    console.log("products =", products);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.delwish = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by their username in the database
    const user = await Userdb.findOne({ username: decoded.username });

    const itemIdToDelete = req.body.id;

    // Check if the item exists in the wishlist
    const itemIndex = user.wishlist.indexOf(itemIdToDelete);
    

    if (itemIndex !== -1) {
      // Item found, remove it from the wishlist
      user.wishlist.splice(itemIndex, 1);

      // Save the updated user object to the database
      await user.save();

      // Respond with the updated user object
      res.json(user);
    } else {
      // Item not found in the wishlist
      res.status(404).json({ error: "Item not found in the wishlist" });
    }
  } catch (error) {
    // Pass the error to the next middleware (error handler)
    next(error);
  }
};



//=====================================================cart====================================================


exports.addToCart = async (req, res) => {
  try {
    const productId = req.body.id;
    const qty=req.body.quantity;

    console.log(productId);
    console.log(qty)

    // Fetch the product by its ID using productDatas.findById
    const product = await productDatas.findById(productId);
    console.log(product);

    // If the product is not found, return a 404 response
    if (!product) {
      return res.status(404).json({ message: "Product not foundddd" });
    }

    // Retrieve the token from the request cookies
    const token = req.cookies.token;

    console.log("token=", token);

    // Verify the token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by their username in the database
    const user = await Userdb.findOne({ username: decoded.username });

    if (user.cart.includes(productId)) {
      return res
        .status(400)
        .json({ message: "product is already in cartlist" });
    }

    // Populate the 'wish' field of the user object before sending the response
    const updatedUser = await Userdb.findById(user._id).populate("cart");

    // Add the product to the user's wishlist
    user.cart.push({product:productId,quantity:qty});

    // Save the updated user object with the new wishlist
    await user.save();

    // Send a 200 response with a success message and the updated user object
    res.status(200).json({
      message: "Product added to wish successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    // If there's an error, send a 500 response with an error message
    res.status(500).json({ error: "Server error", message: err.message });
  }
};





exports.getCart = async (res, req) => {
  try {
    const user = await productDatas.find({});
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};




exports.fetchCart = async (req, res) => {
  try {
    // Validate session ID
    const userId = req.body.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Find the user by userId
    const user = await Userdb.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract product ids from user's cart
    const productIds = user.cart.map(item => item.product);

    // Find products based on productIds
    const products = await productDatas.find({ _id: { $in: productIds } });

    // Create a new array combining product details with quantities from the user's cart
    const combinedArray = user.cart.map(cartItem => {
      const productDetails = products.find(product => product._id.equals(cartItem.product));
      return {
        product: productDetails,
        quantity: cartItem.quantity,
      };
    });

    res.json({ combinedArray });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};




// exports.delcart = async (req, res) => {
//   try {
//     const productId = req.body.id; // Assuming you pass the productId in the URL

//     // Retrieve the token from the request cookies
//     const token = req.cookies.token;

//     // Verify the token and decode the payload
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find the user by their username in the database
//     const user = await Userdb.findOne({ username: decoded.username });

//     // Check if the product is in the user's cart
//     const cartItemIndex = user.cart.findIndex(
//       (item) => item.product === productId
//     );

//     // If the product is not in the cart, return a 404 response
//     if (cartItemIndex === -1) {
//       return res.status(404).json({ message: "Product not found in cart" });
//     }

//     // Remove the product from the user's cart
//     user.cart.splice(cartItemIndex, 1);

//     // Save the updated user object with the removed product
//     await user.save();

//     // Send a 200 response with a success message and the updated user object
//     res.status(200).json({
//       message: "Product removed from cart successfully",
//       user: user,
//     });
//   } catch (err) {
//     console.error(err);

//     // If there's an error, send a 500 response with an error message
//     res.status(500).json({ error: "Server error", message: err.message });
//   }
// };




exports.delcart = async (req, res) => {
  const productId = req.body.id;

  // Retrieve the token from the request cookies
  const token = req.cookies.token;

  // Verify the token and decode the payload
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Find the user by their username in the database
  const user = await Userdb.findOne({ username: decoded.username });

  // Check if the product is in the user's cart
  const cartItemIndex = user.cart.findIndex(
    (item) => item.product == productId
  );

  console.log(cartItemIndex)

  user.cart.splice(cartItemIndex, 1);

  await user.save();
   

  // Send a response back to the client
  res.json({ success: true, message: "Item removed from cart successfully" });
};


// exports.delcart = async (req, res) => {
//   try {
//     const productId = req.body.id;

//     // Retrieve the token from the request cookies
//     const token = req.cookies.token;

//     // Verify the token and decode the payload
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find the user by their username in the database
//     const user = await Userdb.findOne({ username: decoded.username });

//     // Check if the product is in the user's cart
//     const cartItemIndex = user.cart.findIndex(
//       (item) => item.product === productId
//     );

//     if (cartItemIndex === -1) {
//       // Product is not in the cart
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found in cart" });
//     }

//     // Remove the product from the user's cart
//     user.cart.splice(cartItemIndex, 1);

//     // Save the updated user object with the removed product
//     await user.save();

//     // Send a response back to the client
//     res.json({ success: true, message: "Item removed from cart successfully" });
//   } catch (error) {
//     console.error("Error removing item from cart:", error);
//     // Send an error response back to the client
//     res
//       .status(500)
//       .json({ success: false, error: "Server error", message: error.message });
//   }
// };


exports.cartup= async (req, res) => {
  try {
    const { id, productId, quantity } = req.body;

    console.log(id, productId, quantity);

    // Find the user by userId
    // const user = await Userdb.findById(id);
    
    const user = await Userdb.findOne({ _id: id });
    console.log("user=",user)

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }



    // Check if the product is already in the cart
   const cartItem = user.cart.find(
     (item) => item.product.toString() === productId
   );
    console.log("cart", user.cart[1].product);
    console.log("productId=",productId);
    console.log("cartitem=",cartItem)



    if (cartItem) {
      // Update the quantity if the product is already in the cart
      cartItem.quantity = quantity;
    } else {
      // Add the product to the cart if not already present
      user.cart.push({ product: productId, quantity: quantity });
    }

    // Save the updated user document
    await user.save();

    // Send a success response
    res
      .status(200)
      .json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};








// const products = [
//   {
//     _id: "6597980643824d3f853297a1",
//     id: "2",
//     name: "Clafoutis",
//     price: "1999",
//     image:
//       "https://assets.ajio.com/medias/sys_master/root/20231004/EqWL/651d9302afa4cf41f525aef7/-473Wx593H-466670577-white-MODEL.jpg",
//     category: "men",
//     description: "Men V Neck TShirt with Contrast Tipping",
//   },
//   {
//     _id: "6597980643824d3f853297a9",
//     id: "10",
//     name: "POLO",
//     price: "599",
//     image:
//       "https://assets.ajio.com/medias/sys_master/root/20221220/gnyX/63a1d068f997ddfdbde4a22b/-473Wx593H-469412415-darkblue-MODEL3.jpg",
//     category: "men",
//     description: "Loose Fit Polo Shirt with Full Sleeves",
//   },
// ];

// const user = {
//   _id: "65a7667110ae5708cd9d94a8",
//   username: "asmoo",
//   email: "iananthuprasad@gmail.com",
//   password: "$2b$10$FY.QxhkqARdG3mHxZn6d4epUNHp2o1j7cU.1/umZd9eN/.Szuo6S6",
//   wishlist: [
//     "6597980643824d3f853297a1",
//     "6597980643824d3f853297a2",
//     "6597980643824d3f853297a3",
//   ],
//   cart: [
//     {
//       product: "6597980643824d3f853297a1",
//       quantity: "4",
//       _id: "65bc6144dcdad2cc95bc6988",
//     },
//     {
//       product: "6597980643824d3f853297a9",
//       quantity: "3",
//       _id: "65bc6d587e7611d797af4a2d",
//     },
//   ],
//   __v: 49,
// };

// // Create a new array combining product details with quantities from the user's cart
// const combinedArray = user.cart.map((cartItem) => {
//   const productDetails = products.find(
//     (product) => product._id === cartItem.product
//   );

//   return {
//     product: productDetails,
//     quantity: cartItem.quantity,
//   };
// });

// console.log("Combined Array:", combinedArray);
