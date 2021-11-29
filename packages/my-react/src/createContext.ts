import { isNil } from 'ramda';
import { useState } from './hooks';
import { mutables } from './mutables';

export const contextType = '$$my_react-context';

let i = 0;

export function createContext<T>(defaultValue: T): Context<T> {
  const id = `$$create_context-${(i += 1)}`;
  const context: Context<T> = {
    get defaultValue() {
      return defaultValue;
    },
    Consumer({ children }) {
      const [
        {
          props: { nodeValue },
        },
      ] = children;
      const provider = mutables?.wipFiber?.context?.[id];
      return nodeValue(provider ? provider.props.value : defaultValue);
    },
    Provider({ value = defaultValue, children }) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (!(mutables.wipFiber as Fiber).context) {
        (mutables.wipFiber as Fiber).context = {};
      }

      // Fix default provider, even though React doesn't fix this scenario thus result in "undefined"
      // TODO: fix me using FunctionComponent.defaultProps
      if (isNil((mutables.wipFiber as Fiber).props.value)) {
        (mutables.wipFiber as Fiber).props.value = value;
      }
      ((mutables.wipFiber as Fiber).context as Record<string, any>)[id] =
        mutables.wipFiber;
      const [state, setState] = useState(defaultValue);
      if (value !== state) {
        setState(value);
      }
      return children as ComponentChildren;
    },
    id,
  };
  (context.Provider as unknown as FunctionComponent).type = contextType;
  return context;
}
