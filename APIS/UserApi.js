import exp from "express";
import { verifyToken } from "../Middlewares/verifyToken.js";
import ArticleModel from "../Models/ArticleModel.js";
import { register, authenticate } from "../Services/AuthService.js";

export const userRoute = exp.Router();

//Register user
userRoute.post("/users", async (req, res) => {
  //get user obj from req
  let userObj = req.body;
  //call register
  const newUserObj = await register({ ...userObj, role: "USER" });
  //send res
  res.status(201).json({ message: "user created", payload: newUserObj });
});


//Read all articles(protected route)
userRoute.get("/articles", verifyToken("USER"), async (req, res) => {
  //get all articles from the database
  const articles = await ArticleModel.find({isArticleActive:true}).populate("author", "firstName lastName email");
  //Send response 
  //Payload ---> articles array
  res.status(200).json({ message: "All articles", payload: articles });

});

//Add comment to an article(protected route)
userRoute.put("/articles", verifyToken("USER"), async (req, res) => {

  const { user, articleId, comment } = req.body;
console.log(req.user)
if(user!==req.user.userId){
  return res.status(403).json({message: "Forbidden. You can only comment using your own user ID"})
}
  let articleComment = await ArticleModel.findOneAndUpdate(
    {_id:articleId,isArticleActive:true},
    { $push: { comments: { user, comment } } },
    { new: true, runValidators: true }
  );

  if (!articleComment) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.status(200).json({
    message: "Comment added",
    payload: articleComment
  });
});