import authRouter from '../routes/authRoutes.js';
import imageRouter from '../routes/imageRoute.js';
import userRouter from '../routes/usersRoutes.js';
import storyRouter from '../routes/storyRoutes.js';
import commentRouter from '../routes/commentRoutes.js';
import { Application, Request, Response } from 'express';
import responseRouter from '../routes/responseRoutes.js';
import passwordResetRouter from '../routes/resetPassword.js';
import { logURLAndMethods } from '../middleware/urlLogger.js';
import taskManagerRouter from '../routes/taskManagerRoutes.js';
import { verifyAccessToken } from '../middleware/verifyTokens.js';
import { logoutHandler } from '../controller/authController.js';
import { getUser, getUsers } from '../controller/userController.js';
import { getComment, getStoryComments } from '../controller/commentController.js';
import { getResponse, getResponseByComment } from '../controller/responseController.js';
import { getStories, getStoriesWithUserId, getStory, getStoryByCategory, getStoryLikes } from '../controller/storyController.js';
import { getTask, getTasksInBin, getUserTask } from '../controller/taskManagerController.js';
import { fetchSharedStories, getSingleShared } from '../controller/sharedStoryController.js';

export class RevolvingApplication{

  private app: Application

  constructor(app: Application){
    this.app = app
  }

  initiate(){
  // home route
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({ status: true, message: 'server up and running' });
    })
  
  //  CACHING URLS
    this.app.use(logURLAndMethods)

  // ROUTES
    this.app.use('/revolving/auth', authRouter);
    this.app.post('/revolving/auth/logout/:userId', logoutHandler);

  // USERS
    this.app.get('/revolving/users', getUsers);
    this.app.get('/revolving/users/single/:userId', getUser);

  //password reset
    this.app.use('/revolving/auth', passwordResetRouter);
  
    this.app.get('/revolving/story/share_getAll', fetchSharedStories)

  //public routes
    this.app.get('/revolving/story', getStories);
    this.app.get('/revolving/story/user/likesUsersInStory/:userId', getStoryLikes)
    this.app.get('/revolving/story/user/storyWithUserId/:userId', getStoriesWithUserId)
  
  // comments
    this.app.get('/revolving/comment_in_story/:storyId', getStoryComments);
    this.app.get('/revolving/comment/:commentId', getComment);
  
    this.app.get('/revolving/response_in_comment/:commentId', getResponseByComment);
    this.app.get('/revolving/response/:responseId', getResponse);

    this.app.get('/revolving/story/category', getStoryByCategory);
    this.app.get('/revolving/story/:storyId', getStory);
    this.app.get('/revolving/story/share/:sharedId', getSingleShared)

  // Task manager
    this.app.get('/revolving/task/user/:userId', getUserTask)
    this.app.get('/revolving/task/:taskId', getTask)
    this.app.get('/revolving/task/bin/:userId', getTasksInBin)

  // get image
  //  this.app.get('/revolving/images/:imageName', getImage)
  
  // checks for accesstoken
    this.app.use(verifyAccessToken);
  
  // story router
    this.app.use('/revolving/story', storyRouter);
  
  // user router
    this.app.use('/revolving/users', userRouter);
  
  // comment router
    this.app.use('/revolving/comments', commentRouter);
  
  // image upload
    this.app.use('/revolving/images', imageRouter)
  
  // response router
    this.app.use('/revolving/responses', responseRouter);

  // task manager router
    this.app.use('/revolving/task', taskManagerRouter);
    
    // catch all error
     //app.use(errorLog);
    this.app.all('*', (req: Request, res: Response) => {
      res.status(404).json({status: false, message: 'NOT FOUND'})
    })
  }
}