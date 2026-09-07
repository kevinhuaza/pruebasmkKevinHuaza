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
  declare nombreOriginal: string;
  declare nombreAlmacenado: string;
  declare rutaArchivo: string;
  declare numRegistros: CreationOptional<number>;
  declare usuarioId: number;
  declare fecha_carga: CreationOptional<Date>;

  declare usuario?: NonAttribute<User>;
}

export default function defineDocument(sequelize: Sequelize): typeof Document {
  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombreOriginal: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'nombre_original',
      },
      nombreAlmacenado: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'nombre_almacenado',
      },
      rutaArchivo: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'ruta_archivo',
      },
      numRegistros: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'num_registros',
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'usuario_id',
      },
      fecha_carga: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'documents',
      timestamps: true,
      createdAt: 'fecha_carga',
      updatedAt: false,
    }
  );

  return Document;
}
