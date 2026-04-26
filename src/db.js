require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_STORAGE || "database.sqlite",
  logging: false
});

const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false, field: "password_hash" },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" }
}, {
  tableName: "users",
  underscored: true
});

const Movie = sequelize.define("Movie", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, field: "duration_minutes" },
  posterUrl: { type: DataTypes.STRING, field: "poster_url" }
}, {
  tableName: "movies",
  underscored: true
});

const Screening = sequelize.define("Screening", {
  startTime: { type: DataTypes.STRING, allowNull: false, field: "start_time" },
  room: { type: DataTypes.STRING, allowNull: false },
  totalSeats: { type: DataTypes.INTEGER, allowNull: false, field: "total_seats" }
}, {
  tableName: "screenings",
  underscored: true
});

const Booking = sequelize.define("Booking", {
  customerName: { type: DataTypes.STRING, allowNull: false, field: "customer_name" },
  customerEmail: { type: DataTypes.STRING, allowNull: false, field: "customer_email" },
  seats: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "bookings",
  underscored: true
});

Movie.hasMany(Screening, { foreignKey: "movie_id" });
Screening.belongsTo(Movie, { foreignKey: "movie_id" });

Screening.hasMany(Booking, { foreignKey: "screening_id" });
Booking.belongsTo(Screening, { foreignKey: "screening_id" });

User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

module.exports = { sequelize, User, Movie, Screening, Booking };
