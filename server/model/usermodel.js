const mongoose = require("mongoose");

const schemaUsers = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
  },
  wishlist: [
    {
      type: String,
      required: false,
    },
  ],
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId },
      quantity: { type: String, default: 1 },
    },
  ],
});

module.exports= mongoose.model("users", schemaUsers);

