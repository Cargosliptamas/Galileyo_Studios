/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { relations } from "drizzle-orm/relations";

import {
  address,
  adminMember,
  affiliate,
  affiliateInvite,
  authAssignment,
  authItem,
  authItemChild,
  authRule,
  bpSubscription,
  bundle,
  bundleItem,
  comment,
  contact,
  contractLine,
  contractLinePaid,
  conversation,
  conversationFile,
  conversationMessage,
  conversationUnviewed,
  conversationUser,
  creditCard,
  device,
  devicePlan,
  emailPool,
  emailPoolAttachment,
  follower,
  followerList,
  influencerAssistant,
  influencerPage,
  invite,
  inviteAffiliate,
  invoice,
  invoiceLine,
  invoicePromocode,
  invoiceService,
  logAuthorize,
  loginStatistic,
  memberRequest,
  memberTemplate,
  moneyTransaction,
  news,
  newsContent,
  page,
  pageContent,
  phoneNumber,
  productPhoto,
  promocode,
  promocodeInfluencer,
  provider,
  providerTwilioCarrier,
  reaction,
  service,
  smsPool,
  smsPoolPhoneNumber,
  smsPoolPhoto,
  smsPoolReaction,
  smsShedule,
  spsAddUserRequest,
  spsContract,
  staff,
  subscription,
  subscriptionCategory,
  subscriptionWizard,
  twilioCarrier,
  user,
  userFollowerAlert,
  userFriend,
  userPlan,
  userPlanShedule,
  userPointHistory,
  userPointSettings,
  userSatelliteSubscription,
  userService,
  userSubscription,
  userSubscriptionAddress,
} from "./schema";

export const addressRelations = relations(address, ({ one }) => ({
  invoice: one(invoice, {
    fields: [address.idInvoice],
    references: [invoice.id],
  }),
  user: one(user, {
    fields: [address.idUser],
    references: [user.id],
  }),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  addresses: many(address),
  contractLinePaids: many(contractLinePaid),
  inviteAffiliates_idInviteInvoice: many(inviteAffiliate, {
    relationName: "inviteAffiliate_idInviteInvoice_invoice_id",
  }),
  inviteAffiliates_idRewardInvoice: many(inviteAffiliate, {
    relationName: "inviteAffiliate_idRewardInvoice_invoice_id",
  }),
  user: one(user, {
    fields: [invoice.idUser],
    references: [user.id],
  }),
  bpSubscription: one(bpSubscription, {
    fields: [invoice.idBpSubscribe],
    references: [bpSubscription.id],
  }),
  invoiceLines: many(invoiceLine),
  invoicePromocodes: many(invoicePromocode),
  invoiceServices: many(invoiceService),
  moneyTransactions: many(moneyTransaction),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  addresses: many(address),
  adminMembers_idAdmin: many(adminMember, {
    relationName: "adminMember_idAdmin_user_id",
  }),
  adminMembers_idMember: many(adminMember, {
    relationName: "adminMember_idMember_user_id",
  }),
  affiliates_idUserChild: many(affiliate, {
    relationName: "affiliate_idUserChild_user_id",
  }),
  affiliates_idUserParent: many(affiliate, {
    relationName: "affiliate_idUserParent_user_id",
  }),
  affiliateInvites: many(affiliateInvite),
  bpSubscriptions: many(bpSubscription),
  comments: many(comment),
  contacts: many(contact),
  contractLines: many(contractLine),
  conversationMessages: many(conversationMessage),
  conversationUsers: many(conversationUser),
  creditCards: many(creditCard),
  devices: many(device),
  followers_idUserFollower: many(follower, {
    relationName: "follower_idUserFollower_user_id",
  }),
  followers_idUserLeader: many(follower, {
    relationName: "follower_idUserLeader_user_id",
  }),
  followerLists: many(followerList),
  influencerAssistants_idAssistant: many(influencerAssistant, {
    relationName: "influencerAssistant_idAssistant_user_id",
  }),
  influencerAssistants_idInfluencer: many(influencerAssistant, {
    relationName: "influencerAssistant_idInfluencer_user_id",
  }),
  invites: many(invite),
  inviteAffiliates_idInvited: many(inviteAffiliate, {
    relationName: "inviteAffiliate_idInvited_user_id",
  }),
  inviteAffiliates_idInviter: many(inviteAffiliate, {
    relationName: "inviteAffiliate_idInviter_user_id",
  }),
  invoices: many(invoice),
  logAuthorizes: many(logAuthorize),
  loginStatistics: many(loginStatistic),
  memberRequests_idUser: many(memberRequest, {
    relationName: "memberRequest_idUser_user_id",
  }),
  memberRequests_idUserFrom: many(memberRequest, {
    relationName: "memberRequest_idUserFrom_user_id",
  }),
  memberTemplates: many(memberTemplate),
  moneyTransactions: many(moneyTransaction),
  phoneNumbers: many(phoneNumber),
  smsPools_idAssistant: many(smsPool, {
    relationName: "smsPool_idAssistant_user_id",
  }),
  smsPools_idUser: many(smsPool, {
    relationName: "smsPool_idUser_user_id",
  }),
  smsPoolPhoneNumbers: many(smsPoolPhoneNumber),
  smsPoolReactions: many(smsPoolReaction),
  smsShedules_idAssistant: many(smsShedule, {
    relationName: "smsShedule_idAssistant_user_id",
  }),
  smsShedules_idUser: many(smsShedule, {
    relationName: "smsShedule_idUser_user_id",
  }),
  spsAddUserRequests: many(spsAddUserRequest),
  spsContracts: many(spsContract),
  subscriptions: many(subscription),
  subscriptionWizards: many(subscriptionWizard),
  user: one(user, {
    fields: [user.idInviter],
    references: [user.id],
    relationName: "user_idInviter_user_id",
  }),
  users: many(user, {
    relationName: "user_idInviter_user_id",
  }),
  userFollowerAlerts: many(userFollowerAlert),
  userFriends_idFriend: many(userFriend, {
    relationName: "userFriend_idFriend_user_id",
  }),
  userFriends_idUser: many(userFriend, {
    relationName: "userFriend_idUser_user_id",
  }),
  userPlans: many(userPlan),
  userPlanShedules: many(userPlanShedule),
  userPointHistories: many(userPointHistory),
  userSatelliteSubscriptions: many(userSatelliteSubscription),
  userServices: many(userService),
  userSubscriptions: many(userSubscription),
  userSubscriptionAddresses: many(userSubscriptionAddress),
}));

export const adminMemberRelations = relations(adminMember, ({ one }) => ({
  user_idAdmin: one(user, {
    fields: [adminMember.idAdmin],
    references: [user.id],
    relationName: "adminMember_idAdmin_user_id",
  }),
  user_idMember: one(user, {
    fields: [adminMember.idMember],
    references: [user.id],
    relationName: "adminMember_idMember_user_id",
  }),
  userPlan: one(userPlan, {
    fields: [adminMember.idPlan],
    references: [userPlan.id],
  }),
}));

export const userPlanRelations = relations(userPlan, ({ one, many }) => ({
  adminMembers: many(adminMember),
  memberTemplates: many(memberTemplate),
  spsContracts: many(spsContract),
  invoiceLine: one(invoiceLine, {
    fields: [userPlan.idInvoiceLine],
    references: [invoiceLine.id],
  }),
  service: one(service, {
    fields: [userPlan.idService],
    references: [service.id],
  }),
  user: one(user, {
    fields: [userPlan.idUser],
    references: [user.id],
  }),
}));

export const affiliateRelations = relations(affiliate, ({ one }) => ({
  user_idUserChild: one(user, {
    fields: [affiliate.idUserChild],
    references: [user.id],
    relationName: "affiliate_idUserChild_user_id",
  }),
  user_idUserParent: one(user, {
    fields: [affiliate.idUserParent],
    references: [user.id],
    relationName: "affiliate_idUserParent_user_id",
  }),
}));

export const affiliateInviteRelations = relations(
  affiliateInvite,
  ({ one }) => ({
    user: one(user, {
      fields: [affiliateInvite.idUser],
      references: [user.id],
    }),
  }),
);

export const authAssignmentRelations = relations(authAssignment, ({ one }) => ({
  authItem: one(authItem, {
    fields: [authAssignment.itemName],
    references: [authItem.name],
  }),
}));

export const authItemRelations = relations(authItem, ({ one, many }) => ({
  authAssignments: many(authAssignment),
  authRule: one(authRule, {
    fields: [authItem.ruleName],
    references: [authRule.name],
  }),
  authItemChildren_parent: many(authItemChild, {
    relationName: "authItemChild_parent_authItem_name",
  }),
  authItemChildren_child: many(authItemChild, {
    relationName: "authItemChild_child_authItem_name",
  }),
}));

export const authRuleRelations = relations(authRule, ({ many }) => ({
  authItems: many(authItem),
}));

export const authItemChildRelations = relations(authItemChild, ({ one }) => ({
  authItem_parent: one(authItem, {
    fields: [authItemChild.parent],
    references: [authItem.name],
    relationName: "authItemChild_parent_authItem_name",
  }),
  authItem_child: one(authItem, {
    fields: [authItemChild.child],
    references: [authItem.name],
    relationName: "authItemChild_child_authItem_name",
  }),
}));

export const bpSubscriptionRelations = relations(
  bpSubscription,
  ({ one, many }) => ({
    user: one(user, {
      fields: [bpSubscription.idUser],
      references: [user.id],
    }),
    invoices: many(invoice),
  }),
);

export const bundleItemRelations = relations(bundleItem, ({ one }) => ({
  bundle: one(bundle, {
    fields: [bundleItem.idBundle],
    references: [bundle.id],
  }),
  service: one(service, {
    fields: [bundleItem.idItem],
    references: [service.id],
  }),
}));

export const bundleRelations = relations(bundle, ({ many }) => ({
  bundleItems: many(bundleItem),
  invoiceLines: many(invoiceLine),
}));

export const serviceRelations = relations(service, ({ many }) => ({
  bundleItems: many(bundleItem),
  contractLines: many(contractLine),
  devicePlans_idDevice: many(devicePlan, {
    relationName: "devicePlan_idDevice_service_id",
  }),
  devicePlans_idPlan: many(devicePlan, {
    relationName: "devicePlan_idPlan_service_id",
  }),
  invoiceServices: many(invoiceService),
  productPhotos: many(productPhoto),
  spsContracts: many(spsContract),
  userPlans: many(userPlan),
  userPlanShedules: many(userPlanShedule),
  userServices: many(userService),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  comment: one(comment, {
    fields: [comment.idParent],
    references: [comment.id],
    relationName: "comment_idParent_comment_id",
  }),
  comments: many(comment, {
    relationName: "comment_idParent_comment_id",
  }),
  smsPool: one(smsPool, {
    fields: [comment.idSmsPool],
    references: [smsPool.id],
  }),
  user: one(user, {
    fields: [comment.idUser],
    references: [user.id],
  }),
  userPointHistories: many(userPointHistory),
}));

export const smsPoolRelations = relations(smsPool, ({ one, many }) => ({
  comments: many(comment),
  user_idAssistant: one(user, {
    fields: [smsPool.idAssistant],
    references: [user.id],
    relationName: "smsPool_idAssistant_user_id",
  }),
  staff: one(staff, {
    fields: [smsPool.idStaff],
    references: [staff.id],
  }),
  user_idUser: one(user, {
    fields: [smsPool.idUser],
    references: [user.id],
    relationName: "smsPool_idUser_user_id",
  }),
  smsPoolPhoneNumbers: many(smsPoolPhoneNumber),
  smsPoolPhotos: many(smsPoolPhoto),
  smsPoolReactions: many(smsPoolReaction),
  smsShedules: many(smsShedule),
  userPointHistories: many(userPointHistory),
}));

export const contactRelations = relations(contact, ({ one }) => ({
  user: one(user, {
    fields: [contact.idUser],
    references: [user.id],
  }),
}));

export const contractLineRelations = relations(
  contractLine,
  ({ one, many }) => ({
    service: one(service, {
      fields: [contractLine.idService],
      references: [service.id],
    }),
    spsContract: one(spsContract, {
      fields: [contractLine.idSpsContract],
      references: [spsContract.id],
    }),
    user: one(user, {
      fields: [contractLine.idUser],
      references: [user.id],
    }),
    contractLinePaids: many(contractLinePaid),
    invoiceLines: many(invoiceLine),
    userPlanShedules: many(userPlanShedule),
  }),
);

export const spsContractRelations = relations(spsContract, ({ one, many }) => ({
  contractLines: many(contractLine),
  userPlan: one(userPlan, {
    fields: [spsContract.idPlan],
    references: [userPlan.id],
  }),
  service: one(service, {
    fields: [spsContract.idService],
    references: [service.id],
  }),
  user: one(user, {
    fields: [spsContract.idUser],
    references: [user.id],
  }),
}));

export const contractLinePaidRelations = relations(
  contractLinePaid,
  ({ one }) => ({
    contractLine: one(contractLine, {
      fields: [contractLinePaid.idContractLine],
      references: [contractLine.id],
    }),
    invoice: one(invoice, {
      fields: [contractLinePaid.idInvoice],
      references: [invoice.id],
    }),
    invoiceLine: one(invoiceLine, {
      fields: [contractLinePaid.idInvoiceLine],
      references: [invoiceLine.id],
    }),
  }),
);

export const invoiceLineRelations = relations(invoiceLine, ({ one, many }) => ({
  contractLinePaids: many(contractLinePaid),
  bundle: one(bundle, {
    fields: [invoiceLine.idBundle],
    references: [bundle.id],
  }),
  contractLine: one(contractLine, {
    fields: [invoiceLine.idContractLine],
    references: [contractLine.id],
  }),
  invoice: one(invoice, {
    fields: [invoiceLine.idInvoice],
    references: [invoice.id],
  }),
  userPlans: many(userPlan),
}));

export const conversationFileRelations = relations(
  conversationFile,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationFile.idConversation],
      references: [conversation.id],
    }),
    conversationMessage: one(conversationMessage, {
      fields: [conversationFile.idConversationMessage],
      references: [conversationMessage.id],
    }),
  }),
);

export const conversationRelations = relations(conversation, ({ many }) => ({
  conversationFiles: many(conversationFile),
  conversationMessages: many(conversationMessage),
  conversationUnvieweds: many(conversationUnviewed),
  conversationUsers: many(conversationUser),
}));

export const conversationMessageRelations = relations(
  conversationMessage,
  ({ one, many }) => ({
    conversationFiles: many(conversationFile),
    conversation: one(conversation, {
      fields: [conversationMessage.idConversation],
      references: [conversation.id],
    }),
    user: one(user, {
      fields: [conversationMessage.idUser],
      references: [user.id],
    }),
    conversationUnvieweds: many(conversationUnviewed),
  }),
);

export const conversationUnviewedRelations = relations(
  conversationUnviewed,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationUnviewed.idConversation],
      references: [conversation.id],
    }),
    conversationMessage: one(conversationMessage, {
      fields: [conversationUnviewed.idConversationMessage],
      references: [conversationMessage.id],
    }),
  }),
);

export const conversationUserRelations = relations(
  conversationUser,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationUser.idConversation],
      references: [conversation.id],
    }),
    user: one(user, {
      fields: [conversationUser.idUser],
      references: [user.id],
    }),
  }),
);

export const creditCardRelations = relations(creditCard, ({ one, many }) => ({
  user: one(user, {
    fields: [creditCard.idUser],
    references: [user.id],
  }),
  moneyTransactions: many(moneyTransaction),
}));

export const deviceRelations = relations(device, ({ one }) => ({
  user: one(user, {
    fields: [device.idUser],
    references: [user.id],
  }),
}));

export const devicePlanRelations = relations(devicePlan, ({ one }) => ({
  service_idDevice: one(service, {
    fields: [devicePlan.idDevice],
    references: [service.id],
    relationName: "devicePlan_idDevice_service_id",
  }),
  service_idPlan: one(service, {
    fields: [devicePlan.idPlan],
    references: [service.id],
    relationName: "devicePlan_idPlan_service_id",
  }),
}));

export const emailPoolAttachmentRelations = relations(
  emailPoolAttachment,
  ({ one }) => ({
    emailPool: one(emailPool, {
      fields: [emailPoolAttachment.idEmailPool],
      references: [emailPool.id],
    }),
  }),
);

export const emailPoolRelations = relations(emailPool, ({ many }) => ({
  emailPoolAttachments: many(emailPoolAttachment),
}));

export const followerRelations = relations(follower, ({ one }) => ({
  followerList: one(followerList, {
    fields: [follower.idFollowerList],
    references: [followerList.id],
  }),
  user_idUserFollower: one(user, {
    fields: [follower.idUserFollower],
    references: [user.id],
    relationName: "follower_idUserFollower_user_id",
  }),
  user_idUserLeader: one(user, {
    fields: [follower.idUserLeader],
    references: [user.id],
    relationName: "follower_idUserLeader_user_id",
  }),
}));

export const followerListRelations = relations(
  followerList,
  ({ one, many }) => ({
    followers: many(follower),
    user: one(user, {
      fields: [followerList.idUser],
      references: [user.id],
    }),
    invites: many(invite),
    smsShedules: many(smsShedule),
  }),
);

export const influencerAssistantRelations = relations(
  influencerAssistant,
  ({ one }) => ({
    user_idAssistant: one(user, {
      fields: [influencerAssistant.idAssistant],
      references: [user.id],
      relationName: "influencerAssistant_idAssistant_user_id",
    }),
    user_idInfluencer: one(user, {
      fields: [influencerAssistant.idInfluencer],
      references: [user.id],
      relationName: "influencerAssistant_idInfluencer_user_id",
    }),
  }),
);

export const influencerPageRelations = relations(influencerPage, ({ one }) => ({
  subscription: one(subscription, {
    fields: [influencerPage.idSubscription],
    references: [subscription.id],
  }),
}));

export const subscriptionRelations = relations(
  subscription,
  ({ one, many }) => ({
    influencerPages: many(influencerPage),
    smsShedules: many(smsShedule),
    user: one(user, {
      fields: [subscription.idInfluencer],
      references: [user.id],
    }),
    subscriptionCategory: one(subscriptionCategory, {
      fields: [subscription.idSubscriptionCategory],
      references: [subscriptionCategory.id],
    }),
    userSatelliteSubscriptions: many(userSatelliteSubscription),
    userSubscriptions: many(userSubscription),
    userSubscriptionAddresses: many(userSubscriptionAddress),
  }),
);

export const inviteRelations = relations(invite, ({ one }) => ({
  followerList: one(followerList, {
    fields: [invite.idFollowerList],
    references: [followerList.id],
  }),
  user: one(user, {
    fields: [invite.idUser],
    references: [user.id],
  }),
}));

export const inviteAffiliateRelations = relations(
  inviteAffiliate,
  ({ one }) => ({
    user_idInvited: one(user, {
      fields: [inviteAffiliate.idInvited],
      references: [user.id],
      relationName: "inviteAffiliate_idInvited_user_id",
    }),
    user_idInviter: one(user, {
      fields: [inviteAffiliate.idInviter],
      references: [user.id],
      relationName: "inviteAffiliate_idInviter_user_id",
    }),
    invoice_idInviteInvoice: one(invoice, {
      fields: [inviteAffiliate.idInviteInvoice],
      references: [invoice.id],
      relationName: "inviteAffiliate_idInviteInvoice_invoice_id",
    }),
    invoice_idRewardInvoice: one(invoice, {
      fields: [inviteAffiliate.idRewardInvoice],
      references: [invoice.id],
      relationName: "inviteAffiliate_idRewardInvoice_invoice_id",
    }),
  }),
);

export const invoicePromocodeRelations = relations(
  invoicePromocode,
  ({ one }) => ({
    invoice: one(invoice, {
      fields: [invoicePromocode.idInvoice],
      references: [invoice.id],
    }),
    promocode: one(promocode, {
      fields: [invoicePromocode.idPromo],
      references: [promocode.id],
    }),
  }),
);

export const promocodeRelations = relations(promocode, ({ many }) => ({
  invoicePromocodes: many(invoicePromocode),
  promocodeInfluencers: many(promocodeInfluencer),
}));

export const invoiceServiceRelations = relations(invoiceService, ({ one }) => ({
  invoice: one(invoice, {
    fields: [invoiceService.idInvoice],
    references: [invoice.id],
  }),
  service: one(service, {
    fields: [invoiceService.idService],
    references: [service.id],
  }),
}));

export const logAuthorizeRelations = relations(logAuthorize, ({ one }) => ({
  moneyTransaction: one(moneyTransaction, {
    fields: [logAuthorize.idMoneyTransaction],
    references: [moneyTransaction.id],
  }),
  user: one(user, {
    fields: [logAuthorize.idUser],
    references: [user.id],
  }),
}));

export const moneyTransactionRelations = relations(
  moneyTransaction,
  ({ one, many }) => ({
    logAuthorizes: many(logAuthorize),
    creditCard: one(creditCard, {
      fields: [moneyTransaction.idCreditCard],
      references: [creditCard.id],
    }),
    invoice: one(invoice, {
      fields: [moneyTransaction.idInvoice],
      references: [invoice.id],
    }),
    moneyTransaction: one(moneyTransaction, {
      fields: [moneyTransaction.idRefund],
      references: [moneyTransaction.id],
      relationName: "moneyTransaction_idRefund_moneyTransaction_id",
    }),
    moneyTransactions: many(moneyTransaction, {
      relationName: "moneyTransaction_idRefund_moneyTransaction_id",
    }),
    user: one(user, {
      fields: [moneyTransaction.idUser],
      references: [user.id],
    }),
  }),
);

export const loginStatisticRelations = relations(loginStatistic, ({ one }) => ({
  user: one(user, {
    fields: [loginStatistic.idUser],
    references: [user.id],
  }),
}));

export const memberRequestRelations = relations(memberRequest, ({ one }) => ({
  user_idUser: one(user, {
    fields: [memberRequest.idUser],
    references: [user.id],
    relationName: "memberRequest_idUser_user_id",
  }),
  user_idUserFrom: one(user, {
    fields: [memberRequest.idUserFrom],
    references: [user.id],
    relationName: "memberRequest_idUserFrom_user_id",
  }),
}));

export const memberTemplateRelations = relations(memberTemplate, ({ one }) => ({
  userPlan: one(userPlan, {
    fields: [memberTemplate.idPlan],
    references: [userPlan.id],
  }),
  user: one(user, {
    fields: [memberTemplate.idAdmin],
    references: [user.id],
  }),
}));

export const newsContentRelations = relations(newsContent, ({ one }) => ({
  news: one(news, {
    fields: [newsContent.idNews],
    references: [news.id],
  }),
}));

export const newsRelations = relations(news, ({ many }) => ({
  newsContents: many(newsContent),
}));

export const pageContentRelations = relations(pageContent, ({ one }) => ({
  page: one(page, {
    fields: [pageContent.idPage],
    references: [page.id],
  }),
}));

export const pageRelations = relations(page, ({ many }) => ({
  pageContents: many(pageContent),
}));

export const phoneNumberRelations = relations(phoneNumber, ({ one, many }) => ({
  provider: one(provider, {
    fields: [phoneNumber.idProvider],
    references: [provider.id],
  }),
  user: one(user, {
    fields: [phoneNumber.idUser],
    references: [user.id],
  }),
  smsPoolPhoneNumbers: many(smsPoolPhoneNumber),
}));

export const providerRelations = relations(provider, ({ many }) => ({
  phoneNumbers: many(phoneNumber),
  providerTwilioCarriers: many(providerTwilioCarrier),
  smsPoolPhoneNumbers: many(smsPoolPhoneNumber),
}));

export const productPhotoRelations = relations(productPhoto, ({ one }) => ({
  service: one(service, {
    fields: [productPhoto.idService],
    references: [service.id],
  }),
}));

export const promocodeInfluencerRelations = relations(
  promocodeInfluencer,
  ({ one }) => ({
    promocode: one(promocode, {
      fields: [promocodeInfluencer.idPromocode],
      references: [promocode.id],
    }),
  }),
);

export const providerTwilioCarrierRelations = relations(
  providerTwilioCarrier,
  ({ one }) => ({
    provider: one(provider, {
      fields: [providerTwilioCarrier.idProvider],
      references: [provider.id],
    }),
    twilioCarrier: one(twilioCarrier, {
      fields: [providerTwilioCarrier.idTwilioCarrier],
      references: [twilioCarrier.id],
    }),
  }),
);

export const twilioCarrierRelations = relations(twilioCarrier, ({ many }) => ({
  providerTwilioCarriers: many(providerTwilioCarrier),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  smsPools: many(smsPool),
  smsShedules: many(smsShedule),
}));

export const smsPoolPhoneNumberRelations = relations(
  smsPoolPhoneNumber,
  ({ one }) => ({
    phoneNumber: one(phoneNumber, {
      fields: [smsPoolPhoneNumber.idPhoneNumber],
      references: [phoneNumber.id],
    }),
    provider: one(provider, {
      fields: [smsPoolPhoneNumber.idProvider],
      references: [provider.id],
    }),
    smsPool: one(smsPool, {
      fields: [smsPoolPhoneNumber.idSmsPool],
      references: [smsPool.id],
    }),
    user: one(user, {
      fields: [smsPoolPhoneNumber.idUser],
      references: [user.id],
    }),
  }),
);

export const smsPoolPhotoRelations = relations(smsPoolPhoto, ({ one }) => ({
  smsPool: one(smsPool, {
    fields: [smsPoolPhoto.idSmsPool],
    references: [smsPool.id],
  }),
  smsShedule: one(smsShedule, {
    fields: [smsPoolPhoto.idSmsShedule],
    references: [smsShedule.id],
  }),
}));

export const smsSheduleRelations = relations(smsShedule, ({ one, many }) => ({
  smsPoolPhotos: many(smsPoolPhoto),
  user_idAssistant: one(user, {
    fields: [smsShedule.idAssistant],
    references: [user.id],
    relationName: "smsShedule_idAssistant_user_id",
  }),
  followerList: one(followerList, {
    fields: [smsShedule.idFollowerList],
    references: [followerList.id],
  }),
  smsPool: one(smsPool, {
    fields: [smsShedule.idSmsPool],
    references: [smsPool.id],
  }),
  staff: one(staff, {
    fields: [smsShedule.idStaff],
    references: [staff.id],
  }),
  subscription: one(subscription, {
    fields: [smsShedule.idSubscription],
    references: [subscription.id],
  }),
  user_idUser: one(user, {
    fields: [smsShedule.idUser],
    references: [user.id],
    relationName: "smsShedule_idUser_user_id",
  }),
}));

export const smsPoolReactionRelations = relations(
  smsPoolReaction,
  ({ one }) => ({
    reaction: one(reaction, {
      fields: [smsPoolReaction.idReaction],
      references: [reaction.id],
    }),
    smsPool: one(smsPool, {
      fields: [smsPoolReaction.idSmsPool],
      references: [smsPool.id],
    }),
    user: one(user, {
      fields: [smsPoolReaction.idUser],
      references: [user.id],
    }),
  }),
);

export const reactionRelations = relations(reaction, ({ many }) => ({
  smsPoolReactions: many(smsPoolReaction),
}));

export const spsAddUserRequestRelations = relations(
  spsAddUserRequest,
  ({ one }) => ({
    user: one(user, {
      fields: [spsAddUserRequest.idUser],
      references: [user.id],
    }),
  }),
);

export const subscriptionCategoryRelations = relations(
  subscriptionCategory,
  ({ many }) => ({
    subscriptions: many(subscription),
  }),
);

export const subscriptionWizardRelations = relations(
  subscriptionWizard,
  ({ one }) => ({
    user: one(user, {
      fields: [subscriptionWizard.idUser],
      references: [user.id],
    }),
  }),
);

export const userFollowerAlertRelations = relations(
  userFollowerAlert,
  ({ one }) => ({
    user: one(user, {
      fields: [userFollowerAlert.idUser],
      references: [user.id],
    }),
  }),
);

export const userFriendRelations = relations(userFriend, ({ one }) => ({
  user_idFriend: one(user, {
    fields: [userFriend.idFriend],
    references: [user.id],
    relationName: "userFriend_idFriend_user_id",
  }),
  user_idUser: one(user, {
    fields: [userFriend.idUser],
    references: [user.id],
    relationName: "userFriend_idUser_user_id",
  }),
}));

export const userPlanSheduleRelations = relations(
  userPlanShedule,
  ({ one }) => ({
    contractLine: one(contractLine, {
      fields: [userPlanShedule.idContractLine],
      references: [contractLine.id],
    }),
    service: one(service, {
      fields: [userPlanShedule.idService],
      references: [service.id],
    }),
    user: one(user, {
      fields: [userPlanShedule.idUser],
      references: [user.id],
    }),
  }),
);

export const userPointHistoryRelations = relations(
  userPointHistory,
  ({ one }) => ({
    comment: one(comment, {
      fields: [userPointHistory.idComment],
      references: [comment.id],
    }),
    smsPool: one(smsPool, {
      fields: [userPointHistory.idSmsPool],
      references: [smsPool.id],
    }),
    user: one(user, {
      fields: [userPointHistory.idUser],
      references: [user.id],
    }),
    userPointSetting: one(userPointSettings, {
      fields: [userPointHistory.idUserPointSettings],
      references: [userPointSettings.id],
    }),
  }),
);

export const userPointSettingsRelations = relations(
  userPointSettings,
  ({ many }) => ({
    userPointHistories: many(userPointHistory),
  }),
);

export const userSatelliteSubscriptionRelations = relations(
  userSatelliteSubscription,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [userSatelliteSubscription.idSubscription],
      references: [subscription.id],
    }),
    user: one(user, {
      fields: [userSatelliteSubscription.idUser],
      references: [user.id],
    }),
  }),
);

export const userServiceRelations = relations(userService, ({ one }) => ({
  service: one(service, {
    fields: [userService.idService],
    references: [service.id],
  }),
  user: one(user, {
    fields: [userService.idUser],
    references: [user.id],
  }),
}));

export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [userSubscription.idSubscription],
      references: [subscription.id],
    }),
    user: one(user, {
      fields: [userSubscription.idUser],
      references: [user.id],
    }),
  }),
);

export const userSubscriptionAddressRelations = relations(
  userSubscriptionAddress,
  ({ one }) => ({
    subscription: one(subscription, {
      fields: [userSubscriptionAddress.idSubscription],
      references: [subscription.id],
    }),
    user: one(user, {
      fields: [userSubscriptionAddress.idUser],
      references: [user.id],
    }),
  }),
);
