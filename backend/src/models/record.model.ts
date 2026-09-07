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
  declare correo: string;
  declare nombre: string;
  declare telefono: string;
  declare ciudad: string;
  declare notas: string | null;
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
      correo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      ciudad: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'document_id',
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
