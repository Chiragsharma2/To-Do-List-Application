import mongoose from 'mongoose';

const ItemSchema = mongoose.Schema({
    work: String
  });
  
const Item = mongoose.model("Item", ItemSchema);
  

export default Item;