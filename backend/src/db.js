import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

// SQLite Database Configuration (for development)
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false
})

export default sequelize