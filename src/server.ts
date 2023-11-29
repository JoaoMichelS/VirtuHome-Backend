import App from "./App";

import { AccountController } from "./controllers/AccountController";
import { TransactionController } from "./controllers/TransactionController";
import { UserController } from "./controllers/UserController";
import { UserService } from "./services/UserServices";
import { GoalController } from "./controllers/GoalController";

const userService = new UserService();
const accountController = new AccountController(userService);
const goalController = new GoalController(userService);

const app = new App([new UserController(), accountController, new TransactionController(), goalController], 3000);
app.listen();
