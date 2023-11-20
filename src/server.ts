import App from "./App";
import { AccountController } from "./controllers/AccountController";
import { UserController } from "./controllers/UserController";
import { UserService } from "./services/UserServices";

const userService = new UserService();
const accountController = new AccountController(userService);

const app = new App([new UserController(), accountController], 3000);
app.listen();
