import { Deepslate, DeepslateFS_Local, type DeepslatePlugin } from "#";

const app = new Deepslate({
  port: 4000,
  server: {
    fs: new DeepslateFS_Local("./data"),
  },
});

// Example plugin

class HelloWorld implements DeepslatePlugin {
  name = "HelloWorld";
  version = "1.0.0";
  init(deepslate: Deepslate) {
    deepslate.server.get("/", async (req, res) => {
      const userData = await deepslate.auth.getUserData(req);
      res.send({
        text: "Hello, World!",
        user: userData ?? "Guest",
      });
    });
  }
}

app.use(new HelloWorld());

app.start();
