/**
 * Extending Error is intentional here, not a composition-over-inheritance violation: a custom
 * exception hierarchy is the standard, idiomatic pattern, and Error's surface (message, stack,
 * cause) is exactly what every subclass needs — unlike extending a type whose surface is far
 * wider than the actual contract (the RxJS-Observable case this codebase avoids elsewhere).
 */
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
