const express=require('express');
const router=express.Router();
const { check, validationResult } = require('express-validator');
const auth=require('../../middleware/auth');

const Post=require('../../models/Post');
const Profile=require('../../models/Profile');
const User=require('../../models/User');
const { post } = require('request');


router.post('/',[auth,[
    check('text','Text is required').not().isEmpty()
]
],
  async  (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    try {
      const user=await User.findById(req.user.id).select('-password');
     
    const newPost=new Post({
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    });
    const post=await newPost.save();
    res.json(post);
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    

})

router.get('/',auth,async (req,res)=>{
    try {
        const posts=await Post.find().sort({data:-1})
        res.json(posts)
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({msg:'Post not found'});
        }
        res.json(post);
    } catch (error) {
        console.error(error.message)
        if(error.kind=='ObjectId'){
            return res.status(404).json({msg:'Post not found'});
        }
       
        res.status(500).send('Server error')
    }
})

// router.delete('/:id',auth, async(req,res)=>{
//     console.log(req.user); // This should show the user object if the token is valid
//     const post = await Post.findById(req.params.id);
//     console.log(post.user.toString()); // Check if this matches req.user.id
    
//     try {
//       const post=await Post.findById(req.params.id);

//     if(!post){
//         return res.status(404).json('post not found')
//     }

//     if(post.user.toString() !== req.user.id){
//         return res.status(401).json({msg:'Unauthorized request'})
//     }

//     await post.remove();
//     res.json({msg:'post removed'})  
//     }
//     catch (error) {
//         console.error(error.message);
//         if(error.kind=='ObjectId'){
//             return res.status(404).json({msg:'Post not found'});
//         }
//         res.status(500).send('Server Error');
//     }
    
// })


router.delete('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check if the logged-in user is the owner of the post
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Unauthorized request' });
      }
  
      // Use `findByIdAndDelete()` to delete the post
      await Post.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Post removed' });
    } catch (error) {
      console.error(error.message);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Post not found' });
      }
      res.status(500).send('Server Error');
    }
  });
  
  

router.put('/like/:id',auth,async(req,res)=>{
    try{
    const post=await Post.findById(req.params.id);

    if(post.likes.filter(like=>like.user.toString() === req.user.id).length>0){
        return res.status(400).json({msg: 'Post already liked'})
    }

    post.likes.unshift({user:req.user.id});

    await post.save();
    res.json(post.likes);
}catch (error) {
    console.error(error.message);
    if(error.kind=='ObjectId'){
        return res.status(404).json({msg:'Post not found'});
    }
    res.status(500).send('Server Error');
}
})

router.put('/dislike/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);

        if(post.likes.filter(like=>like.user.toString() ===req.user.id ).length === 0){
           res.status(400).json('post has not yet been liked')
        }

        const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);


        // post.likes.unshift({user:req.user.id});
        await post.save()

        res.json(post.likes)
    }
    catch (error) {
        console.error(error.message);
        if(error.kind=='ObjectId'){
            return res.status(404).json({msg:'Post not found'});
        }
        res.status(500).send('Server Error');
    }
})

router.post('/comment/:id',[auth,[
check('text','text is required').not().isEmpty()
]],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
try {
 const post=await Post.findById(req.params.id) ;
   const user=await User.findById(req.user.id).select('-password') ;

   const newComment={
text:req.body.text,
name:user.name,
avatar:user.avatar,
user:req.body.id
   };

   post.comments.unshift(newComment)
   await post.save()
   res.json(post.comments);

   
} catch (error) {
    console.error(error.message);
    if(error.kind=='ObjectId'){
        return res.status(404).json({msg:'Post not found'});
    }
    res.status(500).send('Server Error'); 
}
})

// router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
//     try {
//         const post=await Post.findById(req.params.id);
//         const comment=post.comments.find(comment=>comment.id===req.params.comment_id);

//         if(!comment){
//             return res.status(404).json({msg:'comment does not exist'})
//         }
//         if(comment.user.toString() !== req.user.id){
//             return res.status(401).json({msg:'user not authorized'})
//         }

        
        

        
//         const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);

//         post.comments.splice(removeIndex,1);


//         // post.likes.unshift({user:req.user.id});
//         await post.save()

//        res.json(post.comments)
//     }  catch (error) {
//         console.error(error.message);
//         if(error.kind=='ObjectId'){
//             return res.status(404).json({msg:'Post not found'});
//         }
//         res.status(500).send('Server Error'); 
//     }
// })



router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Find the comment to delete
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Ensure the comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        // Check if the user is authorized to delete the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Find the index of the comment to remove
        const removeIndex = post.comments.findIndex(comment => comment.id === req.params.comment_id);

        // Check if the comment was found
        if (removeIndex === -1) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Remove the comment from the array
        post.comments.splice(removeIndex, 1);

        // Save the updated post
        await post.save();

        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports=router;