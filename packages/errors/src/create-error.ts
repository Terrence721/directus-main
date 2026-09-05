export abstract class DirectusError<Extensions = void> extends Error {
	abstract readonly code: string;
	abstract readonly status: number;
	readonly extensions: Extensions;

	constructor(message: string, extensions: Extensions, options?: ErrorOptions) {
		super(message, options);
		this.name = 'DirectusError';
		this.extensions = extensions;
	}

	override toString(): string {
		return `${this.name} [${this.code}]: ${this.message}`;
	}
}
