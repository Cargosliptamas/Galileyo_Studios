/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "drizzle-orm";
import {
  bigint,
  date,
  datetime,
  decimal,
  float,
  foreignKey,
  index,
  int,
  json,
  longtext,
  mediumtext,
  mysqlTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  tinyint,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const account = mysqlTable(
  "account",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: bigint({ mode: "number" }).notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ mode: "string" }),
    refreshTokenExpiresAt: timestamp({ mode: "string" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "account_id" })],
);

export const activeRecordLog = mysqlTable(
  "active_record_log",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }),
    idStaff: bigint("id_staff", { mode: "number" }),
    actionType: tinyint("action_type"),
    model: varchar({ length: 50 }),
    idModel: varchar("id_model", { length: 255 }),
    field: varchar({ length: 50 }),
    changes: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "active_record_log_id" }),
  ],
);

export const address = mysqlTable(
  "address",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    idInvoice: bigint("id_invoice", { mode: "number" }).references(
      () => invoice.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    company: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    phoneNumber: varchar("phone_number", { length: 255 }),
    country: varchar({ length: 3 }),
    state: varchar({ length: 3 }),
    zip: varchar({ length: 10 }),
    city: varchar({ length: 255 }),
    address1: varchar({ length: 255 }),
    address2: varchar({ length: 255 }),
    addressType: tinyint("address_type"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "address_id" })],
);

export const adminMember = mysqlTable(
  "admin_member",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idAdmin: bigint("id_admin", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idMember: bigint("id_member", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idPlan: bigint("id_plan", { mode: "number" }).references(
      () => userPlan.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "admin_member_id" }),
    unique("UK_admin_member").on(table.idAdmin, table.idMember),
  ],
);

export const adminMessageLog = mysqlTable(
  "admin_message_log",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idStaff: bigint("id_staff", { mode: "number" }).notNull(),
    objType: tinyint("obj_type"),
    objId: varchar("obj_id", { length: 10 }),
    body: text(),
    createdAt: datetime("created_at", { mode: "string" }),
  },
  (table) => [
    index("IDX_admin_message_log").on(
      table.objType,
      table.objId,
      table.createdAt,
    ),
    primaryKey({ columns: [table.id], name: "admin_message_log_id" }),
  ],
);

export const affiliate = mysqlTable(
  "affiliate",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUserParent: bigint("id_user_parent", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idUserChild: bigint("id_user_child", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    isActive: tinyint("is_active"),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "affiliate_id" })],
);

export const affiliateInvite = mysqlTable(
  "affiliate_invite",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    email: varchar({ length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 63 }),
    token: varchar({ length: 255 }),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "affiliate_invite_id" })],
);

export const apiLog = mysqlTable(
  "api_log",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    key: varchar({ length: 255 }).notNull(),
    value: mediumtext(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "api_log_id" })],
);

export const appleAppTransactions = mysqlTable(
  "apple_app_transactions",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    status: varchar({ length: 255 }),
    error: varchar({ length: 255 }),
    idUser: bigint("id_user", { mode: "number" }),
    data: json(),
    appleCreatedAt: datetime("apple_created_at", { mode: "string" }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    isProcess: tinyint("is_process").default(0),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "apple_app_transactions_id" }),
  ],
);

export const appleNotification = mysqlTable(
  "apple_notification",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    notificationType: varchar("notification_type", { length: 255 }),
    transactionInfo: text("transaction_info"),
    renewalInfo: text("renewal_info"),
    payload: mediumtext(),
    data: mediumtext(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    originalTransactionId: varchar("original_transaction_id", { length: 255 }),
    isProcess: tinyint("is_process").default(0),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "apple_notification_id" }),
  ],
);

export const authAssignment = mysqlTable(
  "auth_assignment",
  {
    itemName: varchar("item_name", { length: 64 })
      .notNull()
      .references(() => authItem.name, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: varchar("user_id", { length: 64 }).notNull(),
    createdAt: int("created_at"),
  },
  (table) => [
    index("idx-auth_assignment-user_id").on(table.userId),
    primaryKey({
      columns: [table.itemName, table.userId],
      name: "auth_assignment_item_name_user_id",
    }),
  ],
);

export const authItem = mysqlTable(
  "auth_item",
  {
    name: varchar({ length: 64 }).notNull(),
    type: smallint().notNull(),
    description: text(),
    ruleName: varchar("rule_name", { length: 64 }).references(
      () => authRule.name,
      { onDelete: "set null", onUpdate: "cascade" },
    ),
    // Warning: Can't parse blob from database
    // blobType: blob("data"),
    createdAt: int("created_at"),
    updatedAt: int("updated_at"),
  },
  (table) => [
    index("idx-auth_item-type").on(table.type),
    primaryKey({ columns: [table.name], name: "auth_item_name" }),
  ],
);

export const authItemChild = mysqlTable(
  "auth_item_child",
  {
    parent: varchar({ length: 64 })
      .notNull()
      .references(() => authItem.name, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    child: varchar({ length: 64 })
      .notNull()
      .references(() => authItem.name, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.parent, table.child],
      name: "auth_item_child_parent_child",
    }),
  ],
);

export const authRule = mysqlTable(
  "auth_rule",
  {
    name: varchar({ length: 64 }).notNull(),
    // Warning: Can't parse blob from database
    // blobType: blob("data"),
    createdAt: int("created_at"),
    updatedAt: int("updated_at"),
  },
  (table) => [primaryKey({ columns: [table.name], name: "auth_rule_name" })],
);

export const bookmarkedPosts = mysqlTable(
  "bookmarked_posts",
  {
    id: int().autoincrement().notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    postId: bigint("post_id", { mode: "number" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "bookmarked_posts_id" })],
);

export const bpSubscription = mysqlTable(
  "bp_subscription",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idSubscription: varchar("id_subscription", { length: 255 }).notNull(),
    idBill: varchar("id_bill", { length: 255 }).notNull(),
    status: tinyint().notNull(),
    email: varchar({ length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "bp_subscription_id" })],
);

export const bundle = mysqlTable(
  "bundle",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    title: varchar({ length: 255 }),
    type: tinyint(),
    payInterval: tinyint("pay_interval"),
    isActive: tinyint("is_active").default(0).notNull(),
    total: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "bundle_id" })],
);

export const bundleItem = mysqlTable(
  "bundle_item",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idBundle: bigint("id_bundle", { mode: "number" }).references(
      () => bundle.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idItem: bigint("id_item", { mode: "number" }).references(() => service.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    type: tinyint(),
    price: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    quantity: int(),
    customData: json("custom_data"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "bundle_item_id" })],
);

export const comment = mysqlTable(
  "comment",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).references(
      () => smsPool.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    message: text().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    idParent: bigint("id_parent", { mode: "number" }),
    isDeleted: tinyint("is_deleted").default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idParent],
      foreignColumns: [table.id],
      name: "fk-comment-id_parent",
    })
      .onUpdate("restrict")
      .onDelete("restrict"),
    primaryKey({ columns: [table.id], name: "comment_id" }),
  ],
);

export const contact = mysqlTable(
  "contact",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    subject: varchar({ length: 255 }),
    body: text().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    status: tinyint().default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "contact_id" })],
);

export const contractLine = mysqlTable(
  "contract_line",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    idService: bigint("id_service", { mode: "number" }).references(
      () => service.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idSpsContract: bigint("id_sps_contract", { mode: "number" }).references(
      () => spsContract.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    type: tinyint(),
    payInterval: tinyint("pay_interval"),
    quantity: int(),
    periodPrice: decimal("period_price", { precision: 10, scale: 2 }),
    customData: json("custom_data"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    terminatedAt: date("terminated_at", { mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    beginAt: date("begin_at", { mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    endAt: date("end_at", { mode: "string" }),
    isSpsLine: tinyint("is_sps_line").default(0).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    title: varchar({ length: 255 }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "contract_line_id" })],
);

export const contractLinePaid = mysqlTable(
  "contract_line_paid",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idContractLine: bigint("id_contract_line", { mode: "number" }).references(
      () => contractLine.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idInvoice: bigint("id_invoice", { mode: "number" }).references(
      () => invoice.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idInvoiceLine: bigint("id_invoice_line", { mode: "number" }).references(
      () => invoiceLine.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    total: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    beginAt: date("begin_at", { mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    endAt: date("end_at", { mode: "string" }),
    days: int(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "contract_line_paid_id" }),
  ],
);

export const conversation = mysqlTable(
  "conversation",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "conversation_id" })],
);

export const conversationFile = mysqlTable(
  "conversation_file",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idConversation: bigint("id_conversation", { mode: "number" }).references(
      () => conversation.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idConversationMessage: bigint("id_conversation_message", {
      mode: "number",
    }).references(() => conversationMessage.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    folderName: varchar("folder_name", { length: 255 }),
    webName: varchar("web_name", { length: 255 }),
    fileName: varchar("file_name", { length: 255 }),
    sizes: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "conversation_file_id" }),
  ],
);

export const conversationMessage = mysqlTable(
  "conversation_message",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idConversation: bigint("id_conversation", { mode: "number" }).references(
      () => conversation.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    message: text(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    receivedAt: datetime("received_at", { mode: "string" }),
    token: varchar({ length: 255 }),
    isSystem: tinyint("is_system").default(0).notNull(),
    metadata: json(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "conversation_message_id" }),
  ],
);

export const conversationUnviewed = mysqlTable(
  "conversation_unviewed",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }),
    idConversation: bigint("id_conversation", { mode: "number" }).references(
      () => conversation.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idConversationMessage: bigint("id_conversation_message", {
      mode: "number",
    }).references(() => conversationMessage.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "conversation_unviewed_id" }),
  ],
);

export const conversationUser = mysqlTable(
  "conversation_user",
  {
    idConversation: bigint("id_conversation", { mode: "number" })
      .notNull()
      .references(() => conversation.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.idConversation, table.idUser],
      name: "conversation_user_id_conversation_id_user",
    }),
  ],
);

export const creditCard = mysqlTable(
  "credit_card",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    num: varchar({ length: 255 }),
    cvv: varchar({ length: 255 }),
    type: varchar({ length: 63 }),
    expirationYear: int("expiration_year"),
    expirationMonth: tinyint("expiration_month"),
    isActive: tinyint("is_active").default(1).notNull(),
    isPreferred: tinyint("is_preferred").default(0).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    anetCustomerPaymentProfileId: varchar("anet_customer_payment_profile_id", {
      length: 255,
    }),
    anetProfileDeleted: tinyint("anet_profile_deleted").default(0).notNull(),
    phone: text(),
    zip: text(),
    isAgreeToReceive: tinyint("is_agree_to_receive").default(0).notNull(),
    billingAddress: json("billing_address"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "credit_card_id" })],
);

export const device = mysqlTable(
  "device",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    uuid: varchar({ length: 255 }).notNull(),
    os: varchar({ length: 255 }),
    pushToken: varchar("push_token", { length: 255 }),
    accessToken: varchar("access_token", { length: 255 }),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    pushTurnOn: tinyint("push_turn_on").default(0),
  },
  (table) => [primaryKey({ columns: [table.id], name: "device_id" })],
);

export const devicePlan = mysqlTable(
  "device_plan",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idDevice: bigint("id_device", { mode: "number" }).references(
      () => service.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idPlan: bigint("id_plan", { mode: "number" }).references(() => service.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    isDefault: tinyint("is_default").default(0).notNull(),
    price: decimal({ precision: 10, scale: 2 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "device_plan_id" })],
);

export const emailPool = mysqlTable(
  "email_pool",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    status: tinyint().default(0).notNull(),
    type: tinyint().default(0).notNull(),
    to: varchar({ length: 255 }),
    from: varchar({ length: 255 }),
    reply: varchar({ length: 255 }),
    bcc: varchar({ length: 255 }),
    subject: varchar({ length: 255 }),
    body: text(),
    bodyPlain: text(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    index("IDX_created_at").on(table.createdAt),
    primaryKey({ columns: [table.id], name: "email_pool_id" }),
  ],
);

export const emailPoolAttachment = mysqlTable(
  "email_pool_attachment",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idEmailPool: bigint("id_email_pool", { mode: "number" })
      .notNull()
      .references(() => emailPool.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // Warning: Can't parse mediumblob from database
    // mediumblobType: mediumblob("body").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "email_pool_attachment_id" }),
  ],
);

export const emailTemplate = mysqlTable(
  "email_template",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    from: varchar({ length: 255 }),
    subject: varchar({ length: 255 }).notNull(),
    body: text().notNull(),
    bodyPlain: text(),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "email_template_id" }),
    unique("name").on(table.name),
  ],
);

export const emergencyAlerts = mysqlTable(
  "emergency_alerts",
  {
    id: int().autoincrement().notNull(),
    uuid: varchar({ length: 36 }).notNull(),
    hazardName: varchar("hazard_name", { length: 255 }).notNull(),
    hazardId: varchar("hazard_id", { length: 255 }).notNull(),
    typeId: varchar("type_id", { length: 64 }).notNull(),
    description: text().notNull(),
    severityId: varchar("severity_id", { length: 64 }).notNull(),
    categoryId: varchar("category_id", { length: 64 }).notNull(),
    autoexpire: tinyint().notNull(),
    areabriefUrl: varchar("areabrief_url", { length: 255 }),
    roles: json().notNull(),
    active: tinyint().notNull(),
    latitude: decimal({ precision: 10, scale: 8 }).notNull(),
    longitude: decimal({ precision: 11, scale: 8 }).notNull(),
    // TODO: use point type when drizzle-orm supports it
    area: varchar("area", { length: 255 }).notNull(),
    // TODO: use point type when drizzle-orm supports it
    location: varchar("location", { length: 255 }).notNull(),
    areaWkt: mediumtext("area_wkt"),
    // Warning: Can't parse multipolygon from database
    // multipolygonType: multipolygon("area").notNull(),
    externalCreationDate: timestamp("external_creation_date", {
      mode: "string",
    }),
    startDate: timestamp("start_date", { mode: "string" }),
    endDate: timestamp("end_date", { mode: "string" }),
    lastUpdate: timestamp("last_update", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    index("spx_emergency_alerts_area").on(table.area),
    index("spx_emergency_alerts_location").on(table.location),
    primaryKey({ columns: [table.id], name: "emergency_alerts_id" }),
    unique("uuid").on(table.uuid),
  ],
);

export const emergencyProcess = mysqlTable(
  "emergency_process",
  {
    id: int().autoincrement().notNull(),
    uuid: varchar({ length: 36 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "emergency_process_id" }),
    unique("uuid").on(table.uuid),
  ],
);

export const emergencyTipsRequest = mysqlTable(
  "emergency_tips_request",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    firstName: varchar("first_name", { length: 50 }),
    email: varchar({ length: 100 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "emergency_tips_request_id" }),
    unique("UK_emergency_tips_request_email").on(table.email),
  ],
);

export const follower = mysqlTable(
  "follower",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idFollowerList: bigint("id_follower_list", { mode: "number" })
      .notNull()
      .references(() => followerList.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    idUserLeader: bigint("id_user_leader", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idUserFollower: bigint("id_user_follower", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    isActive: tinyint("is_active"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    inviteSettings: json("invite_settings"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "follower_id" })],
);

export const followerList = mysqlTable(
  "follower_list",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    token: varchar({ length: 255 }),
    description: varchar({ length: 255 }),
    image: varchar({ length: 63 }),
    isActive: tinyint("is_active").default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "follower_list_id" })],
);

export const iexWebhook = mysqlTable(
  "iex_webhook",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    iexId: varchar("iex_id", { length: 255 }),
    event: varchar({ length: 255 }),
    set: varchar({ length: 255 }),
    name: varchar({ length: 255 }),
    data: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "iex_webhook_id" })],
);

export const influencerAssistant = mysqlTable(
  "influencer_assistant",
  {
    idInfluencer: bigint("id_influencer", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idAssistant: bigint("id_assistant", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({
      columns: [table.idInfluencer, table.idAssistant],
      name: "influencer_assistant_id_influencer_id_assistant",
    }),
  ],
);

export const influencerPage = mysqlTable(
  "influencer_page",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSubscription: bigint("id_subscription", { mode: "number" })
      .notNull()
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    title: varchar({ length: 255 }).notNull(),
    alias: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    image: varchar({ length: 63 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    headerImage: varchar("header_image", { length: 255 }),
    socialLinks: json("social_links").$type<string[]>(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "influencer_page_id" }),
    unique("alias").on(table.alias),
  ],
);

export const infoState = mysqlTable(
  "info_state",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    key: varchar({ length: 255 }).notNull(),
    value: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "info_state_id" }),
    unique("key").on(table.key),
  ],
);

export const invite = mysqlTable(
  "invite",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idFollowerList: bigint("id_follower_list", { mode: "number" })
      .notNull()
      .references(() => followerList.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    email: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }),
    phoneNumber: varchar("phone_number", { length: 63 }),
    token: varchar({ length: 255 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "invite_id" })],
);

export const inviteAffiliate = mysqlTable(
  "invite_affiliate",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idInviter: bigint("id_inviter", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idInvited: bigint("id_invited", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idInviteInvoice: bigint("id_invite_invoice", { mode: "number" })
      .notNull()
      .references(() => invoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    idRewardInvoice: bigint("id_reward_invoice", { mode: "number" }).references(
      () => invoice.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "invite_affiliate_id" })],
);

export const invoice = mysqlTable(
  "invoice",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idBpSubscribe: bigint("id_bp_subscribe", { mode: "number" }).references(
      () => bpSubscription.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    paidStatus: tinyint("paid_status").default(0).notNull(),
    total: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    description: text(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "invoice_id" })],
);

export const invoiceLine: any = mysqlTable(
  "invoice_line",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idInvoice: bigint("id_invoice", { mode: "number" }).references(
      () => invoice.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    type: tinyint().default(0).notNull(),
    total: decimal({ precision: 10, scale: 2 }).default("0.00"),
    settings: json(),
    idService: bigint("id_service", { mode: "number" }),
    payInterval: tinyint("pay_interval"),
    quantity: int(),
    idContractLine: bigint("id_contract_line", { mode: "number" }).references(
      () => contractLine.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    beginAt: date("begin_at", { mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    endAt: date("end_at", { mode: "string" }),
    idBundle: bigint("id_bundle", { mode: "number" }).references(
      () => bundle.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
  },
  (table) => [primaryKey({ columns: [table.id], name: "invoice_line_id" })],
);

export const invoicePromocode = mysqlTable(
  "invoice_promocode",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idPromo: bigint("id_promo", { mode: "number" })
      .notNull()
      .references(() => promocode.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    idInvoice: bigint("id_invoice", { mode: "number" })
      .notNull()
      .references(() => invoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: datetime("created_at", { mode: "string" }).default(
      sql`(CURRENT_TIMESTAMP)`,
    ),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "invoice_promocode_id" }),
    unique("UK_invoice_promocode").on(table.idPromo, table.idInvoice),
  ],
);

export const invoiceService = mysqlTable(
  "invoice_service",
  {
    idInvoice: bigint("id_invoice", { mode: "number" })
      .notNull()
      .references(() => invoice.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    idService: bigint("id_service", { mode: "number" })
      .notNull()
      .references(() => service.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    index("IDX_invoice_service").on(table.idInvoice, table.idService),
  ],
);

export const logAuthorize = mysqlTable(
  "log_authorize",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idMoneyTransaction: bigint("id_money_transaction", {
      mode: "number",
    }).references(() => moneyTransaction.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    name: varchar({ length: 255 }),
    request: json(),
    response: json(),
    status: tinyint().default(0),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "log_authorize_id" })],
);

export const logger = mysqlTable(
  "logger",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    employeeLogin: varchar("employee_login", { length: 100 }),
    employeeFirstName: varchar("employee_first_name", { length: 50 }),
    employeeLastName: varchar("employee_last_name", { length: 50 }),
    accessLevel: tinyint("access_level"),
    createdAt: timestamp("created_at", { mode: "string" }),
    category: varchar({ length: 50 }),
    errorType: varchar("error_type", { length: 20 }),
    source: text(),
    content: text(),
    module: varchar({ length: 100 }),
    controller: varchar({ length: 50 }),
    action: varchar({ length: 50 }),
    ip: varchar({ length: 39 }),
    primaryJson: json("primary_json"),
    userAgent: varchar("user_agent", { length: 255 }),
    changedFields: json("changed_fields"),
  },
  (table) => [
    index("IDX_logger_access_level").on(table.accessLevel),
    index("IDX_logger_action").on(table.action),
    index("IDX_logger_category").on(table.category),
    index("IDX_logger_controller").on(table.controller),
    index("IDX_logger_created_at").on(table.createdAt),
    index("IDX_logger_employee_first_name").on(table.employeeFirstName),
    index("IDX_logger_employee_login").on(table.employeeLogin),
    index("IDX_logger_error_type").on(table.errorType, table.createdAt),
    index("IDX_logger_ip").on(table.ip),
    index("IDX_logger_module").on(table.module),
    primaryKey({ columns: [table.id], name: "logger_id" }),
  ],
);

export const loginStatistic = mysqlTable(
  "login_statistic",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idDevice: bigint("id_device", { mode: "number" }),
    type: tinyint().notNull(),
    ip: varchar({ length: 255 }),
    userAgent: text("user_agent"),
    data: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "login_statistic_id" })],
);

export const marketstackIndx = mysqlTable(
  "marketstack_indx",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 64 }).notNull(),
    symbol: varchar({ length: 16 }).notNull(),
    country: varchar({ length: 16 }),
    currency: varchar({ length: 4 }),
    hasIntraday: tinyint("has_intraday"),
    hasEod: tinyint("has_eod"),
    isActive: tinyint("is_active").default(1),
    full: json(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "marketstack_indx_id" })],
);

export const memberRequest = mysqlTable(
  "member_request",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idUserFrom: bigint("id_user_from", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    type: tinyint(),
    text: text(),
    params: json(),
    isActive: tinyint("is_active").default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "member_request_id" })],
);

export const memberTemplate = mysqlTable(
  "member_template",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idAdmin: bigint("id_admin", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 255 }),
    idPlan: bigint("id_plan", { mode: "number" }).references(
      () => userPlan.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    email: varchar({ length: 50 }),
    memberKey: varchar("member_key", { length: 255 }),
    expiredAt: datetime("expired_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "member_template_id" })],
);

export const migration = mysqlTable(
  "migration",
  {
    version: varchar({ length: 180 }).notNull(),
    applyTime: int("apply_time"),
  },
  (table) => [
    primaryKey({ columns: [table.version], name: "migration_version" }),
  ],
);

export const moneyTransaction = mysqlTable(
  "money_transaction",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idInvoice: bigint("id_invoice", { mode: "number" }).references(
      () => invoice.id,
    ),
    idCreditCard: bigint("id_credit_card", { mode: "number" }).references(
      () => creditCard.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    transactionType: tinyint("transaction_type").notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    isSuccess: tinyint("is_success").default(0),
    total: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    isVoid: tinyint("is_void").default(0).notNull(),
    idRefund: bigint("id_refund", { mode: "number" }),
    isTest: tinyint("is_test").default(0).notNull(),
    error: varchar({ length: 255 }),
    note: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.idRefund],
      foreignColumns: [table.id],
      name: "fk-money_transaction-id_refund",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({ columns: [table.id], name: "money_transaction_id" }),
  ],
);

export const mutedSubscriptions = mysqlTable(
  "muted_subscriptions",
  {
    id: int().autoincrement().notNull(),
    idSubscription: bigint("id_subscription", { mode: "number" }).notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "muted_subscriptions_id" }),
  ],
);

export const news = mysqlTable(
  "news",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    image: varchar({ length: 255 }),
    status: tinyint().default(0).notNull(),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "news_id" }),
    unique("name").on(table.name),
    unique("slug").on(table.slug),
  ],
);

export const newsContent = mysqlTable(
  "news_content",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idNews: bigint("id_news", { mode: "number" }).references(() => news.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    status: tinyint().default(0).notNull(),
    params: json(),
    content: longtext(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "news_content_id" })],
);

export const page = mysqlTable(
  "page",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    status: tinyint().default(0).notNull(),
    params: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "page_id" }),
    unique("name").on(table.name),
    unique("slug").on(table.slug),
  ],
);

export const pageContent = mysqlTable(
  "page_content",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idPage: bigint("id_page", { mode: "number" }).references(() => page.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    status: tinyint().default(0).notNull(),
    params: json(),
    content: longtext(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "page_content_id" })],
);

export const phoneNumber = mysqlTable(
  "phone_number",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idProvider: bigint("id_provider", { mode: "number" }).references(
      () => provider.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    type: tinyint().default(1),
    isSatellite: tinyint("is_satellite").default(0),
    number: varchar({ length: 255 }).notNull(),
    isActive: tinyint("is_active"),
    isPrimary: tinyint("is_primary").default(0).notNull(),
    isSend: tinyint("is_send").default(0).notNull(),
    isEmergencyOnly: tinyint("is_emergency_only").default(0).notNull(),
    isValid: tinyint("is_valid").default(0).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    twilioType: varchar("twilio_type", { length: 63 }),
    twilioTypeRaw: json("twilio_type_raw"),
    numverifyType: varchar("numverify_type", { length: 63 }),
    numverifyRaw: json("numverify_raw"),
    bivyStatus: json("bivy_status"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "phone_number_id" })],
);

export const podcast = mysqlTable(
  "podcast",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    type: tinyint().notNull(),
    title: varchar({ length: 255 }),
    url: text(),
    image: varchar({ length: 255 }),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "podcast_id" })],
);

export const productPhoto = mysqlTable(
  "product_photo",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idService: bigint("id_service", { mode: "number" }).references(
      () => service.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    folderName: varchar("folder_name", { length: 255 }),
    sizes: json(),
    isMain: tinyint("is_main").default(0),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "product_photo_id" })],
);

export const promocode = mysqlTable(
  "promocode",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    type: tinyint().notNull(),
    text: varchar({ length: 25 }).notNull(),
    discount: int().notNull(),
    isActive: tinyint("is_active").default(1).notNull(),
    activeFrom: datetime("active_from", { mode: "string" }).notNull(),
    activeTo: datetime("active_to", { mode: "string" }).notNull(),
    trialPeriod: int("trial_period"),
    showOnFrontend: tinyint("show_on_frontend").default(0).notNull(),
    description: text(),
    idInfluencer: bigint("id_influencer", { mode: "number" }),
    serviceId: bigint("service_id", { mode: "number" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "promocode_id" }),
    unique("UK_promocode_text").on(table.text),
  ],
);

export const promocodeInfluencer = mysqlTable(
  "promocode_influencer",
  {
    idPromocode: bigint("id_promocode", { mode: "number" })
      .notNull()
      .references(() => promocode.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.idPromocode],
      name: "promocode_influencer_id_promocode",
    }),
  ],
);

export const provider = mysqlTable(
  "provider",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }),
    isSatellite: tinyint("is_satellite"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    country: varchar({ length: 3 }).default("US"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "provider_id" })],
);

export const providerTwilioCarrier = mysqlTable("provider_twilio_carrier", {
  idProvider: bigint("id_provider", { mode: "number" })
    .notNull()
    .references(() => provider.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  idTwilioCarrier: bigint("id_twilio_carrier", { mode: "number" })
    .notNull()
    .references(() => twilioCarrier.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const reaction = mysqlTable(
  "reaction",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    emoji: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "reaction_id" }),
    unique("emoji").on(table.emoji),
  ],
);

export const recentSearch = mysqlTable(
  "recent_search",
  {
    id: int().autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    phrase: varchar({ length: 25 }),
    idSearchUser: bigint("id_search_user", { mode: "number" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "recent_search_id" })],
);

export const register = mysqlTable(
  "register",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    email: varchar({ length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    isUnfinishedSignup: tinyint("is_unfinished_signup").default(0),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    selectedPlan: int("selected_plan"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "register_id" })],
);

export const reportArchive = mysqlTable(
  "report_archive",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    reportId: varchar("report_id", { length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    data: mediumtext().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    sort: varchar({ length: 32 }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "report_archive_id" })],
);

export const reportReferral = mysqlTable(
  "report_referral",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    period: varchar({ length: 14 }),
    influencerPercent: int("influencer_percent").default(0).notNull(),
    data: json(),
    createdAt: datetime("created_at", { mode: "string" })
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "report_referral_id" }),
    unique("UK_report_referral_month").on(table.period),
  ],
);

export const reportedPosts = mysqlTable(
  "reported_posts",
  {
    id: int().autoincrement().notNull(),
    idNews: int("id_news").notNull(),
    reason: varchar({ length: 255 }).notNull(),
    additionalText: varchar("additional_text", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "reported_posts_id" })],
);

export const scrapedArticles = mysqlTable(
  "scraped_articles",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    hash: varchar({ length: 255 }).notNull(),
    url: varchar({ length: 255 }).notNull(),
    headline: varchar({ length: 255 }).notNull(),
    articleBody: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "scraped_articles_id" })],
);

export const service = mysqlTable(
  "service",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    type: tinyint().default(0).notNull(),
    name: varchar({ length: 255 }),
    description: text(),
    price: float(),
    bonusPoint: int("bonus_point").default(0).notNull(),
    settings: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    isActive: tinyint("is_active").default(0),
    compensation: json(),
    fee: decimal({ precision: 10, scale: 2 }),
    feeAnnual: decimal("fee_annual", { precision: 10, scale: 2 }),
    terminationFee: decimal("termination_fee", { precision: 10, scale: 2 }),
    terminationPeriod: int("termination_period"),
    specialPrice: decimal("special_price", { precision: 10, scale: 2 }),
    isSpecialPrice: tinyint("is_special_price").default(0).notNull(),
    specialFee: decimal("special_fee", { precision: 10, scale: 2 }),
    isSpecialFee: tinyint("is_special_fee").default(0).notNull(),
    specialFeeAnnual: decimal("special_fee_annual", {
      precision: 10,
      scale: 2,
    }),
    isSpecialFeeAnnual: tinyint("is_special_fee_annual").default(0).notNull(),
    specialDatetime: datetime("special_datetime", { mode: "string" }),
    isNewPlan: tinyint("is_new_plan").default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "service_id" })],
);

export const serviceCustom = mysqlTable(
  "service_custom",
  {
    id: int().autoincrement().notNull(),
    phonePrice: float("phone_price").notNull(),
    feedPrice: float("feed_price").notNull(),
    phoneMin: int("phone_min").notNull(),
    phoneMax: int("phone_max").notNull(),
    feedMin: int("feed_min").notNull(),
    feedMax: int("feed_max").notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "service_custom_id" })],
);

export const session = mysqlTable(
  "session",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    token: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: bigint({ mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "session_id" }),
    unique("token").on(table.token),
  ],
);

export const settings = mysqlTable(
  "settings",
  {
    name: varchar({ length: 32 }).notNull(),
    prod: varchar({ length: 255 }).notNull(),
    dev: varchar({ length: 255 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.name], name: "settings_name" })],
);

export const settingsSafe = mysqlTable(
  "settings_safe",
  {
    name: varchar({ length: 35 }).notNull(),
    value: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.name], name: "settings_safe_name" }),
    unique("name").on(table.name),
  ],
);

export const smsPool = mysqlTable(
  "sms_pool",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idStaff: bigint("id_staff", { mode: "number" }).references(() => staff.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idSubscription: bigint("id_subscription", { mode: "number" }),
    idFollowerList: bigint("id_follower_list", { mode: "number" }),
    purpose: tinyint(),
    status: tinyint().default(1).notNull(),
    body: text().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    smsProvider: varchar("sms_provider", { length: 63 }),
    idAssistant: bigint("id_assistant", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    shortBody: varchar("short_body", { length: 160 }),
    url: varchar({ length: 512 }),
    isBan: tinyint("is_ban").default(0).notNull(),
    morphClass: varchar("morph_class", { length: 255 }),
    morphId: bigint("morph_id", { mode: "number" }),
    metaData: json("meta_data"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "sms_pool_id" })],
);

export const smsPoolPhoneNumber = mysqlTable(
  "sms_pool_phone_number",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).references(
      () => smsPool.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idPhoneNumber: bigint("id_phone_number", { mode: "number" }).references(
      () => phoneNumber.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    number: varchar({ length: 255 }),
    isSatellite: tinyint("is_satellite").default(0),
    status: tinyint().default(1).notNull(),
    sid: varchar({ length: 64 }),
    error: text(),
    idProvider: bigint("id_provider", { mode: "number" }).references(
      () => provider.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    type: tinyint(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sms_pool_phone_number_id" }),
  ],
);

export const smsPoolPhoto = mysqlTable(
  "sms_pool_photo",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).references(
      () => smsPool.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idSmsShedule: bigint("id_sms_shedule", { mode: "number" }).references(
      () => smsShedule.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    folderName: varchar("folder_name", { length: 255 }),
    webName: varchar("web_name", { length: 255 }),
    sizes: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    uuid: varchar({ length: 36 }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "sms_pool_photo_id" })],
);

export const smsPoolReaction = mysqlTable(
  "sms_pool_reaction",
  {
    idSmsPool: bigint("id_sms_pool", { mode: "number" })
      .notNull()
      .references(() => smsPool.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    idReaction: bigint("id_reaction", { mode: "number" }).references(
      () => reaction.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.idSmsPool, table.idUser],
      name: "sms_pool_reaction_id_sms_pool_id_user",
    }),
  ],
);

export const smsPoolReport = mysqlTable(
  "sms_pool_report",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    influencerMin: int("influencer_min"),
    influencerMax: int("influencer_max"),
    influencerAvg: decimal("influencer_avg", { precision: 10, scale: 2 }),
    influencerMedian: decimal("influencer_median", { precision: 10, scale: 2 }),
    influencerTotal: int("influencer_total"),
    influencerUsers: int("influencer_users"),
    apiMin: int("api_min"),
    apiMax: int("api_max"),
    apiAvg: decimal("api_avg", { precision: 10, scale: 2 }),
    apiMedian: decimal("api_median", { precision: 10, scale: 2 }),
    apiTotal: int("api_total"),
    apiUsers: int("api_users"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    day: date({ mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "sms_pool_report_id" })],
);

export const smsShedule = mysqlTable(
  "sms_shedule",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idStaff: bigint("id_staff", { mode: "number" }).references(() => staff.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idSubscription: bigint("id_subscription", { mode: "number" }).references(
      () => subscription.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idFollowerList: bigint("id_follower_list", { mode: "number" }).references(
      () => followerList.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).references(
      () => smsPool.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    purpose: tinyint(),
    status: tinyint().default(0),
    body: text().notNull(),
    sendedAt: datetime("sended_at", { mode: "string" }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    idAssistant: bigint("id_assistant", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    shortBody: varchar("short_body", { length: 160 }),
    url: varchar({ length: 512 }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "sms_shedule_id" })],
);

export const spsAddUserRequest = mysqlTable(
  "sps_add_user_request",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
    token: varchar({ length: 255 }),
    postData: json("post_data"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sps_add_user_request_id" }),
  ],
);

export const spsContract = mysqlTable(
  "sps_contract",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idContract: bigint("id_contract", { mode: "number" }).notNull(),
    idPlan: bigint("id_plan", { mode: "number" }).references(
      () => userPlan.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idService: bigint("id_service", { mode: "number" })
      .notNull()
      .references(() => service.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    alert: int().notNull(),
    maxPhoneCnt: int("max_phone_cnt").notNull(),
    payInterval: int("pay_interval").notNull(),
    beginAt: datetime("begin_at", { mode: "string" }).notNull(),
    endedAt: datetime("ended_at", { mode: "string" }).notNull(),
    terminatedAt: datetime("terminated_at", { mode: "string" }),
    isSecondary: tinyint("is_secondary").default(0),
    userPlanData: json("user_plan_data"),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sps_contract_id" }),
    unique("id_contract").on(table.idContract),
  ],
);

export const staff = mysqlTable(
  "staff",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    username: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    authKey: varchar("auth_key", { length: 32 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    role: tinyint().default(1).notNull(),
    status: tinyint().default(1).notNull(),
    isSuperlogin: tinyint("is_superlogin"),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "staff_id" }),
    unique("email").on(table.email),
    unique("password_reset_token").on(table.passwordResetToken),
    unique("username").on(table.username),
  ],
);

export const subscription = mysqlTable(
  "subscription",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSubscriptionCategory: bigint("id_subscription_category", {
      mode: "number",
    })
      .notNull()
      .references(() => subscriptionCategory.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    name: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }),
    positionNo: tinyint("position_no"),
    description: varchar({ length: 255 }),
    rule: varchar({ length: 100 }),
    alertType: tinyint("alert_type").default(1),
    isActive: tinyint("is_active").default(0),
    isHidden: tinyint("is_hidden").default(0).notNull(),
    percent: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    sendedAt: datetime("sended_at", { mode: "string" }),
    params: json(),
    isCustom: tinyint("is_custom").default(0),
    idInfluencer: bigint("id_influencer", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    price: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    bonusPoint: int("bonus_point").default(0).notNull(),
    token: varchar({ length: 255 }),
    ipfsId: varchar("ipfs_id", { length: 255 }),
    isPublic: tinyint("is_public").default(0).notNull(),
    isFake: tinyint("is_fake").default(0).notNull(),
    type: tinyint().default(0),
    showReactions: tinyint("show_reactions").default(0).notNull(),
    showComments: tinyint("show_comments").default(0).notNull(),
    idUser: bigint("id_user", { mode: "number" }),
    isZipRequired: tinyint("is_zip_required").default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "subscription_id" })],
);

export const subscriptionCategory = mysqlTable(
  "subscription_category",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    idParent: bigint("id_parent", { mode: "number" }),
    positionNo: bigint("position_no", { mode: "number" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "subscription_category_id" }),
  ],
);

export const subscriptionWizard = mysqlTable(
  "subscription_wizard",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    settings: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "subscription_wizard_id" }),
  ],
);

export const twilioCarrier = mysqlTable(
  "twilio_carrier",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "twilio_carrier_id" }),
    unique("name").on(table.name),
  ],
);

export const twilioIncoming = mysqlTable(
  "twilio_incoming",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    number: varchar({ length: 255 }),
    body: text(),
    message: json(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    type: tinyint(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "twilio_incoming_id" })],
);

export const user = mysqlTable(
  "user",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }),
    email: varchar({ length: 255 }),
    authKey: varchar("auth_key", { length: 32 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    passwordResetToken: varchar("password_reset_token", { length: 255 }),
    role: tinyint().default(1).notNull(),
    status: tinyint().default(1).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
    phoneProfile: varchar("phone_profile", { length: 63 }),
    country: varchar({ length: 3 }),
    state: varchar({ length: 3 }),
    isInfluencer: tinyint("is_influencer").default(0),
    zip: varchar({ length: 10 }),
    anetCustomerProfileId: varchar("anet_customer_profile_id", { length: 255 }),
    anetCustomerShippingAddressId: varchar(
      "anet_customer_shipping_address_id",
      { length: 255 },
    ),
    bonusPoint: int("bonus_point").default(0).notNull(),
    image: varchar({ length: 63 }),
    timezone: varchar({ length: 63 }),
    verificationToken: varchar("verification_token", { length: 255 }),
    isValidEmail: tinyint("is_valid_email").default(0).notNull(),
    referCustom: text("refer_custom"),
    payAt: datetime("pay_at", { mode: "string" }),
    referType: bigint("refer_type", { mode: "number" }),
    nameAsReferral: varchar("name_as_referral", { length: 255 }),
    affiliateToken: text("affiliate_token"),
    isReceiveSubscribe: tinyint("is_receive_subscribe").default(1).notNull(),
    isReceiveList: tinyint("is_receive_list").default(1).notNull(),
    payDay: tinyint("pay_day"),
    isTest: tinyint("is_test").default(0).notNull(),
    adminToken: varchar("admin_token", { length: 255 }),
    isAssistant: tinyint("is_assistant").default(0).notNull(),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    cancelAt: date("cancel_at", { mode: "string" }),
    tour: tinyint(),
    idSps: bigint("id_sps", { mode: "number" }),
    spsData: json("sps_data"),
    isSpsActive: tinyint("is_sps_active").default(0),
    spsTerminatedAt: datetime("sps_terminated_at", { mode: "string" }),
    generalVisibility: tinyint("general_visibility").default(0),
    phoneVisibility: tinyint("phone_visibility").default(1),
    addressVisibility: tinyint("address_visibility").default(0),
    lastPrice: decimal("last_price", { precision: 10, scale: 2 }),
    credit: float(),
    isBadEmail: tinyint("is_bad_email"),
    promocode: varchar({ length: 25 }),
    testMessageQnt: tinyint("test_message_qnt").default(0),
    testMessageAt: datetime("test_message_at", { mode: "string" }),
    city: varchar({ length: 255 }),
    idInviter: bigint("id_inviter", { mode: "number" }),
    source: tinyint(),
    about: text(),
    headerImage: varchar("header_image", { length: 63 }),
    nameSearch: varchar("name_search", { length: 255 }),
  },
  (table) => [
    foreignKey({
      columns: [table.idInviter],
      foreignColumns: [table.id],
      name: "fk-user-id_inviter",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    primaryKey({ columns: [table.id], name: "user_id" }),
    unique("password_reset_token").on(table.passwordResetToken),
  ],
);

export const userAbilities = mysqlTable(
  "user_abilities",
  {
    id: int().autoincrement().notNull(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    action: varchar({ length: 255 }).notNull(),
    subject: varchar({ length: 255 }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "user_abilities_id" })],
);

export const userFollowerAlert = mysqlTable(
  "user_follower_alert",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    total: int().default(0),
    used: int().default(0),
    beginAt: datetime("begin_at", { mode: "string" }).notNull(),
    endAt: datetime("end_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_follower_alert_id" }),
  ],
);

export const userFriend = mysqlTable(
  "user_friend",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idFriend: bigint("id_friend", { mode: "number" }).references(
      () => user.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_friend_id" }),
    unique("UK_user_friend").on(table.idUser, table.idFriend),
  ],
);

export const userPlan = mysqlTable(
  "user_plan",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    idService: bigint("id_service", { mode: "number" }).references(
      () => service.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    idInvoiceLine: bigint("id_invoice_line", { mode: "number" }).references(
      () => invoiceLine.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    isPrimary: tinyint("is_primary").default(1).notNull(),
    alert: int().default(0),
    maxPhoneCnt: int("max_phone_cnt"),
    payInterval: tinyint("pay_interval"),
    priceBeforeProrate: decimal("price_before_prorate", {
      precision: 10,
      scale: 2,
    }),
    priceAfterProrate: decimal("price_after_prorate", {
      precision: 10,
      scale: 2,
    }),
    settings: json(),
    beginAt: datetime("begin_at", { mode: "string" }).notNull(),
    endAt: datetime("end_at", { mode: "string" }),
    devices: tinyint().default(0).notNull(),
    isNewCustom: tinyint("is_new_custom").default(0).notNull(),
    isNotReceiveMessage: tinyint("is_not_receive_message").default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "user_plan_id" })],
);

export const userPlanShedule = mysqlTable(
  "user_plan_shedule",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
      onDelete: "cascade",
    }),
    idService: bigint("id_service", { mode: "number" }).references(
      () => service.id,
    ),
    settings: json(),
    beginAt: datetime("begin_at", { mode: "string" }),
    endAt: datetime("end_at", { mode: "string" }),
    isComplete: tinyint("is_complete").default(0).notNull(),
    isNewCustom: tinyint("is_new_custom").default(0).notNull(),
    idContractLine: bigint("id_contract_line", { mode: "number" }).references(
      () => contractLine.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_plan_shedule_id" }),
  ],
);

export const userPointHistory = mysqlTable(
  "user_point_history",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    idUserPointSettings: bigint("id_user_point_settings", { mode: "number" })
      .notNull()
      .references(() => userPointSettings.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).references(
      () => smsPool.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    idComment: bigint("id_comment", { mode: "number" }).references(
      () => comment.id,
      { onDelete: "restrict", onUpdate: "restrict" },
    ),
    quantity: int().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_point_history_id" }),
  ],
);

export const userPointSettings = mysqlTable(
  "user_point_settings",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    title: varchar({ length: 255 }),
    price: int().notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_point_settings_id" }),
  ],
);

export const userSatelliteSubscription = mysqlTable(
  "user_satellite_subscription",
  {
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idSubscription: bigint("id_subscription", { mode: "number" })
      .notNull()
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
);

export const userService = mysqlTable("user_service", {
  idUser: bigint("id_user", { mode: "number" }).references(() => user.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  idService: bigint("id_service", { mode: "number" }).references(
    () => service.id,
    { onDelete: "cascade", onUpdate: "cascade" },
  ),
});

export const userSubscription = mysqlTable("user_subscription", {
  idUser: bigint("id_user", { mode: "number" })
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  idSubscription: bigint("id_subscription", { mode: "number" })
    .notNull()
    .references(() => subscription.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export const userSubscriptionAddress = mysqlTable(
  "user_subscription_address",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" })
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    idSubscription: bigint("id_subscription", { mode: "number" })
      .notNull()
      .references(() => subscription.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    zip: varchar({ length: 10 }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_subscription_address_id" }),
  ],
);

export const verification = mysqlTable(
  "verification",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    createdAt: timestamp({ mode: "string" }),
    updatedAt: timestamp({ mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "verification_id" })],
);

export const video = mysqlTable(
  "video",
  {
    id: int().autoincrement().notNull(),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    idSubscription: bigint("id_subscription", { mode: "number" }),
    caption: text(),
    s3Key: varchar("s3_key", { length: 512 }),
    s3Url: varchar("s3_url", { length: 1024 }),
    s3Status: varchar("s3_status", { length: 50 }).default("pending"),
    muxAssetId: varchar("mux_asset_id", { length: 255 }),
    muxUploadId: varchar("mux_upload_id", { length: 255 }),
    playbackId: varchar("playback_id", { length: 255 }),
    transcodingStatus: varchar("transcoding_status", { length: 50 }).default(
      "pending",
    ),
    duration: int(),
    aspectRatio: varchar("aspect_ratio", { length: 20 }),
    thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
    width: int(),
    height: int(),
    fileSize: bigint("file_size", { mode: "number" }),
    likeCount: int("like_count").default(0),
    commentCount: int("comment_count").default(0),
    viewCount: int("view_count").default(0),
    shareCount: int("share_count").default(0),
    allowSharing: tinyint("allow_sharing").default(1),
    allowDuet: tinyint("allow_duet").default(1), // allow duets
    allowStitch: tinyint("allow_stitch").default(1), // allow stitches
    publishStatus: varchar("publish_status", { length: 20 }).default(
      "published",
    ), // draft, scheduled, published
    scheduledAt: timestamp("scheduled_at", { mode: "string" }), // for scheduled posts
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "video_id" })],
);

export const videoLike = mysqlTable(
  "video_like",
  {
    id: int().autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "video_like_id" })],
);

export const videoView = mysqlTable(
  "video_view",
  {
    id: int().autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    watchDuration: int("watch_duration").default(0),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "video_view_id" })],
);

// Video share/repost table
export const videoShare = mysqlTable(
  "video_share",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(), // who shared
    idOriginalUser: bigint("id_original_user", { mode: "number" }).notNull(), // original creator
    caption: varchar({ length: 500 }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_share_id" }),
    index("idx_video_share_user").on(table.idUser),
    index("idx_video_share_video").on(table.idVideo),
    unique("uniq_user_video").on(table.idUser, table.idVideo),
  ],
);

// Video comments with nested reply support
export const videoComment = mysqlTable(
  "video_comment",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    idParent: bigint("id_parent", { mode: "number" }), // null for top-level comments
    content: text().notNull(),
    likeCount: int("like_count").default(0),
    replyCount: int("reply_count").default(0),
    isPinned: tinyint("is_pinned").default(0), // creator can pin comments
    isHearted: tinyint("is_hearted").default(0), // creator heart/like
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_comment_id" }),
    index("idx_video_comment_video").on(table.idVideo),
    index("idx_video_comment_user").on(table.idUser),
    index("idx_video_comment_parent").on(table.idParent),
    index("idx_video_comment_created").on(table.createdAt),
  ],
);

// Video comment likes
export const videoCommentLike = mysqlTable(
  "video_comment_like",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idComment: bigint("id_comment", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_comment_like_id" }),
    index("idx_video_comment_like_comment").on(table.idComment),
    index("idx_video_comment_like_user").on(table.idUser),
    unique("uniq_comment_user").on(table.idComment, table.idUser),
  ],
);

// Hashtags for videos
export const hashtag = mysqlTable(
  "hashtag",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 100 }).notNull(), // hashtag without #
    videoCount: int("video_count").default(0),
    viewCount: bigint("view_count", { mode: "number" }).default(0),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "hashtag_id" }),
    unique("uniq_hashtag_name").on(table.name),
    index("idx_hashtag_video_count").on(table.videoCount),
  ],
);

// Video-Hashtag relationship (many-to-many)
export const videoHashtag = mysqlTable(
  "video_hashtag",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idHashtag: bigint("id_hashtag", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_hashtag_id" }),
    index("idx_video_hashtag_video").on(table.idVideo),
    index("idx_video_hashtag_hashtag").on(table.idHashtag),
    unique("uniq_video_hashtag").on(table.idVideo, table.idHashtag),
  ],
);

// Post view tracking for text posts (smsPool)
export const postView = mysqlTable(
  "post_view",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSmsPool: bigint("id_sms_pool", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "post_view_id" }),
    index("idx_post_view_sms_pool").on(table.idSmsPool),
    index("idx_post_view_created").on(table.createdAt),
  ],
);

// Video collections for organizing saved videos
export const videoCollection = mysqlTable(
  "video_collection",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 255 }),
    isPublic: tinyint("is_public").default(0), // 0 = private, 1 = public
    isDefault: tinyint("is_default").default(0), // 1 = default "Saved" collection
    videoCount: int("video_count").default(0),
    coverUrl: varchar("cover_url", { length: 512 }), // thumbnail from first video
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_collection_id" }),
    index("idx_video_collection_user").on(table.idUser),
  ],
);

// Video saves/bookmarks (links videos to collections)
export const videoSave = mysqlTable(
  "video_save",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    idCollection: bigint("id_collection", { mode: "number" }), // null = default saved
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_save_id" }),
    index("idx_video_save_user").on(table.idUser),
    index("idx_video_save_video").on(table.idVideo),
    index("idx_video_save_collection").on(table.idCollection),
    unique("uniq_video_user_collection").on(
      table.idVideo,
      table.idUser,
      table.idCollection,
    ),
  ],
);

// Sounds/audio for videos
export const sound = mysqlTable(
  "sound",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    artistName: varchar("artist_name", { length: 255 }),
    originalVideoId: bigint("original_video_id", { mode: "number" }), // first video to use this sound
    idUser: bigint("id_user", { mode: "number" }).notNull(), // creator of original sound
    audioUrl: varchar("audio_url", { length: 512 }).notNull(),
    coverUrl: varchar("cover_url", { length: 512 }), // album art or video thumbnail
    duration: int(), // in seconds
    usageCount: int("usage_count").default(0), // how many videos use this sound
    isOriginal: tinyint("is_original").default(1), // 1 = original sound, 0 = licensed/uploaded
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sound_id" }),
    index("idx_sound_user").on(table.idUser),
    index("idx_sound_usage").on(table.usageCount),
    index("idx_sound_name").on(table.name),
  ],
);

// Link between videos and sounds
export const videoSound = mysqlTable(
  "video_sound",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idSound: bigint("id_sound", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_sound_id" }),
    index("idx_video_sound_video").on(table.idVideo),
    index("idx_video_sound_sound").on(table.idSound),
    unique("uniq_video_sound").on(table.idVideo, table.idSound),
  ],
);

// User's saved/favorite sounds
export const soundFavorite = mysqlTable(
  "sound_favorite",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idSound: bigint("id_sound", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "sound_favorite_id" }),
    index("idx_sound_favorite_user").on(table.idUser),
    index("idx_sound_favorite_sound").on(table.idSound),
    unique("uniq_sound_user").on(table.idSound, table.idUser),
  ],
);

// Video reactions (6-type system replacing simple likes)
export const videoReaction = mysqlTable(
  "video_reaction",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(),
    idUser: bigint("id_user", { mode: "number" }).notNull(),
    idReaction: tinyint("id_reaction").notNull(), // 1=like, 2=dislike, 3=laugh, 4=love, 5=fire, 6=disgust
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_reaction_id" }),
    unique("UK_video_reaction_video_user").on(table.idVideo, table.idUser),
    index("IDX_video_reaction_video").on(table.idVideo),
    index("IDX_video_reaction_user").on(table.idUser),
  ],
);

// Duet and Stitch relationships between videos
export const videoDuetStitch = mysqlTable(
  "video_duet_stitch",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    idVideo: bigint("id_video", { mode: "number" }).notNull(), // the new video (duet/stitch)
    idOriginalVideo: bigint("id_original_video", { mode: "number" }).notNull(), // original video being reacted to
    type: varchar({ length: 10 }).notNull(), // 'duet' or 'stitch'
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "video_duet_stitch_id" }),
    index("idx_duet_stitch_video").on(table.idVideo),
    index("idx_duet_stitch_original").on(table.idOriginalVideo),
    unique("uniq_duet_stitch_video").on(table.idVideo), // one video can only be one duet/stitch
  ],
);

export const weatherGovProcess = mysqlTable(
  "weather_gov_process",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    apiId: varchar("api_id", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "weather_gov_process_id" }),
  ],
);

export const zipUs = mysqlTable(
  "zip_us",
  {
    id: bigint({ mode: "number" }).autoincrement().notNull(),
    zip: varchar({ length: 8 }).notNull(),
    // TODO: use point type when drizzle-orm supports it
    geopoint: varchar("geopoint", { length: 255 }).notNull(),
    city: varchar({ length: 32 }),
    state: varchar({ length: 2 }),
    timezone: varchar({ length: 3 }),
    daylightSavingsTimeFlag: varchar("daylight_savings_time_flag", {
      length: 1,
    }),
  },
  (table) => [
    index("geopoint").on(table.geopoint),
    primaryKey({ columns: [table.id], name: "zip_us_id" }),
  ],
);

export * from "./auth-schema";
