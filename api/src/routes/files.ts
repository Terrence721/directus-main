import { Router, Response } from 'express';
import { InvalidCredentialsError, NotFoundError } from '@directus/errors';
import { requireAuth } from '../middleware.js';
import type { AuthenticatedRequest } from '../middleware.js';

/** In-memory file store keyed by fileId */
const files = new Map<string, {
	id: string;
	filename: string;
	collection?: string | null;
	mimeType: string;
	uploadedBy: string;
	createdAt: number;
}>();

export const filesRouter = Router();

/** POST /files - Upload a new file record */
filesRouter.post('/', requireAuth, (req, res) => {
	const body = req.body as { filename?: string; collection?: string; mimeType?: string };
	const { filename, collection, mimeType } = body;
	const authenticatedReq = req as AuthenticatedRequest;

	if (!filename) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: 'Filename is required.' });
		return;
	}

	const id = `file-${Date.now()}`;
	const fileRecord = {
		id,
		filename,
		collection: collection ?? null,
		mimeType: mimeType ?? 'application/octet-stream',
		uploadedBy: authenticatedReq.userId,
		createdAt: Date.now(),
	};

	files.set(id, fileRecord);

	res.status(201).json({
		data: {
			id: fileRecord.id,
			filename: fileRecord.filename,
			collection: fileRecord.collection,
			mimeType: fileRecord.mimeType,
			uploadedAt: fileRecord.createdAt,
		},
	});
});

/** GET /files - List uploaded files */
filesRouter.get('/', requireAuth, (_req, res) => {
	const allFiles = Array.from(files.values()).map(({ id, filename, collection, mimeType, createdAt }) => ({
		id,
		filename,
		collection,
		mimeType,
		createdAt,
	}));

	res.json({ data: allFiles, meta: { totalCount: allFiles.length } });
});

/** GET /files/:id - Get a specific file record */
filesRouter.get('/:id', requireAuth, (req, res) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const fileId = (req as any).params.id;
	const file = files.get(fileId);

	if (!file) {
		const error = new NotFoundError(`File "${fileId}" not found.`);
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({
		data: {
			id: file.id,
			filename: file.filename,
			collection: file.collection,
			mimeType: file.mimeType,
			uploadedAt: file.createdAt,
		},
	});
});
