CREATE TABLE "sys_dict_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dict_type_id" uuid NOT NULL,
	"dict_label" varchar(100) NOT NULL,
	"dict_value" varchar(100) NOT NULL,
	"dict_sort" bigint DEFAULT 0,
	"css_class" varchar(100),
	"list_class" varchar(100),
	"is_default" boolean DEFAULT false,
	"status" varchar(10) DEFAULT 'normal' NOT NULL,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_dict_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dict_name" varchar(100) NOT NULL,
	"dict_type" varchar(100) NOT NULL,
	"status" varchar(10) DEFAULT 'normal' NOT NULL,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sys_dict_types_dict_type_unique" UNIQUE("dict_type")
);
--> statement-breakpoint
ALTER TABLE "sys_dict_data" ADD CONSTRAINT "sys_dict_data_dict_type_id_sys_dict_types_id_fk" FOREIGN KEY ("dict_type_id") REFERENCES "public"."sys_dict_types"("id") ON DELETE cascade ON UPDATE no action;