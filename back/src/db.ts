import mongoose from "mongoose";

mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);

function connect() {
  mongoose.connect("mongodb://localhost:27017/smartair?retryWrites=true&w=majority",
  { user: process.env.MONGO_USER,
    pass: process.env.MONGO_PW,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false })
    .then(
      (connection : any) => {
        console.log('Database is connected')
        return connection;
      },
      (err : any) => { console.log('Cannot connect to the database' + err) }
    );
}

exports.connection = connect();