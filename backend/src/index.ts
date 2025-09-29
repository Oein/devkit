import { Deepslate, DeepslateFS_Local, type DeepslatePlugin } from "#";

const app = new Deepslate({
  port: 3000,
  server: {
    fs: new DeepslateFS_Local("./data"),
  },
});

// Example plugin

class HelloWorld implements DeepslatePlugin {
  name = "HelloWorld";
  version = "1.0.0";
  init(deepslate: Deepslate) {
    deepslate.server.get("/", (req, res) => {
      res.send("Hello, World!");
    });
  }
}

app.use(new HelloWorld());

await app.start();
