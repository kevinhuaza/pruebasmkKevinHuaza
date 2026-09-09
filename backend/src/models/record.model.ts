import {
  DataTypes,
  Model,
  Sequelize,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

export class Record extends Model<InferAttributes<Record>, InferCreationAttributes<Record>> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare fullName: string;
  declare phone: string;
  declare city: string;
  declare notes: string | null;
  declare documentId: number;
}

export default function defineRecord(sequelize: Sequelize): typeof Record {
  Record.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Record',
      tableName: 'records',
      timestamps: true,
    }
  );

  return Record;
}
