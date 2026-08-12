import app from "./app";
import { sequelize } from "./config/database";

const PORT = process.env.PORT || 3000;

async function startServer() {

    try {

        await sequelize.authenticate();

        console.log("MySQL connected successfully");

        await sequelize.sync();

        console.log("Database synchronized");

        app.listen(PORT, () => {
            console.log(
                `Backend running on http://localhost:${PORT}`
            );
        });

    } catch (error) {

        console.error(
            "Unable to start server:",
            error
        );

    }
}

startServer();