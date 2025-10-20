/**
 * @typedef {Object} PaymentLink
 * @property {string} ChatBot - Payment link for ChatBot plan
 * @property {string} Advanced - Payment link for Advanced plan
 * @property {string} Basic - Payment link for Basic plan
 * @property {string} ProYearly - Payment link for ProYearly plan
 * @property {string} BasicYearly - Payment link for BasicYearly plan
 * @property {string} AdvancedYearly - Payment link for AdvancedYearly plan
 * @property {string} Pro - Payment link for Pro plan
 * @property {string} SMG - Payment link for SMG plan
 */

/**
 * @typedef {Object} PaymentLinksResponse
 * @property {boolean} success - Whether the request was successful
 * @property {PaymentLink} paymentLinks - Object containing payment links for different plans
 */

/**
 * @typedef {Object} ZohoInfo
 * @property {string} name - Name in Zoho
 * @property {string} email - Email in Zoho
 * @property {string} phone - Phone in Zoho
 * @property {number} amount - Amount in Zoho
 * @property {string} status - Status in Zoho
 * @property {number} interval - Interval in Zoho
 * @property {string} plan_code - Plan code in Zoho
 * @property {string} plan_name - Plan name in Zoho
 * @property {number} sub_total - Sub total in Zoho
 * @property {string} created_at - Created at in Zoho
 * @property {string} created_by - Created by in Zoho
 * @property {string} expires_at - Expires at in Zoho
 * @property {string} customer_id - Customer ID in Zoho
 */

/**
 * @typedef {Object} FeatureList
 * @property {boolean} featureA - Whether feature A is enabled
 * @property {boolean} featureB - Whether feature B is enabled
 */

/**
 * @typedef {Object} Subscription
 * @property {string} subscription_id - Subscription ID
 * @property {string} plan_name - Plan name
 * @property {number} monthly_cost - Monthly cost
 * @property {number} annual_cost - Annual cost
 * @property {number} message_limit - Message limit
 * @property {number} storage_limit - Storage limit
 * @property {FeatureList} feature_list - Feature list
 * @property {boolean} active - Whether the subscription is active
 * @property {ZohoInfo} [zoho_info] - Zoho information
 */

/**
 * @typedef {Object} Feature
 * @property {string} tooltip_content - Tooltip content
 * @property {boolean} is_new - Whether the feature is new
 * @property {string} name - Feature name
 */

/**
 * @typedef {Object} FeatureDetails
 * @property {Feature[]} features - Array of features
 */

/**
 * @typedef {Object} Document
 * @property {boolean} can_send_in_mail - Whether the document can be sent in mail
 * @property {string} file_name - File name
 * @property {number} attachment_order - Attachment order
 * @property {string} source - Source
 * @property {string} document_id - Document ID
 * @property {string} file_size - File size
 * @property {string} source_formatted - Formatted source
 * @property {string} uploaded_by - Uploaded by
 * @property {string} file_type - File type
 * @property {string} file_size_formatted - Formatted file size
 * @property {string} uploaded_on - Uploaded on
 * @property {string} uploaded_by_id - Uploaded by ID
 * @property {string} alter_text - Alter text
 * @property {string} uploaded_on_date_formatted - Formatted uploaded on date
 */

/**
 * @typedef {Object} PriceBracket
 * @property {number} price - Price
 */

/**
 * @typedef {Object} Plan
 * @property {string} internal_name - Internal name
 * @property {string} plan_id - Plan ID
 * @property {string} created_by_id - Created by ID
 * @property {string} updated_by_id - Updated by ID
 * @property {string} group_name - Group name
 * @property {string} product_name - Product name
 * @property {string} name - Name
 * @property {string} plan_code - Plan code
 * @property {string} description - Description
 * @property {string} status - Status
 * @property {string} product_id - Product ID
 * @property {string} unit - Unit
 * @property {string} account_id - Account ID
 * @property {string} account_name - Account name
 * @property {string} setup_fee_account_id - Setup fee account ID
 * @property {string} setup_fee_account_name - Setup fee account name
 * @property {number} trial_period - Trial period
 * @property {number} setup_fee - Setup fee
 * @property {number} recurring_price - Recurring price
 * @property {PriceBracket[]} price_brackets - Price brackets
 * @property {number} interval - Interval
 * @property {string} interval_unit - Interval unit
 * @property {number} shipping_interval - Shipping interval
 * @property {string} shipping_interval_unit - Shipping interval unit
 * @property {string} billing_mode - Billing mode
 * @property {number} billing_cycles - Billing cycles
 * @property {string} url - URL
 * @property {string} tax_id - Tax ID
 * @property {boolean} is_taxable - Whether the plan is taxable
 * @property {string} tax_exemption_id - Tax exemption ID
 * @property {string} tax_exemption_code - Tax exemption code
 * @property {string} tax_name - Tax name
 * @property {number} tax_percentage - Tax percentage
 * @property {string} tax_type - Tax type
 * @property {string} created_time - Created time
 * @property {string} updated_time - Updated time
 * @property {boolean} is_free_plan - Whether the plan is free
 * @property {string} created_at - Created at
 * @property {string} pricing_scheme - Pricing scheme
 * @property {any[]} custom_fields - Custom fields
 * @property {Object} custom_field_hash - Custom field hash
 * @property {string} product_type - Product type
 * @property {boolean} show_in_widget - Whether to show in widget
 * @property {boolean} show_in_portal - Whether to show in portal
 * @property {string} store_description - Store description
 * @property {string} store_markup_description - Store markup description
 * @property {FeatureDetails} feature_details - Feature details
 * @property {boolean} is_upgrade_to_live_enabled - Whether upgrade to live is enabled
 * @property {boolean} can_charge_setup_fee_immediately - Whether setup fee can be charged immediately
 * @property {boolean} is_usage_supported - Whether usage is supported
 * @property {string} image_name - Image name
 * @property {string} image_type - Image type
 * @property {Document[]} documents - Documents
 * @property {string[]} tags - Tags
 * @property {string} min_qty - Minimum quantity
 * @property {string} max_qty - Maximum quantity
 * @property {string} fixed_qty - Fixed quantity
 * @property {string} step - Step
 */

/**
 * @typedef {Object} Address
 * @property {string} address_id - Address ID
 * @property {string} street - Street
 * @property {string} address - Address
 * @property {string} street2 - Street 2
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} zip - ZIP
 * @property {string} country - Country
 * @property {string} fax - Fax
 * @property {string} state_code - State code
 * @property {string} country_code - Country code
 * @property {string} phone - Phone
 * @property {string} attention - Attention
 */

/**
 * @typedef {Object} DefaultTemplates
 * @property {string} invoice_template_id - Invoice template ID
 * @property {string} creditnote_template_id - Credit note template ID
 */

/**
 * @typedef {Object} Customer
 * @property {string} display_name - Display name
 * @property {string} company_name - Company name
 * @property {string} customer_id - Customer ID
 * @property {string} contact_name - Contact name
 * @property {string} contact_id - Contact ID
 * @property {string} status - Status
 * @property {string} customer_sub_type - Customer sub type
 * @property {string} currency_id - Currency ID
 * @property {boolean} is_client_review_asked - Whether client review is asked
 * @property {boolean} is_client_review_settings_enabled - Whether client review settings are enabled
 * @property {string} source - Source
 * @property {boolean} payment_reminder_enabled - Whether payment reminder is enabled
 * @property {string} language_code - Language code
 * @property {string} portal_status - Portal status
 * @property {string} owner_id - Owner ID
 * @property {string} language_code_formatted - Formatted language code
 * @property {boolean} is_added_in_portal - Whether added in portal
 * @property {boolean} can_invite - Whether can invite
 * @property {number} billing_day - Billing day
 * @property {boolean} is_taxable - Whether taxable
 * @property {string} tax_id - Tax ID
 * @property {string} tax_name - Tax name
 * @property {string} tax_percentage - Tax percentage
 * @property {string} country_code - Country code
 * @property {string} vat_reg_no - VAT registration number
 * @property {string} vat_treatment - VAT treatment
 * @property {string} currency_code - Currency code
 * @property {string} currency_symbol - Currency symbol
 * @property {number} price_precision - Price precision
 * @property {number} unused_credits - Unused credits
 * @property {number} outstanding_receivable_amount - Outstanding receivable amount
 * @property {number} outstanding - Outstanding
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} email - Email
 * @property {string} phone - Phone
 * @property {string} mobile - Mobile
 * @property {string} salutation - Salutation
 * @property {string} contact_salutation - Contact salutation
 * @property {string} ip_address - IP address
 * @property {string} twitter - Twitter
 * @property {string} facebook - Facebook
 * @property {string} department - Department
 * @property {string} designation - Designation
 * @property {string} skype - Skype
 * @property {string} fax - Fax
 * @property {boolean} is_portal_invitation_accepted - Whether portal invitation is accepted
 * @property {string} website - Website
 * @property {string} pricebook_id - Pricebook ID
 * @property {string} zcrm_account_id - ZCRM account ID
 * @property {string} zcrm_contact_id - ZCRM contact ID
 * @property {boolean} is_sms_enabled - Whether SMS is enabled
 * @property {any[]} custom_fields - Custom fields
 * @property {Object} custom_field_hash - Custom field hash
 * @property {number} payment_terms - Payment terms
 * @property {string} payment_terms_label - Payment terms label
 * @property {boolean} is_gapps_customer - Whether G Apps customer
 * @property {number} unused_credits_receivable_amount - Unused credits receivable amount
 * @property {number} unused_credits_receivable_amount_bcy - Unused credits receivable amount BCY
 * @property {number} unused_credits_payable_amount - Unused credits payable amount
 * @property {number} unused_credits_payable_amount_bcy - Unused credits payable amount BCY
 * @property {boolean} is_linked_with_zohocrm - Whether linked with Zoho CRM
 * @property {string} photo_url - Photo URL
 * @property {string} tax_treatment - Tax treatment
 * @property {string} tax_reg_no - Tax registration number
 * @property {string} category - Category
 * @property {boolean} is_consent_agreed - Whether consent is agreed
 * @property {string} consent_date - Consent date
 * @property {boolean} customer_consolidation_preference - Customer consolidation preference
 * @property {boolean} customer_consolidation_applicable - Whether customer consolidation is applicable
 * @property {string} channel_customer_id - Channel customer ID
 * @property {string} channel_source - Channel source
 * @property {Object} encryption_key_map - Encryption key map
 * @property {string} entity_address_id - Entity address ID
 * @property {Address} billing_address - Billing address
 * @property {Address} shipping_address - Shipping address
 * @property {string[]} tags - Tags
 * @property {boolean} ach_supported - Whether ACH is supported
 * @property {string} primary_contactperson_id - Primary contact person ID
 * @property {any[]} addresses - Addresses
 * @property {boolean} can_add_card - Whether can add card
 * @property {boolean} can_add_bank_account - Whether can add bank account
 * @property {string} company_id - Company ID
 * @property {string} label_for_company_id - Label for company ID
 * @property {string} notes - Notes
 * @property {string} created_time - Created time
 * @property {string} updated_time - Updated time
 * @property {DefaultTemplates} default_templates - Default templates
 * @property {any[]} documents - Documents
 */

/**
 * @typedef {Object} CurrentSubscription
 * @property {string} customer_id - Customer ID
 * @property {string} customer_name - Customer name
 * @property {string} email - Email
 * @property {string} phone - Phone
 * @property {string} mobile_phone - Mobile phone
 * @property {string} plan_name - Plan name
 * @property {string} plan_code - Plan code
 * @property {string} pricebook_id - Pricebook ID
 * @property {string} name - Name
 * @property {string} crm_owner_id - CRM owner ID
 * @property {string} zcrm_potential_id - ZCRM potential ID
 * @property {string} zcrm_potential_name - ZCRM potential name
 * @property {number} sub_total - Sub total
 * @property {string} current_term_starts_at - Current term starts at
 * @property {string} current_term_ends_at - Current term ends at
 * @property {number} interval - Interval
 * @property {string} interval_unit - Interval unit
 * @property {number} shipping_interval - Shipping interval
 * @property {string} shipping_interval_unit - Shipping interval unit
 * @property {string} billing_mode - Billing mode
 * @property {boolean} auto_collect - Whether auto collect
 * @property {string} salesperson_id - Salesperson ID
 * @property {string} salesperson_name - Salesperson name
 * @property {string} currency_code - Currency code
 * @property {string} currency_symbol - Currency symbol
 * @property {string} coupon_duration - Coupon duration
 * @property {string} scheduled_cancellation_date - Scheduled cancellation date
 * @property {string} subscription_id - Subscription ID
 * @property {string} subscription_number - Subscription number
 * @property {boolean} is_metered_billing - Whether metered billing
 * @property {string} created_at - Created at
 * @property {string} activated_at - Activated at
 * @property {string} status - Status
 * @property {string} expires_at - Expires at
 * @property {number} amount - Amount
 * @property {string} last_billing_at - Last billing at
 * @property {string} next_billing_at - Next billing at
 * @property {string} total_orders - Total orders
 * @property {string} orders_created - Orders created
 * @property {string} orders_remaining - Orders remaining
 * @property {string} reference_id - Reference ID
 * @property {string} next_shipment_at - Next shipment at
 * @property {string} last_shipment_at - Last shipment at
 * @property {string} created_time - Created time
 * @property {string} updated_time - Updated time
 * @property {string} next_shipment_day - Next shipment day
 * @property {string} last_shipment_day - Last shipment day
 * @property {any[]} custom_fields - Custom fields
 * @property {Object} custom_field_hash - Custom field hash
 * @property {number} payment_terms - Payment terms
 * @property {string} payment_terms_label - Payment terms label
 * @property {string} created_by - Created by
 */

/**
 * @typedef {Object} SubscriptionDetails
 * @property {Subscription} subscription - Subscription details
 * @property {Customer} customer - Customer details
 * @property {Plan} currentPlan - Current plan details
 * @property {CurrentSubscription} currentSubscription - Current subscription details
 * @property {any[]} downgradeOptions - Downgrade options
 */

/**
 * @typedef {Object} SubscriptionResponse
 * @property {boolean} success - Whether the request was successful
 * @property {SubscriptionDetails} details - Subscription details
 */

/**
 * @typedef {Object} CurrentPlanResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} currentPlan - Current plan details
 * @property {CurrentSubscription} currentPlan.subscription - Current subscription details
 * @property {Plan} currentPlan.plan - Current plan details
 */

/**
 * @typedef {Object} CustomerSearchResult
 * @property {string} customer_name - Customer name
 * @property {string} display_name - Display name
 * @property {boolean} is_primary_associated - Whether primary associated
 * @property {boolean} is_backup_associated - Whether backup associated
 * @property {string} customer_id - Customer ID
 * @property {string} contact_id - Contact ID
 * @property {string} currency_code - Currency code
 * @property {string} currency_symbol - Currency symbol
 * @property {string} status - Status
 * @property {string} company_name - Company name
 * @property {number} unused_credits - Unused credits
 * @property {number} outstanding_receivable_amount - Outstanding receivable amount
 * @property {number} unused_credits_receivable_amount_bcy - Unused credits receivable amount BCY
 * @property {number} outstanding_receivable_amount_bcy - Outstanding receivable amount BCY
 * @property {number} outstanding - Outstanding
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 * @property {string} email - Email
 * @property {string} phone - Phone
 * @property {string} mobile - Mobile
 * @property {string} website - Website
 * @property {boolean} is_gapps_customer - Whether G Apps customer
 * @property {string} created_time - Created time
 * @property {string} updated_time - Updated time
 * @property {boolean} is_portal_invitation_accepted - Whether portal invitation is accepted
 * @property {string} payment_terms_label - Payment terms label
 * @property {number} payment_terms - Payment terms
 * @property {string} created_by - Created by
 * @property {boolean} has_attachment - Whether has attachment
 * @property {string[]} tags - Tags
 */

/**
 * @typedef {Object} CustomerSearchResponse
 * @property {boolean} success - Whether the request was successful
 * @property {CustomerSearchResult[]} customers - Customers matching the search criteria
 */

/**
 * @typedef {Object} DowngradePlanRequest
 * @property {string} customerId - Customer ID
 * @property {string} subscriptionId - Subscription ID
 * @property {string} newPlanCode - New plan code
 */

/**
 * @typedef {Object} DowngradePlanResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} subscription - Subscription details
 */

/**
 * @typedef {Object} CreateSubscriptionRequest
 * @property {string} plan_name - Plan name
 * @property {number} monthly_cost - Monthly cost
 * @property {number} annual_cost - Annual cost
 * @property {number} message_limit - Message limit
 * @property {number} storage_limit - Storage limit
 * @property {FeatureList} feature_list - Feature list
 * @property {boolean} active - Whether the subscription is active
 */

/**
 * @typedef {Object} UpdateSubscriptionRequest
 * @property {string} [plan_name] - Plan name
 * @property {number} [monthly_cost] - Monthly cost
 * @property {number} [annual_cost] - Annual cost
 * @property {number} [message_limit] - Message limit
 * @property {number} [storage_limit] - Storage limit
 * @property {FeatureList} [feature_list] - Feature list
 * @property {boolean} [active] - Whether the subscription is active
 */

/**
 * @typedef {Object} CancelSubscriptionRequest
 * @property {boolean} cancel_at_end - Whether to cancel at the end of the current billing period
 * @property {string} cancellation_reason - The reason for cancellation
 */

/**
 * @typedef {Object} CancelSubscriptionResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} subscription - The canceled subscription details
 * @property {number} subscription.code - Response code
 * @property {string} subscription.message - Response message
 * @property {Object} subscription.subscription - Subscription details
 * @property {string} subscription.subscription.subscription_id - Subscription ID
 * @property {string} subscription.subscription.scheduled_cancellation_date - Scheduled cancellation date
 */

export {};
