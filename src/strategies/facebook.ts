import type { StrategyVerifyCallback } from 'remix-auth';
import {
	OAuth2Profile,
	OAuth2StrategyVerifyParams,
	OAuth2Strategy,
} from 'remix-auth-oauth2';
import { SocialsProvider } from '..';

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

export const baseProfileFields = [
	'id',
	'email',
	'name',
	'first_name',
	'middle_name',
	'last_name',
];

export const FacebookDefaultScopes: FacebookScope[] = ['public_profile', 'email'];
export const FacebookScopeSeperator = ',';

export type FacebookStrategyOptions = {
	clientID: string;
	clientSecret: string;
	callbackURL: string;
	/**
	 * @default ["public_profile", "email"]
	 *
	 * See all the possible scopes:
	 * @see https://developers.facebook.com/docs/permissions/reference
	 */
	scope?: FacebookScope[];
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

//TODO: Each field has a specific return type which we can map eventually
export type FacebookProfile = {
	id: string;
	displayName: string;
	_json: Record<AdditionalFacebookProfileField, any>;
} & OAuth2Profile;

export type FacebookExtraParams = {
	expires_in: 5183998;
	token_type: 'bearer';
} & Record<string, string | number>;

//TODO: Versioning
export const latestGraphApiVersion = 'v12.0';

export class FacebookStrategy<User> extends OAuth2Strategy<
	User,
	FacebookProfile,
	FacebookExtraParams
> {
	public name = SocialsProvider.FACEBOOK;
	private readonly scope: FacebookScope[];
	private readonly profileFields: string[];

	private readonly userInfoURL = 'https://graph.facebook.com/me';

	constructor(
		{
			clientID,
			clientSecret,
			callbackURL,
			scope,
			extraProfileFields,
		}: FacebookStrategyOptions,
		verify: StrategyVerifyCallback<
			User,
			OAuth2StrategyVerifyParams<FacebookProfile, FacebookExtraParams>
		>,
	) {
		super(
			{
				clientID,
				clientSecret,
				callbackURL,
				authorizationURL: `https://facebook.com/${latestGraphApiVersion}/dialog/oauth`,
				tokenURL: `https://graph.facebook.com/${latestGraphApiVersion}/oauth/access_token`,
			},
			verify,
		);
		this.scope = scope || FacebookDefaultScopes;
		//Ensure unique entries in case they include the base fields
		this.profileFields = Array.from(
			new Set([...baseProfileFields, ...(extraProfileFields || [])]),
		);
	}

	protected authorizationParams(): URLSearchParams {
		const params = new URLSearchParams({
			scope: this.scope.join(FacebookScopeSeperator),
		});

		return params;
	}

	protected async userProfile(accessToken: string): Promise<FacebookProfile> {
		const response = await fetch(
			`${this.userInfoURL}?fields=${this.profileFields.join(',')}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);
		const raw: FacebookProfile['_json'] = await response.json();
		const profile: FacebookProfile = {
			provider: SocialsProvider.FACEBOOK,
			displayName: raw.name,
			id: raw.id,
			name: {
				givenName: raw.first_name,
				middleName: raw.middle_name,
				familyName: raw.last_name,
			},
			emails: [{ value: raw.email }],
			_json: raw,
		};
		return profile;
	}
}
