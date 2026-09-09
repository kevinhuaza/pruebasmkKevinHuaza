import { sequelize } from '../config/database';
import defineUser, { User } from './user.model';
import defineDocument, { Document } from './document.model';
import defineRecord, { Record } from './record.model';

defineUser(sequelize);
defineDocument(sequelize);
defineRecord(sequelize);

User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'uploadedBy' });

Document.hasMany(Record, { foreignKey: 'documentId', as: 'records', onDelete: 'CASCADE' });
Record.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });

export { sequelize, User, Document, Record };
