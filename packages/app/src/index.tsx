/** @jsx createElement */
import 'requestidlecallback-polyfill';
import { createElement, render } from 'my-react';
import { TodoMVC } from './components';
import { TodoModel } from './model';
import './index.css';

render(
  <TodoMVC model={new TodoModel('myReact-TodoMVC')} />,
  document.getElementById('container') as HTMLDivElement,
);
