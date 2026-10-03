export type ConfirmCallback = (error?: Error) => void;

export type PublishMock = jest.Mock<boolean, [string, string, Buffer, Record<string, unknown>, ConfirmCallback]>;
