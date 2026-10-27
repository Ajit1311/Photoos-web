export type NotificationPriority =
  | number;


export type NotificationStatus =
  | string;


export type NotificationRecipientType =
  | string
  | null;


export type NotificationItem = {

  id:
    string;

  studio_id:
    string;

  recipient_profile_id:
    string
    | null;

  recipient_client_id:
    string
    | null;

  notification_type:
    string;

  channel:
    string;

  priority:
    NotificationPriority;

  title:
    string;

  body:
    string;

  payload:
    Record<
      string,
      unknown
    >;

  metadata:
    Record<
      string,
      unknown
    >;

  status:
    NotificationStatus;

  scheduled_at:
    string
    | null;

  expires_at:
    string
    | null;

  sent_at:
    string
    | null;

  delivered_at:
    string
    | null;

  read_at:
    string
    | null;

  recipient_type:
    NotificationRecipientType;

  image_url:
    string
    | null;

  action_label:
    string
    | null;

  action_url:
    string
    | null;

  entity_type:
    string
    | null;

  entity_id:
    string
    | null;

  dismissed_at:
    string
    | null;

  deleted_at:
    string
    | null;

  created_at:
    string;

  updated_at:
    string;

};


export type NotificationCenterResponse = {

  count:
    number;

  items:
    NotificationItem[];

};


export type NotificationBadgeCount = {

  total:
    number;

  unread:
    number;

};
