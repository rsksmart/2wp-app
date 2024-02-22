import { ServiceError } from '@/common/utils';

describe('ServiceError', () => {
  it('should correctly initialize properties', () => {
    const error = new ServiceError(
      'TestService',
      'testMethod',
      'User message',
      'Technical message',
    );

    expect(error.serviceName).toBe('TestService');
    expect(error.triggeredByMethod).toBe('testMethod');
    expect(error.userMessage).toBe('User message');
    expect(error.technicalMessage).toBe('Technical message');
    expect(error.message).toBe('User message');
  });
});
