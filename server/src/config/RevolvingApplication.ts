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
//  import { verifyAccessToken } from '../middleware/verifyTokens.js';
// import { logoutHandler } from '../controller/authController.js';
// import { getUser, getUsers } from '../controller/userController.js';
// import { getComment, getStoryComments } from '../controller/commentController.js';
// import { getResponse, getResponseByComment } from '../controller/responseController.js';
// import { getTask, getTasksInBin, getUserTask } from '../controller/taskManagerController.js';
// import { fetchSharedStories, getSingleShared } from '../controller/sharedStoryController.js';
// import { getStories, getStoriesWithUserId, getStory, getStoryByCategory, getStoryLikes } from '../controller/storyController.js';
// import TokenController from '../middleware/verifyTokens.js';
import UserController from '../controller/userController.js';
import StoryController from '../controller/storyController.js';
import notificationRouter from '../routes/notificationRoutes.js';
import CommentController from '../controller/commentController.js';
import ResponseController from '../controller/responseController.js';
import AuthenticationController from '../controller/authController.js';
import TaskManagerController from '../controller/taskManagerController.js';
import SharedStoryController from '../controller/sharedStoryController.js';
import { verifyAccessToken } from '../middleware/verifyTokens.js';
import { EmailProps, NewUserProp, RequestProp, RequestStoryProp } from '../../types.js';


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
    this.app.post('/revolving/auth/logout/:userId', (req: NewUserProp, res: Response) => AuthenticationController.logoutHandler(req, res));

  // USERS
    this.app.get('/revolving/users', (req: NewUserProp, res: Response) => UserController.getUsers(req, res));
    this.app.get('/revolving/users/single/:userId', (req: NewUserProp, res: Response) => UserController.getUser(req, res));

  //password reset
    this.app.use('/revolving/auth', passwordResetRouter);
  
    this.app.get('/revolving/story/share_getAll', (req: RequestStoryProp, res: Response) => SharedStoryController.fetchSharedStories(req, res));

  //public routes
    this.app.get('/revolving/story', (req: RequestStoryProp, res: Response) => StoryController.getStories(req, res));
    this.app.get('/revolving/story/user/likesUsersInStory/:userId', (req: RequestStoryProp, res: Response) => StoryController.getStoryLikes(req, res));
    this.app.get('/revolving/story/user/storyWithUserId/:userId', (req: RequestStoryProp, res: Response) => StoryController.getStoriesWithUserId(req, res));
  
  // comments
    this.app.get('/revolving/comment_in_story/:storyId', (req: RequestProp, res: Response) => CommentController.getStoryComments(req, res));
    this.app.get('/revolving/comment/:commentId', (req: RequestProp, res: Response) => CommentController.getComment(req, res));
  
    this.app.get('/revolving/response_in_comment/:commentId', (req: RequestProp, res: Response) => ResponseController.getResponseByComment(req, res));
    this.app.get('/revolving/response/:responseId', (req: RequestProp, res: Response) => ResponseController.getResponse(req, res));

    this.app.get('/revolving/story/category', (req: RequestStoryProp, res: Response) => StoryController.getStoryByCategory(req, res));
    this.app.get('/revolving/story/:storyId', (req: RequestStoryProp, res: Response) => StoryController.getStory(req, res));
    this.app.get('/revolving/story/share/:sharedId', (req: RequestStoryProp, res: Response) => SharedStoryController.getSingleShared(req, res));

  // Task manager
    this.app.get('/revolving/task/user/:userId', (req: Request, res: Response) => TaskManagerController.getUserTask(req, res));
    this.app.get('/revolving/task/:taskId', (req: Request, res: Response) => TaskManagerController.getTask(req, res));
    this.app.get('/revolving/task/bin/:userId', (req: Request, res: Response) => TaskManagerController.getTasksInBin(req, res));

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
  
    // notification router
    this.app.use('/revolving/notification', notificationRouter);
    
    // catch all error
     //app.use(errorLog);
    this.app.all('*', (req: Request, res: Response) => {
      res.status(404).json({status: false, message: 'NOT FOUND'})
    })
  }
}