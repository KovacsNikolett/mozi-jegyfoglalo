const { app, initDatabase } = require("./app");

const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Mozi jegyfoglaló szerver fut: http://localhost:${PORT}`);
  });
});
