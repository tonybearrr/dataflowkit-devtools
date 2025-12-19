
export function base64UrlDecode(input: string): string {
	// Replace URL-safe characters with standard Base64 characters
	let base64 = input.replace(/-/g, '+').replace(/_/g, '/');

	// Add padding if necessary
	const padding = base64.length % 4;
	if (padding) {
		base64 += '='.repeat(4 - padding);
	}

	try {
		// Decode Base64 to binary string
		const binaryString = atob(base64);

		// Convert binary string to UTF-8
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		return new TextDecoder('utf-8').decode(bytes);
	} catch {
		throw new Error('Invalid Base64URL encoding');
	}
}


export function base64UrlEncode(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binaryString = '';
	for (let i = 0; i < bytes.length; i++) {
		binaryString += String.fromCharCode(bytes[i]);
	}

	const base64 = btoa(binaryString);

	// Convert to URL-safe format and remove padding
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


export function isValidBase64Url(input: string): boolean {
	// Base64URL uses only A-Z, a-z, 0-9, -, _
	return /^[A-Za-z0-9_-]*$/.test(input);
}

