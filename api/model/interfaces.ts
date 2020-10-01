export interface UserInfo {
  sub: string;
  uid: string;
  roles: string[];
  name: string;
  given_name: string;
  family_name: string;
}

export interface Session {
  sessionId: string;
  caseId: string;
  dateOfHearing: string;
  presenterId: string;
  presenterName: string;
  participants: string;
}

export interface PresenterUpdate {
  caseId: string;
  sessionId: string;
  presenterId: string;
  presenterName: string;
}
