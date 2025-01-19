import MonoContext from '@simplyhexagonal/mono-context';
import Logger from '@simplyhexagonal/logger';
export const setLogger = (logger: Logger): void => {
  MonoContext.setState({
    ['logger']: logger,
  });
};

export const getLogger = () => {
  return MonoContext.getState()['logger'] as Logger;
};