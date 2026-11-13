import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_interests" AS ENUM('safari', 'coast', 'walking', 'marine', 'culture', 'honeymoon', 'family', 'birding');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'quoted', 'deposit_paid', 'confirmed', 'travelled', 'review_requested', 'lost');
  CREATE TYPE "public"."enum_leads_source_channel" AS ENUM('form', 'plan', 'chat', 'email', 'phone', 'referral', 'other');
  CREATE TYPE "public"."enum_contacts_source_channel" AS ENUM('form', 'plan', 'chat', 'email', 'phone', 'referral', 'other');
  CREATE TYPE "public"."enum_companies_type" AS ENUM('agent', 'partner', 'corporate', 'other');
  CREATE TYPE "public"."enum_conversations_channel" AS ENUM('email', 'chat');
  CREATE TYPE "public"."enum_conversations_status" AS ENUM('open', 'pending', 'closed');
  CREATE TYPE "public"."enum_conversations_last_direction" AS ENUM('in', 'out');
  CREATE TYPE "public"."enum_conversations_source_channel" AS ENUM('form', 'plan', 'chat', 'email', 'phone', 'referral', 'other');
  CREATE TYPE "public"."enum_messages_direction" AS ENUM('in', 'out', 'note');
  CREATE TYPE "public"."enum_messages_channel" AS ENUM('email', 'chat');
  CREATE TYPE "public"."enum_messages_delivery_status" AS ENUM('queued', 'sent', 'logged', 'failed');
  CREATE TYPE "public"."enum_activities_type" AS ENUM('note', 'email_in', 'email_out', 'chat', 'status', 'lead', 'quote', 'booking', 'payment', 'review', 'task');
  CREATE TYPE "public"."enum_review_requests_status" AS ENUM('scheduled', 'sent', 'reminded', 'clicked', 'opted_out', 'failed');
  CREATE TYPE "public"."enum_quotes_items_unit" AS ENUM('per_person', 'per_child', 'per_group', 'fixed');
  CREATE TYPE "public"."enum_quotes_status" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
  CREATE TYPE "public"."enum_quotes_currency" AS ENUM('USD', 'KES');
  CREATE TYPE "public"."enum_bookings_services_status" AS ENUM('requested', 'confirmed', 'paid', 'cancelled');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('pending_deposit', 'deposit_paid', 'paid', 'travelling', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_bookings_currency" AS ENUM('USD', 'KES');
  CREATE TYPE "public"."enum_departures_status" AS ENUM('scheduled', 'confirmed', 'running', 'done', 'cancelled');
  CREATE TYPE "public"."enum_suppliers_type" AS ENUM('lodge', 'hotel', 'driver', 'guide', 'vehicle', 'boat', 'other');
  CREATE TYPE "public"."enum_payments_kind" AS ENUM('deposit', 'balance', 'other');
  CREATE TYPE "public"."enum_payments_currency" AS ENUM('USD', 'KES');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('pending', 'success', 'failed', 'abandoned', 'refunded');
  CREATE TYPE "public"."enum_payments_provider" AS ENUM('paystack', 'manual', 'mpesa');
  CREATE TYPE "public"."enum_payments_method" AS ENUM('card', 'mobile_money', 'bank', 'cash');
  CREATE TYPE "public"."enum_pages_blocks_statement_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum_pages_blocks_text_media_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_text_media_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum_pages_blocks_facts_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum_pages_blocks_cta_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum_pages_blocks_cards_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum_pages_hero_tone" AS ENUM('night', 'coast', 'safari', 'cream');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_statement_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum__pages_v_blocks_text_media_image_side" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_text_media_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum__pages_v_blocks_facts_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum__pages_v_blocks_cards_tone" AS ENUM('cream', 'coast', 'safari', 'night');
  CREATE TYPE "public"."enum__pages_v_version_hero_tone" AS ENUM('night', 'coast', 'safari', 'cream');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_trips_best_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum_trips_itinerary_meals" AS ENUM('B', 'L', 'D');
  CREATE TYPE "public"."enum_trips_type" AS ENUM('safari', 'coastal', 'walking');
  CREATE TYPE "public"."enum_trips_difficulty" AS ENUM('easy', 'moderate', 'challenging');
  CREATE TYPE "public"."enum_trips_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__trips_v_version_best_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum__trips_v_version_itinerary_meals" AS ENUM('B', 'L', 'D');
  CREATE TYPE "public"."enum__trips_v_version_type" AS ENUM('safari', 'coastal', 'walking');
  CREATE TYPE "public"."enum__trips_v_version_difficulty" AS ENUM('easy', 'moderate', 'challenging');
  CREATE TYPE "public"."enum__trips_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_destinations_best_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum_destinations_region" AS ENUM('coast', 'safari', 'mountain');
  CREATE TYPE "public"."enum_destinations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__destinations_v_version_best_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum__destinations_v_version_region" AS ENUM('coast', 'safari', 'mountain');
  CREATE TYPE "public"."enum__destinations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_experiences_category" AS ENUM('water', 'wild', 'culture', 'foot');
  CREATE TYPE "public"."enum_wildlife_best_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum_wildlife_group" AS ENUM('predators', 'grazers', 'primates', 'birds', 'marine');
  CREATE TYPE "public"."enum_posts_topics" AS ENUM('safari', 'coast', 'wildlife', 'planning', 'culture', 'marine');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_topics" AS ENUM('safari', 'coast', 'wildlife', 'planning', 'culture', 'marine');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'sales', 'editor');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('create', 'update', 'delete', 'login', 'send', 'payment');
  CREATE TYPE "public"."enum_site_settings_hours_days" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  CREATE TYPE "public"."enum_site_settings_social_platform" AS ENUM('instagram', 'facebook', 'tiktok', 'youtube', 'tripadvisor', 'google');
  CREATE TYPE "public"."enum_home_seasons_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum_home_seasons_kind" AS ENUM('dry', 'rains', 'migration', 'marine');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_seasons_months" AS ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec');
  CREATE TYPE "public"."enum__home_v_version_seasons_kind" AS ENUM('dry', 'rains', 'migration', 'marine');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "leads_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_leads_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"contact_id" integer NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"status_changed_at" timestamp(3) with time zone,
  	"lost_reason" varchar,
  	"travel_start" timestamp(3) with time zone,
  	"travel_end" timestamp(3) with time zone,
  	"dates_flexible" boolean DEFAULT false,
  	"adults" numeric DEFAULT 2,
  	"children" numeric DEFAULT 0,
  	"budget" varchar,
  	"estimated_value" numeric,
  	"message" varchar,
  	"extra" jsonb,
  	"source_channel" "enum_leads_source_channel",
  	"source_cta_id" varchar,
  	"source_page" varchar,
  	"source_utm_source" varchar,
  	"source_utm_medium" varchar,
  	"source_utm_campaign" varchar,
  	"source_utm_term" varchar,
  	"source_utm_content" varchar,
  	"source_referrer" varchar,
  	"source_landing_page" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trips_id" integer
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar,
  	"full_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"country" varchar,
  	"company_id" integer,
  	"owner_id" integer,
  	"marketing_consent" boolean DEFAULT false,
  	"do_not_contact" boolean DEFAULT false,
  	"notes" varchar,
  	"source_channel" "enum_contacts_source_channel",
  	"source_cta_id" varchar,
  	"source_page" varchar,
  	"source_utm_source" varchar,
  	"source_utm_medium" varchar,
  	"source_utm_campaign" varchar,
  	"source_utm_term" varchar,
  	"source_utm_content" varchar,
  	"source_referrer" varchar,
  	"source_landing_page" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_companies_type",
  	"email" varchar,
  	"phone" varchar,
  	"country" varchar,
  	"website" varchar,
  	"commission_percent" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar NOT NULL,
  	"contact_id" integer,
  	"lead_id" integer,
  	"channel" "enum_conversations_channel" DEFAULT 'email' NOT NULL,
  	"status" "enum_conversations_status" DEFAULT 'open' NOT NULL,
  	"assigned_to_id" integer,
  	"unread" numeric DEFAULT 0,
  	"last_message_at" timestamp(3) with time zone,
  	"last_message_preview" varchar,
  	"last_direction" "enum_conversations_last_direction",
  	"visitor_token_hash" varchar,
  	"thread_key" varchar,
  	"source_channel" "enum_conversations_source_channel",
  	"source_cta_id" varchar,
  	"source_page" varchar,
  	"source_utm_source" varchar,
  	"source_utm_medium" varchar,
  	"source_utm_campaign" varchar,
  	"source_utm_term" varchar,
  	"source_utm_content" varchar,
  	"source_referrer" varchar,
  	"source_landing_page" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"direction" "enum_messages_direction" NOT NULL,
  	"channel" "enum_messages_channel" NOT NULL,
  	"body" varchar NOT NULL,
  	"preview" varchar,
  	"author_id" integer,
  	"from_name" varchar,
  	"from_email" varchar,
  	"email_message_id" varchar,
  	"delivery_status" "enum_messages_delivery_status",
  	"read_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_activities_type" NOT NULL,
  	"summary" varchar NOT NULL,
  	"body" varchar,
  	"contact_id" integer,
  	"lead_id" integer,
  	"by_id" integer,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"due" timestamp(3) with time zone,
  	"assigned_to_id" integer,
  	"done" boolean DEFAULT false,
  	"lead_id" integer,
  	"contact_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "canned_replies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"shortcut" varchar,
  	"body" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "review_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"booking_id" integer NOT NULL,
  	"contact_id" integer NOT NULL,
  	"status" "enum_review_requests_status" DEFAULT 'scheduled' NOT NULL,
  	"send_after" timestamp(3) with time zone,
  	"sent_at" timestamp(3) with time zone,
  	"reminder_sent_at" timestamp(3) with time zone,
  	"clicked_at" timestamp(3) with time zone,
  	"clicked_platform" varchar,
  	"token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"unit" "enum_quotes_items_unit" DEFAULT 'per_person',
  	"quantity" numeric DEFAULT 1,
  	"unit_price" numeric NOT NULL
  );
  
  CREATE TABLE "quotes_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"overnight" varchar
  );
  
  CREATE TABLE "quotes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"status" "enum_quotes_status" DEFAULT 'draft' NOT NULL,
  	"valid_until" timestamp(3) with time zone,
  	"title" varchar NOT NULL,
  	"lead_id" integer,
  	"contact_id" integer NOT NULL,
  	"trip_id" integer,
  	"start_date" timestamp(3) with time zone,
  	"adults" numeric DEFAULT 2,
  	"children" numeric DEFAULT 0,
  	"currency" "enum_quotes_currency" DEFAULT 'USD' NOT NULL,
  	"discount" numeric DEFAULT 0,
  	"deposit_percent" numeric DEFAULT 30,
  	"subtotal" numeric,
  	"total" numeric,
  	"deposit" numeric,
  	"inclusions" varchar,
  	"exclusions" varchar,
  	"notes" varchar,
  	"accept_token" varchar,
  	"sent_at" timestamp(3) with time zone,
  	"viewed_at" timestamp(3) with time zone,
  	"accepted_at" timestamp(3) with time zone,
  	"booking_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"supplier_id" integer NOT NULL,
  	"date" timestamp(3) with time zone,
  	"status" "enum_bookings_services_status" DEFAULT 'requested',
  	"service" varchar,
  	"cost" numeric,
  	"confirmation_ref" varchar
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"status" "enum_bookings_status" DEFAULT 'pending_deposit' NOT NULL,
  	"title" varchar NOT NULL,
  	"contact_id" integer NOT NULL,
  	"lead_id" integer,
  	"quote_id" integer,
  	"trip_id" integer,
  	"departure_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"pax" numeric DEFAULT 2,
  	"currency" "enum_bookings_currency" DEFAULT 'USD' NOT NULL,
  	"total" numeric NOT NULL,
  	"deposit_due" numeric,
  	"amount_paid" numeric DEFAULT 0,
  	"balance_due" numeric,
  	"balance_due_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"review_requested" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"travellers_id" integer
  );
  
  CREATE TABLE "travellers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_id" integer,
  	"nationality" varchar,
  	"is_child" boolean DEFAULT false,
  	"age_on_travel" numeric,
  	"dietary" varchar,
  	"medical_notes" varchar,
  	"emergency_name" varchar,
  	"emergency_phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"trip_id" integer NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"capacity" numeric DEFAULT 6,
  	"guide_id" integer,
  	"vehicle_id" integer,
  	"status" "enum_departures_status" DEFAULT 'scheduled',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "suppliers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_suppliers_type" NOT NULL,
  	"contact_name" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"location_id" integer,
  	"rates" varchar,
  	"licence" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"booking_id" integer NOT NULL,
  	"contact_id" integer,
  	"kind" "enum_payments_kind" DEFAULT 'deposit' NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" "enum_payments_currency" DEFAULT 'USD' NOT NULL,
  	"status" "enum_payments_status" DEFAULT 'pending' NOT NULL,
  	"provider" "enum_payments_provider" DEFAULT 'paystack' NOT NULL,
  	"method" "enum_payments_method",
  	"exchange_rate" numeric,
  	"credited" numeric,
  	"pay_url" varchar,
  	"provider_ref" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"receipt_number" varchar,
  	"fees" numeric,
  	"reconciled" boolean DEFAULT false,
  	"notes" varchar,
  	"raw" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"text" varchar,
  	"emphasis" varchar,
  	"tone" "enum_pages_blocks_statement_tone" DEFAULT 'cream',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_side" "enum_pages_blocks_text_media_image_side" DEFAULT 'right',
  	"link_label" varchar,
  	"link_href" varchar,
  	"tone" "enum_pages_blocks_text_media_tone" DEFAULT 'cream',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_facts_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"tone" "enum_pages_blocks_facts_tone" DEFAULT 'cream',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Good to know',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"label" varchar DEFAULT 'Plan your trip',
  	"href" varchar DEFAULT '/plan-your-trip',
  	"cta_id" varchar,
  	"tone" "enum_pages_blocks_cta_tone" DEFAULT 'cream',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"tone" "enum_pages_blocks_cards_tone" DEFAULT 'cream',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"hero_eyebrow" varchar,
  	"hero_statement" varchar,
  	"hero_emphasis" varchar,
  	"hero_intro" varchar,
  	"hero_image_id" integer,
  	"hero_tone" "enum_pages_hero_tone" DEFAULT 'night',
  	"sample" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trips_id" integer,
  	"destinations_id" integer,
  	"experiences_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"text" varchar,
  	"emphasis" varchar,
  	"tone" "enum__pages_v_blocks_statement_tone" DEFAULT 'cream',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"image_id" integer,
  	"image_side" "enum__pages_v_blocks_text_media_image_side" DEFAULT 'right',
  	"link_label" varchar,
  	"link_href" varchar,
  	"tone" "enum__pages_v_blocks_text_media_tone" DEFAULT 'cream',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_facts_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"tone" "enum__pages_v_blocks_facts_tone" DEFAULT 'cream',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Good to know',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"label" varchar DEFAULT 'Plan your trip',
  	"href" varchar DEFAULT '/plan-your-trip',
  	"cta_id" varchar,
  	"tone" "enum__pages_v_blocks_cta_tone" DEFAULT 'cream',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"tone" "enum__pages_v_blocks_cards_tone" DEFAULT 'cream',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_statement" varchar,
  	"version_hero_emphasis" varchar,
  	"version_hero_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_tone" "enum__pages_v_version_hero_tone" DEFAULT 'night',
  	"version_sample" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trips_id" integer,
  	"destinations_id" integer,
  	"experiences_id" integer
  );
  
  CREATE TABLE "trips_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "trips_best_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_trips_best_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "trips_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "trips_itinerary_meals" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_trips_itinerary_meals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "trips_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"overnight" varchar,
  	"drive" varchar
  );
  
  CREATE TABLE "trips_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "trips_exclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "trips_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "trips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"type" "enum_trips_type" DEFAULT 'safari',
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 100,
  	"summary" varchar,
  	"statement" varchar,
  	"emphasis" varchar,
  	"hero_image_id" integer,
  	"days" numeric,
  	"nights" numeric,
  	"starts_from" varchar DEFAULT 'Diani Beach',
  	"price_from" numeric,
  	"price_basis" varchar DEFAULT 'per person sharing',
  	"child_percent" numeric DEFAULT 50,
  	"single_supplement" numeric,
  	"group_size_max" numeric,
  	"difficulty" "enum_trips_difficulty",
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_trips_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "trips_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"destinations_id" integer
  );
  
  CREATE TABLE "_trips_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v_version_best_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__trips_v_version_best_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_trips_v_version_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v_version_itinerary_meals" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__trips_v_version_itinerary_meals",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_trips_v_version_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"overnight" varchar,
  	"drive" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v_version_inclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v_version_exclusions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_trips_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_type" "enum__trips_v_version_type" DEFAULT 'safari',
  	"version_featured" boolean DEFAULT false,
  	"version_order" numeric DEFAULT 100,
  	"version_summary" varchar,
  	"version_statement" varchar,
  	"version_emphasis" varchar,
  	"version_hero_image_id" integer,
  	"version_days" numeric,
  	"version_nights" numeric,
  	"version_starts_from" varchar DEFAULT 'Diani Beach',
  	"version_price_from" numeric,
  	"version_price_basis" varchar DEFAULT 'per person sharing',
  	"version_child_percent" numeric DEFAULT 50,
  	"version_single_supplement" numeric,
  	"version_group_size_max" numeric,
  	"version_difficulty" "enum__trips_v_version_difficulty",
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_sample" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__trips_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_trips_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"destinations_id" integer
  );
  
  CREATE TABLE "destinations_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "destinations_best_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_destinations_best_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "destinations_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "destinations_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "destinations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"region" "enum_destinations_region",
  	"order" numeric DEFAULT 100,
  	"summary" varchar,
  	"statement" varchar,
  	"emphasis" varchar,
  	"hero_image_id" integer,
  	"body" jsonb,
  	"county" varchar,
  	"distance_from_diani" varchar,
  	"altitude" varchar,
  	"area" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_destinations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_destinations_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v_version_best_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__destinations_v_version_best_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_destinations_v_version_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_region" "enum__destinations_v_version_region",
  	"version_order" numeric DEFAULT 100,
  	"version_summary" varchar,
  	"version_statement" varchar,
  	"version_emphasis" varchar,
  	"version_hero_image_id" integer,
  	"version_body" jsonb,
  	"version_county" varchar,
  	"version_distance_from_diani" varchar,
  	"version_altitude" varchar,
  	"version_area" varchar,
  	"version_lat" numeric,
  	"version_lng" numeric,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_sample" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__destinations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_experiences_category" NOT NULL,
  	"summary" varchar NOT NULL,
  	"duration" varchar,
  	"price_from" numeric,
  	"location_id" integer,
  	"image_id" integer,
  	"order" numeric DEFAULT 100,
  	"sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wildlife_best_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_wildlife_best_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "wildlife" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"swahili_name" varchar,
  	"scientific_name" varchar,
  	"group" "enum_wildlife_group" NOT NULL,
  	"description" varchar NOT NULL,
  	"tip" varchar,
  	"image_id" integer,
  	"order" numeric DEFAULT 100,
  	"sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wildlife_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"destinations_id" integer
  );
  
  CREATE TABLE "posts_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "posts_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_posts_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"sample" boolean DEFAULT false,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trips_id" integer,
  	"destinations_id" integer
  );
  
  CREATE TABLE "_posts_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_version_topics" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_version_topics",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_sample" boolean DEFAULT false,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"trips_id" integer,
  	"destinations_id" integer
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"role" varchar,
  	"bio" varchar NOT NULL,
  	"photo_id" integer,
  	"sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"poster_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"phone" varchar,
  	"title" varchar,
  	"signature" varchar,
  	"notify_new_leads" boolean DEFAULT true,
  	"notify_chat" boolean DEFAULT true,
  	"takes_new_leads" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"action" "enum_audit_logs_action" NOT NULL,
  	"collection_slug" varchar,
  	"doc_id" varchar,
  	"summary" varchar,
  	"ip" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "rate_limits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"reset_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"leads_id" integer,
  	"contacts_id" integer,
  	"companies_id" integer,
  	"conversations_id" integer,
  	"messages_id" integer,
  	"activities_id" integer,
  	"tasks_id" integer,
  	"canned_replies_id" integer,
  	"review_requests_id" integer,
  	"quotes_id" integer,
  	"bookings_id" integer,
  	"travellers_id" integer,
  	"departures_id" integer,
  	"suppliers_id" integer,
  	"payments_id" integer,
  	"pages_id" integer,
  	"trips_id" integer,
  	"destinations_id" integer,
  	"experiences_id" integer,
  	"wildlife_id" integer,
  	"posts_id" integer,
  	"authors_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"audit_logs_id" integer,
  	"rate_limits_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_site_settings_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar DEFAULT '08:00' NOT NULL,
  	"closes" varchar DEFAULT '18:00' NOT NULL
  );
  
  CREATE TABLE "site_settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"number" varchar,
  	"url" varchar,
  	"sample" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_reviews_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"business_name" varchar DEFAULT 'Ngina Trails & Safaris' NOT NULL,
  	"tagline" varchar DEFAULT 'Safaris and coastal journeys from Diani Beach, Kenya',
  	"email" varchar,
  	"phone" varchar,
  	"whatsapp" varchar,
  	"address_street" varchar,
  	"address_locality" varchar DEFAULT 'Diani Beach',
  	"address_region" varchar DEFAULT 'Kwale County',
  	"address_postal_code" varchar,
  	"address_country" varchar DEFAULT 'KE',
  	"address_lat" numeric DEFAULT -4.3167,
  	"address_lng" numeric DEFAULT 39.5833,
  	"response_time" varchar DEFAULT 'one working day',
  	"reviews_delay_days" numeric DEFAULT 2,
  	"reviews_reminder_days" numeric DEFAULT 7,
  	"notifications_team_emails" varchar,
  	"default_deposit_percent" numeric DEFAULT 30,
  	"show_sample_banner" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_coast_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "home_safari_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "home_seasons_months" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_home_seasons_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_home_seasons_kind",
  	"note" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Diani Beach, Kenya',
  	"hero_statement" varchar,
  	"hero_emphasis" varchar,
  	"hero_intro" varchar,
  	"hero_image_id" integer,
  	"hero_video_id" integer,
  	"play_intro" boolean DEFAULT true,
  	"story_statement" varchar,
  	"story_emphasis" varchar,
  	"story_body" varchar,
  	"coast_eyebrow" varchar,
  	"coast_statement" varchar,
  	"coast_emphasis" varchar,
  	"coast_body" varchar,
  	"coast_image_id" integer,
  	"coast_video_id" integer,
  	"coast_link_label" varchar,
  	"coast_link_href" varchar,
  	"safari_eyebrow" varchar,
  	"safari_statement" varchar,
  	"safari_emphasis" varchar,
  	"safari_body" varchar,
  	"safari_image_id" integer,
  	"safari_video_id" integer,
  	"safari_link_label" varchar,
  	"safari_link_href" varchar,
  	"when_statement" varchar,
  	"cta_statement" varchar,
  	"cta_emphasis" varchar,
  	"cta_body" varchar,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_v_version_coast_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_safari_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_seasons_months" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__home_v_version_seasons_months",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_home_v_version_seasons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__home_v_version_seasons_kind",
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_eyebrow" varchar DEFAULT 'Diani Beach, Kenya',
  	"version_hero_statement" varchar,
  	"version_hero_emphasis" varchar,
  	"version_hero_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_video_id" integer,
  	"version_play_intro" boolean DEFAULT true,
  	"version_story_statement" varchar,
  	"version_story_emphasis" varchar,
  	"version_story_body" varchar,
  	"version_coast_eyebrow" varchar,
  	"version_coast_statement" varchar,
  	"version_coast_emphasis" varchar,
  	"version_coast_body" varchar,
  	"version_coast_image_id" integer,
  	"version_coast_video_id" integer,
  	"version_coast_link_label" varchar,
  	"version_coast_link_href" varchar,
  	"version_safari_eyebrow" varchar,
  	"version_safari_statement" varchar,
  	"version_safari_emphasis" varchar,
  	"version_safari_body" varchar,
  	"version_safari_image_id" integer,
  	"version_safari_video_id" integer,
  	"version_safari_link_label" varchar,
  	"version_safari_link_href" varchar,
  	"version_when_statement" varchar,
  	"version_cta_statement" varchar,
  	"version_cta_emphasis" varchar,
  	"version_cta_body" varchar,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "leads_interests" ADD CONSTRAINT "leads_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_texts" ADD CONSTRAINT "contacts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes_items" ADD CONSTRAINT "quotes_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quotes_days" ADD CONSTRAINT "quotes_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings_services" ADD CONSTRAINT "bookings_services_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings_services" ADD CONSTRAINT "bookings_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_travellers_fk" FOREIGN KEY ("travellers_id") REFERENCES "public"."travellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "travellers" ADD CONSTRAINT "travellers_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departures" ADD CONSTRAINT "departures_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departures" ADD CONSTRAINT "departures_guide_id_suppliers_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departures" ADD CONSTRAINT "departures_vehicle_id_suppliers_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_location_id_destinations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_statement" ADD CONSTRAINT "pages_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_media" ADD CONSTRAINT "pages_blocks_text_media_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_media" ADD CONSTRAINT "pages_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_facts_key_facts" ADD CONSTRAINT "pages_blocks_facts_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_facts" ADD CONSTRAINT "pages_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_faqs" ADD CONSTRAINT "pages_blocks_faq_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cards" ADD CONSTRAINT "pages_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_statement" ADD CONSTRAINT "_pages_v_blocks_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_media" ADD CONSTRAINT "_pages_v_blocks_text_media_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_media" ADD CONSTRAINT "_pages_v_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_facts_key_facts" ADD CONSTRAINT "_pages_v_blocks_facts_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_facts" ADD CONSTRAINT "_pages_v_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_faqs" ADD CONSTRAINT "_pages_v_blocks_faq_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cards" ADD CONSTRAINT "_pages_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_highlights" ADD CONSTRAINT "trips_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_best_months" ADD CONSTRAINT "trips_best_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_key_facts" ADD CONSTRAINT "trips_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_itinerary_meals" ADD CONSTRAINT "trips_itinerary_meals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips_itinerary"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_itinerary" ADD CONSTRAINT "trips_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_inclusions" ADD CONSTRAINT "trips_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_exclusions" ADD CONSTRAINT "trips_exclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_faqs" ADD CONSTRAINT "trips_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips" ADD CONSTRAINT "trips_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trips_rels" ADD CONSTRAINT "trips_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_highlights" ADD CONSTRAINT "_trips_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_best_months" ADD CONSTRAINT "_trips_v_version_best_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_key_facts" ADD CONSTRAINT "_trips_v_version_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_itinerary_meals" ADD CONSTRAINT "_trips_v_version_itinerary_meals_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_trips_v_version_itinerary"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_itinerary" ADD CONSTRAINT "_trips_v_version_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_inclusions" ADD CONSTRAINT "_trips_v_version_inclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_exclusions" ADD CONSTRAINT "_trips_v_version_exclusions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_version_faqs" ADD CONSTRAINT "_trips_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v" ADD CONSTRAINT "_trips_v_parent_id_trips_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."trips"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trips_v" ADD CONSTRAINT "_trips_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trips_v" ADD CONSTRAINT "_trips_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_trips_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_trips_v_rels" ADD CONSTRAINT "_trips_v_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_highlights" ADD CONSTRAINT "destinations_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_best_months" ADD CONSTRAINT "destinations_best_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_key_facts" ADD CONSTRAINT "destinations_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_faqs" ADD CONSTRAINT "destinations_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_highlights" ADD CONSTRAINT "_destinations_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_best_months" ADD CONSTRAINT "_destinations_v_version_best_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_key_facts" ADD CONSTRAINT "_destinations_v_version_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_faqs" ADD CONSTRAINT "_destinations_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_parent_id_destinations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_location_id_destinations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wildlife_best_months" ADD CONSTRAINT "wildlife_best_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wildlife"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wildlife" ADD CONSTRAINT "wildlife_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wildlife_rels" ADD CONSTRAINT "wildlife_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wildlife"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wildlife_rels" ADD CONSTRAINT "wildlife_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_faqs" ADD CONSTRAINT "posts_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_topics" ADD CONSTRAINT "posts_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_faqs" ADD CONSTRAINT "_posts_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_topics" ADD CONSTRAINT "_posts_v_version_topics_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_texts" ADD CONSTRAINT "authors_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs_texts" ADD CONSTRAINT "audit_logs_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tasks_fk" FOREIGN KEY ("tasks_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_canned_replies_fk" FOREIGN KEY ("canned_replies_id") REFERENCES "public"."canned_replies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_review_requests_fk" FOREIGN KEY ("review_requests_id") REFERENCES "public"."review_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_travellers_fk" FOREIGN KEY ("travellers_id") REFERENCES "public"."travellers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departures_fk" FOREIGN KEY ("departures_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_suppliers_fk" FOREIGN KEY ("suppliers_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trips_fk" FOREIGN KEY ("trips_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wildlife_fk" FOREIGN KEY ("wildlife_id") REFERENCES "public"."wildlife"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rate_limits_fk" FOREIGN KEY ("rate_limits_id") REFERENCES "public"."rate_limits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_hours_days" ADD CONSTRAINT "site_settings_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_hours" ADD CONSTRAINT "site_settings_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social" ADD CONSTRAINT "site_settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_trust" ADD CONSTRAINT "site_settings_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_reviews_platforms" ADD CONSTRAINT "site_settings_reviews_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_coast_points" ADD CONSTRAINT "home_coast_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_safari_points" ADD CONSTRAINT "home_safari_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_seasons_months" ADD CONSTRAINT "home_seasons_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_seasons" ADD CONSTRAINT "home_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_coast_image_id_media_id_fk" FOREIGN KEY ("coast_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_coast_video_id_media_id_fk" FOREIGN KEY ("coast_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_safari_image_id_media_id_fk" FOREIGN KEY ("safari_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_safari_video_id_media_id_fk" FOREIGN KEY ("safari_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_coast_points" ADD CONSTRAINT "_home_v_version_coast_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_safari_points" ADD CONSTRAINT "_home_v_version_safari_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_seasons_months" ADD CONSTRAINT "_home_v_version_seasons_months_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v_version_seasons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_seasons" ADD CONSTRAINT "_home_v_version_seasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_video_id_media_id_fk" FOREIGN KEY ("version_hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_coast_image_id_media_id_fk" FOREIGN KEY ("version_coast_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_coast_video_id_media_id_fk" FOREIGN KEY ("version_coast_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_safari_image_id_media_id_fk" FOREIGN KEY ("version_safari_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_safari_video_id_media_id_fk" FOREIGN KEY ("version_safari_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "leads_interests_order_idx" ON "leads_interests" USING btree ("order");
  CREATE INDEX "leads_interests_parent_idx" ON "leads_interests" USING btree ("parent_id");
  CREATE INDEX "leads_contact_idx" ON "leads" USING btree ("contact_id");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "leads_rels_order_idx" ON "leads_rels" USING btree ("order");
  CREATE INDEX "leads_rels_parent_idx" ON "leads_rels" USING btree ("parent_id");
  CREATE INDEX "leads_rels_path_idx" ON "leads_rels" USING btree ("path");
  CREATE INDEX "leads_rels_trips_id_idx" ON "leads_rels" USING btree ("trips_id");
  CREATE INDEX "contacts_full_name_idx" ON "contacts" USING btree ("full_name");
  CREATE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");
  CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");
  CREATE INDEX "contacts_owner_idx" ON "contacts" USING btree ("owner_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "contacts_texts_order_parent" ON "contacts_texts" USING btree ("order","parent_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "conversations_contact_idx" ON "conversations" USING btree ("contact_id");
  CREATE INDEX "conversations_lead_idx" ON "conversations" USING btree ("lead_id");
  CREATE INDEX "conversations_status_idx" ON "conversations" USING btree ("status");
  CREATE INDEX "conversations_assigned_to_idx" ON "conversations" USING btree ("assigned_to_id");
  CREATE INDEX "conversations_last_message_at_idx" ON "conversations" USING btree ("last_message_at");
  CREATE INDEX "conversations_visitor_token_hash_idx" ON "conversations" USING btree ("visitor_token_hash");
  CREATE INDEX "conversations_thread_key_idx" ON "conversations" USING btree ("thread_key");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");
  CREATE INDEX "messages_author_idx" ON "messages" USING btree ("author_id");
  CREATE INDEX "messages_email_message_id_idx" ON "messages" USING btree ("email_message_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE INDEX "activities_contact_idx" ON "activities" USING btree ("contact_id");
  CREATE INDEX "activities_lead_idx" ON "activities" USING btree ("lead_id");
  CREATE INDEX "activities_by_idx" ON "activities" USING btree ("by_id");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "tasks_due_idx" ON "tasks" USING btree ("due");
  CREATE INDEX "tasks_assigned_to_idx" ON "tasks" USING btree ("assigned_to_id");
  CREATE INDEX "tasks_lead_idx" ON "tasks" USING btree ("lead_id");
  CREATE INDEX "tasks_contact_idx" ON "tasks" USING btree ("contact_id");
  CREATE INDEX "tasks_updated_at_idx" ON "tasks" USING btree ("updated_at");
  CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");
  CREATE INDEX "canned_replies_updated_at_idx" ON "canned_replies" USING btree ("updated_at");
  CREATE INDEX "canned_replies_created_at_idx" ON "canned_replies" USING btree ("created_at");
  CREATE INDEX "review_requests_booking_idx" ON "review_requests" USING btree ("booking_id");
  CREATE INDEX "review_requests_contact_idx" ON "review_requests" USING btree ("contact_id");
  CREATE INDEX "review_requests_status_idx" ON "review_requests" USING btree ("status");
  CREATE INDEX "review_requests_send_after_idx" ON "review_requests" USING btree ("send_after");
  CREATE INDEX "review_requests_token_idx" ON "review_requests" USING btree ("token");
  CREATE INDEX "review_requests_updated_at_idx" ON "review_requests" USING btree ("updated_at");
  CREATE INDEX "review_requests_created_at_idx" ON "review_requests" USING btree ("created_at");
  CREATE INDEX "quotes_items_order_idx" ON "quotes_items" USING btree ("_order");
  CREATE INDEX "quotes_items_parent_id_idx" ON "quotes_items" USING btree ("_parent_id");
  CREATE INDEX "quotes_days_order_idx" ON "quotes_days" USING btree ("_order");
  CREATE INDEX "quotes_days_parent_id_idx" ON "quotes_days" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "quotes_number_idx" ON "quotes" USING btree ("number");
  CREATE INDEX "quotes_lead_idx" ON "quotes" USING btree ("lead_id");
  CREATE INDEX "quotes_contact_idx" ON "quotes" USING btree ("contact_id");
  CREATE INDEX "quotes_trip_idx" ON "quotes" USING btree ("trip_id");
  CREATE INDEX "quotes_accept_token_idx" ON "quotes" USING btree ("accept_token");
  CREATE INDEX "quotes_booking_idx" ON "quotes" USING btree ("booking_id");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE INDEX "bookings_services_order_idx" ON "bookings_services" USING btree ("_order");
  CREATE INDEX "bookings_services_parent_id_idx" ON "bookings_services" USING btree ("_parent_id");
  CREATE INDEX "bookings_services_supplier_idx" ON "bookings_services" USING btree ("supplier_id");
  CREATE UNIQUE INDEX "bookings_reference_idx" ON "bookings" USING btree ("reference");
  CREATE INDEX "bookings_contact_idx" ON "bookings" USING btree ("contact_id");
  CREATE INDEX "bookings_lead_idx" ON "bookings" USING btree ("lead_id");
  CREATE INDEX "bookings_quote_idx" ON "bookings" USING btree ("quote_id");
  CREATE INDEX "bookings_trip_idx" ON "bookings" USING btree ("trip_id");
  CREATE INDEX "bookings_departure_idx" ON "bookings" USING btree ("departure_id");
  CREATE INDEX "bookings_start_date_idx" ON "bookings" USING btree ("start_date");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "bookings_rels_order_idx" ON "bookings_rels" USING btree ("order");
  CREATE INDEX "bookings_rels_parent_idx" ON "bookings_rels" USING btree ("parent_id");
  CREATE INDEX "bookings_rels_path_idx" ON "bookings_rels" USING btree ("path");
  CREATE INDEX "bookings_rels_travellers_id_idx" ON "bookings_rels" USING btree ("travellers_id");
  CREATE INDEX "travellers_contact_idx" ON "travellers" USING btree ("contact_id");
  CREATE INDEX "travellers_updated_at_idx" ON "travellers" USING btree ("updated_at");
  CREATE INDEX "travellers_created_at_idx" ON "travellers" USING btree ("created_at");
  CREATE INDEX "departures_trip_idx" ON "departures" USING btree ("trip_id");
  CREATE INDEX "departures_start_date_idx" ON "departures" USING btree ("start_date");
  CREATE INDEX "departures_guide_idx" ON "departures" USING btree ("guide_id");
  CREATE INDEX "departures_vehicle_idx" ON "departures" USING btree ("vehicle_id");
  CREATE INDEX "departures_updated_at_idx" ON "departures" USING btree ("updated_at");
  CREATE INDEX "departures_created_at_idx" ON "departures" USING btree ("created_at");
  CREATE INDEX "suppliers_location_idx" ON "suppliers" USING btree ("location_id");
  CREATE INDEX "suppliers_updated_at_idx" ON "suppliers" USING btree ("updated_at");
  CREATE INDEX "suppliers_created_at_idx" ON "suppliers" USING btree ("created_at");
  CREATE UNIQUE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");
  CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");
  CREATE INDEX "payments_contact_idx" ON "payments" USING btree ("contact_id");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "pages_blocks_statement_order_idx" ON "pages_blocks_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_statement_parent_id_idx" ON "pages_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_statement_path_idx" ON "pages_blocks_statement" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_media_order_idx" ON "pages_blocks_text_media" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_media_parent_id_idx" ON "pages_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_media_path_idx" ON "pages_blocks_text_media" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_media_image_idx" ON "pages_blocks_text_media" USING btree ("image_id");
  CREATE INDEX "pages_blocks_facts_key_facts_order_idx" ON "pages_blocks_facts_key_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_facts_key_facts_parent_id_idx" ON "pages_blocks_facts_key_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_facts_order_idx" ON "pages_blocks_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_facts_parent_id_idx" ON "pages_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_facts_path_idx" ON "pages_blocks_facts" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_faqs_order_idx" ON "pages_blocks_faq_faqs" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_faqs_parent_id_idx" ON "pages_blocks_faq_faqs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_cards_order_idx" ON "pages_blocks_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cards_parent_id_idx" ON "pages_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cards_path_idx" ON "pages_blocks_cards" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_hero_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_seo_seo_image_idx" ON "pages" USING btree ("seo_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_trips_id_idx" ON "pages_rels" USING btree ("trips_id");
  CREATE INDEX "pages_rels_destinations_id_idx" ON "pages_rels" USING btree ("destinations_id");
  CREATE INDEX "pages_rels_experiences_id_idx" ON "pages_rels" USING btree ("experiences_id");
  CREATE INDEX "_pages_v_blocks_statement_order_idx" ON "_pages_v_blocks_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_statement_parent_id_idx" ON "_pages_v_blocks_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_statement_path_idx" ON "_pages_v_blocks_statement" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_media_order_idx" ON "_pages_v_blocks_text_media" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_media_parent_id_idx" ON "_pages_v_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_media_path_idx" ON "_pages_v_blocks_text_media" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_media_image_idx" ON "_pages_v_blocks_text_media" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_facts_key_facts_order_idx" ON "_pages_v_blocks_facts_key_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_facts_key_facts_parent_id_idx" ON "_pages_v_blocks_facts_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_facts_order_idx" ON "_pages_v_blocks_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_facts_parent_id_idx" ON "_pages_v_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_facts_path_idx" ON "_pages_v_blocks_facts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_faqs_order_idx" ON "_pages_v_blocks_faq_faqs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_faqs_parent_id_idx" ON "_pages_v_blocks_faq_faqs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cards_order_idx" ON "_pages_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cards_parent_id_idx" ON "_pages_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cards_path_idx" ON "_pages_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_hero_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_image_idx" ON "_pages_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_trips_id_idx" ON "_pages_v_rels" USING btree ("trips_id");
  CREATE INDEX "_pages_v_rels_destinations_id_idx" ON "_pages_v_rels" USING btree ("destinations_id");
  CREATE INDEX "_pages_v_rels_experiences_id_idx" ON "_pages_v_rels" USING btree ("experiences_id");
  CREATE INDEX "trips_highlights_order_idx" ON "trips_highlights" USING btree ("_order");
  CREATE INDEX "trips_highlights_parent_id_idx" ON "trips_highlights" USING btree ("_parent_id");
  CREATE INDEX "trips_best_months_order_idx" ON "trips_best_months" USING btree ("order");
  CREATE INDEX "trips_best_months_parent_idx" ON "trips_best_months" USING btree ("parent_id");
  CREATE INDEX "trips_key_facts_order_idx" ON "trips_key_facts" USING btree ("_order");
  CREATE INDEX "trips_key_facts_parent_id_idx" ON "trips_key_facts" USING btree ("_parent_id");
  CREATE INDEX "trips_itinerary_meals_order_idx" ON "trips_itinerary_meals" USING btree ("order");
  CREATE INDEX "trips_itinerary_meals_parent_idx" ON "trips_itinerary_meals" USING btree ("parent_id");
  CREATE INDEX "trips_itinerary_order_idx" ON "trips_itinerary" USING btree ("_order");
  CREATE INDEX "trips_itinerary_parent_id_idx" ON "trips_itinerary" USING btree ("_parent_id");
  CREATE INDEX "trips_inclusions_order_idx" ON "trips_inclusions" USING btree ("_order");
  CREATE INDEX "trips_inclusions_parent_id_idx" ON "trips_inclusions" USING btree ("_parent_id");
  CREATE INDEX "trips_exclusions_order_idx" ON "trips_exclusions" USING btree ("_order");
  CREATE INDEX "trips_exclusions_parent_id_idx" ON "trips_exclusions" USING btree ("_parent_id");
  CREATE INDEX "trips_faqs_order_idx" ON "trips_faqs" USING btree ("_order");
  CREATE INDEX "trips_faqs_parent_id_idx" ON "trips_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "trips_slug_idx" ON "trips" USING btree ("slug");
  CREATE INDEX "trips_hero_image_idx" ON "trips" USING btree ("hero_image_id");
  CREATE INDEX "trips_seo_seo_image_idx" ON "trips" USING btree ("seo_image_id");
  CREATE INDEX "trips_updated_at_idx" ON "trips" USING btree ("updated_at");
  CREATE INDEX "trips_created_at_idx" ON "trips" USING btree ("created_at");
  CREATE INDEX "trips__status_idx" ON "trips" USING btree ("_status");
  CREATE INDEX "trips_rels_order_idx" ON "trips_rels" USING btree ("order");
  CREATE INDEX "trips_rels_parent_idx" ON "trips_rels" USING btree ("parent_id");
  CREATE INDEX "trips_rels_path_idx" ON "trips_rels" USING btree ("path");
  CREATE INDEX "trips_rels_media_id_idx" ON "trips_rels" USING btree ("media_id");
  CREATE INDEX "trips_rels_destinations_id_idx" ON "trips_rels" USING btree ("destinations_id");
  CREATE INDEX "_trips_v_version_highlights_order_idx" ON "_trips_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_trips_v_version_highlights_parent_id_idx" ON "_trips_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_version_best_months_order_idx" ON "_trips_v_version_best_months" USING btree ("order");
  CREATE INDEX "_trips_v_version_best_months_parent_idx" ON "_trips_v_version_best_months" USING btree ("parent_id");
  CREATE INDEX "_trips_v_version_key_facts_order_idx" ON "_trips_v_version_key_facts" USING btree ("_order");
  CREATE INDEX "_trips_v_version_key_facts_parent_id_idx" ON "_trips_v_version_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_version_itinerary_meals_order_idx" ON "_trips_v_version_itinerary_meals" USING btree ("order");
  CREATE INDEX "_trips_v_version_itinerary_meals_parent_idx" ON "_trips_v_version_itinerary_meals" USING btree ("parent_id");
  CREATE INDEX "_trips_v_version_itinerary_order_idx" ON "_trips_v_version_itinerary" USING btree ("_order");
  CREATE INDEX "_trips_v_version_itinerary_parent_id_idx" ON "_trips_v_version_itinerary" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_version_inclusions_order_idx" ON "_trips_v_version_inclusions" USING btree ("_order");
  CREATE INDEX "_trips_v_version_inclusions_parent_id_idx" ON "_trips_v_version_inclusions" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_version_exclusions_order_idx" ON "_trips_v_version_exclusions" USING btree ("_order");
  CREATE INDEX "_trips_v_version_exclusions_parent_id_idx" ON "_trips_v_version_exclusions" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_version_faqs_order_idx" ON "_trips_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_trips_v_version_faqs_parent_id_idx" ON "_trips_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_trips_v_parent_idx" ON "_trips_v" USING btree ("parent_id");
  CREATE INDEX "_trips_v_version_version_slug_idx" ON "_trips_v" USING btree ("version_slug");
  CREATE INDEX "_trips_v_version_version_hero_image_idx" ON "_trips_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_trips_v_version_seo_version_seo_image_idx" ON "_trips_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_trips_v_version_version_updated_at_idx" ON "_trips_v" USING btree ("version_updated_at");
  CREATE INDEX "_trips_v_version_version_created_at_idx" ON "_trips_v" USING btree ("version_created_at");
  CREATE INDEX "_trips_v_version_version__status_idx" ON "_trips_v" USING btree ("version__status");
  CREATE INDEX "_trips_v_created_at_idx" ON "_trips_v" USING btree ("created_at");
  CREATE INDEX "_trips_v_updated_at_idx" ON "_trips_v" USING btree ("updated_at");
  CREATE INDEX "_trips_v_latest_idx" ON "_trips_v" USING btree ("latest");
  CREATE INDEX "_trips_v_rels_order_idx" ON "_trips_v_rels" USING btree ("order");
  CREATE INDEX "_trips_v_rels_parent_idx" ON "_trips_v_rels" USING btree ("parent_id");
  CREATE INDEX "_trips_v_rels_path_idx" ON "_trips_v_rels" USING btree ("path");
  CREATE INDEX "_trips_v_rels_media_id_idx" ON "_trips_v_rels" USING btree ("media_id");
  CREATE INDEX "_trips_v_rels_destinations_id_idx" ON "_trips_v_rels" USING btree ("destinations_id");
  CREATE INDEX "destinations_highlights_order_idx" ON "destinations_highlights" USING btree ("_order");
  CREATE INDEX "destinations_highlights_parent_id_idx" ON "destinations_highlights" USING btree ("_parent_id");
  CREATE INDEX "destinations_best_months_order_idx" ON "destinations_best_months" USING btree ("order");
  CREATE INDEX "destinations_best_months_parent_idx" ON "destinations_best_months" USING btree ("parent_id");
  CREATE INDEX "destinations_key_facts_order_idx" ON "destinations_key_facts" USING btree ("_order");
  CREATE INDEX "destinations_key_facts_parent_id_idx" ON "destinations_key_facts" USING btree ("_parent_id");
  CREATE INDEX "destinations_faqs_order_idx" ON "destinations_faqs" USING btree ("_order");
  CREATE INDEX "destinations_faqs_parent_id_idx" ON "destinations_faqs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "destinations_slug_idx" ON "destinations" USING btree ("slug");
  CREATE INDEX "destinations_hero_image_idx" ON "destinations" USING btree ("hero_image_id");
  CREATE INDEX "destinations_seo_seo_image_idx" ON "destinations" USING btree ("seo_image_id");
  CREATE INDEX "destinations_updated_at_idx" ON "destinations" USING btree ("updated_at");
  CREATE INDEX "destinations_created_at_idx" ON "destinations" USING btree ("created_at");
  CREATE INDEX "destinations__status_idx" ON "destinations" USING btree ("_status");
  CREATE INDEX "_destinations_v_version_highlights_order_idx" ON "_destinations_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_highlights_parent_id_idx" ON "_destinations_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_version_best_months_order_idx" ON "_destinations_v_version_best_months" USING btree ("order");
  CREATE INDEX "_destinations_v_version_best_months_parent_idx" ON "_destinations_v_version_best_months" USING btree ("parent_id");
  CREATE INDEX "_destinations_v_version_key_facts_order_idx" ON "_destinations_v_version_key_facts" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_key_facts_parent_id_idx" ON "_destinations_v_version_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_version_faqs_order_idx" ON "_destinations_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_faqs_parent_id_idx" ON "_destinations_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_parent_idx" ON "_destinations_v" USING btree ("parent_id");
  CREATE INDEX "_destinations_v_version_version_slug_idx" ON "_destinations_v" USING btree ("version_slug");
  CREATE INDEX "_destinations_v_version_version_hero_image_idx" ON "_destinations_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_destinations_v_version_seo_version_seo_image_idx" ON "_destinations_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_destinations_v_version_version_updated_at_idx" ON "_destinations_v" USING btree ("version_updated_at");
  CREATE INDEX "_destinations_v_version_version_created_at_idx" ON "_destinations_v" USING btree ("version_created_at");
  CREATE INDEX "_destinations_v_version_version__status_idx" ON "_destinations_v" USING btree ("version__status");
  CREATE INDEX "_destinations_v_created_at_idx" ON "_destinations_v" USING btree ("created_at");
  CREATE INDEX "_destinations_v_updated_at_idx" ON "_destinations_v" USING btree ("updated_at");
  CREATE INDEX "_destinations_v_latest_idx" ON "_destinations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "experiences_slug_idx" ON "experiences" USING btree ("slug");
  CREATE INDEX "experiences_location_idx" ON "experiences" USING btree ("location_id");
  CREATE INDEX "experiences_image_idx" ON "experiences" USING btree ("image_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "wildlife_best_months_order_idx" ON "wildlife_best_months" USING btree ("order");
  CREATE INDEX "wildlife_best_months_parent_idx" ON "wildlife_best_months" USING btree ("parent_id");
  CREATE UNIQUE INDEX "wildlife_slug_idx" ON "wildlife" USING btree ("slug");
  CREATE INDEX "wildlife_image_idx" ON "wildlife" USING btree ("image_id");
  CREATE INDEX "wildlife_updated_at_idx" ON "wildlife" USING btree ("updated_at");
  CREATE INDEX "wildlife_created_at_idx" ON "wildlife" USING btree ("created_at");
  CREATE INDEX "wildlife_rels_order_idx" ON "wildlife_rels" USING btree ("order");
  CREATE INDEX "wildlife_rels_parent_idx" ON "wildlife_rels" USING btree ("parent_id");
  CREATE INDEX "wildlife_rels_path_idx" ON "wildlife_rels" USING btree ("path");
  CREATE INDEX "wildlife_rels_destinations_id_idx" ON "wildlife_rels" USING btree ("destinations_id");
  CREATE INDEX "posts_faqs_order_idx" ON "posts_faqs" USING btree ("_order");
  CREATE INDEX "posts_faqs_parent_id_idx" ON "posts_faqs" USING btree ("_parent_id");
  CREATE INDEX "posts_topics_order_idx" ON "posts_topics" USING btree ("order");
  CREATE INDEX "posts_topics_parent_idx" ON "posts_topics" USING btree ("parent_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_seo_seo_image_idx" ON "posts" USING btree ("seo_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_trips_id_idx" ON "posts_rels" USING btree ("trips_id");
  CREATE INDEX "posts_rels_destinations_id_idx" ON "posts_rels" USING btree ("destinations_id");
  CREATE INDEX "_posts_v_version_faqs_order_idx" ON "_posts_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_posts_v_version_faqs_parent_id_idx" ON "_posts_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_topics_order_idx" ON "_posts_v_version_topics" USING btree ("order");
  CREATE INDEX "_posts_v_version_topics_parent_idx" ON "_posts_v_version_topics" USING btree ("parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_image_idx" ON "_posts_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_trips_id_idx" ON "_posts_v_rels" USING btree ("trips_id");
  CREATE INDEX "_posts_v_rels_destinations_id_idx" ON "_posts_v_rels" USING btree ("destinations_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_photo_idx" ON "authors" USING btree ("photo_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "authors_texts_order_parent" ON "authors_texts" USING btree ("order","parent_id");
  CREATE INDEX "media_poster_idx" ON "media" USING btree ("poster_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");
  CREATE INDEX "audit_logs_collection_slug_idx" ON "audit_logs" USING btree ("collection_slug");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE INDEX "audit_logs_texts_order_parent" ON "audit_logs_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "rate_limits_key_idx" ON "rate_limits" USING btree ("key");
  CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits" USING btree ("reset_at");
  CREATE INDEX "rate_limits_updated_at_idx" ON "rate_limits" USING btree ("updated_at");
  CREATE INDEX "rate_limits_created_at_idx" ON "rate_limits" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("tasks_id");
  CREATE INDEX "payload_locked_documents_rels_canned_replies_id_idx" ON "payload_locked_documents_rels" USING btree ("canned_replies_id");
  CREATE INDEX "payload_locked_documents_rels_review_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("review_requests_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_travellers_id_idx" ON "payload_locked_documents_rels" USING btree ("travellers_id");
  CREATE INDEX "payload_locked_documents_rels_departures_id_idx" ON "payload_locked_documents_rels" USING btree ("departures_id");
  CREATE INDEX "payload_locked_documents_rels_suppliers_id_idx" ON "payload_locked_documents_rels" USING btree ("suppliers_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_trips_id_idx" ON "payload_locked_documents_rels" USING btree ("trips_id");
  CREATE INDEX "payload_locked_documents_rels_destinations_id_idx" ON "payload_locked_documents_rels" USING btree ("destinations_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_wildlife_id_idx" ON "payload_locked_documents_rels" USING btree ("wildlife_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_rate_limits_id_idx" ON "payload_locked_documents_rels" USING btree ("rate_limits_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_hours_days_order_idx" ON "site_settings_hours_days" USING btree ("order");
  CREATE INDEX "site_settings_hours_days_parent_idx" ON "site_settings_hours_days" USING btree ("parent_id");
  CREATE INDEX "site_settings_hours_order_idx" ON "site_settings_hours" USING btree ("_order");
  CREATE INDEX "site_settings_hours_parent_id_idx" ON "site_settings_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_order_idx" ON "site_settings_social" USING btree ("_order");
  CREATE INDEX "site_settings_social_parent_id_idx" ON "site_settings_social" USING btree ("_parent_id");
  CREATE INDEX "site_settings_trust_order_idx" ON "site_settings_trust" USING btree ("_order");
  CREATE INDEX "site_settings_trust_parent_id_idx" ON "site_settings_trust" USING btree ("_parent_id");
  CREATE INDEX "site_settings_reviews_platforms_order_idx" ON "site_settings_reviews_platforms" USING btree ("_order");
  CREATE INDEX "site_settings_reviews_platforms_parent_id_idx" ON "site_settings_reviews_platforms" USING btree ("_parent_id");
  CREATE INDEX "home_coast_points_order_idx" ON "home_coast_points" USING btree ("_order");
  CREATE INDEX "home_coast_points_parent_id_idx" ON "home_coast_points" USING btree ("_parent_id");
  CREATE INDEX "home_safari_points_order_idx" ON "home_safari_points" USING btree ("_order");
  CREATE INDEX "home_safari_points_parent_id_idx" ON "home_safari_points" USING btree ("_parent_id");
  CREATE INDEX "home_seasons_months_order_idx" ON "home_seasons_months" USING btree ("order");
  CREATE INDEX "home_seasons_months_parent_idx" ON "home_seasons_months" USING btree ("parent_id");
  CREATE INDEX "home_seasons_order_idx" ON "home_seasons" USING btree ("_order");
  CREATE INDEX "home_seasons_parent_id_idx" ON "home_seasons" USING btree ("_parent_id");
  CREATE INDEX "home_hero_image_idx" ON "home" USING btree ("hero_image_id");
  CREATE INDEX "home_hero_video_idx" ON "home" USING btree ("hero_video_id");
  CREATE INDEX "home_coast_coast_image_idx" ON "home" USING btree ("coast_image_id");
  CREATE INDEX "home_coast_coast_video_idx" ON "home" USING btree ("coast_video_id");
  CREATE INDEX "home_safari_safari_image_idx" ON "home" USING btree ("safari_image_id");
  CREATE INDEX "home_safari_safari_video_idx" ON "home" USING btree ("safari_video_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "_home_v_version_coast_points_order_idx" ON "_home_v_version_coast_points" USING btree ("_order");
  CREATE INDEX "_home_v_version_coast_points_parent_id_idx" ON "_home_v_version_coast_points" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_safari_points_order_idx" ON "_home_v_version_safari_points" USING btree ("_order");
  CREATE INDEX "_home_v_version_safari_points_parent_id_idx" ON "_home_v_version_safari_points" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_seasons_months_order_idx" ON "_home_v_version_seasons_months" USING btree ("order");
  CREATE INDEX "_home_v_version_seasons_months_parent_idx" ON "_home_v_version_seasons_months" USING btree ("parent_id");
  CREATE INDEX "_home_v_version_seasons_order_idx" ON "_home_v_version_seasons" USING btree ("_order");
  CREATE INDEX "_home_v_version_seasons_parent_id_idx" ON "_home_v_version_seasons" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_version_hero_image_idx" ON "_home_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_home_v_version_version_hero_video_idx" ON "_home_v" USING btree ("version_hero_video_id");
  CREATE INDEX "_home_v_version_coast_version_coast_image_idx" ON "_home_v" USING btree ("version_coast_image_id");
  CREATE INDEX "_home_v_version_coast_version_coast_video_idx" ON "_home_v" USING btree ("version_coast_video_id");
  CREATE INDEX "_home_v_version_safari_version_safari_image_idx" ON "_home_v" USING btree ("version_safari_image_id");
  CREATE INDEX "_home_v_version_safari_version_safari_video_idx" ON "_home_v" USING btree ("version_safari_video_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "leads_interests" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "leads_rels" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "contacts_texts" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "conversations" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "tasks" CASCADE;
  DROP TABLE "canned_replies" CASCADE;
  DROP TABLE "review_requests" CASCADE;
  DROP TABLE "quotes_items" CASCADE;
  DROP TABLE "quotes_days" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "bookings_services" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "bookings_rels" CASCADE;
  DROP TABLE "travellers" CASCADE;
  DROP TABLE "departures" CASCADE;
  DROP TABLE "suppliers" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "pages_blocks_statement" CASCADE;
  DROP TABLE "pages_blocks_text_media" CASCADE;
  DROP TABLE "pages_blocks_facts_key_facts" CASCADE;
  DROP TABLE "pages_blocks_facts" CASCADE;
  DROP TABLE "pages_blocks_faq_faqs" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_cards" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_statement" CASCADE;
  DROP TABLE "_pages_v_blocks_text_media" CASCADE;
  DROP TABLE "_pages_v_blocks_facts_key_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_faqs" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_cards" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "trips_highlights" CASCADE;
  DROP TABLE "trips_best_months" CASCADE;
  DROP TABLE "trips_key_facts" CASCADE;
  DROP TABLE "trips_itinerary_meals" CASCADE;
  DROP TABLE "trips_itinerary" CASCADE;
  DROP TABLE "trips_inclusions" CASCADE;
  DROP TABLE "trips_exclusions" CASCADE;
  DROP TABLE "trips_faqs" CASCADE;
  DROP TABLE "trips" CASCADE;
  DROP TABLE "trips_rels" CASCADE;
  DROP TABLE "_trips_v_version_highlights" CASCADE;
  DROP TABLE "_trips_v_version_best_months" CASCADE;
  DROP TABLE "_trips_v_version_key_facts" CASCADE;
  DROP TABLE "_trips_v_version_itinerary_meals" CASCADE;
  DROP TABLE "_trips_v_version_itinerary" CASCADE;
  DROP TABLE "_trips_v_version_inclusions" CASCADE;
  DROP TABLE "_trips_v_version_exclusions" CASCADE;
  DROP TABLE "_trips_v_version_faqs" CASCADE;
  DROP TABLE "_trips_v" CASCADE;
  DROP TABLE "_trips_v_rels" CASCADE;
  DROP TABLE "destinations_highlights" CASCADE;
  DROP TABLE "destinations_best_months" CASCADE;
  DROP TABLE "destinations_key_facts" CASCADE;
  DROP TABLE "destinations_faqs" CASCADE;
  DROP TABLE "destinations" CASCADE;
  DROP TABLE "_destinations_v_version_highlights" CASCADE;
  DROP TABLE "_destinations_v_version_best_months" CASCADE;
  DROP TABLE "_destinations_v_version_key_facts" CASCADE;
  DROP TABLE "_destinations_v_version_faqs" CASCADE;
  DROP TABLE "_destinations_v" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "wildlife_best_months" CASCADE;
  DROP TABLE "wildlife" CASCADE;
  DROP TABLE "wildlife_rels" CASCADE;
  DROP TABLE "posts_faqs" CASCADE;
  DROP TABLE "posts_topics" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_faqs" CASCADE;
  DROP TABLE "_posts_v_version_topics" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "authors_texts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "audit_logs_texts" CASCADE;
  DROP TABLE "rate_limits" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_hours_days" CASCADE;
  DROP TABLE "site_settings_hours" CASCADE;
  DROP TABLE "site_settings_social" CASCADE;
  DROP TABLE "site_settings_trust" CASCADE;
  DROP TABLE "site_settings_reviews_platforms" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "home_coast_points" CASCADE;
  DROP TABLE "home_safari_points" CASCADE;
  DROP TABLE "home_seasons_months" CASCADE;
  DROP TABLE "home_seasons" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "_home_v_version_coast_points" CASCADE;
  DROP TABLE "_home_v_version_safari_points" CASCADE;
  DROP TABLE "_home_v_version_seasons_months" CASCADE;
  DROP TABLE "_home_v_version_seasons" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TYPE "public"."enum_leads_interests";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_source_channel";
  DROP TYPE "public"."enum_contacts_source_channel";
  DROP TYPE "public"."enum_companies_type";
  DROP TYPE "public"."enum_conversations_channel";
  DROP TYPE "public"."enum_conversations_status";
  DROP TYPE "public"."enum_conversations_last_direction";
  DROP TYPE "public"."enum_conversations_source_channel";
  DROP TYPE "public"."enum_messages_direction";
  DROP TYPE "public"."enum_messages_channel";
  DROP TYPE "public"."enum_messages_delivery_status";
  DROP TYPE "public"."enum_activities_type";
  DROP TYPE "public"."enum_review_requests_status";
  DROP TYPE "public"."enum_quotes_items_unit";
  DROP TYPE "public"."enum_quotes_status";
  DROP TYPE "public"."enum_quotes_currency";
  DROP TYPE "public"."enum_bookings_services_status";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_currency";
  DROP TYPE "public"."enum_departures_status";
  DROP TYPE "public"."enum_suppliers_type";
  DROP TYPE "public"."enum_payments_kind";
  DROP TYPE "public"."enum_payments_currency";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_provider";
  DROP TYPE "public"."enum_payments_method";
  DROP TYPE "public"."enum_pages_blocks_statement_tone";
  DROP TYPE "public"."enum_pages_blocks_text_media_image_side";
  DROP TYPE "public"."enum_pages_blocks_text_media_tone";
  DROP TYPE "public"."enum_pages_blocks_facts_tone";
  DROP TYPE "public"."enum_pages_blocks_cta_tone";
  DROP TYPE "public"."enum_pages_blocks_cards_tone";
  DROP TYPE "public"."enum_pages_hero_tone";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_statement_tone";
  DROP TYPE "public"."enum__pages_v_blocks_text_media_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_text_media_tone";
  DROP TYPE "public"."enum__pages_v_blocks_facts_tone";
  DROP TYPE "public"."enum__pages_v_blocks_cta_tone";
  DROP TYPE "public"."enum__pages_v_blocks_cards_tone";
  DROP TYPE "public"."enum__pages_v_version_hero_tone";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_trips_best_months";
  DROP TYPE "public"."enum_trips_itinerary_meals";
  DROP TYPE "public"."enum_trips_type";
  DROP TYPE "public"."enum_trips_difficulty";
  DROP TYPE "public"."enum_trips_status";
  DROP TYPE "public"."enum__trips_v_version_best_months";
  DROP TYPE "public"."enum__trips_v_version_itinerary_meals";
  DROP TYPE "public"."enum__trips_v_version_type";
  DROP TYPE "public"."enum__trips_v_version_difficulty";
  DROP TYPE "public"."enum__trips_v_version_status";
  DROP TYPE "public"."enum_destinations_best_months";
  DROP TYPE "public"."enum_destinations_region";
  DROP TYPE "public"."enum_destinations_status";
  DROP TYPE "public"."enum__destinations_v_version_best_months";
  DROP TYPE "public"."enum__destinations_v_version_region";
  DROP TYPE "public"."enum__destinations_v_version_status";
  DROP TYPE "public"."enum_experiences_category";
  DROP TYPE "public"."enum_wildlife_best_months";
  DROP TYPE "public"."enum_wildlife_group";
  DROP TYPE "public"."enum_posts_topics";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_topics";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_site_settings_hours_days";
  DROP TYPE "public"."enum_site_settings_social_platform";
  DROP TYPE "public"."enum_home_seasons_months";
  DROP TYPE "public"."enum_home_seasons_kind";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_seasons_months";
  DROP TYPE "public"."enum__home_v_version_seasons_kind";
  DROP TYPE "public"."enum__home_v_version_status";`)
}
