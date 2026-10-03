import { CapturingPublishFake, RejectingPublishFakeDto } from '../interfaces/fakes.interface';
import { ConfirmCallback, PublishMock } from '../types/publish-mock.type';

export const aCapturingPublish = (): CapturingPublishFake => {
  let captured: ConfirmCallback = () => undefined;

  const publish: PublishMock = jest.fn((_exchange, _routingKey, _content, _options, callback: ConfirmCallback) => {
    captured = callback;
    return true;
  });

  return { publish, confirm: () => captured };
};

export const aRejectingPublish = ({ error }: RejectingPublishFakeDto): PublishMock =>
  jest.fn((_exchange, _routingKey, _content, _options, callback: ConfirmCallback) => {
    callback(error);
    return true;
  });

export const aSilentPublish = (): PublishMock => jest.fn<boolean, Parameters<PublishMock>>(() => true);
