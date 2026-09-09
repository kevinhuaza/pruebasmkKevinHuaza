import {
  DataTypes,
  Model,
  Sequelize,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { User } from './user.model';

export class Document extends Model<InferAttributes<Document>, InferCreationAttributes<Document>> {
  declare id: CreationOptional<number>;
  declare originalName: string;
  declare storedName: string;
  declare storageKey: string;
  declare recordCount: CreationOptional<number>;
  declare userId: number;
  declare uploadedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  declare uploadedBy?: NonAttribute<User>;
}

export default function defineDocument(sequelize: Sequelize): typeof Document {
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      storedName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      storageKey: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      recordCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'documents',
      timestamps: true,
      createdAt: 'uploadedAt',
      updatedAt: false,
      paranoid: true,
    }
  );

  return Document;
}
