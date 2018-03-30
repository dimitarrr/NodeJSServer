const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json()); // to make use of the body message in the res and req

dishRouter.route('/')
.get((req,res,next)=>{

  Dishes.find({})
  .then((dishes) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dishes);  //Will take as an input json stirng and then will send it back over
  }, (err) => next(err))
  .catch((err) => next(err));  //Will pass the error to the overall error handler
})
.post((req,res,next)=>{
  Dishes.create(req.body)
  .then((dish) => {
    console.log('Dish Created', dish);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put((req,res,next)=>{
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes');
})
.delete((req,res,next)=>{
  Dishes.remove({})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});

dishRouter.route('/:dishId')
.get((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);  //Will take as an input json stirng and then will send it back over
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req,res,next)=>{
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+req.params.dishId);
})
.put((req,res,next)=>{
  Dishes.findByIdAndUpdate(req.params.dishId, {
    $set: req.body
  }, { new: true}) // Returns the result
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);  //Will take as an input json stirng and then will send it back over
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete((req,res,next)=>{
  Dishes.findByIdAndRemove(req.params.dishId)
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);  //Will take as an input json stirng and then will send it back over
  }, (err) => next(err))
  .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.get((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null){
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments);  //Will take as an input json stirng and then will send it back over
    }
    else{
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));  //Will pass the error to the overall error handler
})
.post((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null){
      dish.comments.push(req.body);
      dish.save()     // Saving the updated dish
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);  //Will take as an input json stirng and then will send it back over
      }, (err) => next(err));
    }
    else{
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put((req,res,next)=>{
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null){
      for(var i= (dish.comments.length-1); i >=0; i--){
        dish.comments.id(dish.comments[i]._id).remove();
      }
      dish.save()     // Saving the updated dish
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);  //Will take as an input json stirng and then will send it back over
      }, (err) => next(err));
    }
    else{
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId').all((req,res,next)=>{
  res.statusCode = 200;
  res.setHeader('Content-Type','text/plain');
  next();
})
.get((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null && dish.comments.id(req.params.commentId) != null){
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments.id(req.params.commentId));  //Will take as an input json stirng and then will send it back over
    }
    else if (dish == null){
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
    else{
      err = new Error('Comment '+req.params.commentId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req,res,next)=>{
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/'+req.params.dishId+'/commnets/'+req.params.commentId);
})
.put((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null && dish.comments.id(req.params.commentId) != null){
      if(req.body.rating){
        dish.comments.id(req.params.commentId).rating = req.body.rating;
      }
      if(req.body.comment){
        dish.comments.id(req.params.commentId).comment = req.body.comment;
      }
      dish.save()     // Saving the updated dish
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);  //Will take as an input json stirng and then will send it back over
      }, (err) => next(err));
    }
    else if (dish == null){
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
    else{
      err = new Error('Comment '+req.params.commentId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete((req,res,next)=>{
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null && dish.comments.id(req.params.commentId) != null){

        dish.comments.id(req.params.commentId).remove();

      dish.save()     // Saving the updated dish
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);  //Will take as an input json stirng and then will send it back over
      }, (err) => next(err));
    }
    else if (dish == null){
      err = new Error('Dish '+req.params.dishId+' not found!');
      err.status = 404;
      return next(err);
    }
    else{
      err = new Error('Comment '+req.params.commentId+' not found!');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = dishRouter;