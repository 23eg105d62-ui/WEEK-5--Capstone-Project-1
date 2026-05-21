import exp from "express";
import { authenticate, register } from "../Services/AuthService.js";
import UserModel from "../Models/UserModel.js";
import ArticleModel from "../Models/ArticleModel.js";
import { checkAuthor } from "../Middlewares/checkAuthor.js";
import { verifyToken } from "../Middlewares/verifyToken.js";

export const authorRoute = exp.Router();

//Register author(public)
authorRoute.post("/users", async (req, res) => {
  //get user obj from req
  let userObj = req.body;
  //call register
  const newUserObj = await register({ ...userObj, role: "AUTHOR" });
  //send res
  res.status(201).json({ message: "author created", payload: newUserObj });
});


//Create article(protected route)
authorRoute.post("/articles", verifyToken("AUTHOR"), async (req, res) => {
  
    //get article from req
    let article = req.body;

    article.author = req.user.userId;

    //create article document
    let newArticleDoc = new ArticleModel(article);

    //validate before saving
    await newArticleDoc.validate();

    //save to database
    let createdArticleDoc = await newArticleDoc.save();

    //send response
    res.status(201).json({ message: "article created", payload: createdArticleDoc });
  
});

//Read articles of author(protected route)
authorRoute.get("/articles/:authorId", verifyToken("AUTHOR"), async (req, res) => {
  
    //get author id from URL parameters
    let aid = req.params.authorId;

    //read articles by this author which are active
    let articles = await ArticleModel.find({ author: aid, isArticleActive: true }).populate("author", "firstName email");

    //send response 
    res.status(200).json({ message: "articles", payload: articles });
  
});

//edit article(protected route)
authorRoute.put("/articles", verifyToken("AUTHOR"), async (req, res) => {

    //get modified article fields from request body

    let { articleId, title, category, content, author } = req.body;

    // chech that the authenticated user owns this article

    if (author !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to edit this article" });
    }

    //find article in database to verify it exists
    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: author });

    //If article not found, return 404
    if (!articleOfDB) {
      return res.status(404).json({ message: "Article not found" });
    }

    //update the article with new values

    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId,
      {
        $set: { title, category, content },
      },
      { new: true },
    );

    //send response 
    res.status(200).json({ message: "article updated", payload: updatedArticle });
   
});

//delete(soft delete) article(protected route)
//Soft delete means marking the article as inactive instead of removing from database
//delete(soft delete) article(Protected route)
authorRoute.patch("/articles/:articleId/status", verifyToken("AUTHOR"), async (req, res) => {
  const { id } = req.params;
  const { isArticleActive } = req.body;
  // Find article
  const article = await ArticleModel.findById(id); //.populate("author");
  //console.log(article)
  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  //console.log(req.user.userId,article.author.toString())
  // AUTHOR can only modify their own articles
  if (req.user.role === "AUTHOR" && 
    article.author.toString() !== req.user.userId) {
    return res
    .status(403)
    .json({ message: "Forbidden. You can only modify your own articles" });
  }
  // Already in requested state
  if (article.isArticleActive === isArticleActive) {
    return res.status(400).json({
      message: `Article is already ${isArticleActive ? "active" : "deleted"}`,
    });
  }

  //update status
  article.isArticleActive = isArticleActive;
  await article.save();

  //send res
  res.status(200).json({
    message: `Article ${isArticleActive ? "restored" : "deleted"} successfully,
    article,`
  });
});



