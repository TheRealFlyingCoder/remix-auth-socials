import { OAuth2Strategy } from 'remix-auth-oauth2';

export const baseProfileFields = [
	'id',
	'email',
	'name',
	'first_name',
	'middle_name',
	'last_name',
	'picture',
] as const;

export const FacebookStrategyName = 'facebook';
export const FacebookStrategyDefaultScopes: FacebookScope[] = [
	'public_profile',
	'email',
];
export const FacebookStrategyScopeSeperator = ',';
export type FacebookProfileFields = [
	...typeof baseProfileFields,
	...AdditionalFacebookProfileField[],
];

export class FacebookStrategy<User> extends OAuth2Strategy<User> {
	public override name = FacebookStrategyName;
	private readonly scope: FacebookScope[];
	private readonly userInfoURL = 'https://graph.facebook.com/me';

	private readonly profileFields: FacebookProfileFields;

	constructor(
		{
			clientId,
			clientSecret,
			redirectURI,
			scopes,
			extraProfileFields,
		}: FacebookStrategyOptions,
		verify: OAuth2Strategy<User>['verify'],
	) {
		super(
			{
				clientId,
				clientSecret,
				redirectURI,
				authorizationEndpoint: `https://facebook.com/v14.0/dialog/oauth`,
				tokenEndpoint: `https://graph.facebook.com/v14.0/oauth/access_token`,
			},
			verify,
		);
		this.scope = this.getScope(scopes);
		// Ensure unique entries in case they include the base fields
		this.profileFields = [
			...new Set([...baseProfileFields, ...(extraProfileFields || [])]),
		] as FacebookProfileFields;
	}

	// Allow users the option to pass a scope string, or typed array
	private getScope(scopes: FacebookStrategyOptions['scopes']) {
		if (!scopes) {
			return FacebookStrategyDefaultScopes;
		} else if (typeof scopes === 'string') {
			return scopes.split(
				FacebookStrategyScopeSeperator,
			) as FacebookScope[];
		}

		return scopes;
	}

	protected override authorizationParams(): URLSearchParams {
		const params = new URLSearchParams({
			scope: this.scope.join(FacebookStrategyScopeSeperator),
		});

		return params;
	}

	public async userProfile(accessToken: string): Promise<FacebookProfile> {
		const requestParams = `?fields=${this.profileFields.join(',')}`;
		const requestUrl = `${this.userInfoURL}${requestParams}`;
		const response = await fetch(requestUrl, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const raw: FacebookProfile['_json'] = await response.json();
		const profile: FacebookProfile = {
			id: raw.id,
			displayName: raw.name,
			name: {
				familyName: raw.last_name,
				givenName: raw.first_name,
			},
			emails: [{ value: raw.email }],
			photos: [{ value: raw.picture.data.url }],
			_json: raw,
		};
		return profile;
	}
}

/**
 * @see https://developers.facebook.com/docs/permissions/reference
 */
export type FacebookScope =
	| 'ads_management'
	| 'ads_read'
	| 'attribution_read'
	| 'catalog_management'
	| 'business_management'
	| 'email'
	| 'gaming_user_locale'
	| 'groups_access_member_info'
	| 'instagram_basic'
	| 'instagram_content_publish'
	| 'instagram_manage_comments'
	| 'instagram_manage_insights'
	| 'instagram_manage_messages'
	| 'leads_retrieval'
	| 'manage_pages'
	| 'page_events'
	| 'pages_manage_ads'
	| 'pages_manage_cta'
	| 'pages_manage_engagement'
	| 'pages_manage_instant_articles'
	| 'pages_manage_metadata'
	| 'pages_manage_posts'
	| 'pages_messaging'
	| 'pages_read_engagement'
	| 'pages_read_user_content'
	| 'pages_show_list'
	| 'pages_user_gender'
	| 'pages_user_locale'
	| 'pages_user_timezone'
	| 'publish_pages'
	| 'public_profile'
	| 'publish_to_groups'
	| 'publish_video'
	| 'read_insights'
	| 'research_apis'
	| 'user_age_range'
	| 'user_birthday'
	| 'user_friends'
	| 'user_gender'
	| 'user_hometown'
	| 'user_likes'
	| 'user_link'
	| 'user_location'
	| 'user_messenger_contact'
	| 'user_photos'
	| 'user_posts'
	| 'user_videos';

export type AdditionalFacebookProfileField =
	| 'about'
	| 'birthday'
	| 'id'
	| 'age_range'
	| 'education'
	| 'email'
	| 'favorite_athletes'
	| 'favorite_teams'
	| 'first_name'
	| 'gender'
	| 'hometown'
	| 'inspirational_people'
	| 'install_type'
	| 'installed'
	| 'is_guest_user'
	| 'languages'
	| 'last_name'
	| 'link'
	| 'location'
	| 'meeting_for'
	| 'middle_name'
	| 'name'
	| 'name_format'
	| 'payment_pricepoints'
	| 'political'
	| 'picture'
	| 'profile_pic'
	| 'quotes'
	| 'relationship_status'
	| 'shared_login_upgrade_required_by'
	| 'short_name'
	| 'significant_other'
	| 'sports'
	| 'supports_donate_button_in_live_video'
	| 'token_for_business'
	| 'video_upload_limits'
	| 'website';

export type FacebookStrategyOptions = {
	clientId: string;
	clientSecret: string;
	redirectURI: string;
	/**
	 * @default ["public_profile", "email"]
	 *
	 * See all the possible scopes:
	 * @see https://developers.facebook.com/docs/permissions/reference
	 */
	scopes?: FacebookScope[] | string;
	/**
	 * Additional fields that will show up in the profile._json object
	 *
	 * The following fields are included as part of the Oauth2 basic profile
	 * ['id', 'email', 'name', 'first_name', 'middle_name', 'last_name']
	 *
	 * Note: some fields require additional scopes
	 */
	extraProfileFields?: Array<AdditionalFacebookProfileField>;
};

export type FacebookProfile = {
	id: string;
	displayName: string;
	name: {
		familyName: string;
		givenName: string;
	};
	emails: [{ value: string }];
	photos: [{ value: string }];
	_json: {
		id: string;
		name: string;
		first_name: string;
		last_name: string;
		picture: FacebookPicture;
		email: string;
	};
};

export type FacebookExtraParams = {
	expires_in: number;
	token_type: 'bearer';
} & Record<string, string | number>;

export interface FacebookPictureData {
	url: string;
	width: number;
	height: number;
	is_silhouette: boolean;
}
export interface FacebookPicture {
	data: FacebookPictureData;
}
