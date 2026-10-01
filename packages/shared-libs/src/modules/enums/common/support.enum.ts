export enum SupportConversationStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum SupportMessageKind {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM'
}

export enum SupportMessageSource {
  WEB = 'WEB',
  TELEGRAM = 'TELEGRAM',
  SYSTEM = 'SYSTEM'
}

export enum PresenceState {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  OFFLINE = 'OFFLINE'
}

export enum SupportDeleteScope {
  ME = 'ME',
  EVERYONE = 'EVERYONE'
}

export enum SupportCallMedia {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum SupportCallStatus {
  RINGING = 'RINGING',
  ACTIVE = 'ACTIVE'
}

export enum SupportCallEndReason {
  HANGUP = 'HANGUP',
  DECLINED = 'DECLINED',
  MISSED = 'MISSED',
  BUSY = 'BUSY',
  FAILED = 'FAILED'
}
