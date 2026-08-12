import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class Invoice extends Model {}

Invoice.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        supplier: {
            type: DataTypes.STRING,
            allowNull: true
        },

        invoice_number: {
            type: DataTypes.STRING,
            allowNull: true
        },

        invoice_date: {
            type: DataTypes.STRING,
            allowNull: true
        },

        due_date: {
            type: DataTypes.STRING,
            allowNull: true
        },

        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },

        currency: {
            type: DataTypes.STRING,
            allowNull: true
        },

        vat: {
            type: DataTypes.STRING,
            allowNull: true
        },

        confidence: {
            type: DataTypes.FLOAT,
            allowNull: true
        },

        raw_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "processed"
        }
    },
    {
        sequelize,
        tableName: "invoices",
        timestamps: false
    }
    
);

export default Invoice;