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
userRoute.get("/articles", verifyToken, async (req, res) => {
    //get all articles from the database
    const articles = await ArticleModel.find().populate("author", "firstName lastName email");

    //Send response 
    //Payload ---> articles array
    res.status(200).json({message: "All articles",payload: articles});

});

//Add comment to an article(protected route)

userRoute.post("/articles/:articleId/comments", verifyToken, async (req, res) => {
  
    //get articleId from URL parameters
    
    const { articleId } = req.params;

    //get comment text from request body
    
    const { comment } = req.body;

    //check if  that comment is not empty 

    if (!comment  === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    //Find article by its articleId
    //Update it by pushing a new comment to the comments array
   
    const updatedArticle = await ArticleModel.findByIdAndUpdate(articleId,
      {$push: {comments: {userId: req.user.userId, comment: comment, }}},
      { new: true }
    );

    //Check if article was found and updated
    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    //Send  response
    
    res.status(200).json({ message: "Comment added", payload: updatedArticle});
  
});
