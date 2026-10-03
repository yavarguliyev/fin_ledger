import { ConfirmCallback, PublishMock } from '../types/publish-mock.type';

export interface ConfigFakeDto {
  values: Record<string, unknown>;
}

export interface PublishFakeDto {
  publish: PublishMock;
}

export interface CapturingPublishFake extends PublishFakeDto {
  confirm: () => ConfirmCallback;
}

export interface RejectingPublishFakeDto {
  error: Error;
}
