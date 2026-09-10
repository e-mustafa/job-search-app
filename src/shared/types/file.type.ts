import { CloudinaryResourceType, UploadResult } from '../../utils/upload-files/cloudinary';

export type IFile = Express.Multer.File;

export type TAttachment =
	| UploadResult
	| {
			public_id: string;
			secure_url: string;
			resourceType: CloudinaryResourceType;
	  };
