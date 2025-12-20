export type Locale = 'en' | 'uk' | 'ru';

export interface Translations {
	common: {
		devToolbox: string;
		madeBy: string;
		donate: string;
		privacy: string;
		about: string;
		privacyFirst: string;
		noTracking: string;
		localOnly: string;
		builtBy: string;
		moreToolsComing: string;
	};
	nav: {
		jwt: string;
		cron: string;
		timestamp: string;
		request: string;
		json: string;
		base64: string;
		url: string;
	};
	home: {
		title: string;
		description: string;
		jwtInspector: {
			title: string;
			description: string;
			tags: string[];
		};
		cronExplainer: {
			title: string;
			description: string;
			tags: string[];
		};
		timestampConverter: {
			title: string;
			description: string;
			tags: string[];
		};
		apiRequestBuilder: {
			title: string;
			description: string;
			tags: string[];
		};
		jsonFormatter: {
			title: string;
			description: string;
			tags: string[];
		};
		base64Converter: {
			title: string;
			description: string;
			tags: string[];
		};
		urlInspector: {
			title: string;
			description: string;
			tags: string[];
		};
	};
	jwt: {
		title: string;
		description: string;
	};
	cron: {
		title: string;
		description: string;
	};
	timestamp: {
		title: string;
		description: string;
	};
	request: {
		title: string;
		description: string;
	};
	json: {
		title: string;
		description: string;
	};
	base64: {
		title: string;
		description: string;
	};
	url: {
		title: string;
		description: string;
	};
	about: {
		title: string;
		description: string;
	};
	privacy: {
		title: string;
		description: string;
	};
}

