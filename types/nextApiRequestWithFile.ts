import { NextApiRequest } from 'next';
import { MulterFile } from './multerFile';

export interface NextApiRequestWithFile extends NextApiRequest {
  file?: MulterFile;
  files?: MulterFile[];
}
