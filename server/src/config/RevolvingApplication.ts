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
import AuthenticationInstance from '../controller/authController.js';
import UserControllerInstance from '../controller/userController.js';
import StoryControllerInstance from '../controller/storyController.js';
import CommentControllerInstance from '../controller/commentController.js';
import ResponseControllerInstance from '../controller/responseController.js';
import TaskManagerControllerInstance from '../controller/taskManagerController.js';
import SharedStoryControllerInstance from '../controller/sharedStoryController.js';

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
    this.app.post('/revolving/auth/logout/:userId', AuthenticationInstance.logoutHandler);

  // USERS
    this.app.get('/revolving/users', UserControllerInstance.getUsers);
    this.app.get('/revolving/users/single/:userId', UserControllerInstance.getUser);

  //password reset
    this.app.use('/revolving/auth', passwordResetRouter);
  
    this.app.get('/revolving/story/share_getAll', SharedStoryControllerInstance.fetchSharedStories)

  //public routes
    this.app.get('/revolving/story', StoryControllerInstance.getStories);
  
  // comments
    this.app.get('/revolving/comment_in_story/:storyId', CommentControllerInstance.getStoryComments);
    this.app.get('/revolving/comment/:commentId', CommentControllerInstance.getComment);
  
    this.app.get('/revolving/response_in_comment/:commentId', ResponseControllerInstance.getResponseByComment);
    this.app.get('/revolving/response/:responseId', ResponseControllerInstance.getResponse);

    this.app.get('/revolving/story/category', StoryControllerInstance.getStoryByCategory);
    this.app.get('/revolving/story/:storyId', StoryControllerInstance.getStory);
    this.app.get('/revolving/story/share/:sharedId', SharedStoryControllerInstance.getSingleShared)

  // Task manager
    this.app.get('/revolving/task/user/:userId', TaskManagerControllerInstance.getUserTask)
    this.app.get('/revolving/task/:taskId', TaskManagerControllerInstance.getTask)
    this.app.get('/revolving/task/bin/:userId', TaskManagerControllerInstance.getTasksInBin)

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