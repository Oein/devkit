import { Deepslate, DeepslateFS_Local } from "#";

const app = new Deepslate({
  port: 3000,
  server: {
    fs: new DeepslateFS_Local("./data"),
  },
});

await app.start();
