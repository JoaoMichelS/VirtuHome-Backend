import express from 'express';
const cors = require('cors');
 
class App {
  public app: express.Application;
  public port: number;
 
  constructor(controllers: any[], port: number) {
    this.app = express();    
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }
 
  private initializeControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App running on the ${this.port} port`);
    });
  }
}
 
export default App;