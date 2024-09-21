// pages/api/getUserInfo.ts
import { getUserInfo } from '../../controllers/userController';
import { authenticate } from '../../middlewares/authMiddleware';

export default authenticate(getUserInfo);
